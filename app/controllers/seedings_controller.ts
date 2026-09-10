import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Field from '#models/field'
import Seeding from '#models/seeding'
import { calculateCost, roundTons, tonsFor } from '#services/cost_calculation_service'
import * as cropRecommendation from '#services/crop_recommendation_service'
import * as fertilizerPlans from '#services/fertilizer_plan_service'
import {
  getFreeFieldOrFail,
  buildPreview,
  createSeeding,
  completeSeeding,
  resolveSownArea,
} from '#services/seeding_service'
import { SEEDING_STATUS } from '#constants/seeding'
import { CENTNERS_PER_TON } from '#constants/crop'
import {
  seedingPlanValidator,
  completeSeedingValidator,
  cropYieldTargetValidator,
  fieldChoiceValidator,
  stagePlanPageValidator,
  partialStageRowsValidator,
  seedingListValidator,
} from '#validators/seeding'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

interface StagePlanRow {
  uid: number
  stageName: string
  fertilizerId: string
  dosagePerHa: string | number
}

export default class SeedingsController {
  async index({ request, view }: HttpContext) {
    const { status = SEEDING_STATUS.ACTIVE } = await request.validateUsing(seedingListValidator)

    const seedings = await Seeding.query()
      .where('status', status)
      .preload('field')
      .preload('crop')
      .orderBy('startedAt', 'desc')

    return view.render('pages/seedings/index', { seedings, currentStatus: status })
  }

  async show({ params, view }: HttpContext) {
    const seeding = await Seeding.query()
      .where('id', params.id)
      .preload('field')
      .preload('crop')
      .preload('seedingFertilizers', (query) => query.preload('fertilizer'))
      .firstOrFail()

    return view.render('pages/seedings/show', {
      seeding,
      expectedTons: this.toTons(seeding.expectedYieldPerHa, seeding.sownArea),
      actualTons: this.toTons(seeding.actualYieldPerHa, seeding.sownArea),
    })
  }

  async newStart({ view }: HttpContext) {
    return view.render('pages/seedings/new_start')
  }

  async newByField({ view }: HttpContext) {
    const fields = await Field.query().withScopes((scopes) => scopes.free())

    return view.render('pages/seedings/new_by_field', { fields })
  }

  async newByCrop({ request, view }: HttpContext) {
    const crops = await Crop.query().withScopes((scopes) => scopes.ordered())

    return view.render('pages/seedings/new_by_crop', {
      crops,
      selectedCropId: request.input('cropId'),
      desiredYieldTons: request.input('desiredYieldTons'),
    })
  }

  async newByCropFields({ request, view }: HttpContext) {
    const { cropId, desiredYieldTons } = await request.validateUsing(cropYieldTargetValidator)
    const crop = await Crop.findOrFail(cropId)

    const { requiredArea, options } = await cropRecommendation.getFieldOptionsForYield(
      crop,
      desiredYieldTons
    )

    return view.render('pages/seedings/new_by_crop_fields', {
      crop,
      desiredYieldTons,
      requiredArea,
      options,
    })
  }

  async newByCropPlan({ request, response }: HttpContext) {
    const choice = await request.validateUsing(fieldChoiceValidator)

    return response.redirect().toRoute(
      'seedings.new.step2',
      { fieldId: choice.fieldId },
      {
        qs: {
          cropId: choice.cropId,
          sownArea: choice.sownArea,
          desiredYieldTons: choice.desiredYieldTons,
        },
      }
    )
  }

  async newStep1({ params, request, view }: HttpContext) {
    const field = await getFreeFieldOrFail(params.fieldId)
    const recommendations = await cropRecommendation.getRecommendedCrops(field)

    const items = recommendations.map((item) => ({
      ...item,
      cost: calculateCost({
        crop: item.crop,
        areaHa: field.area,
        fertilizerPlan: [],
      }),
    }))

    return view.render('pages/seedings/new_step1', {
      field,
      recommendations: items,
      selectedCropId: request.input('cropId'),
    })
  }

  async newStep2({ params, request, view, session }: HttpContext) {
    const field = await getFreeFieldOrFail(params.fieldId)
    const { cropId, sownArea, desiredYieldTons } =
      await request.validateUsing(stagePlanPageValidator)
    const crop = await Crop.findOrFail(cropId)

    const allFertilizers = await Fertilizer.query().withScopes((scopes) => scopes.ordered())

    const { rows, showEmptyPlanNotice } = await this.buildStagePlanRows(request, session, crop)

    const stagePlanConfig = {
      area: resolveSownArea(field, sownArea),
      fieldArea: field.area,
      cropPrice: crop.price,
      avgYieldPerHa: crop.avgYieldPerHa,
      centnersPerTon: CENTNERS_PER_TON,
      prices: Object.fromEntries(allFertilizers.map((f) => [String(f.id), f.price])),
      defaultFertilizerId: String(allFertilizers[0]?.id ?? ''),
      rows,
    }

    return view.render('pages/seedings/new_step2', {
      field,
      crop,
      allFertilizers,
      stagePlanConfig,
      showEmptyPlanNotice,
      desiredYieldTons,
      backUrl: this.buildBackUrl(field.id, crop.id, desiredYieldTons),
    })
  }

  async newStep3({ params, request, view }: HttpContext) {
    const field = await getFreeFieldOrFail(params.fieldId)
    const input = await request.validateUsing(seedingPlanValidator)
    const { crop, fertilizerPlan, sownArea, cost, probability, probabilityReason } =
      await buildPreview(field, input)

    return view.render('pages/seedings/new_step3', {
      field,
      crop,
      fertilizerPlan,
      sownArea,
      desiredYieldTons: input.desiredYieldTons,
      cost,
      probability,
      probabilityReason,
    })
  }

  async store({ params, request, response }: HttpContext) {
    const input = await request.validateUsing(seedingPlanValidator)
    const seeding = await createSeeding(params.fieldId, input)

    return response.redirect().toRoute('seedings.show', { id: seeding.id })
  }

  async complete({ params, request, response }: HttpContext) {
    const { actualYieldPerHa } = await request.validateUsing(completeSeedingValidator)
    const seeding = await completeSeeding(params.id, actualYieldPerHa)

    return response.redirect().toRoute('seedings.show', { id: seeding.id })
  }

  private buildBackUrl(
    fieldId: number,
    cropId: number,
    desiredYieldTons: number | undefined
  ): string {
    if (desiredYieldTons === undefined) {
      return router.makeUrl('seedings.new.step1', { fieldId }, { qs: { cropId } })
    }

    return router.makeUrl('seedings.new.byCrop.fields', {}, { qs: { cropId, desiredYieldTons } })
  }

  private toTons(yieldPerHa: number | null, areaHa: number): number | null {
    return yieldPerHa === null ? null : roundTons(tonsFor(yieldPerHa, areaHa))
  }

  private async buildStagePlanRows(
    request: HttpContext['request'],
    session: HttpContext['session'],
    crop: Crop
  ): Promise<{ rows: StagePlanRow[]; showEmptyPlanNotice: boolean }> {
    const flashed = await this.parseStageRows(session.flashMessages.get('stages'))
    const submitted = flashed.length ? flashed : await this.parseStageRows(request.input('stages'))

    if (submitted.length) {
      return {
        rows: submitted.map((row, index) => ({
          uid: index,
          stageName: row.stageName ?? '',
          fertilizerId: row.fertilizerId ?? '',
          dosagePerHa: row.dosagePerHa ?? '',
        })),
        showEmptyPlanNotice: false,
      }
    }

    const plan = await fertilizerPlans.getRecommendedPlan(crop.name)

    return {
      rows: plan.map((item, index) => ({
        uid: index,
        stageName: item.stageName,
        fertilizerId: String(item.fertilizer.id),
        dosagePerHa: item.dosagePerHa,
      })),
      showEmptyPlanNotice: plan.length === 0,
    }
  }

  private async parseStageRows(value: unknown) {
    const [, rows] = await partialStageRowsValidator.tryValidate(value)

    return rows ?? []
  }
}

import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Seeding from '#models/seeding'
import { calculateCost } from '#services/cost_calculation_service'
import * as cropRecommendation from '#services/crop_recommendation_service'
import * as fertilizerPlans from '#services/fertilizer_plan_service'
import {
  getFreeFieldOrFail,
  buildPreview,
  createSeeding,
  completeSeeding,
} from '#services/seeding_service'
import type { SeedingPlanInput } from '#services/seeding_service'
import { SEEDING_STATUS } from '#constants/seeding'
import { CENTNERS_PER_TON } from '#constants/crop'
import { seedingPlanValidator, completeSeedingValidator } from '#validators/seeding'
import type { HttpContext } from '@adonisjs/core/http'

interface RawStageRow {
  stageName?: string
  fertilizerId?: string
  dosagePerHa?: string
}

interface StagePlanRow {
  uid: number
  stageName: string
  fertilizerId: string
  dosagePerHa: string | number
}

function toStageRows(value: unknown): RawStageRow[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((row): row is RawStageRow => typeof row === 'object' && row !== null)
}

export default class SeedingsController {
  async index({ request, view }: HttpContext) {
    const requestedStatus = request.input('status', SEEDING_STATUS.ACTIVE)
    const status = Object.values(SEEDING_STATUS).includes(requestedStatus)
      ? requestedStatus
      : SEEDING_STATUS.ACTIVE

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
      expectedTons: this.toTons(seeding.expectedYieldPerHa, seeding.field.area),
      actualTons: this.toTons(seeding.actualYieldPerHa, seeding.field.area),
    })
  }

  async newStep1({ params, request, view }: HttpContext) {
    const field = await getFreeFieldOrFail(params.fieldId)
    const recommendations = await cropRecommendation.getRecommendedCrops(field)

    const items = recommendations.map((item) => ({
      ...item,
      cost: calculateCost({
        crop: item.crop,
        fieldAreaHa: field.area,
        fertilizerPlan: [],
      }),
    }))

    return view.render('pages/seedings/new_step1', {
      field,
      recommendations: items,
      selectedCropId: request.input('cropId'),
    })
  }

  async newStep2({ params, request, view, session, response }: HttpContext) {
    const field = await getFreeFieldOrFail(params.fieldId)

    const cropId = Number(request.input('cropId'))
    const crop = Number.isFinite(cropId) && cropId > 0 ? await Crop.find(cropId) : null

    if (!crop) {
      session.flash('error', 'Выберите культуру из списка')
      return response.redirect().toRoute('seedings.new.step1', { fieldId: field.id })
    }

    const allFertilizers = await Fertilizer.all()

    const { rows, showEmptyPlanNotice } = await this.buildStagePlanRows(request, session, crop)

    const stagePlanConfig = {
      area: field.area,
      seedCost: crop.price * field.area,
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
    })
  }

  async newStep3({ params, request, view }: HttpContext) {
    const field = await getFreeFieldOrFail(params.fieldId)
    const input = await this.parsePlanRequest(request)
    const { crop, fertilizerPlan, cost, probability, probabilityReason } = await buildPreview(
      field,
      input
    )

    return view.render('pages/seedings/new_step3', {
      field,
      crop,
      fertilizerPlan,
      cost,
      probability,
      probabilityReason,
    })
  }

  async store({ params, request, response }: HttpContext) {
    const input = await this.parsePlanRequest(request)
    const seeding = await createSeeding(params.fieldId, input)

    return response.redirect().toRoute('seedings.show', { id: seeding.id })
  }

  async complete({ params, request, response }: HttpContext) {
    const { actualYieldPerHa } = await request.validateUsing(completeSeedingValidator)
    const seeding = await completeSeeding(params.id, actualYieldPerHa)

    return response.redirect().toRoute('seedings.show', { id: seeding.id })
  }

  private toTons(yieldPerHa: number | null, fieldAreaHa: number): number | null {
    return yieldPerHa === null
      ? null
      : Math.round((yieldPerHa * fieldAreaHa * 100) / CENTNERS_PER_TON) / 100
  }

  private async buildStagePlanRows(
    request: HttpContext['request'],
    session: HttpContext['session'],
    crop: Crop
  ): Promise<{ rows: StagePlanRow[]; showEmptyPlanNotice: boolean }> {
    const flashed = toStageRows(session.flashMessages.get('stages'))
    const submitted = flashed.length ? flashed : toStageRows(request.input('stages'))

    if (submitted.length) {
      return {
        rows: submitted.map((row, index) => ({
          uid: index,
          stageName: row.stageName ?? '',
          fertilizerId: String(row.fertilizerId ?? ''),
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

  private parsePlanRequest(request: HttpContext['request']): Promise<SeedingPlanInput> {
    return seedingPlanValidator.validate({
      cropId: request.input('cropId'),
      stages: request.input('stages', []),
    })
  }
}

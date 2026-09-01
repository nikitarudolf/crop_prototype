import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Seeding from '#models/seeding'
import CostCalculationService from '#services/cost_calculation_service'
import CropRecommendationService from '#services/crop_recommendation_service'
import FertilizerPlanService from '#services/fertilizer_plan_service'
import SeedingService from '#services/seeding_service'
import type { SeedingPlanInput } from '#services/seeding_service'
import { SEEDING_STATUS, probabilityText } from '#constants/seeding'
import { seedingPlanValidator, completeSeedingValidator } from '#validators/seeding'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'

interface RawPlanRow {
  stageName: string
  fertilizerId?: string
  dosage?: string
}

interface StagePlanRow {
  uid: number
  stageName: string
  fertilizerId: string
  dosage: string | number
}

function toArray<T = string>(value: unknown): T[] {
  if (value === undefined || value === null) {
    return []
  }

  return (Array.isArray(value) ? value : [value]) as T[]
}

@inject()
export default class SeedingsController {
  constructor(
    private seedingService: SeedingService,
    private cropService: CropRecommendationService,
    private fertilizerPlanService: FertilizerPlanService,
    private costService: CostCalculationService
  ) {}

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

    return view.render('pages/seedings/index', { seedings, currentStatus: status, SEEDING_STATUS })
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
      SEEDING_STATUS,
      probabilityText: probabilityText(seeding.probability),
      expectedTons: this.toTons(seeding.expectedYieldPerHa, seeding.field.area),
      actualTons: this.toTons(seeding.actualYieldPerHa, seeding.field.area),
    })
  }

  async newStep1({ params, request, view }: HttpContext) {
    const field = await this.seedingService.getFreeFieldOrFail(params.fieldId)
    const recommendations = await this.cropService.getRecommendedCrops(field.id)

    const items = recommendations.map((item) => ({
      ...item,
      cost: this.costService.calculate({
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
    const field = await this.seedingService.getFreeFieldOrFail(params.fieldId)

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
    const field = await this.seedingService.getFreeFieldOrFail(params.fieldId)
    const input = await this.parsePlanRequest(request)
    const { crop, fertilizerPlan, cost, probability, probabilityReason } =
      await this.seedingService.buildPreview(field, input)

    return view.render('pages/seedings/new_step3', {
      field,
      crop,
      fertilizerPlan,
      cost,
      probability,
      probabilityText: probabilityText(probability),
      probabilityReason,
    })
  }

  async store({ params, request, response }: HttpContext) {
    const input = await this.parsePlanRequest(request)
    const seeding = await this.seedingService.createSeeding(params.fieldId, input)

    return response.redirect().toRoute('seedings.show', { id: seeding.id })
  }

  async complete({ params, request, response }: HttpContext) {
    const { actualYieldPerHa } = await request.validateUsing(completeSeedingValidator)
    const seeding = await this.seedingService.completeSeeding(params.id, actualYieldPerHa)

    return response.redirect().toRoute('seedings.show', { id: seeding.id })
  }

  private toTons(yieldPerHa: number | null, fieldAreaHa: number): number | null {
    return yieldPerHa === null ? null : Math.round(yieldPerHa * fieldAreaHa * 100) / 100
  }

  private async buildStagePlanRows(
    request: HttpContext['request'],
    session: HttpContext['session'],
    crop: Crop
  ): Promise<{ rows: StagePlanRow[]; showEmptyPlanNotice: boolean }> {
    const flashed = this.readPlanRows((key) => session.flashMessages.get(key, []))
    const submitted = flashed.length ? flashed : this.readPlanRows((key) => request.input(key, []))

    if (submitted.length) {
      return {
        rows: submitted.map((row, index) => ({
          uid: index,
          stageName: row.stageName,
          fertilizerId: String(row.fertilizerId ?? ''),
          dosage: row.dosage ?? '',
        })),
        showEmptyPlanNotice: false,
      }
    }

    const plan = await this.fertilizerPlanService.getRecommendedPlan(crop.name)

    return {
      rows: plan.map((item, index) => ({
        uid: index,
        stageName: item.stageName,
        fertilizerId: String(item.fertilizer.id),
        dosage: item.dosagePerHa,
      })),
      showEmptyPlanNotice: plan.length === 0,
    }
  }

  private parsePlanRequest(request: HttpContext['request']): Promise<SeedingPlanInput> {
    const rows = this.readPlanRows((key) => request.input(key, []))

    return seedingPlanValidator.validate({
      cropId: request.input('cropId'),
      stages: rows.map((row) => ({
        stageName: row.stageName,
        fertilizerId: row.fertilizerId,
        dosagePerHa: row.dosage,
      })),
    })
  }

  private readPlanRows(read: (key: string) => unknown): RawPlanRow[] {
    const stageNames = toArray(read('stageName'))
    const fertilizerIds = toArray(read('fertilizerId'))
    const dosages = toArray(read('dosage'))

    return stageNames.map((stageName, index) => ({
      stageName,
      fertilizerId: fertilizerIds[index],
      dosage: dosages[index],
    }))
  }
}

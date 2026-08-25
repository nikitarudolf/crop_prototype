import Field from '#models/field'
import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Seeding from '#models/seeding'
import SeedingFertilizer from '#models/seeding_fertilizer'
import CropRecommendationService from '#services/crop_recommendation_service'
import FertilizerPlanService from '#services/fertilizer_plan_service'
import CostCalculationService from '#services/cost_calculation_service'
import { FIELD_STATUS } from '#constants/field'
import { SEEDING_STATUS, PROBABILITY_LABEL } from '#constants/seeding'
import type { ProbabilityLabel } from '#constants/seeding'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class SeedingsController {
  // --- Список "Мои посевы" ---

  async index({ request, view }: HttpContext) {
    const status = request.input('status', SEEDING_STATUS.ACTIVE)

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

    const costService = new CostCalculationService()
    const fertilizerPlan = seeding.seedingFertilizers.map((item) => ({
      fertilizer: item.fertilizer,
      dosagePerHa: item.dosageUsed,
    }))

    const cost = costService.calculate({
      crop: seeding.crop,
      fieldAreaHa: seeding.field.area,
      fertilizerPlan,
    })

    return view.render('pages/seedings/show', { seeding, cost, probabilityText: this.getProbabilityText(seeding.probability) })
  }

  private getProbabilityText(probability: ProbabilityLabel | null): string {
    switch (probability) {
      case PROBABILITY_LABEL.HIGH:
        return 'Высокая'
      case PROBABILITY_LABEL.MEDIUM:
        return 'Средняя'
      case PROBABILITY_LABEL.LOW:
        return 'Низкая'
      default:
        return 'Неизвестно'
    }
  }

  // --- Шаг 1: выбор культуры ---

  async newStep1({ params, view, response, session }: HttpContext) {
    const field = await Field.findOrFail(params.fieldId)

    if (field.status !== FIELD_STATUS.FREE) {
      session.flash('error', 'Поле уже занято активным посевом')
      return response.redirect().toRoute('fields.show', { id: field.id })
    }

    const cropService = new CropRecommendationService()
    const recommendations = await cropService.getRecommendedCrops(field.id)

    return view.render('pages/seedings/new_step1', { field, recommendations })
  }

  // --- Шаг 2: удобрения ---

  async newStep2({ params, request, view }: HttpContext) {
    const field = await Field.findOrFail(params.fieldId)
    const cropId = request.input('cropId')
    const crop = await Crop.findOrFail(cropId)

    const fertilizerPlanService = new FertilizerPlanService()
    const plan = await fertilizerPlanService.getRecommendedPlan(crop.name)

    const allFertilizers = await Fertilizer.all()

    return view.render('pages/seedings/new_step2', {
      field,
      crop,
      plan,
      allFertilizers,
    })
  }

  // --- Шаг 3: итог (себестоимость + вероятность) ---

  async newStep3({ params, request, view }: HttpContext) {
  const field = await Field.findOrFail(params.fieldId)
  const cropId = request.input('cropId')
  const crop = await Crop.findOrFail(cropId)

  const stageNames: string[] = [].concat(request.input('stageName', []))
  const fertilizerIds: string[] = [].concat(request.input('fertilizerId', []))
  const dosages: string[] = [].concat(request.input('dosage', []))

  const fertilizerPlan = []
  for (let i = 0; i < stageNames.length; i++) {
    const fertilizer = await Fertilizer.findOrFail(fertilizerIds[i])
    fertilizerPlan.push({
      stageName: stageNames[i],
      fertilizer,
      dosagePerHa: Number(dosages[i]),
    })
  }

  const costService = new CostCalculationService()
  const costResult = costService.calculate({
    crop,
    fieldAreaHa: field.area,
    fertilizerPlan,
  })

  const cropService = new CropRecommendationService()
  const recommendations = await cropService.getRecommendedCrops(field.id)
  const currentCropRecommendation = recommendations.find((r) => r.crop.id === crop.id)
  const probability: ProbabilityLabel =
    currentCropRecommendation?.suitability === 'recommended'
      ? PROBABILITY_LABEL.HIGH
      : PROBABILITY_LABEL.LOW

  return view.render('pages/seedings/new_step3', {
    field,
    crop,
    fertilizerPlan,
    cost: costResult,
    probability,
    probabilityText: this.getProbabilityText(probability),
  })
}

  // --- Финальное сохранение ---

  async store({ params, request, response }: HttpContext) {
    const field = await Field.findOrFail(params.fieldId)
    const cropId = request.input('cropId')
    const crop = await Crop.findOrFail(cropId)
    const totalCost = Number(request.input('totalCost'))
    const probability = request.input('probability') as ProbabilityLabel

    const stageNames: string[] = [].concat(request.input('stageName', []))
    const fertilizerIds: string[] = [].concat(request.input('fertilizerId', []))
    const dosages: string[] = [].concat(request.input('dosage', []))

    const trx = await db.transaction()

    try {
      const seeding = await Seeding.create(
        {
          fieldId: field.id,
          cropId: crop.id,
          startedAt: DateTime.now(),
          status: SEEDING_STATUS.ACTIVE,
          probability,
          cost: totalCost,
        },
        { client: trx }
      )

      for (let i = 0; i < stageNames.length; i++) {
        await SeedingFertilizer.create(
          {
            seedingId: seeding.id,
            fertilizerId: Number(fertilizerIds[i]),
            stageName: stageNames[i],
            dosageUsed: Number(dosages[i]),
          },
          { client: trx }
        )
      }

      field.useTransaction(trx)
      field.status = FIELD_STATUS.OCCUPIED
      await field.save()

      await trx.commit()

      return response.redirect().toRoute('seedings.show', { id: seeding.id })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  // --- Завершение посева ---

  async complete({ params, request, response }: HttpContext) {
    const seeding = await Seeding.findOrFail(params.id)
    const actualYield = Number(request.input('actualYield'))

    const trx = await db.transaction()

    try {
      seeding.useTransaction(trx)
      seeding.status = SEEDING_STATUS.COMPLETED
      seeding.finishedAt = DateTime.now()
      seeding.actualYield = actualYield
      await seeding.save()

      const field = await Field.findOrFail(seeding.fieldId, { client: trx })
      field.status = FIELD_STATUS.FREE
      await field.save()

      await trx.commit()

      return response.redirect().toRoute('seedings.show', { id: seeding.id })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
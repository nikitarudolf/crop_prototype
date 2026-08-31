import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Field from '#models/field'
import Seeding from '#models/seeding'
import CropRecommendationService from '#services/crop_recommendation_service'
import FertilizerPlanService from '#services/fertilizer_plan_service'
import SeedingService from '#services/seeding_service'
import type { SeedingPlanInput } from '#services/seeding_service'
import { SEEDING_STATUS, probabilityText } from '#constants/seeding'
import FieldOccupiedException from '#exceptions/field_occupied_exception'
import SeedingAlreadyCompletedException from '#exceptions/seeding_already_completed_exception'
import { completeSeedingValidator, seedingPlanValidator } from '#validators/seeding'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeedingsController {
  private seedingService = new SeedingService()
  private cropService = new CropRecommendationService()
  private fertilizerPlanService = new FertilizerPlanService()

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

    return view.render('pages/seedings/show', {
      seeding,
      probabilityText: probabilityText(seeding.probability),
    })
  }

  async newStep1({ params, view, response, session }: HttpContext) {
    try {
      const field = await this.seedingService.getFreeFieldOrFail(params.fieldId)
      const recommendations = await this.cropService.getRecommendedCrops(field.id)

      return view.render('pages/seedings/new_step1', { field, recommendations })
    } catch (error) {
      return this.handleDomainError(error, { response, session })
    }
  }

  async newStep2({ params, request, view }: HttpContext) {
    const field = await Field.findOrFail(params.fieldId)
    const crop = await Crop.findOrFail(request.input('cropId'))

    const plan = await this.fertilizerPlanService.getRecommendedPlan(crop.name)
    const allFertilizers = await Fertilizer.all()

    return view.render('pages/seedings/new_step2', { field, crop, plan, allFertilizers })
  }

  async newStep3({ params, request, view, response, session }: HttpContext) {
    try {
      const field = await this.seedingService.getFreeFieldOrFail(params.fieldId)
      const input = await this.parsePlanRequest(request)
      const { crop, fertilizerPlan, cost, probability } = await this.seedingService.buildPreview(
        field,
        input
      )

      return view.render('pages/seedings/new_step3', {
        field,
        crop,
        fertilizerPlan,
        cost,
        probability,
        probabilityText: probabilityText(probability),
      })
    } catch (error) {
      return this.handleDomainError(error, { response, session })
    }
  }

  async store({ params, request, response, session }: HttpContext) {
    try {
      const input = await this.parsePlanRequest(request)
      const seeding = await this.seedingService.createSeeding(params.fieldId, input)

      return response.redirect().toRoute('seedings.show', { id: seeding.id })
    } catch (error) {
      return this.handleDomainError(error, { response, session })
    }
  }

  async complete({ params, request, response, session }: HttpContext) {
    const { actualYieldPerHa } = await request.validateUsing(completeSeedingValidator)

    try {
      const seeding = await this.seedingService.completeSeeding(params.id, actualYieldPerHa)

      return response.redirect().toRoute('seedings.show', { id: seeding.id })
    } catch (error) {
      return this.handleDomainError(error, { response, session })
    }
  }

  private parsePlanRequest(request: HttpContext['request']): Promise<SeedingPlanInput> {
    const stageNames: string[] = [].concat(request.input('stageName', []))
    const fertilizerIds: string[] = [].concat(request.input('fertilizerId', []))
    const dosages: string[] = [].concat(request.input('dosage', []))

    return seedingPlanValidator.validate({
      cropId: request.input('cropId'),
      stages: stageNames.map((stageName, index) => ({
        stageName,
        fertilizerId: fertilizerIds[index],
        dosagePerHa: dosages[index],
      })),
    })
  }

  private handleDomainError(
    error: unknown,
    { response, session }: Pick<HttpContext, 'response' | 'session'>
  ) {
    if (error instanceof FieldOccupiedException) {
      session.flash('error', error.message)
      return response.redirect().toRoute('fields.show', { id: error.fieldId })
    }

    if (error instanceof SeedingAlreadyCompletedException) {
      session.flash('error', error.message)
      return response.redirect().toRoute('seedings.show', { id: error.seedingId })
    }

    throw error
  }
}

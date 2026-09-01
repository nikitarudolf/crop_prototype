import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Field from '#models/field'
import Seeding from '#models/seeding'
import SeedingFertilizer from '#models/seeding_fertilizer'
import CostCalculationService from '#services/cost_calculation_service'
import type { CostResult } from '#services/cost_calculation_service'
import CropRecommendationService from '#services/crop_recommendation_service'
import type { FertilizerPlanItem } from '#services/fertilizer_plan_service'
import { FIELD_STATUS } from '#constants/field'
import { SEEDING_STATUS, PROBABILITY_LABEL } from '#constants/seeding'
import type { ProbabilityLabel } from '#constants/seeding'
import FieldOccupiedException from '#exceptions/field_occupied_exception'
import SeedingAlreadyCompletedException from '#exceptions/seeding_already_completed_exception'
import db from '@adonisjs/lucid/services/db'
import { errors } from '@adonisjs/lucid'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'

export interface SeedingPlanInput {
  cropId: number
  stages: {
    stageName: string
    fertilizerId: number
    dosagePerHa: number
  }[]
}

export interface ResolvedPlan {
  crop: Crop
  fertilizerPlan: FertilizerPlanItem[]
}

export interface SeedingPreview extends ResolvedPlan {
  cost: CostResult
  probability: ProbabilityLabel
  probabilityReason: string
}

@inject()
export default class SeedingService {
  constructor(
    private costService: CostCalculationService,
    private cropService: CropRecommendationService
  ) {}

  async getFreeFieldOrFail(fieldId: number, trx?: TransactionClientContract): Promise<Field> {
    const query = Field.query(trx ? { client: trx } : {}).where('id', fieldId)

    if (trx) {
      query.forUpdate()
    }

    const field = await query.firstOrFail()

    if (field.status !== FIELD_STATUS.FREE) {
      throw new FieldOccupiedException(field.id)
    }

    return field
  }

  async resolvePlan(
    input: SeedingPlanInput,
    trx?: TransactionClientContract
  ): Promise<ResolvedPlan> {
    const options = trx ? { client: trx } : {}

    const crop = await Crop.findOrFail(input.cropId, options)

    const fertilizerIds = [...new Set(input.stages.map((stage) => stage.fertilizerId))]
    const fertilizers = await Fertilizer.query(options).whereIn('id', fertilizerIds)
    const fertilizersById = new Map(fertilizers.map((fertilizer) => [fertilizer.id, fertilizer]))

    const fertilizerPlan = input.stages.map((stage) => {
      const fertilizer = fertilizersById.get(stage.fertilizerId)

      if (!fertilizer) {
        throw new errors.E_ROW_NOT_FOUND()
      }

      return {
        stageName: stage.stageName,
        fertilizer,
        dosagePerHa: stage.dosagePerHa,
      }
    })

    return { crop, fertilizerPlan }
  }

  async buildPreview(field: Field, input: SeedingPlanInput): Promise<SeedingPreview> {
    const { crop, fertilizerPlan } = await this.resolvePlan(input)
    const recommendation = await this.cropService.getRecommendation(field.id, crop.id)

    return {
      crop,
      fertilizerPlan,
      cost: this.costService.calculate({ crop, fieldAreaHa: field.area, fertilizerPlan }),
      probability:
        recommendation.suitability === 'recommended'
          ? PROBABILITY_LABEL.HIGH
          : PROBABILITY_LABEL.LOW,
      probabilityReason: recommendation.reason,
    }
  }

  async createSeeding(fieldId: number, input: SeedingPlanInput): Promise<Seeding> {
    return db.transaction(async (trx) => {
      const field = await this.getFreeFieldOrFail(fieldId, trx)
      const { crop, fertilizerPlan } = await this.resolvePlan(input, trx)

      const cost = this.costService.calculate({ crop, fieldAreaHa: field.area, fertilizerPlan })
      const probability = await this.cropService.getProbability(field.id, crop.id, trx)

      const seeding = await Seeding.create(
        {
          fieldId: field.id,
          cropId: crop.id,
          startedAt: DateTime.now(),
          status: SEEDING_STATUS.ACTIVE,
          probability,
          cost: cost.totalCost,
          seedCost: cost.seedCost,
          fertilizerCost: cost.fertilizerCost,
          expectedYieldPerHa: crop.avgYieldPerHa,
        },
        { client: trx }
      )

      await SeedingFertilizer.createMany(
        fertilizerPlan.map((item) => ({
          seedingId: seeding.id,
          fertilizerId: item.fertilizer.id,
          stageName: item.stageName,
          dosageUsed: item.dosagePerHa,
        })),
        { client: trx }
      )

      field.status = FIELD_STATUS.OCCUPIED
      await field.save()

      return seeding
    })
  }

  async completeSeeding(seedingId: number, actualYieldPerHa: number): Promise<Seeding> {
    return db.transaction(async (trx) => {
      const seeding = await Seeding.query({ client: trx })
        .where('id', seedingId)
        .forUpdate()
        .firstOrFail()

      if (seeding.status !== SEEDING_STATUS.ACTIVE) {
        throw new SeedingAlreadyCompletedException(seeding.id)
      }

      seeding.status = SEEDING_STATUS.COMPLETED
      seeding.finishedAt = DateTime.now()
      seeding.actualYieldPerHa = actualYieldPerHa
      await seeding.save()

      const field = await Field.findOrFail(seeding.fieldId, { client: trx })
      field.status = FIELD_STATUS.FREE
      await field.save()

      return seeding
    })
  }
}

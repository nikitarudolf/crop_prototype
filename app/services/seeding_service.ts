import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Field from '#models/field'
import Seeding from '#models/seeding'
import SeedingFertilizer from '#models/seeding_fertilizer'
import { calculateCost } from '#services/cost_calculation_service'
import type { CostResult } from '#services/cost_calculation_service'
import * as cropRecommendation from '#services/crop_recommendation_service'
import type { FertilizerPlanItem, PlanStage } from '#services/fertilizer_plan_service'
import { FIELD_STATUS } from '#constants/field'
import { SEEDING_STATUS } from '#constants/seeding'
import type { ProbabilityLabel } from '#constants/seeding'
import FieldOccupiedException from '#exceptions/field_occupied_exception'
import SeedingAlreadyCompletedException from '#exceptions/seeding_already_completed_exception'
import db from '@adonisjs/lucid/services/db'
import { errors } from '@adonisjs/lucid'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

export interface SeedingPlanInput {
  cropId: number
  stages: (PlanStage & { fertilizerId: number })[]
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

export async function getFreeFieldOrFail(
  fieldId: number,
  trx?: TransactionClientContract
): Promise<Field> {
  const field = await Field.query({ client: trx }).where('id', fieldId).firstOrFail()

  if (field.status !== FIELD_STATUS.FREE) {
    throw new FieldOccupiedException(field.id)
  }

  return field
}

export async function resolvePlan(
  input: SeedingPlanInput,
  trx?: TransactionClientContract
): Promise<ResolvedPlan> {
  const options = { client: trx }

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

export async function buildPreview(field: Field, input: SeedingPlanInput): Promise<SeedingPreview> {
  const { crop, fertilizerPlan } = await resolvePlan(input)
  const recommendation = await cropRecommendation.getRecommendation(field, crop.id)

  return {
    crop,
    fertilizerPlan,
    cost: calculateCost({ crop, fieldAreaHa: field.area, fertilizerPlan }),
    probability: recommendation.probability,
    probabilityReason: recommendation.reason,
  }
}

export async function createSeeding(fieldId: number, input: SeedingPlanInput): Promise<Seeding> {
  return db.transaction(async (trx) => {
    const field = await getFreeFieldOrFail(fieldId, trx)
    const { crop, fertilizerPlan } = await resolvePlan(input, trx)

    const cost = calculateCost({ crop, fieldAreaHa: field.area, fertilizerPlan })
    const { probability } = await cropRecommendation.getRecommendation(field, crop.id, trx)

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

export async function completeSeeding(
  seedingId: number,
  actualYieldPerHa: number
): Promise<Seeding> {
  return db.transaction(async (trx) => {
    const seeding = await Seeding.query({ client: trx }).where('id', seedingId).firstOrFail()

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

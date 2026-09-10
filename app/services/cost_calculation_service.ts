import type Crop from '#models/crop'
import type { FertilizerPlanItem } from '#services/fertilizer_plan_service'
import { CENTNERS_PER_TON } from '#constants/crop'

interface CalculateParams {
  crop: Crop
  areaHa: number
  fertilizerPlan: FertilizerPlanItem[]
}

export interface CostStage extends FertilizerPlanItem {
  cost: number
}

export interface CostResult {
  seedCost: number
  fertilizerCost: number
  totalCost: number
  costPerHa: number
  costPerExpectedTon: number
  expectedTons: number
  stages: CostStage[]
}

export function tonsFor(yieldPerHa: number, areaHa: number): number {
  return (yieldPerHa * areaHa) / CENTNERS_PER_TON
}

export function expectedTonsFor(crop: Crop, areaHa: number): number {
  return tonsFor(crop.avgYieldPerHa, areaHa)
}

export function roundTons(tons: number): number {
  return Math.round(tons * 100) / 100
}

export function areaForYieldTons(crop: Crop, yieldTons: number): number {
  return crop.avgYieldPerHa > 0 ? (yieldTons * CENTNERS_PER_TON) / crop.avgYieldPerHa : 0
}

export function calculateCost(params: CalculateParams): CostResult {
  const { crop, areaHa, fertilizerPlan } = params

  const seedCost = crop.price * areaHa

  const stages: CostStage[] = fertilizerPlan.map((item) => ({
    ...item,
    cost: item.fertilizer.price * item.dosagePerHa * areaHa,
  }))

  const fertilizerCost = stages.reduce((sum, stage) => sum + stage.cost, 0)

  const totalCost = seedCost + fertilizerCost
  const costPerHa = areaHa > 0 ? totalCost / areaHa : 0

  const expectedTons = expectedTonsFor(crop, areaHa)
  const costPerExpectedTon = expectedTons > 0 ? totalCost / expectedTons : 0

  return {
    seedCost,
    fertilizerCost,
    totalCost,
    costPerHa,
    costPerExpectedTon,
    expectedTons,
    stages,
  }
}

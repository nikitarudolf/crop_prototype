import type Crop from '#models/crop'
import type Fertilizer from '#models/fertilizer'
import type { FertilizerPlanItem } from '#services/fertilizer_plan_service'

interface CalculateParams {
  crop: Crop
  fieldAreaHa: number
  fertilizerPlan: FertilizerPlanItem[]
}

export interface CostStage {
  stageName: string
  fertilizer: Fertilizer
  dosagePerHa: number
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

export default class CostCalculationService {
  calculate(params: CalculateParams): CostResult {
    const { crop, fieldAreaHa, fertilizerPlan } = params

    const seedCost = crop.price * fieldAreaHa

    const stages: CostStage[] = fertilizerPlan.map((item) => ({
      stageName: item.stageName,
      fertilizer: item.fertilizer,
      dosagePerHa: item.dosagePerHa,
      cost: item.fertilizer.price * item.dosagePerHa * fieldAreaHa,
    }))

    const fertilizerCost = stages.reduce((sum, stage) => sum + stage.cost, 0)

    const totalCost = seedCost + fertilizerCost
    const costPerHa = fieldAreaHa > 0 ? totalCost / fieldAreaHa : 0

    const expectedTons = crop.avgYieldPerHa * fieldAreaHa
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
}

import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'

interface FertilizerPlanItem {
  fertilizer: Fertilizer
  dosagePerHa: number
}

interface CalculateParams {
  crop: Crop
  fieldAreaHa: number
  fertilizerPlan: FertilizerPlanItem[]
}

export interface CostResult {
  seedCost: number
  fertilizerCost: number
  totalCost: number
  costPerExpectedTon: number
}

export default class CostCalculationService {
  calculate(params: CalculateParams): CostResult {
    const { crop, fieldAreaHa, fertilizerPlan } = params

    const seedCost = crop.price * fieldAreaHa

    const fertilizerCost = fertilizerPlan.reduce((sum, item) => {
      return sum + item.fertilizer.price * item.dosagePerHa * fieldAreaHa
    }, 0)

    const totalCost = seedCost + fertilizerCost

    const expectedTons = crop.avgYieldPerHa * fieldAreaHa
    const costPerExpectedTon = expectedTons > 0 ? totalCost / expectedTons : 0

    return { seedCost, fertilizerCost, totalCost, costPerExpectedTon }
  }
}
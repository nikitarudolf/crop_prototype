import Fertilizer from '#models/fertilizer'
import { FERTILIZER_PLANS } from '#constants/fertilizer'
import logger from '@adonisjs/core/services/logger'

export interface PlanStage {
  stageName: string
  dosagePerHa: number
}

export interface FertilizerPlanItem extends PlanStage {
  fertilizer: Fertilizer
}

export async function getRecommendedPlan(cropName: string): Promise<FertilizerPlanItem[]> {
  const template = FERTILIZER_PLANS[cropName] ?? []
  if (template.length === 0) {
    return []
  }

  const names = [...new Set(template.map((item) => item.fertilizerName))]
  const fertilizers = await Fertilizer.query().whereIn('name', names)
  const fertilizersByName = new Map(fertilizers.map((fertilizer) => [fertilizer.name, fertilizer]))

  const plan: FertilizerPlanItem[] = []

  for (const item of template) {
    const fertilizer = fertilizersByName.get(item.fertilizerName)

    if (!fertilizer) {
      logger.warn(
        `Удобрение "${item.fertilizerName}" не найдено в справочнике, пропускаю стадию "${item.stageName}"`
      )
      continue
    }

    plan.push({
      stageName: item.stageName,
      fertilizer,
      dosagePerHa: item.dosagePerHa,
    })
  }

  return plan
}

import Fertilizer from '#models/fertilizer'
import logger from '@adonisjs/core/services/logger'

interface PlanTemplateItem {
  stageName: string
  fertilizerName: string
  dosagePerHa: number
}

export interface FertilizerPlanItem {
  stageName: string
  fertilizer: Fertilizer
  dosagePerHa: number
}

const FERTILIZER_PLANS: Record<string, PlanTemplateItem[]> = {
  Пшеница: [
    { stageName: 'Перед посевом', fertilizerName: 'Аммофос', dosagePerHa: 100 },
    { stageName: 'Вегетация', fertilizerName: 'Карбамид', dosagePerHa: 50 },
    { stageName: 'Колошение', fertilizerName: 'КАС-32', dosagePerHa: 30 },
  ],
  Кукуруза: [
    { stageName: 'Перед посевом', fertilizerName: 'Аммофос', dosagePerHa: 120 },
    { stageName: 'Вегетация', fertilizerName: 'Карбамид', dosagePerHa: 60 },
  ],
  Соя: [{ stageName: 'Перед посевом', fertilizerName: 'Суперфосфат', dosagePerHa: 80 }],
  Ячмень: [
    { stageName: 'Перед посевом', fertilizerName: 'Аммофос', dosagePerHa: 90 },
    { stageName: 'Вегетация', fertilizerName: 'Карбамид', dosagePerHa: 40 },
  ],
  Картофель: [
    { stageName: 'Перед посадкой', fertilizerName: 'Аммофос', dosagePerHa: 150 },
    { stageName: 'Вегетация', fertilizerName: 'Сульфат калия', dosagePerHa: 80 },
  ],
  Подсолнечник: [
    { stageName: 'Перед посевом', fertilizerName: 'Суперфосфат', dosagePerHa: 80 },
    { stageName: 'Цветение', fertilizerName: 'Сульфат калия', dosagePerHa: 40 },
  ],
}

export default class FertilizerPlanService {
  async getRecommendedPlan(cropName: string): Promise<FertilizerPlanItem[]> {
    const template = FERTILIZER_PLANS[cropName] ?? []
    if (template.length === 0) {
      return []
    }

    const names = [...new Set(template.map((item) => item.fertilizerName))]
    const fertilizers = await Fertilizer.query().whereIn('name', names)
    const fertilizersByName = new Map(
      fertilizers.map((fertilizer) => [fertilizer.name, fertilizer])
    )

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
}

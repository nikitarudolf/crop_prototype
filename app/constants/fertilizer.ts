export interface PlanTemplateItem {
  stageName: string
  fertilizerName: string
  dosagePerHa: number
}

export const FERTILIZER_PLANS: Record<string, PlanTemplateItem[]> = {
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

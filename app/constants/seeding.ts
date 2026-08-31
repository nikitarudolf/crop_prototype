export const SEEDING_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const

export type SeedingStatus = (typeof SEEDING_STATUS)[keyof typeof SEEDING_STATUS]

export const PROBABILITY_LABEL = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export type ProbabilityLabel = (typeof PROBABILITY_LABEL)[keyof typeof PROBABILITY_LABEL]

const PROBABILITY_TEXT: Record<ProbabilityLabel, string> = {
  [PROBABILITY_LABEL.HIGH]: 'Высокая',
  [PROBABILITY_LABEL.MEDIUM]: 'Средняя',
  [PROBABILITY_LABEL.LOW]: 'Низкая',
}

export function probabilityText(probability: ProbabilityLabel | null): string {
  return probability ? PROBABILITY_TEXT[probability] : 'Неизвестно'
}

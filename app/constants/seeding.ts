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
import vine from '@vinejs/vine'
import { SEEDING_STATUS } from '#constants/seeding'

const cropId = () => vine.number().positive().exists({ table: 'crops', column: 'id' })
const fieldId = () => vine.number().positive().exists({ table: 'fields', column: 'id' })
const area = () => vine.number().positive().decimal([0, 2])
const yieldTons = () => vine.number().positive().decimal([0, 2])

export const seedingListValidator = vine.create({
  status: vine.enum(Object.values(SEEDING_STATUS)).optional(),
})

export const cropYieldTargetValidator = vine.create({
  cropId: cropId(),
  desiredYieldTons: yieldTons(),
})

export const fieldChoiceValidator = vine.create({
  fieldId: fieldId(),
  cropId: cropId(),
  sownArea: area(),
  desiredYieldTons: yieldTons().optional(),
})

export const stagePlanPageValidator = vine.create({
  cropId: cropId(),
  sownArea: area().optional(),
  desiredYieldTons: yieldTons().optional(),
})

export const seedingPlanValidator = vine.create({
  cropId: cropId(),
  sownArea: area().optional(),
  desiredYieldTons: yieldTons().optional(),
  stages: vine
    .array(
      vine.object({
        stageName: vine.string().trim().minLength(1),
        fertilizerId: vine.number().positive().exists({ table: 'fertilizers', column: 'id' }),
        dosagePerHa: vine.number().positive(),
      })
    )
    .parse((value) => value ?? []),
})

export const completeSeedingValidator = vine.create({
  actualYieldPerHa: vine.number().min(0).decimal([0, 2]),
})

export const partialStageRowsValidator = vine.create(
  vine.array(
    vine.object({
      stageName: vine.string().optional(),
      fertilizerId: vine.string().optional(),
      dosagePerHa: vine.string().optional(),
    })
  )
)

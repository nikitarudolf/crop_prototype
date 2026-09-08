import vine from '@vinejs/vine'

export const seedingPlanValidator = vine.create({
  cropId: vine.number().positive(),
  stages: vine.array(
    vine.object({
      stageName: vine.string().trim().minLength(1),
      fertilizerId: vine.number().positive(),
      dosagePerHa: vine.number().positive(),
    })
  ),
})

export const completeSeedingValidator = vine.create({
  actualYieldPerHa: vine.number().min(0).decimal([0, 2]),
})

export const stageRowsValidator = vine.create(
  vine.array(
    vine.object({
      stageName: vine.string().optional(),
      fertilizerId: vine.string().optional(),
      dosagePerHa: vine.string().optional(),
    })
  )
)

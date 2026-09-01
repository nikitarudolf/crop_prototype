import vine from '@vinejs/vine'

export const cropValidator = vine.create({
  name: vine.string().minLength(2),
  price: vine.number().positive(),
  avgYieldPerHa: vine.number().positive(),
})

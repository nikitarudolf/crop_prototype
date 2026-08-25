import vine from '@vinejs/vine'

export const storeCropValidator = vine.create({
  name: vine.string().minLength(2),
  price: vine.number().positive(),
  avgYieldPerHa: vine.number().positive(),
})

export const updateCropValidator = vine.create({
  name: vine.string().minLength(2),
  price: vine.number().positive(),
  avgYieldPerHa: vine.number().positive(),
})

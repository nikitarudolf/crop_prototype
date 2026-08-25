import vine from '@vinejs/vine'

export const storeFertilizerValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2),
    price: vine.number().positive(),
  })
)

export const updateFertilizerValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2),
    price: vine.number().positive(),
  })
)

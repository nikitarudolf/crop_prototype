import vine from '@vinejs/vine'

export const fertilizerValidator = vine.create({
  name: vine.string().minLength(2),
  price: vine.number().positive(),
})

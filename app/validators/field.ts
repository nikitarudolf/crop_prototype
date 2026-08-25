import vine from '@vinejs/vine'
import { FIELD_TYPES } from '#constants/field'

export const storeFieldValidator = vine.create({
  area: vine.number().positive(),
  type: vine.enum(FIELD_TYPES),
})

export const updateFieldValidator = vine.create({
  area: vine.number().positive(),
  type: vine.enum(FIELD_TYPES),
})

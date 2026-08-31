import vine from '@vinejs/vine'
import { FIELD_TYPES } from '#constants/field'

export const storeFieldValidator = vine.create({
  name: vine.string().trim().optional(),
  area: vine.number().positive(),
  type: vine.enum(FIELD_TYPES),
})

export const updateFieldValidator = vine.create({
  name: vine.string().trim().optional(),
  area: vine.number().positive(),
  type: vine.enum(FIELD_TYPES),
})

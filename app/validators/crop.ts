import vine from '@vinejs/vine'
import { CROP_FAMILIES } from '#constants/crop'

export const cropValidator = vine.create({
  name: vine.string().minLength(2),
  family: vine.enum(CROP_FAMILIES),
  price: vine.number().positive(),
  avgYieldPerHa: vine.number().positive(),
})

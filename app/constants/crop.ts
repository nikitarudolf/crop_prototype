import type { FieldType } from '#constants/field'

export const CROP_FAMILIES = ['cereal', 'legume', 'oilseed', 'root', 'other'] as const

export type CropFamily = (typeof CROP_FAMILIES)[number]

export const CROP_FAMILY_TEXT: Record<CropFamily, string> = {
  cereal: 'Злаковые',
  legume: 'Бобовые',
  oilseed: 'Масличные',
  root: 'Корнеплоды',
  other: 'Прочее',
}

export const PREFERRED_SOILS: Record<CropFamily, FieldType[]> = {
  cereal: ['chernozem', 'loam'],
  legume: ['chernozem', 'loam'],
  oilseed: ['chernozem', 'loam'],
  root: ['loam', 'sandy_loam'],
  other: ['chernozem', 'loam', 'sandy_loam'],
}

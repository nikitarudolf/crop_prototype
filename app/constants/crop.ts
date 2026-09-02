export const CROP_FAMILIES = ['cereal', 'legume', 'oilseed', 'root', 'other'] as const

export type CropFamily = (typeof CROP_FAMILIES)[number]

const CROP_FAMILY_TEXT: Record<CropFamily, string> = {
  cereal: 'Злаковые',
  legume: 'Бобовые',
  oilseed: 'Масличные',
  root: 'Корнеплоды',
  other: 'Прочее',
}

export function cropFamilyText(family: CropFamily): string {
  return CROP_FAMILY_TEXT[family]
}

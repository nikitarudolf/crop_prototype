export const FIELD_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied',
} as const

export type FieldStatus = (typeof FIELD_STATUS)[keyof typeof FIELD_STATUS]

export const FIELD_TYPES = ['chernozem', 'loam', 'sandy_loam'] as const

export type FieldType = (typeof FIELD_TYPES)[number]

const FIELD_TYPE_TEXT: Record<FieldType, string> = {
  chernozem: 'Чернозём',
  loam: 'Суглинок',
  sandy_loam: 'Супесь',
}

export function fieldTypeText(type: FieldType): string {
  return FIELD_TYPE_TEXT[type]
}

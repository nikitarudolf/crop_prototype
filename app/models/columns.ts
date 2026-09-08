export const numericColumn = {
  consume: (value: string | number) => Number(value),
}

export const nullableNumericColumn = {
  consume: (value: string | number | null) => (value === null ? null : Number(value)),
}

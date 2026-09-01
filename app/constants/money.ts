const moneyFormatter = new Intl.NumberFormat('ru-BY', {
  style: 'currency',
  currency: 'BYN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

import Alpine from 'alpinejs'
import { formatMoney } from '../../app/constants/money.ts'

Alpine.data('alert', function () {
  return {
    isVisible: false,
    dismiss() {
      this.isVisible = false
    },
    init() {
      setTimeout(() => {
        this.isVisible = true
      }, 80)
      setTimeout(() => {
        this.dismiss()
      }, 5000)
    },
  }
})

Alpine.data('stagePlan', function (config) {
  return {
    area: config.area,
    seedCost: config.seedCost,
    prices: config.prices,
    defaultFertilizerId: config.defaultFertilizerId,
    rows: config.rows,
    nextUid: config.rows.length,

    rowCost(row) {
      const price = Number(this.prices[row.fertilizerId]) || 0
      const dosage = Number(row.dosage) || 0
      return price * dosage * this.area
    },
    get fertilizerCost() {
      return this.rows.reduce((sum, row) => sum + this.rowCost(row), 0)
    },
    get totalCost() {
      return this.seedCost + this.fertilizerCost
    },
    get costPerHa() {
      return this.area > 0 ? this.totalCost / this.area : 0
    },
    addRow() {
      this.rows.push({
        uid: this.nextUid++,
        stageName: '',
        fertilizerId: this.defaultFertilizerId,
        dosage: '',
      })
    },
    removeRow(index) {
      this.rows.splice(index, 1)
    },
    money(value) {
      return formatMoney(value)
    },
  }
})

Alpine.start()

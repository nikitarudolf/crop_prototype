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
    fieldArea: config.fieldArea,
    cropPrice: config.cropPrice,
    avgYieldPerHa: config.avgYieldPerHa,
    centnersPerTon: config.centnersPerTon,
    prices: config.prices,
    defaultFertilizerId: config.defaultFertilizerId,
    rows: config.rows,
    nextUid: config.rows.length,

    get areaHa() {
      const area = Number(this.area) || 0
      return Math.min(Math.max(area, 0), this.fieldArea)
    },
    get isPartial() {
      return this.areaHa > 0 && this.areaHa < this.fieldArea
    },
    get seedCost() {
      return this.cropPrice * this.areaHa
    },
    get expectedTons() {
      return (this.avgYieldPerHa * this.areaHa) / this.centnersPerTon
    },
    rowCost(row) {
      const price = Number(this.prices[row.fertilizerId]) || 0
      const dosagePerHa = Number(row.dosagePerHa) || 0
      return price * dosagePerHa * this.areaHa
    },
    get fertilizerCost() {
      return this.rows.reduce((sum, row) => sum + this.rowCost(row), 0)
    },
    get totalCost() {
      return this.seedCost + this.fertilizerCost
    },
    get costPerHa() {
      return this.areaHa > 0 ? this.totalCost / this.areaHa : 0
    },
    get costPerExpectedTon() {
      return this.expectedTons > 0 ? this.totalCost / this.expectedTons : 0
    },
    addRow() {
      this.rows.push({
        uid: this.nextUid++,
        stageName: '',
        fertilizerId: this.defaultFertilizerId,
        dosagePerHa: '',
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

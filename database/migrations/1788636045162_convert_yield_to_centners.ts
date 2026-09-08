import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.from('crops').update({ avg_yield_per_ha: db.raw('avg_yield_per_ha * 10') })
      await db.from('seedings').update({
        expected_yield_per_ha: db.raw('expected_yield_per_ha * 10'),
        actual_yield_per_ha: db.raw('actual_yield_per_ha * 10'),
      })
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from('crops').update({ avg_yield_per_ha: db.raw('avg_yield_per_ha / 10') })
      await db.from('seedings').update({
        expected_yield_per_ha: db.raw('expected_yield_per_ha / 10'),
        actual_yield_per_ha: db.raw('actual_yield_per_ha / 10'),
      })
    })
  }
}

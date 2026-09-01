import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seedings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('seed_cost', 10, 2).nullable()
      table.decimal('fertilizer_cost', 10, 2).nullable()
      table.decimal('expected_yield_per_ha', 10, 2).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('seed_cost')
      table.dropColumn('fertilizer_cost')
      table.dropColumn('expected_yield_per_ha')
    })
  }
}

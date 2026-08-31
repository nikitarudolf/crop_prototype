import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seedings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('actual_yield', 'actual_yield_per_ha')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('actual_yield_per_ha', 'actual_yield')
    })
  }
}

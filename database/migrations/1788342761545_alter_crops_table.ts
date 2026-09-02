import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'crops'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('family', 50).notNullable().defaultTo('other')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('family')
    })
  }
}

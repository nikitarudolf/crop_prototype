import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'crops'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 150).notNullable().unique()
      table.string('family', 50).notNullable().defaultTo('other')
      table.decimal('price', 10, 2).notNullable()
      /**
       * Centners per hectare, the unit every yield in the app is measured in.
       */
      table.decimal('avg_yield_per_ha', 10, 2).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

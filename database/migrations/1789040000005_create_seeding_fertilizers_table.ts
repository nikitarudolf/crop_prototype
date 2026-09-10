import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seeding_fertilizers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('seeding_id').unsigned().notNullable().references('id').inTable('seedings')
      table
        .integer('fertilizer_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('fertilizers')
      table.string('stage_name', 100).notNullable()
      table.decimal('dosage_used', 10, 2).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

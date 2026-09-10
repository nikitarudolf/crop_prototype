import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seedings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('field_id').unsigned().notNullable().references('id').inTable('fields')
      table.integer('crop_id').unsigned().notNullable().references('id').inTable('crops')
      table.decimal('sown_area', 10, 2).notNullable()
      table.timestamp('started_at').notNullable()
      table.timestamp('finished_at').nullable()
      table.string('status', 50).notNullable()
      table.string('probability', 50).nullable()
      table.decimal('expected_yield_per_ha', 10, 2).nullable()
      table.decimal('actual_yield_per_ha', 10, 2).nullable()
      table.decimal('seed_cost', 10, 2).nullable()
      table.decimal('fertilizer_cost', 10, 2).nullable()
      table.decimal('cost', 10, 2).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

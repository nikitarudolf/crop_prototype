import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('crops', (table) => {
      table.unique(['name'])
    })

    this.schema.alterTable('fertilizers', (table) => {
      table.unique(['name'])
    })
  }

  async down() {
    this.schema.alterTable('crops', (table) => {
      table.dropUnique(['name'])
    })

    this.schema.alterTable('fertilizers', (table) => {
      table.dropUnique(['name'])
    })
  }
}

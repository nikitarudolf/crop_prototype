import Fertilizer from '#models/fertilizer'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Fertilizer.updateOrCreateMany('name', [
      { name: 'Аммофос', price: 2.2 },
      { name: 'Карбамид', price: 1.6 },
      { name: 'Суперфосфат', price: 1.1 },
      { name: 'Сульфат калия', price: 2.0 },
      { name: 'КАС-32', price: 1.3 },
    ])
  }
}

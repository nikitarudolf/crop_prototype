import Fertilizer from '#models/fertilizer'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Fertilizer.createMany([
      { name: 'Аммофос', price: 42000 },
      { name: 'Карбамид', price: 28000 },
      { name: 'Суперфосфат', price: 18000 },
      { name: 'Сульфат калия', price: 35000 },
      { name: 'КАС-32', price: 22000 },
    ])
  }
}
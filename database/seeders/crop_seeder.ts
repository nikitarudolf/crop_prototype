import Crop from '#models/crop'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Crop.createMany([
      { name: 'Пшеница', price: 180, avgYieldPerHa: 3.5 },
      { name: 'Кукуруза', price: 320, avgYieldPerHa: 6.0 },
      { name: 'Соя', price: 260, avgYieldPerHa: 2.0 },
      { name: 'Ячмень', price: 150, avgYieldPerHa: 3.0 },
      { name: 'Подсолнечник', price: 240, avgYieldPerHa: 2.2 },
    ])
  }
}

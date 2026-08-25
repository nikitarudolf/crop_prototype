import Crop from '#models/crop'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Crop.createMany([
      { name: 'Пшеница', price: 14000, avgYieldPerHa: 3.5 },
      { name: 'Кукуруза', price: 12000, avgYieldPerHa: 6.0 },
      { name: 'Соя', price: 32000, avgYieldPerHa: 2.0 },
      { name: 'Ячмень', price: 11000, avgYieldPerHa: 3.0 },
      { name: 'Подсолнечник', price: 25000, avgYieldPerHa: 2.2 },
    ])
  }
}
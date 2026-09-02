import Crop from '#models/crop'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Crop.updateOrCreateMany('name', [
      { name: 'Пшеница', family: 'cereal', price: 180, avgYieldPerHa: 3.5 },
      { name: 'Кукуруза', family: 'cereal', price: 320, avgYieldPerHa: 6.0 },
      { name: 'Соя', family: 'legume', price: 260, avgYieldPerHa: 2.0 },
      { name: 'Ячмень', family: 'cereal', price: 150, avgYieldPerHa: 3.0 },
      { name: 'Подсолнечник', family: 'oilseed', price: 240, avgYieldPerHa: 2.2 },
      { name: 'Картофель', family: 'root', price: 900, avgYieldPerHa: 25 },
    ])
  }
}

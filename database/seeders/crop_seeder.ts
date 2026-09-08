import Crop from '#models/crop'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Crop.updateOrCreateMany('name', [
      { name: 'Пшеница', family: 'cereal', price: 180, avgYieldPerHa: 38 },
      { name: 'Кукуруза', family: 'cereal', price: 320, avgYieldPerHa: 65 },
      { name: 'Соя', family: 'legume', price: 260, avgYieldPerHa: 18 },
      { name: 'Ячмень', family: 'cereal', price: 150, avgYieldPerHa: 35 },
      { name: 'Рапс', family: 'oilseed', price: 240, avgYieldPerHa: 24 },
      { name: 'Картофель', family: 'root', price: 900, avgYieldPerHa: 280 },
      { name: 'Сахарная свёкла', family: 'root', price: 850, avgYieldPerHa: 500 },
    ])
  }
}

import Field from '#models/field'
import User from '#models/user'
import { FIELD_STATUS } from '#constants/field'
import type { FieldType } from '#constants/field'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const FIELDS: { name: string; area: number; type: FieldType }[] = [
  { name: 'Северное', area: 42.5, type: 'chernozem' },
  { name: 'Южное', area: 18, type: 'loam' },
  { name: 'Речное', area: 7.25, type: 'sandy_loam' },
  { name: 'Дальнее', area: 64, type: 'chernozem' },
  { name: 'Малое', area: 3.5, type: 'loam' },
]

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    await User.updateOrCreate(
      { email: 'dev@example.com' },
      { fullName: 'Дев Аккаунт', password: 'secret123' }
    )

    await Field.updateOrCreateMany(
      'name',
      FIELDS.map((field) => ({ ...field, status: FIELD_STATUS.FREE }))
    )
  }
}

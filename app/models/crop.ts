import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { CropFamily } from '#constants/crop'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Seeding from '#models/seeding'

export default class Crop extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare family: CropFamily

  @column({ consume: (value: string | number) => Number(value) })
  declare price: number

  @column({ consume: (value: string | number) => Number(value) })
  declare avgYieldPerHa: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Seeding)
  declare seedings: HasMany<typeof Seeding>
}

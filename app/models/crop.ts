import { BaseModel, column, scope } from '@adonisjs/lucid/orm'
import { numericColumn } from '#models/columns'
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

  @column(numericColumn)
  declare price: number

  @column(numericColumn)
  declare avgYieldPerHa: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Seeding)
  declare seedings: HasMany<typeof Seeding>

  /**
   * Canonical order for every crop list shown to the user.
   */
  static ordered = scope((query) => {
    query.orderBy('name', 'asc')
  })
}

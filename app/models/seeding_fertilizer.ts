import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Seeding from '#models/seeding'
import Fertilizer from '#models/fertilizer'

export default class SeedingFertilizer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare seedingId: number

  @column()
  declare fertilizerId: number

  @column()
  declare stageName: string

  @column()
  declare dosageUsed: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Seeding)
  declare seeding: BelongsTo<typeof Seeding>

  @belongsTo(() => Fertilizer)
  declare fertilizer: BelongsTo<typeof Fertilizer>
}

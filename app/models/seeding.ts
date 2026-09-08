import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { numericColumn, nullableNumericColumn } from '#models/columns'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Field from '#models/field'
import Crop from '#models/crop'
import SeedingFertilizer from '#models/seeding_fertilizer'
import type { SeedingStatus, ProbabilityLabel } from '#constants/seeding'

export default class Seeding extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fieldId: number

  @column()
  declare cropId: number

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare finishedAt: DateTime | null

  @column()
  declare status: SeedingStatus

  @column()
  declare probability: ProbabilityLabel | null

  @column(nullableNumericColumn)
  declare actualYieldPerHa: number | null

  @column(numericColumn)
  declare cost: number

  @column(nullableNumericColumn)
  declare seedCost: number | null

  @column(nullableNumericColumn)
  declare fertilizerCost: number | null

  @column(nullableNumericColumn)
  declare expectedYieldPerHa: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Field)
  declare field: BelongsTo<typeof Field>

  @belongsTo(() => Crop)
  declare crop: BelongsTo<typeof Crop>

  @hasMany(() => SeedingFertilizer)
  declare seedingFertilizers: HasMany<typeof SeedingFertilizer>
}

import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { FieldStatus, FieldType } from '#constants/field'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Seeding from '#models/seeding'

export default class Field extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ consume: (value: string | number) => Number(value) })
  declare area: number

  @column()
  declare type: FieldType

  @column()
  declare status: FieldStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Seeding)
  declare seedings: HasMany<typeof Seeding>
}

import { BaseModel, column } from '@adonisjs/lucid/orm'
import { numericColumn } from '#models/columns'
import { DateTime } from 'luxon'
import type { FieldStatus, FieldType } from '#constants/field'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Seeding from '#models/seeding'

export default class Field extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column(numericColumn)
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

  get displayName(): string {
    return this.name || `Поле №${this.id}`
  }
}

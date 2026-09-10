import { BaseModel, column, scope } from '@adonisjs/lucid/orm'
import { numericColumn } from '#models/columns'
import { DateTime } from 'luxon'
import { FIELD_STATUS } from '#constants/field'
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

  /**
   * Canonical order for every field list shown to the user.
   */
  static ordered = scope((query) => {
    query.orderBy('id', 'asc')
  })

  /**
   * Fields that can host a new seeding, in the canonical order.
   */
  static free = scope((query) => {
    query.where('status', FIELD_STATUS.FREE).orderBy('id', 'asc')
  })

  get displayName(): string {
    return this.name || `Поле №${this.id}`
  }
}

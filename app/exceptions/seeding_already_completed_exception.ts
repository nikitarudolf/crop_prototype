import { Exception } from '@adonisjs/core/exceptions'

export default class SeedingAlreadyCompletedException extends Exception {
  static status = 409
  static code = 'E_SEEDING_ALREADY_COMPLETED'

  constructor(readonly seedingId: number) {
    super('Этот посев уже завершён')
  }
}

import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeedingAlreadyCompletedException extends Exception {
  static status = 409
  static code = 'E_SEEDING_ALREADY_COMPLETED'

  constructor(readonly seedingId: number) {
    super('Этот посев уже завершён')
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.session.flash('error', error.message)

    return ctx.response.redirect().toRoute('seedings.show', { id: error.seedingId })
  }
}

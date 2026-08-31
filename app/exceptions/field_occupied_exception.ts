import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class FieldOccupiedException extends Exception {
  static status = 409
  static code = 'E_FIELD_OCCUPIED'

  constructor(readonly fieldId: number) {
    super('Поле уже занято активным посевом')
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.session.flash('error', error.message)

    return ctx.response.redirect().toRoute('fields.show', { id: error.fieldId })
  }
}

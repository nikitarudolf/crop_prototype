import { Exception } from '@adonisjs/core/exceptions'

export default class FieldOccupiedException extends Exception {
  static status = 409
  static code = 'E_FIELD_OCCUPIED'

  constructor(readonly fieldId: number) {
    super('Поле уже занято активным посевом')
  }
}

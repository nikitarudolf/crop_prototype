import Field from '#models/field'
import Seeding from '#models/seeding'
import { FIELD_STATUS, FIELD_TYPES } from '#constants/field'
import { SEEDING_STATUS } from '#constants/seeding'
import { storeFieldValidator, updateFieldValidator } from '#validators/field'
import type { HttpContext } from '@adonisjs/core/http'

export default class FieldsController {
  async index({ view }: HttpContext) {
    const fields = await Field.query().orderBy('id', 'asc')
    return view.render('pages/fields/index', { fields })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/fields/create', { fieldTypes: FIELD_TYPES })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(storeFieldValidator)
    await Field.create({
    ...payload,
    status: FIELD_STATUS.FREE,
  })
    return response.redirect().toRoute('fields.index')
  }

  async show({ params, view }: HttpContext) {
    const field = await Field.findOrFail(params.id)
    const activeSeeding = await Seeding.query()
      .where('fieldId', field.id)
      .andWhere('status', SEEDING_STATUS.ACTIVE)
      .first()

    return view.render('pages/fields/show', { field, activeSeeding, FIELD_STATUS })
  }

  async edit({ params, view }: HttpContext) {
    const field = await Field.findOrFail(params.id)
    return view.render('pages/fields/edit', { field, fieldTypes: FIELD_TYPES })
  }

  async update({ params, request, response }: HttpContext) {
    const field = await Field.findOrFail(params.id)
    const payload = await request.validateUsing(updateFieldValidator)
    field.merge(payload)
    await field.save()
    return response.redirect().toRoute('fields.show', { id: field.id })
  }

  async destroy({ params, response }: HttpContext) {
    const field = await Field.findOrFail(params.id)
    // TODO: проверить наличие связанных посевов перед удалением, когда появится модель Seeding
    await field.delete()
    return response.redirect().toRoute('fields.index')
  }
}

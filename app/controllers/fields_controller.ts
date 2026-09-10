import Field from '#models/field'
import Seeding from '#models/seeding'
import { FIELD_STATUS, FIELD_TYPES } from '#constants/field'
import { SEEDING_STATUS } from '#constants/seeding'
import { isFieldUsed } from '#services/reference_usage_service'
import { fieldValidator } from '#validators/field'
import type { HttpContext } from '@adonisjs/core/http'

export default class FieldsController {
  async index({ view }: HttpContext) {
    const fields = await Field.query().withScopes((scopes) => scopes.ordered())
    return view.render('pages/fields/index', { fields })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/fields/create', { fieldTypes: FIELD_TYPES })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(fieldValidator)
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

    const seedingHistory = await Seeding.query()
      .where('fieldId', field.id)
      .preload('crop')
      .orderBy('startedAt', 'desc')

    return view.render('pages/fields/show', {
      field,
      activeSeeding,
      seedingHistory,
    })
  }

  async edit({ params, view }: HttpContext) {
    const field = await Field.findOrFail(params.id)
    return view.render('pages/fields/edit', { field, fieldTypes: FIELD_TYPES })
  }

  async update({ params, request, response, session }: HttpContext) {
    const field = await Field.findOrFail(params.id)
    const payload = await request.validateUsing(fieldValidator)

    const areaChanged = Math.round(payload.area * 100) !== Math.round(field.area * 100)
    if (areaChanged && field.status !== FIELD_STATUS.FREE) {
      session.flash(
        'error',
        'Нельзя изменить площадь: на поле идёт посев, себестоимость которого уже рассчитана для текущей площади. Завершите посев или измените остальные поля.'
      )
      return response.redirect().toRoute('fields.edit', { id: field.id })
    }

    field.merge(payload)
    await field.save()
    return response.redirect().toRoute('fields.show', { id: field.id })
  }

  async destroy({ params, response, session }: HttpContext) {
    const field = await Field.findOrFail(params.id)

    if (await isFieldUsed(field.id)) {
      session.flash('error', 'Нельзя удалить поле: есть связанные посевы')
      return response.redirect().toRoute('fields.show', { id: field.id })
    }

    await field.delete()
    return response.redirect().toRoute('fields.index')
  }
}

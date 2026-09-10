import Crop from '#models/crop'
import { isCropUsed } from '#services/reference_usage_service'
import { cropValidator } from '#validators/crop'
import { CROP_FAMILIES } from '#constants/crop'
import type { HttpContext } from '@adonisjs/core/http'

export default class CropsController {
  async index({ view }: HttpContext) {
    const crops = await Crop.query().withScopes((scopes) => scopes.ordered())
    return view.render('pages/crops/index', { crops })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/crops/create', { cropFamilies: CROP_FAMILIES })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(cropValidator)
    await Crop.create(payload)
    return response.redirect().toRoute('crops.index')
  }

  async show({ params, view }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)
    return view.render('pages/crops/show', { crop })
  }

  async edit({ params, view }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)
    return view.render('pages/crops/edit', { crop, cropFamilies: CROP_FAMILIES })
  }

  async update({ params, request, response }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)
    const payload = await request.validateUsing(cropValidator)
    crop.merge(payload)
    await crop.save()
    return response.redirect().toRoute('crops.show', { id: crop.id })
  }

  async destroy({ params, response, session }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)

    if (await isCropUsed(crop.id)) {
      session.flash('error', 'Нельзя удалить культуру: есть связанные посевы')
      return response.redirect().toRoute('crops.show', { id: crop.id })
    }

    await crop.delete()
    return response.redirect().toRoute('crops.index')
  }
}

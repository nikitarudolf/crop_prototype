import Crop from '#models/crop'
import { storeCropValidator, updateCropValidator } from '#validators/crop'
import type { HttpContext } from '@adonisjs/core/http'

export default class CropsController {
  async index({ view }: HttpContext) {
    const crops = await Crop.query().orderBy('id', 'asc')
    return view.render('pages/crops/index', { crops })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/crops/create')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(storeCropValidator)
    await Crop.create(payload)
    return response.redirect().toRoute('crops.index')
  }

  async show({ params, view }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)
    return view.render('pages/crops/show', { crop })
  }

  async edit({ params, view }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)
    return view.render('pages/crops/edit', { crop })
  }

  async update({ params, request, response }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)
    const payload = await request.validateUsing(updateCropValidator)
    crop.merge(payload)
    await crop.save()
    return response.redirect().toRoute('crops.show', { id: crop.id })
  }

  async destroy({ params, response }: HttpContext) {
    const crop = await Crop.findOrFail(params.id)
    // TODO: проверить наличие связанных посевов перед удалением, когда появится модель Seeding
    await crop.delete()
    return response.redirect().toRoute('crops.index')
  }
}

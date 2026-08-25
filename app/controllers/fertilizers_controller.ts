import Fertilizer from '#models/fertilizer'
import { storeFertilizerValidator, updateFertilizerValidator } from '#validators/fertilizer'
import type { HttpContext } from '@adonisjs/core/http'

export default class FertilizersController {
  async index({ view }: HttpContext) {
    const fertilizers = await Fertilizer.query().orderBy('id', 'asc')
    return view.render('pages/fertilizers/index', { fertilizers })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/fertilizers/create')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(storeFertilizerValidator)
    await Fertilizer.create(payload)
    return response.redirect().toRoute('fertilizers.index')
  }

  async show({ params, view }: HttpContext) {
    const fertilizer = await Fertilizer.findOrFail(params.id)
    return view.render('pages/fertilizers/show', { fertilizer })
  }

  async edit({ params, view }: HttpContext) {
    const fertilizer = await Fertilizer.findOrFail(params.id)
    return view.render('pages/fertilizers/edit', { fertilizer })
  }

  async update({ params, request, response }: HttpContext) {
    const fertilizer = await Fertilizer.findOrFail(params.id)
    const payload = await request.validateUsing(updateFertilizerValidator)
    fertilizer.merge(payload)
    await fertilizer.save()
    return response.redirect().toRoute('fertilizers.show', { id: fertilizer.id })
  }

  async destroy({ params, response }: HttpContext) {
    const fertilizer = await Fertilizer.findOrFail(params.id)
    // TODO: проверить наличие связанных посевов перед удалением, когда появится модель Seeding
    await fertilizer.delete()
    return response.redirect().toRoute('fertilizers.index')
  }
}

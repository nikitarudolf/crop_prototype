import Fertilizer from '#models/fertilizer'
import SeedingFertilizer from '#models/seeding_fertilizer'
import { fertilizerValidator } from '#validators/fertilizer'
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
    const payload = await request.validateUsing(fertilizerValidator)
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
    const payload = await request.validateUsing(fertilizerValidator)
    fertilizer.merge(payload)
    await fertilizer.save()
    return response.redirect().toRoute('fertilizers.show', { id: fertilizer.id })
  }

  async destroy({ params, response, session }: HttpContext) {
    const fertilizer = await Fertilizer.findOrFail(params.id)

    const isUsedInSeedings = await SeedingFertilizer.query()
      .where('fertilizerId', fertilizer.id)
      .first()

    if (isUsedInSeedings) {
      session.flash('error', 'Нельзя удалить удобрение: оно используется в посевах')
      return response.redirect().toRoute('fertilizers.show', { id: fertilizer.id })
    }

    await fertilizer.delete()
    return response.redirect().toRoute('fertilizers.index')
  }
}

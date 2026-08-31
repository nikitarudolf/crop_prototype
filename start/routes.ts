/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.on('/').render('pages/home').as('home')

    router.post('logout', [controllers.Session, 'destroy'])

    router.resource('fields', controllers.Fields)
    router.resource('crops', controllers.Crops)
    router.resource('fertilizers', controllers.Fertilizers)

    router.get('/fields/:fieldId/seedings/new', [controllers.Seedings, 'newStep1']).as('seedings.new.step1')
    router.get('/fields/:fieldId/seedings/new/fertilizers', [controllers.Seedings, 'newStep2']).as('seedings.new.step2')
    router.post('/fields/:fieldId/seedings/new/summary', [controllers.Seedings, 'newStep3']).as('seedings.new.step3')
    router.post('/fields/:fieldId/seedings', [controllers.Seedings, 'store']).as('seedings.store')

    router.get('/seedings', [controllers.Seedings, 'index']).as('seedings.index')
    router.get('/seedings/:id', [controllers.Seedings, 'show']).as('seedings.show')
    router.post('/seedings/:id/complete', [controllers.Seedings, 'complete']).as('seedings.complete')
  })
  .use(middleware.auth())

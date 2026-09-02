import { test } from '@japa/runner'
import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Field from '#models/field'
import SeedingService from '#services/seeding_service'
import CostCalculationService from '#services/cost_calculation_service'
import CropRecommendationService from '#services/crop_recommendation_service'
import FieldOccupiedException from '#exceptions/field_occupied_exception'
import SeedingAlreadyCompletedException from '#exceptions/seeding_already_completed_exception'
import { FIELD_STATUS } from '#constants/field'

function makeService() {
  return new SeedingService(new CostCalculationService(), new CropRecommendationService())
}

test.group('SeedingService', () => {
  test('cannot start a seeding on an already occupied field', async ({ assert }) => {
    const field = await Field.create({ area: 10, type: 'loam', status: FIELD_STATUS.OCCUPIED })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 3.5,
    })
    const service = makeService()

    await assert.rejects(
      () => service.createSeeding(field.id, { cropId: crop.id, stages: [] }),
      FieldOccupiedException
    )
  })

  test('creating a seeding recalculates cost on the server and occupies the field', async ({
    assert,
  }) => {
    const field = await Field.create({ area: 10, type: 'loam', status: FIELD_STATUS.FREE })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 3.5,
    })
    const fertilizer = await Fertilizer.create({ name: 'Аммофос', price: 2.2 })
    const service = makeService()

    const seeding = await service.createSeeding(field.id, {
      cropId: crop.id,
      stages: [{ stageName: 'Перед посевом', fertilizerId: fertilizer.id, dosagePerHa: 100 }],
    })

    assert.equal(seeding.seedCost, 1800)
    assert.approximately(seeding.fertilizerCost!, 2200, 0.001)
    assert.approximately(seeding.cost, 4000, 0.001)

    await field.refresh()
    assert.equal(field.status, FIELD_STATUS.OCCUPIED)
  })

  test('cannot complete a seeding twice', async ({ assert }) => {
    const field = await Field.create({ area: 10, type: 'loam', status: FIELD_STATUS.FREE })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 3.5,
    })
    const service = makeService()

    const seeding = await service.createSeeding(field.id, { cropId: crop.id, stages: [] })
    await service.completeSeeding(seeding.id, 3.2)

    await assert.rejects(
      () => service.completeSeeding(seeding.id, 3.2),
      SeedingAlreadyCompletedException
    )
  })
})

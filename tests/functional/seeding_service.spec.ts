import { test } from '@japa/runner'
import Crop from '#models/crop'
import Fertilizer from '#models/fertilizer'
import Field from '#models/field'
import { createSeeding, completeSeeding } from '#services/seeding_service'
import FieldOccupiedException from '#exceptions/field_occupied_exception'
import SeedingAlreadyCompletedException from '#exceptions/seeding_already_completed_exception'
import { FIELD_STATUS } from '#constants/field'

test.group('SeedingService', () => {
  test('cannot start a seeding on an already occupied field', async ({ assert }) => {
    const field = await Field.create({ area: 10, type: 'loam', status: FIELD_STATUS.OCCUPIED })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 35,
    })

    await assert.rejects(
      () => createSeeding(field.id, { cropId: crop.id, stages: [] }),
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
      avgYieldPerHa: 35,
    })
    const fertilizer = await Fertilizer.create({ name: 'Аммофос', price: 2.2 })

    const seeding = await createSeeding(field.id, {
      cropId: crop.id,
      stages: [{ stageName: 'Перед посевом', fertilizerId: fertilizer.id, dosagePerHa: 100 }],
    })

    assert.equal(seeding.seedCost, 1800)
    assert.approximately(seeding.fertilizerCost!, 2200, 0.001)
    assert.approximately(seeding.cost, 4000, 0.001)

    await field.refresh()
    assert.equal(field.status, FIELD_STATUS.OCCUPIED)
  })

  test('sows only the requested part of the field and counts cost for it', async ({ assert }) => {
    const field = await Field.create({ area: 20, type: 'loam', status: FIELD_STATUS.FREE })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 35,
    })
    const fertilizer = await Fertilizer.create({ name: 'Аммофос', price: 2.2 })

    const seeding = await createSeeding(field.id, {
      cropId: crop.id,
      sownArea: 8,
      stages: [{ stageName: 'Перед посевом', fertilizerId: fertilizer.id, dosagePerHa: 100 }],
    })

    assert.equal(seeding.sownArea, 8)
    assert.equal(seeding.seedCost, 1440)
    assert.approximately(seeding.fertilizerCost!, 1760, 0.001)
  })

  test('a requested area larger than the field falls back to the whole field', async ({
    assert,
  }) => {
    const field = await Field.create({ area: 12, type: 'loam', status: FIELD_STATUS.FREE })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 35,
    })

    const seeding = await createSeeding(field.id, { cropId: crop.id, sownArea: 50, stages: [] })

    assert.equal(seeding.sownArea, 12)
  })

  test('without a requested area the whole field is sown', async ({ assert }) => {
    const field = await Field.create({ area: 7, type: 'loam', status: FIELD_STATUS.FREE })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 35,
    })

    const seeding = await createSeeding(field.id, { cropId: crop.id, stages: [] })

    assert.equal(seeding.sownArea, 7)
  })

  test('cannot complete a seeding twice', async ({ assert }) => {
    const field = await Field.create({ area: 10, type: 'loam', status: FIELD_STATUS.FREE })
    const crop = await Crop.create({
      name: 'Пшеница',
      family: 'cereal',
      price: 180,
      avgYieldPerHa: 35,
    })

    const seeding = await createSeeding(field.id, { cropId: crop.id, stages: [] })
    await completeSeeding(seeding.id, 32)

    await assert.rejects(() => completeSeeding(seeding.id, 32), SeedingAlreadyCompletedException)
  })
})

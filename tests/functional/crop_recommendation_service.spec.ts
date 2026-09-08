import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Crop from '#models/crop'
import Field from '#models/field'
import Seeding from '#models/seeding'
import { getRecommendation } from '#services/crop_recommendation_service'
import { FIELD_STATUS } from '#constants/field'
import type { FieldType } from '#constants/field'
import { SEEDING_STATUS, PROBABILITY_LABEL } from '#constants/seeding'
import type { CropFamily } from '#constants/crop'

function createField(type: FieldType) {
  return Field.create({ area: 10, type, status: FIELD_STATUS.FREE })
}

function completedSeeding(field: Field, crop: Crop, monthsAgo = 1) {
  return Seeding.create({
    fieldId: field.id,
    cropId: crop.id,
    startedAt: DateTime.now().minus({ months: monthsAgo + 5 }),
    finishedAt: DateTime.now().minus({ months: monthsAgo }),
    status: SEEDING_STATUS.COMPLETED,
    cost: 1000,
  })
}

function createCrop(name: string, family: CropFamily) {
  return Crop.create({ name, family, price: 180, avgYieldPerHa: 35 })
}

test.group('CropRecommendationService', () => {
  test('empty field history on suitable soil gives high probability', async ({ assert }) => {
    const field = await createField('chernozem')
    const wheat = await createCrop('Пшеница', 'cereal')

    const { probability } = await getRecommendation(field, wheat.id)

    assert.equal(probability, PROBABILITY_LABEL.HIGH)
  })

  test('same family after the previous crop lowers probability to medium', async ({ assert }) => {
    const field = await createField('chernozem')
    const wheat = await createCrop('Пшеница', 'cereal')
    const barley = await createCrop('Ячмень', 'cereal')
    await completedSeeding(field, wheat)

    const { probability } = await getRecommendation(field, barley.id)

    assert.equal(probability, PROBABILITY_LABEL.MEDIUM)
  })

  test('bad rotation on unsuitable soil gives low probability', async ({ assert }) => {
    const field = await createField('sandy_loam')
    const wheat = await createCrop('Пшеница', 'cereal')
    const barley = await createCrop('Ячмень', 'cereal')
    await completedSeeding(field, wheat)

    const { probability } = await getRecommendation(field, barley.id)

    assert.equal(probability, PROBABILITY_LABEL.LOW)
  })

  test('unsuitable soil alone gives medium probability', async ({ assert }) => {
    const field = await createField('sandy_loam')
    const wheat = await createCrop('Пшеница', 'cereal')

    const { probability } = await getRecommendation(field, wheat.id)

    assert.equal(probability, PROBABILITY_LABEL.MEDIUM)
  })

  test('rotation looks at the latest completed seeding, not the earliest', async ({ assert }) => {
    const field = await createField('chernozem')
    const peas = await createCrop('Горох', 'legume')
    const wheat = await createCrop('Пшеница', 'cereal')
    const barley = await createCrop('Ячмень', 'cereal')

    await completedSeeding(field, peas, 12)
    await completedSeeding(field, wheat, 1)

    const forBarley = await getRecommendation(field, barley.id)
    const forPeas = await getRecommendation(field, peas.id)

    assert.equal(forBarley.probability, PROBABILITY_LABEL.MEDIUM)
    assert.equal(forPeas.probability, PROBABILITY_LABEL.HIGH)
  })

  test('"other" is a catch-all, not a family: it never blocks rotation', async ({ assert }) => {
    const field = await createField('chernozem')
    const previous = await createCrop('Гречиха', 'other')
    const next = await createCrop('Лён', 'other')
    await completedSeeding(field, previous)

    const { probability } = await getRecommendation(field, next.id)

    assert.equal(probability, PROBABILITY_LABEL.HIGH)
  })
})

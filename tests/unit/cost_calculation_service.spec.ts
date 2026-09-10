import { test } from '@japa/runner'
import { calculateCost, areaForYieldTons } from '#services/cost_calculation_service'
import type Crop from '#models/crop'
import type Fertilizer from '#models/fertilizer'

function makeCrop(price: number, avgYieldPerHa: number): Crop {
  return { price, avgYieldPerHa } as Crop
}

function makeFertilizer(price: number): Fertilizer {
  return { price } as Fertilizer
}

test.group('CostCalculationService', () => {
  test('calculates seed, fertilizer and total cost for a field with a fertilizer plan', ({
    assert,
  }) => {
    const crop = makeCrop(180, 35)

    const result = calculateCost({
      crop,
      areaHa: 10,
      fertilizerPlan: [
        { stageName: 'Перед посевом', fertilizer: makeFertilizer(2.2), dosagePerHa: 100 },
        { stageName: 'Вегетация', fertilizer: makeFertilizer(1.6), dosagePerHa: 50 },
      ],
    })

    assert.equal(result.seedCost, 1800)
    assert.approximately(result.fertilizerCost, 2200 + 800, 0.001)
    assert.approximately(result.totalCost, 1800 + 2200 + 800, 0.001)
    assert.approximately(result.costPerHa, result.totalCost / 10, 0.001)
    assert.equal(result.expectedTons, 35)
    assert.approximately(result.costPerExpectedTon, result.totalCost / 35, 0.001)
    assert.lengthOf(result.stages, 2)
  })

  test('handles an empty fertilizer plan', ({ assert }) => {
    const crop = makeCrop(180, 35)

    const result = calculateCost({ crop, areaHa: 10, fertilizerPlan: [] })

    assert.equal(result.fertilizerCost, 0)
    assert.equal(result.totalCost, result.seedCost)
    assert.lengthOf(result.stages, 0)
  })

  test('counts only the sown area, not the whole field', ({ assert }) => {
    const crop = makeCrop(180, 35)

    const result = calculateCost({
      crop,
      areaHa: 4,
      fertilizerPlan: [
        { stageName: 'Перед посевом', fertilizer: makeFertilizer(2.2), dosagePerHa: 100 },
      ],
    })

    assert.equal(result.seedCost, 720)
    assert.approximately(result.fertilizerCost, 880, 0.001)
    assert.approximately(result.expectedTons, 14, 0.001)
  })

  test('does not divide by zero when field area is zero', ({ assert }) => {
    const crop = makeCrop(180, 35)

    const result = calculateCost({ crop, areaHa: 0, fertilizerPlan: [] })

    assert.equal(result.costPerHa, 0)
    assert.equal(result.costPerExpectedTon, 0)
  })

  test('converts a desired yield in tons into the area to sow', ({ assert }) => {
    const crop = makeCrop(180, 40)

    assert.approximately(areaForYieldTons(crop, 100), 25, 0.001)
    assert.equal(areaForYieldTons(makeCrop(180, 0), 100), 0)
  })
})

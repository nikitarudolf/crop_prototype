import { test } from '@japa/runner'
import CostCalculationService from '#services/cost_calculation_service'
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
    const service = new CostCalculationService()
    const crop = makeCrop(180, 3.5)

    const result = service.calculate({
      crop,
      fieldAreaHa: 10,
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
    const service = new CostCalculationService()
    const crop = makeCrop(180, 3.5)

    const result = service.calculate({ crop, fieldAreaHa: 10, fertilizerPlan: [] })

    assert.equal(result.fertilizerCost, 0)
    assert.equal(result.totalCost, result.seedCost)
    assert.lengthOf(result.stages, 0)
  })

  test('does not divide by zero when field area is zero', ({ assert }) => {
    const service = new CostCalculationService()
    const crop = makeCrop(180, 3.5)

    const result = service.calculate({ crop, fieldAreaHa: 0, fertilizerPlan: [] })

    assert.equal(result.costPerHa, 0)
    assert.equal(result.costPerExpectedTon, 0)
  })
})

import Seeding from '#models/seeding'
import SeedingFertilizer from '#models/seeding_fertilizer'

export async function isCropUsed(cropId: number): Promise<boolean> {
  const seeding = await Seeding.query().select('id').where('cropId', cropId).first()

  return seeding !== null
}

export async function isFieldUsed(fieldId: number): Promise<boolean> {
  const seeding = await Seeding.query().select('id').where('fieldId', fieldId).first()

  return seeding !== null
}

export async function isFertilizerUsed(fertilizerId: number): Promise<boolean> {
  const usage = await SeedingFertilizer.query()
    .select('id')
    .where('fertilizerId', fertilizerId)
    .first()

  return usage !== null
}

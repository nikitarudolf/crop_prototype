import Crop from '#models/crop'
import type Field from '#models/field'
import Seeding from '#models/seeding'
import { PREFERRED_SOILS, CROP_FAMILY_TEXT } from '#constants/crop'
import type { CropFamily } from '#constants/crop'
import { FIELD_TYPE_TEXT } from '#constants/field'
import { SEEDING_STATUS, PROBABILITY_LABEL } from '#constants/seeding'
import type { ProbabilityLabel } from '#constants/seeding'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export interface CropRecommendation {
  crop: Crop
  probability: ProbabilityLabel
  reason: string
}

const PROBABILITY_ORDER: ProbabilityLabel[] = [
  PROBABILITY_LABEL.HIGH,
  PROBABILITY_LABEL.MEDIUM,
  PROBABILITY_LABEL.LOW,
]

export async function getRecommendedCrops(
  field: Field,
  trx?: TransactionClientContract
): Promise<CropRecommendation[]> {
  const crops = await Crop.all({ client: trx })
  const previousFamily = await loadPreviousFamily(field, trx)

  const recommendations = crops.map((crop) => evaluate(crop, field, previousFamily))

  return recommendations.sort(
    (a, b) => PROBABILITY_ORDER.indexOf(a.probability) - PROBABILITY_ORDER.indexOf(b.probability)
  )
}

export async function getRecommendation(
  field: Field,
  cropId: number,
  trx?: TransactionClientContract
): Promise<CropRecommendation> {
  const crop = await Crop.findOrFail(cropId, { client: trx })
  const previousFamily = await loadPreviousFamily(field, trx)

  return evaluate(crop, field, previousFamily)
}

async function loadPreviousFamily(
  field: Field,
  trx?: TransactionClientContract
): Promise<CropFamily | null> {
  const lastCompletedSeeding = await Seeding.query({ client: trx })
    .where('fieldId', field.id)
    .andWhere('status', SEEDING_STATUS.COMPLETED)
    .preload('crop')
    .orderBy('finishedAt', 'desc')
    .first()

  return lastCompletedSeeding?.crop?.family ?? null
}

function evaluate(crop: Crop, field: Field, previousFamily: CropFamily | null): CropRecommendation {
  const problems: string[] = []

  if (crop.family !== 'other' && previousFamily === crop.family) {
    problems.push(
      `в прошлом сезоне на поле росла культура того же семейства (${CROP_FAMILY_TEXT[crop.family].toLowerCase()})`
    )
  }

  if (!PREFERRED_SOILS[crop.family].includes(field.type)) {
    problems.push(`${FIELD_TYPE_TEXT[field.type].toLowerCase()} плохо подходит для этого семейства`)
  }

  if (problems.length === 0) {
    return {
      crop,
      probability: PROBABILITY_LABEL.HIGH,
      reason:
        previousFamily === null
          ? 'История поля пуста, почва подходит'
          : 'Подходит по почве и севообороту',
    }
  }

  const reason = problems.join('; ')

  return {
    crop,
    probability: problems.length === 1 ? PROBABILITY_LABEL.MEDIUM : PROBABILITY_LABEL.LOW,
    reason: reason.charAt(0).toUpperCase() + reason.slice(1),
  }
}

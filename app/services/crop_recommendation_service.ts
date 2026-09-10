import Crop from '#models/crop'
import Field from '#models/field'
import Seeding from '#models/seeding'
import { areaForYieldTons, expectedTonsFor, roundTons } from '#services/cost_calculation_service'
import { PREFERRED_SOILS, CROP_FAMILY_TEXT } from '#constants/crop'
import type { CropFamily } from '#constants/crop'
import { FIELD_TYPE_TEXT } from '#constants/field'
import { SEEDING_STATUS, PROBABILITY_LABEL } from '#constants/seeding'
import type { ProbabilityLabel } from '#constants/seeding'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

interface Evaluation {
  probability: ProbabilityLabel
  reason: string
}

export interface CropRecommendation extends Evaluation {
  crop: Crop
}

export interface FieldRecommendation extends Evaluation {
  field: Field
}

export interface FieldOption extends FieldRecommendation {
  maxYieldTons: number
  isBigEnough: boolean
}

export interface FieldOptionsForYield {
  requiredArea: number
  options: FieldOption[]
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
  const crops = await Crop.query({ client: trx }).withScopes((scopes) => scopes.ordered())
  const previousFamily = await loadPreviousFamily(field.id, trx)

  const recommendations = crops.map((crop) => ({
    crop,
    ...evaluate(crop, field, previousFamily),
  }))

  return recommendations.sort(byProbability)
}

export async function getRecommendation(
  field: Field,
  cropId: number,
  trx?: TransactionClientContract
): Promise<CropRecommendation> {
  const crop = await Crop.findOrFail(cropId, { client: trx })
  const previousFamily = await loadPreviousFamily(field.id, trx)

  return { crop, ...evaluate(crop, field, previousFamily) }
}

export async function getFieldOptionsForYield(
  crop: Crop,
  desiredYieldTons: number
): Promise<FieldOptionsForYield> {
  const fields = await Field.query().withScopes((scopes) => scopes.free())
  const previousFamilies = await loadPreviousFamilies(fields.map((field) => field.id))
  const requiredArea = roundUpToCents(areaForYieldTons(crop, desiredYieldTons))

  const options = fields.map((field) => ({
    field,
    ...evaluate(crop, field, previousFamilies.get(field.id) ?? null),
    maxYieldTons: roundTons(expectedTonsFor(crop, field.area)),
    isBigEnough: field.area >= requiredArea,
  }))

  options.sort((a, b) => {
    if (a.isBigEnough !== b.isBigEnough) {
      return a.isBigEnough ? -1 : 1
    }

    const byLabel = byProbability(a, b)
    if (byLabel !== 0) {
      return byLabel
    }

    return a.isBigEnough ? a.field.area - b.field.area : b.field.area - a.field.area
  })

  return { requiredArea, options }
}

function roundUpToCents(area: number): number {
  return Math.ceil(area * 100) / 100
}

function byProbability(a: Evaluation, b: Evaluation): number {
  return PROBABILITY_ORDER.indexOf(a.probability) - PROBABILITY_ORDER.indexOf(b.probability)
}

async function loadPreviousFamily(
  fieldId: number,
  trx?: TransactionClientContract
): Promise<CropFamily | null> {
  const families = await loadPreviousFamilies([fieldId], trx)

  return families.get(fieldId) ?? null
}

async function loadPreviousFamilies(
  fieldIds: number[],
  trx?: TransactionClientContract
): Promise<Map<number, CropFamily>> {
  if (fieldIds.length === 0) {
    return new Map()
  }

  const completedSeedings = await Seeding.query({ client: trx })
    .whereIn('fieldId', fieldIds)
    .andWhere('status', SEEDING_STATUS.COMPLETED)
    .preload('crop')
    .orderBy('finishedAt', 'asc')

  const families = new Map<number, CropFamily>()

  for (const seeding of completedSeedings) {
    families.set(seeding.fieldId, seeding.crop.family)
  }

  return families
}

function evaluate(crop: Crop, field: Field, previousFamily: CropFamily | null): Evaluation {
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
      probability: PROBABILITY_LABEL.HIGH,
      reason:
        previousFamily === null
          ? 'История поля пуста, почва подходит'
          : 'Подходит по почве и севообороту',
    }
  }

  const reason = problems.join('; ')

  return {
    probability: problems.length === 1 ? PROBABILITY_LABEL.MEDIUM : PROBABILITY_LABEL.LOW,
    reason: reason.charAt(0).toUpperCase() + reason.slice(1),
  }
}

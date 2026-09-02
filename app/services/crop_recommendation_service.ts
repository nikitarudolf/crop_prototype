import Crop from '#models/crop'
import type Field from '#models/field'
import Seeding from '#models/seeding'
import { PREFERRED_SOILS, cropFamilyText } from '#constants/crop'
import type { CropFamily } from '#constants/crop'
import { fieldTypeText } from '#constants/field'
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

export default class CropRecommendationService {
  async getRecommendedCrops(
    field: Field,
    trx?: TransactionClientContract
  ): Promise<CropRecommendation[]> {
    const options = trx ? { client: trx } : {}

    const crops = await Crop.all(options)
    const previousFamily = await this.loadPreviousFamily(field, trx)

    const recommendations = crops.map((crop) => this.evaluate(crop, field, previousFamily))

    return recommendations.sort(
      (a, b) => PROBABILITY_ORDER.indexOf(a.probability) - PROBABILITY_ORDER.indexOf(b.probability)
    )
  }

  async getRecommendation(
    field: Field,
    cropId: number,
    trx?: TransactionClientContract
  ): Promise<CropRecommendation> {
    const options = trx ? { client: trx } : {}

    const crop = await Crop.findOrFail(cropId, options)
    const previousFamily = await this.loadPreviousFamily(field, trx)

    return this.evaluate(crop, field, previousFamily)
  }

  async getProbability(
    field: Field,
    cropId: number,
    trx?: TransactionClientContract
  ): Promise<ProbabilityLabel> {
    const { probability } = await this.getRecommendation(field, cropId, trx)

    return probability
  }

  private async loadPreviousFamily(
    field: Field,
    trx?: TransactionClientContract
  ): Promise<CropFamily | null> {
    const lastCompletedSeeding = await Seeding.query(trx ? { client: trx } : {})
      .where('fieldId', field.id)
      .andWhere('status', SEEDING_STATUS.COMPLETED)
      .preload('crop')
      .orderBy('finishedAt', 'desc')
      .first()

    return lastCompletedSeeding?.crop?.family ?? null
  }

  private evaluate(
    crop: Crop,
    field: Field,
    previousFamily: CropFamily | null
  ): CropRecommendation {
    const problems: string[] = []

    if (crop.family !== 'other' && previousFamily === crop.family) {
      problems.push(
        `в прошлом сезоне на поле росла культура того же семейства (${cropFamilyText(crop.family).toLowerCase()})`
      )
    }

    if (!PREFERRED_SOILS[crop.family].includes(field.type)) {
      problems.push(`${fieldTypeText(field.type).toLowerCase()} плохо подходит для этого семейства`)
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
}

import Crop from '#models/crop'
import Seeding from '#models/seeding'
import { SEEDING_STATUS, PROBABILITY_LABEL } from '#constants/seeding'
import type { ProbabilityLabel } from '#constants/seeding'
import { errors } from '@adonisjs/lucid'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export type CropSuitability = 'recommended' | 'not_recommended'

export interface CropRecommendation {
  crop: Crop
  suitability: CropSuitability
  reason: string
}

export default class CropRecommendationService {
  async getRecommendedCrops(
    fieldId: number,
    trx?: TransactionClientContract
  ): Promise<CropRecommendation[]> {
    const options = trx ? { client: trx } : {}

    const crops = await Crop.all(options)

    const lastCompletedSeeding = await Seeding.query(options)
      .where('fieldId', fieldId)
      .andWhere('status', SEEDING_STATUS.COMPLETED)
      .orderBy('finishedAt', 'desc')
      .first()

    const recommendations: CropRecommendation[] = crops.map((crop) => {
      if (!lastCompletedSeeding) {
        return {
          crop,
          suitability: 'recommended',
          reason: 'История поля пуста',
        }
      }

      if (lastCompletedSeeding.cropId === crop.id) {
        return {
          crop,
          suitability: 'not_recommended',
          reason: 'Эта культура уже росла на поле в прошлом сезоне',
        }
      }

      return {
        crop,
        suitability: 'recommended',
        reason: 'Подходит для этого поля',
      }
    })

    return recommendations.sort((a, b) => {
      if (a.suitability === b.suitability) return 0
      return a.suitability === 'recommended' ? -1 : 1
    })
  }

  async getRecommendation(
    fieldId: number,
    cropId: number,
    trx?: TransactionClientContract
  ): Promise<CropRecommendation> {
    const recommendations = await this.getRecommendedCrops(fieldId, trx)
    const current = recommendations.find((item) => item.crop.id === cropId)

    if (!current) {
      throw new errors.E_ROW_NOT_FOUND()
    }

    return current
  }

  async getProbability(
    fieldId: number,
    cropId: number,
    trx?: TransactionClientContract
  ): Promise<ProbabilityLabel> {
    const { suitability } = await this.getRecommendation(fieldId, cropId, trx)

    return suitability === 'recommended' ? PROBABILITY_LABEL.HIGH : PROBABILITY_LABEL.LOW
  }
}

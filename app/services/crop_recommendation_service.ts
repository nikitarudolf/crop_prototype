import Crop from '#models/crop'
import Seeding from '#models/seeding'
import { SEEDING_STATUS } from '#constants/seeding'

export type CropSuitability = 'recommended' | 'not_recommended'

export interface CropRecommendation {
  crop: Crop
  suitability: CropSuitability
  reason: string
}

export default class CropRecommendationService {
  async getRecommendedCrops(fieldId: number): Promise<CropRecommendation[]> {
    const crops = await Crop.all()

    const lastCompletedSeeding = await Seeding.query()
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
}
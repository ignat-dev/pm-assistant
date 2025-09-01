import { Feature } from '@/types'
import { api } from './apiClient'

export async function getFeatures(): Promise<Array<Feature>> {
  return api.get<Array<Feature>>('/api/features').then(sortFeatures)
}

function sortFeatures(features: Array<Feature>): Array<Feature> {
  return features.sort((x, y) => {
    if (y.importancePoints !== x.importancePoints) {
      return y.importancePoints - x.importancePoints
    }

    if (y.requestCount !== x.requestCount) {
      return y.requestCount - x.requestCount
    }

    return y.relatedFeatures.length - x.relatedFeatures.length
  })
}

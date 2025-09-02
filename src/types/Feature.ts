import { SimilarFeatureResult } from './SimilarFeatureResult'

export interface Feature {
  id: string
  importancePoints: number
  relatedFeatures: Array<SimilarFeatureResult>
  requestCount: number
  summary: string
  title: string
  timestamp: number
  transcripts: Array<string>
}

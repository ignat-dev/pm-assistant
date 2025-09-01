export interface Feature {
  id: string
  importancePoints: number
  relatedFeatures: Array<string>
  requestCount: number
  summary: string
  title: string
  timestamp: number
}

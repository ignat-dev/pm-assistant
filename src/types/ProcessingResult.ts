import { Feature } from './Feature'

export interface ProcessingResult {
  id?: string
  duplicates: Array<Feature>
  features: Array<Feature>
}

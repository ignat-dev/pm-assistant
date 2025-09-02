import { ProcessingResult, Transcript } from '@/types'
import { api } from './apiClient'

export function getTranscript(id: string): Promise<Transcript | null> {
  return api.get<Transcript | null>(`/api/transcripts/${id}`)
}

export function getTranscripts(): Promise<Array<Transcript>> {
  return api.get<Array<Transcript>>('/api/transcripts')
}

export function getTestTranscripts(): Promise<Array<Transcript>> {
  return api.get<Array<Transcript>>('/api/transcripts/test')
}

export function processTranscript(content: string): Promise<ProcessingResult> {
  return api.post('/api/transcripts', { content })
}

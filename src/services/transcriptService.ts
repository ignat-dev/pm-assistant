import { DbName } from '@/common/constants'
import { ProcessingResult, Transcript } from '@/types'
import { extractFeaturesFromTranscript } from './aiService'
import { addRecord, getAllRecords, getRecord } from './dbService'
import { processFeatures } from './featureService'

export async function getTranscript(id: string): Promise<Transcript | null> {
  return getRecord<Transcript>(DbName.Transcripts, id)
}

export async function getAllTranscripts(): Promise<Array<Transcript>> {
  return getAllRecords<Transcript>(DbName.Transcripts)
}

export async function addTranscript(content: string): Promise<Transcript> {
  return addRecord<Transcript>(DbName.Transcripts, { content, timestamp: Date.now() })
}

export async function processTranscript(content: string): Promise<ProcessingResult> {
  const transcript = await addTranscript(content)
  const extractedFeatures = await extractFeaturesFromTranscript(transcript)
  const { features, duplicates } = await processFeatures(extractedFeatures)

  return { id: transcript.id, features, duplicates }
}

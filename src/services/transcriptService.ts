import { DbName } from '@/common/constants'
import { ProcessingResult, Transcript } from '@/types'
import { ChatOpenAI } from '@langchain/openai'
import { v4 as uuidv4 } from 'uuid'
import { addRecord, getAllRecords } from './dbService'
import { processFeatures } from './featureService'

export async function getAllTranscripts(): Promise<Array<Transcript>> {
  return getAllRecords<Transcript>(DbName.Transcripts)
}

export async function addTranscript(content: string): Promise<Transcript> {
  return addRecord<Transcript>(DbName.Transcripts, { content, timestamp: Date.now() })
}

export async function processTranscript(content: string): Promise<ProcessingResult> {
  const transcript = await addTranscript(content)

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
  })

  // TODO: Generate title and summary in additional step for better results.
  // Extract feature requests using AI.
  const { content: featuresContent } = await model.invoke(`
    You are a product manager assistant. Your role is to review customer support chats,
    evaluate the customer feedback, and gather valuable insights to improve the product.
    Extract all feature requests from the following customer support chat transcript,
    by taking into account these steps and instructions:

    - First and foremost, identify who is the customer in the conversation.
    - Identify and extract key needs and pain points for the customer.
    - Drop requests that are confirmed as available by the support representative.
    - Do not include features from the support representative's messages/replies.
    - Analyze all information and connections or relations between the requests.
    - Split unrelated topics into separate features, even if they are mentioned together.
    - Combine similar requests into one feature, but only if they are closely related.
    - Rephrase all identified feature requests as detailed product objectives.
    - Create a concise but informative title and a detailed summary for each feature request.
      - Capture key information, requirements, and additional context from the transcript.
      - Generate a user-friendly description for each feature request, with enough context.
      - Explain the feature request in simple terms, focusing on the customer's perspective.
      - The summary should provide enough context for someone unfamiliar with the conversation.
      - Avoid using technical terms, jargon, or abbreviations in the titles and summaries.
    - Assign a score for feature importance based on customer sentiment and request context.
    - Return unformatted JSON array with feature objects with the following format:
      {
        "title": "concise summary of the feature request (up to 100 characters)",
        "summary": "detailed description of the feature request (4-5 sentences)",
        "score": "numeric score of feature importance for the customer (0-low to 5-high)"
      }

    Transcript:
    ---
    ${content}
  `)

  const extractedFeatures = (
    JSON.parse(featuresContent.toString()) as Array<{ title: string, summary: string, score: number }>
  ).map(({ title, score, summary }) => ({
    id: uuidv4(),
    importancePoints: Number(score) ||  0,
    relatedFeatures: [],
    requestCount: 1,
    summary,
    title,
    timestamp: transcript.timestamp,
  }))

  const { features, duplicates } = await processFeatures(extractedFeatures)

  return { id: transcript.id, features, duplicates }
}

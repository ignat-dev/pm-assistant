import { Feature, Transcript } from '@/types'
import { ChatOpenAI } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_CHUNK_SIZE = 8000
const DEFAULT_CHUNK_OVERLAP = 200

export function createModel(options?: { temperature?: number }) {
  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: options?.temperature ?? 0,
  })
}

// TODO: Generate title and summary in additional step for better results.
export async function extractFeaturesFromTranscript(transcript: Transcript): Promise<Array<Feature>> {
  const model = createModel({ temperature: 0.3 })
  const prompt = `
    You are a product manager assistant. Your role is to review customer support chats,
    evaluate the customer feedback, and gather valuable insights to improve the product.
    Extract all feature requests from the following customer support chat transcript,
    by taking into account these steps and instructions:

    - First and foremost, identify who is the customer in the conversation.
    - Identify and extract key needs and pain points for the customer.
    - Drop requests that are confirmed as available by the support representative.
    - Do not include information from the support representative's messages/replies.
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
  `

  const extractedFeatures = []

  for (const chunk of await splitTextIntoChunks(transcript.content)) {
    const { content: featuresContent } = await model.invoke(prompt + chunk)

    try {
      extractedFeatures.push(...JSON.parse(featuresContent.toString()))
    } catch (ex) {
      // TODO: Use persistent storage for logs for debugging purposes.
      console.error('Error parsing extracted feature requests:', ex)
      console.log('Model response:', featuresContent.toString())
    }
  }

  return extractedFeatures.map(({ title, score, summary }) => ({
    id: uuidv4(),
    importancePoints: Number(score) ||  0,
    relatedFeatures: [],
    requestCount: 1,
    summary,
    title,
    timestamp: transcript.timestamp,
    transcripts: [transcript.id],
  }))
}

export async function mergeFeaturesTextProps(x: Feature, y: Feature): Promise<Pick<Feature, 'title' | 'summary'>> {
  const { content } = await createModel({ temperature: 0.5 }).invoke(`
    You are a product manager assistant. Your role is to review duplicate
    feature requests and combine them into a single, comprehensive request.
    Given the feature requests, merge them by following these instructions:

    - Carefully read both feature requests and extract all unique details, requirements, and context from each.
    - Do not omit any relevant information, even if it appears in only one request.
    - If there are differences or variations in requirements, mention them in the summary.
    - Combine all key needs, pain points, and objectives into a unified, detailed summary.
    - Extend the title, if needed, to reflect all important aspects from the titles of both features.
    - The summary should be comprehensive, capturing all important details and context from both requests.
    - If there are any conflicting requirements or priorities, clearly outline them in the summary.
    - The merge process should be transparent, do not mention the merge itself or the original requests.
    - Avoid using technical jargon or abbreviations, and explain any necessary terms.
    - Organize the summary into logical paragraphs. After each main idea or topic, insert a properly escaped
      for JSON string double newline (\\n\\n) to start a new paragraph. See the example below.
    - Ensure the merged feature is clear and understandable for someone unfamiliar with the original requests.
    - Return unformatted JSON object with the following format:
      {
        "title": "concise summary of the merged feature request (up to 100 characters)",
        "summary": "detailed description of the merged feature request (3-9 sentences)"
      }

    Example output:
    {
      "title": "Enable export to PDF and Excel",
      "summary": "Customers want to export reports in PDF format for sharing with stakeholders.\\n\\nSome users also require Excel exports to analyze data and apply custom filters.\\n\\nSupporting both formats will address a wider range of user needs and improve workflow efficiency."
    }

    Here are the feature requests that need to be merged:

    ${[x, y].map(({ title, summary }, i) => `
      - Feature #${i + 1}:
        ---
        Title: ${title}
        Summary: ${summary}
    `).join('\n')}
  `)

  try {
    return JSON.parse(content.toString())
  } catch (ex) {
    // TODO: Use persistent storage for logs for debugging purposes.
    console.error('Error parsing merged feature request:', ex)
    console.log('Model response:', content.toString())

    // In case of parsing failure, fall back to the original feature content.
    return { title: x.title, summary: x.summary }
  }
}


export async function splitTextIntoChunks(
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = DEFAULT_CHUNK_OVERLAP,
): Promise<Array<string>> {
  if (text.length <= chunkSize) {
    return [text]
  }

  return new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap }).splitText(text)
}

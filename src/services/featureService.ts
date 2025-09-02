import { DbName } from '@/common/constants'
import { Feature, ProcessingResult, SimilarFeatureResult } from '@/types'
import { ChatOpenAI } from '@langchain/openai'
import { addRecord, addText, getAllRecords, getRecord, queryText, updateRecord } from './dbService'

// TODO: Move to external configuration.
const SIMILARITY_THRESHOLD_DUPLICATE = 0.85
const SIMILARITY_THRESHOLD_RELATED = 0.60

export async function getAllFeatures(): Promise<Array<Feature>> {
  return getAllRecords<Feature>(DbName.Features)
}

export async function addFeature(text: string): Promise<Feature> {
  return addRecord<Feature>(DbName.Features, {
    importancePoints: 0,
    relatedFeatures: [],
    requestCount: 0,
    title: text,
    timestamp: Date.now(),
  })
}

export async function processFeatures(features: Array<Feature>): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    duplicates: [],
    features: [],
  }

  for (const feature of features) {
    const similarFeatures = await findSimilarFeatures(feature)

    if (similarFeatures.length > 0) {
      const [existingFeature, similarity] = similarFeatures[0]

      // If the feature already exists, update it.
      if (similarity >= SIMILARITY_THRESHOLD_DUPLICATE) {
        updateRecord<Feature>(
          DbName.Features,
          existingFeature.id,
          await mergeFeatures(existingFeature, feature as Feature)
        )
        result.duplicates.push(feature)
        // Avoid storing the duplicate feature.
        continue
      } else {
        // Add the most similar features as related.
        feature.relatedFeatures = mergeRelated([], similarFeatures.map(([feature, similarity]) => ({
          featureId: feature.id,
          similarity,
        })))
        // Also update the related features.
        similarFeatures.forEach(([similarFeature, similarity]) =>
          updateRecord<Feature>(DbName.Features, similarFeature.id, {
            relatedFeatures: mergeRelated(similarFeature.relatedFeatures, [{
              featureId: feature.id,
              similarity,
            }]),
          })
        )
      }
    }

    // Store the feature request in DB.
    const storedFeature = addRecord<Feature>(DbName.Features, feature)

    // Keep the full feature object to return it.
    result.features.push(storedFeature)

    // Store feature details for similarity searches.
    addText(storedFeature.title, { featureId: storedFeature.id })
    addText(storedFeature.summary, { featureId: storedFeature.id })
  }

  return result
}

async function findSimilarFeatures({ title, summary }: Feature): Promise<Array<[Feature, number]>> {
  const similarResults = [...await queryText(title), ...await queryText(summary)]
  const processedResults = new Set<string>()

  return (
    similarResults
      .filter(({ similarity }) => similarity > SIMILARITY_THRESHOLD_RELATED)
      .sort(({ similarity: x }, { similarity: y }) => y - x)
      .reduce((result, { document, similarity }) => {
        const { featureId } = document.metadata || {}

        if (!featureId || processedResults.has(featureId)) {
          return result
        }

        processedResults.add(featureId)

        const feature = getRecord<Feature>(DbName.Features, featureId)

        if (feature) {
          result.push([feature, similarity])
        }

        return result
      }, [] as Array<[Feature, number]>)
  )
}

async function mergeFeatures(x: Feature, y: Feature): Promise<Feature> {
  // TODO: Move model initialization to a new service.
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
  })

  const { content } = await model.invoke(`
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

  let mergedContent = {}

  // In case of parsing failure, fall back to original feature content.
  try {
    mergedContent = JSON.parse(content.toString())
  } catch (ex) {
    // TODO: Use persistent storage for logs for debugging purposes.
    console.error('Error parsing merged feature request:', ex)
    console.log('Merged content:', content.toString())
  }

  return {
    ...x,
    ...mergedContent,
    importancePoints: x.importancePoints + y.importancePoints,
    relatedFeatures: mergeRelated(x.relatedFeatures, y.relatedFeatures),
    requestCount: x.requestCount + 1,
  }
}

function mergeRelated<T extends SimilarFeatureResult>(x: Array<T>, y: Array<T>): Array<T> {
  const result = [...x]

  for (const item of y) {
    const existing = result.find((x) => x.featureId === item.featureId)

    if (existing) {
      existing.similarity = Math.max(existing.similarity, item.similarity)
    } else {
      result.push(item)
    }
  }

  return result
}

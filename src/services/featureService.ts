import { DbName } from '@/common/constants'
import { Feature, ProcessingResult, SimilarFeatureResult } from '@/types'
import { mergeFeaturesTextProps } from './aiService'
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
  const mergedContent = await mergeFeaturesTextProps(x, y)

  return {
    ...x,
    ...mergedContent,
    importancePoints: x.importancePoints + y.importancePoints,
    relatedFeatures: mergeRelated(x.relatedFeatures, y.relatedFeatures),
    requestCount: x.requestCount + 1,
    transcripts: Array.from(new Set([...x.transcripts, ...y.transcripts])),
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

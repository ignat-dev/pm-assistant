import { DbName } from '@/common/constants'
import { Feature, ProcessingResult } from '@/types'
import { addRecord, addText, getAllRecords, getRecord, queryText, updateRecord } from './dbService'

const SIMILARITY_THRESHOLD_DUPLICATE = 0.90
const SIMILARITY_THRESHOLD_RELATED = 0.70

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
        // TODO: Use AI to merge the title and summary properties.
        updateRecord<Feature>(
          DbName.Features,
          existingFeature.id,
          mergeFeatures(existingFeature, feature as Feature)
        )
        result.duplicates.push(feature)
        // Avoid storing the duplicate feature.
        continue
      } else {
        // Add the most similar features as related.
        feature.relatedFeatures = mergeRelated([], similarFeatures.map(([feature]) => feature.id))
        // Also update the related features.
        similarFeatures.forEach(([similarFeature]) =>
          updateRecord<Feature>(DbName.Features, similarFeature.id, {
            relatedFeatures: mergeRelated(similarFeature.relatedFeatures, [feature.id]),
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
      .filter(({ similarity }) => similarity >= SIMILARITY_THRESHOLD_RELATED)
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

function mergeFeatures(x: Feature, y: Feature): Feature {
  return {
    ...x,
    importancePoints: x.importancePoints + y.importancePoints,
    relatedFeatures: mergeRelated(x.relatedFeatures, y.relatedFeatures),
    requestCount: x.requestCount + 1,
  }
}

function mergeRelated(x: Array<string>, y: Array<string>): Array<string> {
  return Array.from(new Set([...x, ...y]))
}

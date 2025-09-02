'use client'

import { LoadingDialog, ModalDialog } from '@/components'
import { getFeatures, getTranscript } from '@/lib/api'
import { Feature, SimilarFeature, Transcript } from '@/types'
import { useEffect, useMemo, useState } from 'react'
import FeatureDetails from './components/FeatureDetails/FeatureDetails'
import FeatureList from './components/FeatureList/FeatureList'

import './page.scss'

export default function Features() {
  const [features, setFeatures] = useState<Array<Feature>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null)
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null)

  const currentRelatedFeatures = useMemo(() => (
    selectedFeature?.relatedFeatures.reduce(
      (result, { featureId, similarity }) => {
        const feature = features.find((f) => f.id === featureId) ?? null

        if (feature) {
          result.push({ feature, similarity })
        }

        return result
      },
      [] as Array<SimilarFeature>,
    ).sort((x, y) => y.similarity - x.similarity) ?? []
  ), [selectedFeature, features])

  useEffect(() => {
    getFeatures().then((features) => {
      setFeatures(features)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selectedTranscriptId) {
      getTranscript(selectedTranscriptId).then(setSelectedTranscript)
    } else {
      setSelectedTranscript(null)
    }
  }, [selectedTranscriptId])

  if (isLoading) {
    return (
      <LoadingDialog text="Loading feature requests..." />
    )
  }

  return (
    <main className="page-features">
      <FeatureList
        features={features}
        selectedFeatureId={selectedFeature?.id ?? ''}
        onRowClick={setSelectedFeature}
      />
      {selectedFeature && (
        <FeatureDetails
          feature={selectedFeature}
          relatedFeatures={currentRelatedFeatures}
          onClickRelated={setSelectedFeature}
          onClickTranscript={setSelectedTranscriptId}
          onClose={() => setSelectedFeature(null)}
        />
      )}
      {selectedTranscriptId && (
        <ModalDialog title="Transcript preview" onClose={() => setSelectedTranscriptId(null)}>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {selectedTranscript?.content ?? (
              <span aria-busy="true">Loading transcript content...</span>
            )}
          </p>
        </ModalDialog>
      )}
    </main>
  )
}

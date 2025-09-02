'use client'

import { LoadingDialog } from '@/components'
import { getFeatures } from '@/lib/api'
import { Feature, SimilarFeature } from '@/types'
import { useEffect, useMemo, useState } from 'react'
import FeatureDetails from './components/FeatureDetails/FeatureDetails'
import FeatureList from './components/FeatureList/FeatureList'

import './page.scss'

export default function Features() {
  const [features, setFeatures] = useState<Array<Feature>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

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
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </main>
  )
}

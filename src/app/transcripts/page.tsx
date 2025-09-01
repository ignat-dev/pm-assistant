'use client'

import { LoadingDialog, ModalDialog } from '@/components'
import { getTestTranscripts, getTranscripts, processTranscript } from '@/lib/api'
import { ProcessingResult, Transcript } from '@/types'
import { simulateDelay } from '@/utils'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ResultView from './components/ResultView/ResultView'
import TranscriptPreview from './components/TranscriptPreview/TranscriptPreview'

import './page.scss'

export default function Transcripts() {
  const [currentTranscript, setCurrentTranscript] = useState<Transcript | null>(null)
  const [duplicatesCount, setDuplicatesCount] = useState(0)
  const [featuresCount, setFeaturesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [processedCount, setProcessedCount] = useState(0)
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [useTestData, setUseTestData] = useState(false)
  const isComplete = useMemo(() => processedCount === totalCount, [processedCount, totalCount])
  const router = useRouter()

  const loadItems = useCallback(async (): Promise<Array<Transcript>> => {
    let result: Array<Transcript> = []

    try {
      setIsLoading(true)
      result = await (useTestData ? getTestTranscripts : getTranscripts)()
      await simulateDelay(1000)
    } catch (error) {
      console.error('Error loading transcripts:', error)
    } finally {
      setIsLoading(false)
    }

    return result
  }, [useTestData])

  const processItem = useCallback(async (transcript: Transcript): Promise<void> => {
    try {
      setCurrentTranscript(transcript)
      setProcessingResult(null)

      const data = await processTranscript(transcript.content)

      setProcessedCount((prev) => prev + 1)
      setProcessingResult(data)
      setFeaturesCount((prev) => prev + data.features.length)
      setDuplicatesCount((prev) => prev + data.duplicates.length)
      await simulateDelay(1500)
    } catch (error) {
      console.error('Error processing transcript:', error)
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    loadItems().then(async (transcripts) => {
      setProcessedCount(0)
      setFeaturesCount(0)
      setDuplicatesCount(0)
      setTotalCount(transcripts.length)

      for (const item of transcripts) {
        if (isCancelled) {
          break
        }

        await processItem(item)
      }
    })

    // Cleanup in case component unmounts.
    return () => {
      isCancelled = true
    }
  }, [loadItems, processItem])

  if (isLoading) {
    return (
      <LoadingDialog text={`Loading ${useTestData ? 'test' : 'chat'} transcripts...`} />
    )
  }

  if (totalCount === 0) {
    return (
      <ModalDialog
        confirmText="Continue"
        title="No transcripts available"
        onConfirm={() => setUseTestData(true)}
      >
        <p>
          Currently there are no chat transcripts available for processing.
          Some example chat transcripts will be loaded for testing purposes.
        </p>
      </ModalDialog>
    )
  }

  return (
    <main className="page-transcripts">
      <header>
        <span aria-busy={!isComplete}>
          {isComplete ? 'Processed all transcripts!' : 'Processing chat transcripts...'}
        </span>
        <progress max={totalCount} value={processedCount} />
        <span>
          {processedCount} / {totalCount}
        </span>
      </header>
      {renderContent()}
    </main>
  )

  function renderContent() {
    if (isComplete) {
      return (
        <section>
          <article>
            <h2>Transcripts processing complete</h2>
            <p>
              All chat transcripts have been processed successfully.
            </p>
            <p>Summary of processing results:</p>
            <ul>
              <li>Total transcripts: {totalCount}</li>
              <li>Feature requests: {featuresCount}</li>
              <li>Duplicate features: {duplicatesCount}</li>
            </ul>
            <p>
              Now you can proceed to review the extracted feature requests.
            </p>
            <footer>
              <button onClick={() => router.push('/features')}>Continue</button>
            </footer>
          </article>
        </section>
      )
    }

    return (
      <section>
        <div>
          <TranscriptPreview transcript={currentTranscript} />
        </div>
        <div>
          <ResultView result={processingResult} />
        </div>
      </section>
    )
  }
}

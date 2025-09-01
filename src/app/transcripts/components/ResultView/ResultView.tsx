import { Feature, ProcessingResult } from '@/types'

import './ResultView.scss'

interface Props {
  result: ProcessingResult | null
}

export default function ResultView({ result }: Props) {
  return (
    <article className="result-view">
      {renderContent()}
    </article>
  )

  function renderContent() {
    if (!result) {
      return <span aria-busy="true">Processing...</span>
    }

    return (
      <>
        <h5>Feature requests</h5>
        {result.features.length > 0 ? (
          renderFeatures(result.features)
        ) : (
          <p style={{ fontStyle: 'italic' }}>
            {(
              result.duplicates.length > 0
                ? 'All feature requests found in the transcript were duplicates.'
                : 'No feature requests were found in the transcript.'
            )}
          </p>
        )}
        {result.duplicates.length > 0 && (
          <>
            <h5>Duplicate features</h5>
            {renderFeatures(result.duplicates)}
          </>
        )}
      </>
    )
  }

  function renderFeatures(features: Array<Feature>) {
    return (
      <ul>
        {features.map(({ id, summary, title }) => (
          <li key={id}>
            <b>{title}</b>
            <br />
            <span>{summary}</span>
          </li>
        ))}
      </ul>
    )
  }
}

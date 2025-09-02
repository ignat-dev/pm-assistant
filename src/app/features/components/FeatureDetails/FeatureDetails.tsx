import { Feature, SimilarFeature } from '@/types'

import './FeatureDetails.scss'

interface Props {
  feature: Feature
  relatedFeatures: Array<SimilarFeature>
  onClickRelated: (feature: Feature) => void
  onClickTranscript: (transcriptId: string) => void
  onClose: () => void
}

export default function FeatureDetails({
  feature,
  relatedFeatures,
  onClickRelated,
  onClickTranscript,
  onClose,
}: Props) {
  const handleClickRelated = (e: React.MouseEvent, relatedFeature: Feature) => {
    e.preventDefault()
    onClickRelated(relatedFeature)
  }

  const handleClickTranscript = (e: React.MouseEvent, transcriptId: string) => {
    e.preventDefault()
    onClickTranscript(transcriptId)
  }

  return (
    <section className="feature-details">
      <article>
        <header>
          <h3>{feature.title}</h3>
          <button className="outline secondary" onClick={onClose}>✕</button>
        </header>
        <section>
          <h5>Details</h5>
          <table>
            <tbody>
              <tr>
                <td>Importance points:</td>
                <td>{feature.importancePoints}</td>
              </tr>
              <tr>
                <td>Request count:</td>
                <td>{feature.requestCount}</td>
              </tr>
              <tr>
                <td>Related features:</td>
                <td>{relatedFeatures.length}</td>
              </tr>
            </tbody>
          </table>
        </section>
        {feature.summary && (
          <section>
            <h5>Summary</h5>
            {feature.summary.split('\n\n').filter((x) => x.trim().length > 0).map((content, i) => (
              <p key={i}>{content}</p>
            ))}
          </section>
        )}
        {relatedFeatures.length > 0 && (
          <section>
            <h5>Related Features</h5>
            <ul>
              {relatedFeatures.map(({ feature: relatedFeature, similarity }) => (
                <li key={relatedFeature.id}>
                  <a href="" onClick={(e) => handleClickRelated(e, relatedFeature)}>
                    {relatedFeature.title}
                  </a>
                  {' '}
                  <span>({(similarity * 100).toFixed(0)}%)</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {feature.transcripts.length > 0 && (
          <section>
            <h5>Transcripts</h5>
            <ul>
              {feature.transcripts.map((transcriptId) => (
                <li key={transcriptId}>
                  <a href="" onClick={(e) => handleClickTranscript(e, transcriptId)}>
                    {transcriptId}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </section>
  )
}

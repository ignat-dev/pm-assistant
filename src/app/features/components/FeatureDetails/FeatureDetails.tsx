import { Feature } from '@/types'

import './FeatureDetails.scss'

interface Props {
  feature: Feature
  relatedFeatures: Array<Feature>
  onClickRelated: (feature: Feature) => void
  onClose: () => void
}

export default function FeatureDetails({ feature, relatedFeatures, onClickRelated, onClose }: Props) {
  const handleClickRelated = (e: React.MouseEvent, relatedFeature: Feature) => {
    e.preventDefault()
    onClickRelated(relatedFeature)
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
            <p>{feature.summary}</p>
          </section>
        )}
        {relatedFeatures.length > 0 && (
          <section>
            <h5>Related Features</h5>
            <ul>
              {relatedFeatures.map((relatedFeature) => (
                <li key={relatedFeature.id}>
                  <a href="" onClick={(e) => handleClickRelated(e, relatedFeature)}>
                    {relatedFeature.title}
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

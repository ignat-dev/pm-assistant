import { Feature } from '@/types'

import './FeatureList.scss'

interface Props {
  features: Array<Feature>
  selectedFeatureId?: string | null
  onRowClick: (feature: Feature | null) => void
}

export default function FeatureList({ features, selectedFeatureId, onRowClick }: Props) {
  return (
    <section className="feature-list">
      <table>
        <colgroup>
          <col width="*" />
          <col width="100px" />
          <col width="100px" />
          <col width="100px" />
        </colgroup>
        <thead>
          <tr>
            <th>Feature request</th>
            <th>Points</th>
            <th>Requests</th>
            <th>Related</th>
          </tr>
        </thead>
        <tbody>
          {features.length > 0 ? (
            features.map((x) => (
              <tr
                key={x.id}
                className={x.id === selectedFeatureId ? 'selected' : ''}
                onClick={() => onRowClick(x)}
              >
                <td>{x.title}</td>
                <td>{x.importancePoints}</td>
                <td>{x.requestCount}</td>
                <td>{x.relatedFeatures.length}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>There are no features requests.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}

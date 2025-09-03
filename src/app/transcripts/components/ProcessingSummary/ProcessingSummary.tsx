import './ProcessingSummary.scss'

interface Props {
  duplicatesCount: number
  featuresCount: number
  transcriptsCount: number
}

export default function ProcessingSummary({ transcriptsCount, featuresCount, duplicatesCount }: Props) {
  return (
    <div className="processing-summary">
      <p>Summary of processing results:</p>
      <table>
        <tbody>
          <tr>
            <td>Total transcripts:</td>
            <td>{transcriptsCount}</td>
          </tr>
          <tr>
            <td>Total features:</td>
            <td>{featuresCount + duplicatesCount}</td>
          </tr>
          <tr>
            <td>&nbsp;&nbsp;&nbsp;&nbsp; New features:</td>
            <td>{featuresCount}</td>
          </tr>
          <tr>
            <td>&nbsp;&nbsp;&nbsp;&nbsp; Duplicate features:</td>
            <td>{duplicatesCount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

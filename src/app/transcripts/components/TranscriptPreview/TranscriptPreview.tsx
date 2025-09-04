import { ChatPreview } from '@/components'
import { Transcript } from '@/types'

import './TranscriptPreview.scss'

interface Props {
  transcript: Transcript | null
}

export default function TranscriptPreview({ transcript }: Props) {
  return (
    <article className="transcript-preview">
      <h5>Transcript content</h5>
      {transcript?.content ? (
        <ChatPreview content={transcript?.content} />
      ) : (
        <span aria-busy="true">Loading transcript content...</span>
      )}
    </article>
  )
}

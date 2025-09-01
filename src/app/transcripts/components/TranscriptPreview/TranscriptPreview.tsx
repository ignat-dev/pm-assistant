import { Transcript } from '@/types'

import './TranscriptPreview.scss'

interface Props {
  transcript: Transcript | null
}

export default function TranscriptPreview({ transcript }: Props) {
  return (
    <article className="transcript-preview">
      <h5>Transcript content</h5>
      <span aria-busy={!transcript}>
        {transcript?.content ?? 'Loading...'}
      </span>
    </article>
  )
}

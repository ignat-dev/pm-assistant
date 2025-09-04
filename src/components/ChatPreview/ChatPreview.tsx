import { ConversationLog } from '@/types'
import { CSSProperties, Fragment, useMemo } from 'react'

import './ChatPreview.scss'

interface Props {
  content: string | null
  style?: CSSProperties
}

export default function ChatPreview({ content, style }: Props) {
  const log = useMemo<ConversationLog['messages']>(() => (
    content?.split('\n\n').filter((x) => x.trim().length > 0).map((text) => {
      const divIndex = text.indexOf(': ')

      return (
        divIndex >= 0
          ? { sender: text.slice(0, divIndex), content: text.slice(divIndex + 2) }
          : { sender: '', content: text }
      )
    }) ?? []
  ), [content])

  return (
    <div className="chat-preview" style={style}>
      {log.map(({ sender, content }, i) => (
        <Fragment key={i}>
          <div>{sender}</div>
          <div>{content}</div>
        </Fragment>
      ))}
    </div>
  )
}

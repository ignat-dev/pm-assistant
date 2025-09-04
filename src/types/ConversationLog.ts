export interface ConversationLog {
  id: string
  messages: Array<{
    sender: string
    content: string
  }>
}

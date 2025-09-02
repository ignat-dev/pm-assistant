import { type DocumentInterface } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { v4 as uuidv4 } from 'uuid'

const DB: Record<string, Array<DbRecord>> = {
  features: [],
  transcripts: [],
}

const VECTOR_DB = new MemoryVectorStore(new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-3-small',
}))

export function addRecord<T = Record<string, unknown>>(table: string, item: Partial<T>): T {
  const record: DbRecord = { id: uuidv4(), ...item }

  DB[table].push(record)

  return record as T
}

export function getRecord<T extends DbRecord = DbRecord>(table: string, id: string): T | null {
  return (DB[table].find(item => item.id === id) as T) ?? null
}

export function getAllRecords<T extends DbRecord = DbRecord>(table: string): Array<T> {
  return (DB[table] ?? []) as Array<T>
}

export function updateRecord<T extends DbRecord = DbRecord>(table: string, id: string, item: Partial<T>): T {
  const existingItem = getRecord<T>(table, id)

  if (!existingItem) {
    throw new Error(`Item with ID "${id}" not found in table "${table}".`)
  }

  const updatedItem = Object.assign(existingItem, item, { id})

  DB[table] = DB[table].map(x => (x.id === id ? updatedItem : x))

  return updatedItem
}

export async function addText(text: string, metadata: Record<string, unknown> = {}): Promise<void> {
  if (!text || text.trim().length === 0) {
    return
  }

  await VECTOR_DB.addDocuments([{
    metadata,
    pageContent: text,
  }])
}

export async function queryText(text: string, limit: number = 5): Promise<Array<VectorQueryResult>> {
  if (!text || text.trim().length === 0) {
    return []
  }

  const results = await VECTOR_DB.similaritySearchWithScore(text, limit) ?? []

  return results.map(([document, similarity]) => ({ document, similarity }))
}

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
type DbRecord = { id: string } & Object
type VectorQueryResult = { document: DocumentInterface; similarity: number }

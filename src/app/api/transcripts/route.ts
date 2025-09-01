import { getAllTranscripts, processTranscript } from '@/services'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(await getAllTranscripts())
}

export async function POST(req: Request) {
  const { content } = await req.json()

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid transcript content' }, { status: 400 })
  }

  return NextResponse.json(await processTranscript(content))
}

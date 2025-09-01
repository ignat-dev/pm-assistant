import { NextResponse } from 'next/server'

export async function GET() {
  const { default: transcripts } = await import('../../../../../data/transcripts.json')

  return NextResponse.json(transcripts)
}

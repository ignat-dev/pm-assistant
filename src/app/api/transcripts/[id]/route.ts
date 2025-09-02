import { getTranscript } from '@/services'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json(await getTranscript((await params).id))
}

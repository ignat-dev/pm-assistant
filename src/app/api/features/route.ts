import { addFeature, getAllFeatures } from '@/services'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(await getAllFeatures())
}

export async function POST(req: Request) {
  const { text } = await req.json()

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Feature is required' }, { status: 400 })
  }

  return NextResponse.json(await addFeature(text))
}


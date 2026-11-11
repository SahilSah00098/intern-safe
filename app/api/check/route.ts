import { NextResponse } from 'next/server'
import { analyzeOffer } from '@/lib/analyzeOffer'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Offer text is required' },
        { status: 400 }
      )
    }

    const result = await analyzeOffer(text)

    const { data, error } = await supabase
      .from('checks')
      .insert({
        offer_text: text,
        company_name: result.companyName,
        score: result.score,
        level: result.level,
        result,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Could not save report' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data.id,
      result,
    })
  } catch (error) {
    console.error('Check API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze offer' },
      { status: 500 }
    )
  }
}
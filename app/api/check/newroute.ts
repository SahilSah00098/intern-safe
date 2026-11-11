import { NextResponse } from 'next/server'
import { z } from 'zod'
import { analyzeOffer } from '@/lib/analyzeOffer'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  text: z.string().trim().min(10).max(5000),
})

export async function POST(req: Request) {
  const parsed = schema.safeParse(
    await req.json().catch(() => null)
  )

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid offer text' },
      { status: 400 }
    )
  }

  const result = await analyzeOffer(parsed.data.text)

  const { data, error } = await supabase
    .from('checks')
    .insert({
      offer_text: parsed.data.text,
      company_name: result.companyName,
      score: result.score,
      level: result.level,
      result,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Supabase error:', error.message)

    return NextResponse.json(
      { error: 'Could not save' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    id: data.id,
    result,
  })
}
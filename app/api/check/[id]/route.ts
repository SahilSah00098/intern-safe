import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
_: Request,
{ params }: { params: Promise<{ id: string }> }
) {
const { id } = await params

if (!/^[0-9a-f-]{36}$/i.test(id)) {
return NextResponse.json(
{ error: 'Not found' },
{ status: 404 }
)
}

const { data, error } = await supabase
.from('checks')
.select('result')
.eq('id', id)
.single()

if (error || !data) {
return NextResponse.json(
{ error: 'Not found' },
{ status: 404 }
)
}

return NextResponse.json({ result: data.result })
}

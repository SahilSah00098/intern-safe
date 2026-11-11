import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY

if (!url || !secretKey) {
throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(url, secretKey, {
auth: {
persistSession: false,
autoRefreshToken: false,
},
})

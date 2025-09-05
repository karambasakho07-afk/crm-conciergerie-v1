import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

export const supabaseServer = createClient(url, serviceKey)

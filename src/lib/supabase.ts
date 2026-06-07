import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwldsgjgfffaozbdvdiy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bGRzZ2pnZmZmYW96YmR2ZGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjQ0MDYsImV4cCI6MjA5NjQwMDQwNn0.nx6pje0wMrhspRgszmwKBqqpm74I8upTLUFHfpfg_eA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

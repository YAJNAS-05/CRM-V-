import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not configured')
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || ''
)

// OAuth Providers supported
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  AZURE: 'azure',
  DISCORD: 'discord',
} as const

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS]

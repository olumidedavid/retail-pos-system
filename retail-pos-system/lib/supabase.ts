import { createClient } from '@supabase/supabase-js';

// Use only the base Supabase URL. If /rest/v1 is accidentally pasted in Vercel,
// this removes it so the client does not call /rest/v1/rest/v1.
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing. Use https://your-project.supabase.co only.');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Use your Supabase publishable key.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

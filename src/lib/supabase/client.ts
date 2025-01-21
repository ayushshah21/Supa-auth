import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

// Get the site URL based on environment
const getSiteUrl = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:5173';
    }
    // For production, use the main domain
    return 'https://ticket-ai-chi.vercel.app';
};

export const supabase = createClient<Database>(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            storage: globalThis?.localStorage
        },
        global: {
            headers: {
                'x-initial-location': `${getSiteUrl()}/dashboard`
            }
        }
    }
); 
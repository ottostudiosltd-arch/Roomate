import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sqnuxxabhjblqdfqjvrx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: any;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase URL or Anon Key is missing. App is running in offline fallback mode.');
    // Return a dummy proxy to prevent client method calls from crashing on load
    supabaseClient = new Proxy({}, {
      get: (_target, prop) => {
        if (prop === 'from') {
          return () => ({
            select: () => ({ order: () => Promise.resolve({ data: [], error: new Error('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel settings.') }) }),
            insert: () => ({ select: () => ({ single: () => Promise.reject(new Error('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel settings.')) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase credentials missing.') }) }),
            update: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase credentials missing.') }) }),
          });
        }
        return () => Promise.resolve({ data: null, error: new Error('Supabase configuration missing.') });
      }
    });
  }
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
  supabaseClient = new Proxy({}, {
    get: () => () => Promise.resolve({ data: null, error: err })
  });
}

export const supabase = supabaseClient;

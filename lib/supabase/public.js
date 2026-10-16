import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, assertSupabaseEnv } from './config';

// Client "lecture publique" utilisé par les pages de la boutique.
// Il n'utilise pas les cookies : les pages peuvent donc être mises en cache.
let client;

export function getPublicClient() {
  assertSupabaseEnv();
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

'use client';

import { createBrowserClient } from '@supabase/ssr';

// Client navigateur : utilisé uniquement dans l'admin (connexion, envoi d'images).
let client;

export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}

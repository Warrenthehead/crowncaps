import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY, assertSupabaseEnv } from './config';

// Client côté serveur qui connaît la session de l'admin (via les cookies).
// Utilisé dans l'admin et dans les Server Actions. La sécurité est assurée
// par les règles RLS de Supabase : seul un admin peut écrire.
export async function getServerClient() {
  assertSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un composant serveur : le proxy rafraîchit déjà la session.
        }
      },
    },
  });
}

// Renvoie l'utilisateur connecté s'il est administrateur, sinon null.
export async function getAdminUser() {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return isAdmin ? user : null;
}

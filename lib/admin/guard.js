import 'server-only';
import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';

// Vérifie que la personne connectée est l'admin et renvoie un client Supabase
// à son nom. La base refuse de toute façon toute écriture d'un non-admin (RLS).
export async function requireAdmin() {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Session expirée : reconnectez-vous.');
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) throw new Error("Ce compte n'est pas administrateur.");
  return supabase;
}

// Après chaque modification, toutes les pages de la boutique sont régénérées
// à la prochaine visite (le site est petit : c'est simple et instantané).
export function refreshShop() {
  revalidatePath('/', 'layout');
}

// Format de réponse commun des actions : { ok: true, data } ou { ok: false, error }
export async function action(fn) {
  try {
    const data = await fn();
    return { ok: true, data: data ?? null };
  } catch (e) {
    console.error('[admin]', e);
    return { ok: false, error: friendlyError(e) };
  }
}

function friendlyError(e) {
  const msg = e?.message || String(e);
  if (/duplicate key.*slug/i.test(msg)) return 'Cette adresse (slug) est déjà utilisée. Changez le titre ou le slug.';
  if (/duplicate key.*code/i.test(msg)) return 'Ce code produit existe déjà.';
  if (/duplicate key/i.test(msg)) return 'Cet élément existe déjà.';
  if (/row-level security/i.test(msg)) return "Action refusée : ce compte n'est pas administrateur.";
  return msg;
}

// Vérifie le résultat d'une requête Supabase et lève une erreur lisible.
export function must({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

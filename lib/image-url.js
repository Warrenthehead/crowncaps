// =====================================================================
//  URLS D'IMAGES RÉSISTANTES AUX RÉSEAUX DIFFICILES
//  Les photos sont stockées sur Supabase (supabase.co). Certains opérateurs
//  ou pays bloquent ou ralentissent ce domaine. Le site les propose donc
//  d'abord via son propre domaine (/media/..., voir next.config.mjs), puis
//  retombe sur l'adresse Supabase d'origine si ça échoue (et inversement).
// =====================================================================

const MARKER = '/storage/v1/object/public/images/';

// Adresse via le domaine du site. Les autres URL (externes, déjà relatives) restent inchangées.
export function mediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const i = url.indexOf(MARKER);
  if (i < 0 || !/^https?:\/\//.test(url)) return url;
  return `/media/${url.slice(i + MARKER.length)}`;
}

// Adresses à essayer, dans l'ordre : domaine du site, Supabase direct, puis on recommence.
export function imageCandidates(url) {
  if (!url) return [];
  const proxied = mediaUrl(url);
  if (proxied === url) return [url, url, url];
  return [proxied, url, proxied, url];
}

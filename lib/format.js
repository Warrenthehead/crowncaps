// Prix en F CFA, entier, affiché "12,000F" (virgule pour les milliers, F collé).
export function formatPrice(value) {
  const n = Math.round(Number(value) || 0);
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}F`;
}

// Taille de fichier lisible : "4,2 Mo", "210 Ko"
export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

// Concatène des classes CSS en ignorant les valeurs vides.
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

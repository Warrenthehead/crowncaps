// =====================================================================
//  LISTE DES MODELES DE PAGE PRODUIT
//  Pour ajouter un modèle :
//   1. créez templates/MonModele.js (copiez Standard.js comme base)
//   2. ajoutez une ligne ici { key, label, description }
//   3. ajoutez la ligne correspondante dans templates/index.js
//  L'admin affiche automatiquement tous les modèles de cette liste.
// =====================================================================
export const TEMPLATES = [
  {
    key: 'standard',
    label: 'Standard',
    description: 'Ajouter au panier + Acheter directement.',
  },
  {
    key: 'a-venir',
    label: 'À venir',
    description: 'Badge « À venir », compte à rebours optionnel, bouton « Me prévenir sur WhatsApp ».',
  },
  {
    key: 'vendu',
    label: 'Vendu',
    description: 'Badge « Vendu » et bouton « Me prévenir si retour ».',
  },
];

export const TEMPLATE_KEYS = TEMPLATES.map((t) => t.key);

export function templateLabel(key) {
  return TEMPLATES.find((t) => t.key === key)?.label || key;
}

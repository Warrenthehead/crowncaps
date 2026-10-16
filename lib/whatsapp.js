import { formatPrice } from '@/lib/format';
import { absoluteUrl } from '@/lib/site';

// Au-delà de cette longueur, certains téléphones coupent le lien wa.me.
export const MAX_MESSAGE_LENGTH = 1800;

// Garde uniquement les chiffres : "+241 07 12 34 56" -> "24107123456"
export function cleanNumber(number) {
  return String(number || '').replace(/\D/g, '');
}

export function whatsappLink(number, message) {
  const n = cleanNumber(number);
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${n}${text}`;
}

function lineDetails(item) {
  const parts = [`Code : ${item.code}`];
  if (item.size) parts.push(`Taille : ${item.size}`);
  if (item.color) parts.push(`Couleur : ${item.color}`);
  return parts.join(' | ');
}

// Message de commande pour une liste d'articles (panier ou achat direct).
export function orderMessage(items, shopName = 'CrownCaps') {
  const lines = [`Bonjour ${shopName}, je voudrais commander :`, ''];
  let total = 0;
  items.forEach((item, index) => {
    total += item.price * item.quantity;
    lines.push(`${index + 1}) ${item.title}`);
    lines.push(lineDetails(item));
    lines.push(`Qté : ${item.quantity} × ${formatPrice(item.price)}`);
    lines.push(absoluteUrl(`/produits/${item.slug}`));
    lines.push('');
  });
  lines.push(`Total : ${formatPrice(total)}`);
  return lines.join('\n');
}

// Message court utilisé si le message complet est trop long.
export function shortOrderMessage(items, shopName = 'CrownCaps') {
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);
  return `Bonjour ${shopName}, je voudrais commander ${count} article(s) pour un total de ${formatPrice(total)}. Je colle le détail de ma commande ci-dessous :`;
}

export function notifyMessage(product, shopName = 'CrownCaps', reason = 'a_venir') {
  const intro =
    reason === 'vendu'
      ? `Bonjour ${shopName}, pouvez-vous me prévenir si cet article revient en stock ?`
      : `Bonjour ${shopName}, pouvez-vous me prévenir dès que cet article est disponible ?`;
  return `${intro}\n\n${product.title}\nCode : ${product.code}\n${absoluteUrl(`/produits/${product.slug}`)}`;
}

// Ouvre WhatsApp. Si le message est trop long : copie le message complet dans
// le presse-papier et ouvre WhatsApp avec un message court.
// Renvoie { fallback: true } quand le repli a été utilisé (pour afficher une explication).
export async function openWhatsAppOrder(number, items, shopName) {
  const full = orderMessage(items, shopName);
  if (full.length <= MAX_MESSAGE_LENGTH) {
    window.open(whatsappLink(number, full), '_blank', 'noopener');
    return { fallback: false };
  }
  let copied = false;
  try {
    await navigator.clipboard.writeText(full);
    copied = true;
  } catch {
    copied = false;
  }
  // Après une copie, certains navigateurs bloquent les nouveaux onglets :
  // on prépare donc le lien et la fenêtre d'explication l'ouvre au clic.
  return { fallback: true, copied, message: full, link: whatsappLink(number, shortOrderMessage(items, shopName)) };
}

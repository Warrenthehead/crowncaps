import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';

export const metadata = { title: 'Accueil' };

// Accueil admin : uniquement des raccourcis (pas de statistiques).
export default function AdminHome() {
  const shortcuts = [
    { href: '/admin/produits/nouveau', title: 'Ajouter un produit', text: 'Photos compressées automatiquement.' },
    { href: '/', title: 'Voir la boutique', text: 'Ouvre le site dans un nouvel onglet.', external: true },
    { href: '/admin/produits', title: 'Gérer les produits', text: 'Modifier, trier, marquer comme vendu.' },
    { href: '/admin/accueil', title: "Page d'accueil", text: 'Ordre et contenu des sections.' },
  ];
  return (
    <>
      <PageHeader title="Bonjour" />
      <div className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="card block transition hover:ring-1 hover:ring-ink"
          >
            <p className="font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

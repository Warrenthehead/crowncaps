import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1.25rem' }}>
      <h1 className="page-title">Page introuvable</h1>
      <p className="mt-4 text-muted">Cette adresse n&apos;existe pas.</p>
      <Link href="/" className="link-underline mt-8 inline-block">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

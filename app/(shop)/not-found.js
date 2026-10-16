import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-shop py-20 text-center">
      <h1 className="page-title">Page introuvable</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">Ce produit ou cette page n&apos;existe plus.</p>
      <div className="mx-auto mt-8 max-w-xs">
        <Link href="/collections" className="btn-primary">
          Voir les collections
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

// Message clair en cas d'erreur (jamais d'écran blanc).
export default function ShopError({ error, reset }) {
  return (
    <div className="container-shop py-20 text-center">
      <h1 className="page-title">Oups, un souci est survenu</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        La page n&apos;a pas pu se charger. Vérifiez votre connexion internet puis réessayez.
      </p>
      {process.env.NODE_ENV === 'development' && error?.message && (
        <p className="mx-auto mt-4 max-w-xl rounded bg-surface p-3 text-left text-sm text-danger">{error.message}</p>
      )}
      <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Réessayer
        </button>
        <Link href="/" className="btn-outline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

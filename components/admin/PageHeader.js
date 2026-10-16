import Link from 'next/link';

// En-tête des pages de l'admin : titre + bouton(s) à droite.
export default function PageHeader({ title, back, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {back && (
          <Link href={back} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white" aria-label="Retour">
            ←
          </Link>
        )}
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

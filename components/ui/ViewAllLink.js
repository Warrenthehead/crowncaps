import Link from 'next/link';

// Lien centré "Tout afficher" sous les sections.
export default function ViewAllLink({ href }) {
  return (
    <div className="mt-6 flex justify-center">
      <Link href={href} className="px-6 py-3 text-[1rem] tracking-[0.06em] transition hover:underline hover:underline-offset-4">
        Tout afficher
      </Link>
    </div>
  );
}

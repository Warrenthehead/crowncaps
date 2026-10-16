import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { adminTable } from '@/lib/admin/queries';

export const metadata = { title: 'Pages' };

export default async function AdminPagesList() {
  const pages = await adminTable('pages', 'title');
  return (
    <>
      <PageHeader title="Pages">
        <Link href="/admin/pages/nouveau" className="btn-admin">
          + Créer une page
        </Link>
      </PageHeader>
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {pages.length === 0 && <p className="p-6 text-sm text-muted">Aucune page.</p>}
        {pages.map((p) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-surface/60">
            <div className="min-w-0">
              <p className="truncate font-semibold">{p.title}</p>
              <p className="truncate text-xs text-muted">/pages/{p.slug}</p>
            </div>
            {!p.visible && <span className="rounded bg-surface px-2 py-0.5 text-xs text-muted">Masquée</span>}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Astuce : ajoutez ensuite la page dans un menu (Menus) pour qu&apos;elle apparaisse sur le site.</p>
    </>
  );
}

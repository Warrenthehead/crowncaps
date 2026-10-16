import { notFound } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import PageForm from '@/components/admin/PageForm';
import { adminRow } from '@/lib/admin/queries';

export const metadata = { title: 'Page' };

export default async function PageEdit({ params }) {
  const { id } = await params;
  const isNew = id === 'nouveau';
  const page = isNew ? null : await adminRow('pages', id);
  if (!isNew && !page) notFound();
  return (
    <>
      <PageHeader title={isNew ? 'Nouvelle page' : page.title} back="/admin/pages">
        {page && (
          <a href={`/pages/${page.slug}`} target="_blank" rel="noopener noreferrer" className="btn-admin-ghost">
            Voir sur le site
          </a>
        )}
      </PageHeader>
      <PageForm page={page} />
    </>
  );
}

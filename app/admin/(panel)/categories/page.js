import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import CategoriesList from '@/components/admin/CategoriesList';
import { adminTable } from '@/lib/admin/queries';

export const metadata = { title: 'Catégories' };

export default async function AdminCategoriesPage() {
  const categories = await adminTable('categories');
  return (
    <>
      <PageHeader title="Catégories">
        <Link href="/admin/categories/nouveau" className="btn-admin">
          + Ajouter une catégorie
        </Link>
      </PageHeader>
      <CategoriesList categories={categories} />
    </>
  );
}

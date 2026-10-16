import { notFound } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import CategoryForm from '@/components/admin/CategoryForm';
import { adminRow, adminTable } from '@/lib/admin/queries';

export const metadata = { title: 'Catégorie' };

export default async function CategoryEditPage({ params }) {
  const { id } = await params;
  const isNew = id === 'nouveau';
  const [category, sizeGroups] = await Promise.all([isNew ? null : adminRow('categories', id), adminTable('size_groups')]);
  if (!isNew && !category) notFound();
  return (
    <>
      <PageHeader title={isNew ? 'Nouvelle catégorie' : category.name} back="/admin/categories" />
      <CategoryForm category={category} sizeGroups={sizeGroups} />
    </>
  );
}

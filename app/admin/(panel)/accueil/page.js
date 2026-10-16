import PageHeader from '@/components/admin/PageHeader';
import HomeEditor from '@/components/admin/HomeEditor';
import { adminTable } from '@/lib/admin/queries';

export const metadata = { title: "Page d'accueil" };

export default async function HomeAdminPage() {
  const [sections, categories] = await Promise.all([adminTable('home_sections'), adminTable('categories')]);
  return (
    <>
      <PageHeader title="Page d'accueil" />
      <HomeEditor sections={sections} categories={categories} />
    </>
  );
}

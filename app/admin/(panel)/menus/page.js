import PageHeader from '@/components/admin/PageHeader';
import MenuEditor from '@/components/admin/MenuEditor';
import { adminMenus, adminTable } from '@/lib/admin/queries';

export const metadata = { title: 'Menus' };

export default async function MenusPage() {
  const [menus, categories, pages] = await Promise.all([adminMenus(), adminTable('categories'), adminTable('pages', 'title')]);
  return (
    <>
      <PageHeader title="Menus" />
      <MenuEditor menus={menus} categories={categories} pages={pages} />
    </>
  );
}

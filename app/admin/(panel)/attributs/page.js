import PageHeader from '@/components/admin/PageHeader';
import AttributesManager from '@/components/admin/AttributesManager';
import { adminCatalog } from '@/lib/admin/queries';

export const metadata = { title: 'Couleurs & tailles' };

export default async function AttributesPage() {
  const catalog = await adminCatalog();
  return (
    <>
      <PageHeader title="Couleurs & tailles" />
      <AttributesManager colors={catalog.colors} sizeGroups={catalog.sizeGroups} garmentTypes={catalog.garmentTypes} />
    </>
  );
}

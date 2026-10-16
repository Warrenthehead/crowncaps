import PageHeader from '@/components/admin/PageHeader';
import ProductForm from '@/components/admin/ProductForm';
import { adminCatalog } from '@/lib/admin/queries';

export const metadata = { title: 'Nouveau produit' };

export default async function NewProductPage() {
  const catalog = await adminCatalog();
  return (
    <>
      <PageHeader title="Nouveau produit" back="/admin/produits" />
      <ProductForm catalog={catalog} />
    </>
  );
}

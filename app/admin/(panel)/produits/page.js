import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import ProductsTable from '@/components/admin/ProductsTable';
import { adminCatalog, adminProducts } from '@/lib/admin/queries';

export const metadata = { title: 'Produits' };

export default async function AdminProductsPage() {
  const [products, catalog] = await Promise.all([adminProducts(), adminCatalog()]);
  return (
    <>
      <PageHeader title="Produits">
        <Link href="/admin/produits/nouveau" className="btn-admin">
          + Ajouter un produit
        </Link>
      </PageHeader>
      <ProductsTable products={products} categories={catalog.categories} />
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import ProductForm from '@/components/admin/ProductForm';
import { adminCatalog, adminProduct } from '@/lib/admin/queries';

export const metadata = { title: 'Modifier le produit' };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [product, catalog] = await Promise.all([adminProduct(id), adminCatalog()]);
  if (!product) notFound();
  return (
    <>
      <PageHeader title={product.title} back="/admin/produits">
        <a href={`/produits/${product.slug}`} target="_blank" rel="noopener noreferrer" className="btn-admin-ghost">
          Voir sur le site
        </a>
        <Link href="/admin/produits/nouveau" className="text-sm underline hover:text-muted">
          Ajouter un nouveau produit
        </Link>
      </PageHeader>
      <ProductForm product={product} catalog={catalog} />
    </>
  );
}

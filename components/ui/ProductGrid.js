import ProductCard from './ProductCard';

// Grille produits : 2 colonnes mobile, 3 tablette, 4 PC, écart de 6 px.
export default function ProductGrid({ products, priorityCount = 0 }) {
  return (
    <div className="grid grid-cols-2 gap-x-1.5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

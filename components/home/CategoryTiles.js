import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';

// Tuiles de catégories : grande image, nom centré dessous. 2 colonnes mobile.
export default function CategoryTiles({ categories, priority = false }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-2 md:grid-cols-3 md:gap-x-6 md:px-0 lg:grid-cols-4">
      {categories.map((c, i) => (
        <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
          <SmartImage
            src={c.image_url}
            alt={c.name}
            ratio="aspect-[4/5]"
            priority={priority && i < 2}
            imgClassName="md:group-hover:scale-[1.03]"
          />
          <p className="mt-3 text-center text-[1rem] tracking-[0.04em] group-hover:underline group-hover:underline-offset-4">{c.name}</p>
        </Link>
      ))}
    </div>
  );
}

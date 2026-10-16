import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';

// Grande photo bannière pleine largeur.
export default function ImageBanner({ image_url, link, alt, priority = false }) {
  if (!image_url) return null;
  const image = <SmartImage src={image_url} alt={alt || ''} ratio="aspect-[4/3] md:aspect-[16/6]" sizes="100vw" priority={priority} />;
  return link ? <Link href={link}>{image}</Link> : image;
}

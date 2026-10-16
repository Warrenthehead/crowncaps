import { absoluteUrl } from '@/lib/site';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/panier', '/recherche', '/api'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}

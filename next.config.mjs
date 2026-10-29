/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig = {
  // Les images sont déjà compressées en WebP dans l'admin (navigateur),
  // on les affiche avec de simples <img> : pas de dépendance au service d'images de Vercel.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Les photos passent par le domaine du site (/media/...) : si un opérateur ou un pays
  // bloque ou ralentit supabase.co, les clients les reçoivent quand même. Voir lib/image-url.js.
  async rewrites() {
    if (!SUPABASE_URL) return [];
    return [
      {
        source: '/media/:path*',
        destination: `${SUPABASE_URL}/storage/v1/object/public/images/:path*`,
      },
    ];
  },

  // Photos : nom unique à chaque envoi, donc cache longue durée (navigateur + CDN).
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;

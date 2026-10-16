/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les images sont déjà compressées en WebP dans l'admin (navigateur),
  // on les affiche avec de simples <img> : pas de dépendance au service d'images de Vercel.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

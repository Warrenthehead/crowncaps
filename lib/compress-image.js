'use client';

import imageCompression from 'browser-image-compression';
import { getBrowserClient } from '@/lib/supabase/browser';

// =====================================================================
//  COMPRESSEUR D'IMAGES (dans le navigateur, avant l'envoi)
//  - grande image : WebP, côté long 1600 px max, qualité 0,8, cible 300 Ko
//  - miniature    : WebP, côté long 600 px max, cible 80 Ko (grilles)
// =====================================================================

export const FULL = { maxWidthOrHeight: 1600, maxSizeMB: 0.3, initialQuality: 0.8 };
export const THUMB = { maxWidthOrHeight: 600, maxSizeMB: 0.08, initialQuality: 0.8 };

export async function compress(file, preset = FULL, onProgress) {
  const out = await imageCompression(file, {
    ...preset,
    fileType: 'image/webp',
    useWebWorker: true,
    onProgress,
  });
  return new File([out], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`, { type: 'image/webp' });
}

function randomName() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function uploadFile(file, path) {
  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from('images').upload(path, file, {
    contentType: file.type || 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(`Envoi impossible : ${error.message}`);
  return supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
}

// Compresse puis envoie une image. Renvoie { url, thumb_url, before, after }.
// onProgress(0..100) permet d'afficher une barre de progression.
export async function processAndUpload(file, { folder = 'products', withThumb = true, onProgress } = {}) {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} n'est pas une image.`);
  const base = `${folder}/${randomName()}`;

  // SVG : déjà léger, on l'envoie tel quel
  if (file.type === 'image/svg+xml') {
    const url = await uploadFile(file, `${base}.svg`);
    onProgress?.(100);
    return { url, thumb_url: url, before: file.size, after: file.size };
  }

  const full = await compress(file, FULL, (p) => onProgress?.(Math.round(p * 0.5)));
  const thumb = withThumb ? await compress(full, THUMB, (p) => onProgress?.(50 + Math.round(p * 0.3))) : null;
  const url = await uploadFile(full, `${base}.webp`);
  onProgress?.(90);
  const thumb_url = thumb ? await uploadFile(thumb, `${base}-thumb.webp`) : url;
  onProgress?.(100);
  return { url, thumb_url, before: file.size, after: full.size };
}

'use client';

import { useRef, useState } from 'react';
import SortableList from './SortableList';
import { processAndUpload } from '@/lib/compress-image';
import { formatBytes } from '@/lib/format';
import { IconClose, IconStar, IconUpload } from '@/components/icons';

const MAX_FILES = 10;

// Images multiples du produit : glisser-déposer des fichiers, compression WebP
// automatique, barre de progression, avant/après, réordonner, image principale.
export default function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const [uploads, setUploads] = useState([]); // { id, name, progress, before, after, error }
  const [dragOver, setDragOver] = useState(false);
  const busy = uploads.some((u) => u.progress < 100 && !u.error);

  const items = images.map((img, i) => ({ ...img, id: img.id || img.url || String(i) }));

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    const room = MAX_FILES - images.length;
    if (room <= 0) {
      alert(`Maximum ${MAX_FILES} images par produit.`);
      return;
    }
    const batch = files.slice(0, room).map((file) => ({ id: `${file.name}-${Math.random()}`, file, name: file.name, progress: 0, before: file.size }));
    if (files.length > room) alert(`Seules ${room} image(s) ont été ajoutées (maximum ${MAX_FILES}).`);
    setUploads((u) => [...u, ...batch]);

    const results = [];
    // Une image à la fois : plus doux pour les téléphones
    for (const job of batch) {
      try {
        const res = await processAndUpload(job.file, {
          folder: 'products',
          onProgress: (p) => setUploads((u) => u.map((x) => (x.id === job.id ? { ...x, progress: p } : x))),
        });
        setUploads((u) => u.map((x) => (x.id === job.id ? { ...x, progress: 100, after: res.after } : x)));
        results.push({ url: res.url, thumb_url: res.thumb_url, alt: '' });
        onChange((current) => [...current, { url: res.url, thumb_url: res.thumb_url, alt: '' }]);
      } catch (e) {
        setUploads((u) => u.map((x) => (x.id === job.id ? { ...x, error: e.message } : x)));
      }
    }
    // Les lignes réussies disparaissent après quelques secondes
    setTimeout(() => setUploads((u) => u.filter((x) => x.error || x.progress < 100)), 6000);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (id) => onChange(items.filter((i) => i.id !== id).map(strip));
  const makeMain = (id) => {
    const target = items.find((i) => i.id === id);
    onChange([target, ...items.filter((i) => i.id !== id)].map(strip));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragOver ? 'border-ink bg-surface' : 'border-line'
        }`}
      >
        <IconUpload size={28} className="text-muted" />
        <p className="mt-2 text-sm">Glissez vos photos ici ou</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="btn-admin-ghost mt-3" disabled={busy}>
          Choisir des images
        </button>
        <p className="mt-2 text-xs text-muted">
          Jusqu&apos;à {MAX_FILES} images. Compression automatique en WebP (≤ 300 Ko) + miniature.
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {uploads.length > 0 && (
        <ul className="mt-3 space-y-2">
          {uploads.map((u) => (
            <li key={u.id} className="rounded-lg border border-line p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{u.name}</span>
                <span className={`shrink-0 tabular-nums ${u.error ? 'text-danger' : 'text-muted'}`}>
                  {u.error ? 'Erreur' : u.after ? `${formatBytes(u.before)} → ${formatBytes(u.after)}` : `${u.progress}%`}
                </span>
              </div>
              {!u.error && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-ink transition-all duration-300" style={{ width: `${u.progress}%` }} />
                </div>
              )}
              {u.error && <p className="mt-1 text-xs text-danger">{u.error}</p>}
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <SortableList
          items={items}
          onChange={(next) => onChange(next.map(strip))}
          layout="grid"
          className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4"
          renderItem={(img, handle, index) => (
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="relative aspect-square bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.thumb_url || img.url} alt="" className="h-full w-full object-cover" />
                {index === 0 && <span className="absolute top-1.5 left-1.5 rounded bg-ink px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">Principale</span>}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="absolute top-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow"
                  aria-label="Supprimer l'image"
                >
                  <IconClose size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between px-1">
                {handle}
                {index !== 0 && (
                  <button type="button" onClick={() => makeMain(img.id)} className="flex h-10 items-center gap-1 px-2 text-xs text-muted hover:text-ink" title="Définir comme image principale">
                    <IconStar size={14} /> Principale
                  </button>
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}

function strip({ url, thumb_url, alt }) {
  return { url, thumb_url, alt };
}

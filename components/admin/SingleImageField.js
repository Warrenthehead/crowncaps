'use client';

import { useRef, useState } from 'react';
import { processAndUpload } from '@/lib/compress-image';
import { formatBytes } from '@/lib/format';
import { IconUpload } from '@/components/icons';

// Champ "une seule image" (catégorie, logo, bannière, diapositive), compressée en WebP.
export default function SingleImageField({ value, onChange, folder = 'misc', label = 'Image', ratio = 'aspect-[4/5]' }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const pick = async (file) => {
    if (!file) return;
    setError('');
    setInfo('');
    setProgress(0);
    try {
      const res = await processAndUpload(file, { folder, withThumb: false, onProgress: setProgress });
      onChange(res.url);
      setInfo(`${formatBytes(res.before)} → ${formatBytes(res.after)}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-4">
        <div className={`relative w-28 shrink-0 overflow-hidden rounded-lg border border-line bg-surface ${ratio}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">Aucune</span>
          )}
          {progress !== null && (
            <div className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-white/70">
              <div className="h-full bg-ink transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-admin-ghost" disabled={progress !== null}>
            <IconUpload size={16} /> {value ? 'Remplacer' : 'Choisir'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="text-left text-sm text-danger hover:underline">
              Retirer
            </button>
          )}
          {info && <span className="text-xs text-muted">{info}</span>}
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

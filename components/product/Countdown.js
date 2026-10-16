'use client';

import { useEffect, useState } from 'react';

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { j: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

// Compte à rebours jusqu'à la date de sortie. Appelle onDone() à zéro.
export default function Countdown({ date, onDone }) {
  const target = new Date(date).getTime();
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= target) {
        clearInterval(id);
        onDone?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, onDone]);

  if (now === null) return <div className="h-[4.5rem]" aria-hidden="true" />;
  const p = parts(target - now);
  const cells = [
    ['j', 'jours'],
    ['h', 'heures'],
    ['m', 'min'],
    ['s', 'sec'],
  ];

  return (
    <div className="mt-6" aria-label="Temps restant avant la sortie">
      <p className="caps mb-2">Sortie le {new Date(date).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
      <div className="grid grid-cols-4 gap-2">
        {cells.map(([k, l]) => (
          <div key={k} className="border border-line py-2.5 text-center">
            <span className="block text-2xl tabular-nums">{String(p[k]).padStart(2, '0')}</span>
            <span className="text-[0.7rem] tracking-[0.12em] text-muted uppercase">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

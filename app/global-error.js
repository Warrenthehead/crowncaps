'use client';

// Dernier filet de sécurité si l'habillage du site lui-même plante.
export default function GlobalError({ reset }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '4rem 1.25rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 400 }}>Le site est momentanément indisponible</h1>
        <p style={{ color: '#5c5c5c', marginTop: '1rem' }}>Merci de réessayer dans quelques instants.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: '2rem', background: '#121212', color: '#fff', border: 0, borderRadius: 999, padding: '0.9rem 2rem', fontSize: '1rem' }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}

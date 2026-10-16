'use client';

import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

// Connexion admin : email + mot de passe (Supabase Auth).
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await getBrowserClient().auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message);
      setLoading(false);
      return;
    }
    // Rechargement complet pour que le serveur lise la nouvelle session
    window.location.href = '/admin';
  };

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h1 className="text-xl font-semibold">Connexion</h1>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
      </div>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn-admin w-full" disabled={loading}>
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

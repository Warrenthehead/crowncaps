'use client';

import { getBrowserClient } from '@/lib/supabase/browser';

export default function SignOutButton({ className = 'btn-admin-ghost' }) {
  const signOut = async () => {
    await getBrowserClient().auth.signOut();
    window.location.href = '/admin/login';
  };
  return (
    <button type="button" onClick={signOut} className={className}>
      Se déconnecter
    </button>
  );
}

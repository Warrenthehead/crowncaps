import AdminShell from '@/components/admin/AdminShell';
import SignOutButton from '@/components/admin/SignOutButton';
import { getAdminUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Toutes les pages de l'admin (sauf /admin/login) passent par ici.
export default async function PanelLayout({ children }) {
  const user = await getAdminUser();
  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="card max-w-sm space-y-4 text-center">
          <h1 className="text-lg font-semibold">Accès refusé</h1>
          <p className="text-sm text-muted">
            Ce compte n&apos;est pas administrateur. Ajoutez-le dans la table « admins » de Supabase (voir docs/GUIDE-SUPABASE.md, étape 5).
          </p>
          <SignOutButton className="btn-admin w-full" />
        </div>
      </div>
    );
  }
  return <AdminShell email={user.email}>{children}</AdminShell>;
}

import PageHeader from '@/components/admin/PageHeader';
import SettingsForm from '@/components/admin/SettingsForm';
import { adminRow } from '@/lib/admin/queries';

export const metadata = { title: 'Paramètres' };

export default async function SettingsPage() {
  const settings = await adminRow('settings', 1);
  return (
    <>
      <PageHeader title="Paramètres" />
      <SettingsForm settings={settings || {}} />
    </>
  );
}

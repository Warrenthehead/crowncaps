import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Connexion' };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center font-serif text-3xl">CrownCaps</p>
        <LoginForm />
      </div>
    </div>
  );
}

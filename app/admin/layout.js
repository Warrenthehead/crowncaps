export const metadata = {
  title: { default: 'Admin', template: '%s – Admin CrownCaps' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="min-h-dvh bg-[#f6f6f7]">{children}</div>;
}

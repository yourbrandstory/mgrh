import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MGRH Website Editor',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}

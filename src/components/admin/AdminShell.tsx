'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from './AdminProvider';
import Sidebar from './Sidebar';

export default function AdminShell({ children }: { children: ReactNode }) {
  const admin = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (!admin.ready) return;
    if (isLogin) {
      if (admin.user) router.replace('/admin/doctors');
      return;
    }
    if (!admin.user) router.replace('/admin/login');
  }, [admin.ready, admin.user, isLogin, router]);

  if (!admin.ready) return null;

  if (isLogin) {
    if (admin.user) return null;
    return <>{children}</>;
  }

  if (!admin.user) return null;

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div>{children}</div>
      </main>
    </div>
  );
}

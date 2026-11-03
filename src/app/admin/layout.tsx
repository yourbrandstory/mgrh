import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Mono, DM_Sans } from 'next/font/google';
import AdminProvider from '@/components/admin/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import { ImageEditorProvider } from '@/components/admin/ImageEditor';
import './admin.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MGRH Content Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${dmSans.variable} ${dmMono.variable} admin-root`}>
      <AdminProvider>
        <ImageEditorProvider>
          <AdminShell>{children}</AdminShell>
        </ImageEditorProvider>
      </AdminProvider>
    </div>
  );
}

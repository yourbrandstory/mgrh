'use client';

import { usePathname } from 'next/navigation';
import { Header, TopBand } from './Header';
import Footer from './Footer';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-ink">
      <TopBand />
      <Header />
      <main>{children}</main>
      <Footer curveFrom={pathname === '/' ? '#EAF5F2' : '#FFFFFF'} />
    </div>
  );
}

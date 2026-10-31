'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import type { CSSProperties } from 'react';

const alertIcon = (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
    <circle cx={12} cy={12} r={9.5} />
    <path d="M12 7.5v6M12 16.6v.4" />
  </svg>
);

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Facilities', href: '/facilities' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Events', href: '/events' },
  { label: 'Support Us', href: '/support' },
  { label: 'Contact', href: '/contact' },
];

export function Header({ logoHeight = 140 }: { logoHeight?: number }) {
  const pathname = usePathname();

  const headerStyle: CSSProperties = { position: 'sticky', top: 0, zIndex: 60, background: '#ffffff', borderBottom: '1px solid #E0EDE9' };
  const containerStyle: CSSProperties = { maxWidth: 1800, margin: '0 auto', padding: '14px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 };
  const logoStyle: CSSProperties = { height: logoHeight, width: 'auto', display: 'block' };
  const navStyle: CSSProperties = { flex: '1 1 0%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0 };
  const navListStyle: CSSProperties = { flex: '0 1 auto', minWidth: 0, marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0, overflowX: 'auto' };
  const baseLinkStyle: CSSProperties = { flex: '0 0 auto', fontWeight: 500, fontSize: 24, padding: '9px 15px', borderRadius: 6, whiteSpace: 'nowrap', textDecoration: 'none' };
  const emergencyStyle: CSSProperties = { flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 22, marginLeft: 14, background: '#E1332A', color: '#fff', padding: '12px 20px', borderRadius: 6, whiteSpace: 'nowrap', textDecoration: 'none' };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <Link href="/" style={{ display: 'block', flex: '0 0 auto' }} aria-label="Morarji Gokuldas Rural Hospital — home">
          <img src="/images/00-shared/logo.png" alt="Morarji Gokuldas Rural Hospital" style={logoStyle} />
        </Link>
        <nav style={navStyle}>
          <div style={navListStyle}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              const [hovered, setHovered] = useState(false);
              const color = active ? '#0A8E7B' : '#35514B';
              const linkStyle: CSSProperties = { ...baseLinkStyle, color, ...(hovered ? { color: '#0A8E7B' } : {}) };
              return (
                <Link key={item.href} href={item.href} style={linkStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                  {item.label}
                </Link>
              );
            })}
          </div>
          <Link href="/emergency" style={emergencyStyle}>{alertIcon} Emergency</Link>
        </nav>
      </div>
    </header>
  );
}

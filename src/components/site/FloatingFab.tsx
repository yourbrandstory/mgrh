'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

const closeIcon = (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const menuIcon = (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 21V9.4a1 1 0 0 1 .55-.9L11.5 5a1 1 0 0 1 .9 0l7.05 3.5a1 1 0 0 1 .55.9V21" />
    <path d="M2.5 21h19" />
    <path d="M12 9.6v5.2M9.4 12.2h5.2" strokeWidth={2.1} />
    <path d="M9.6 21v-3.1h4.8V21" />
  </svg>
);

interface FloatingFabProps {
  title: string;
  links: { label: string; href: string }[];
}

export function FloatingFab({ title, links }: FloatingFabProps) {
  const [open, setOpen] = useState(false);

  const wrapperStyle: CSSProperties = { position: 'fixed', right: 30, bottom: 30, zIndex: 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 };
  const panelStyle: CSSProperties = { width: 300, background: '#ffffff', border: '1px solid #E6ECEA', borderRadius: 18, boxShadow: '0 26px 56px -20px rgba(12,70,62,0.45)', overflow: 'hidden' };
  const panelHeaderStyle: CSSProperties = { padding: '15px 20px 13px', borderBottom: '1px solid #EEF3F1', display: 'flex', alignItems: 'center', gap: 9 };
  const dashStyle: CSSProperties = { width: 22, height: 3, borderRadius: 2, background: '#E1332A', flex: 'none' };
  const panelTitleStyle: CSSProperties = { fontWeight: 700, fontSize: 16, color: '#1F3A34' };
  const panelLinksStyle: CSSProperties = { display: 'flex', flexDirection: 'column' };
  const linkStyle: CSSProperties = { display: 'block', padding: '13px 20px', borderBottom: '1px solid #F1F5F3', fontSize: 16, fontWeight: 500, color: '#1F3A34', textDecoration: 'none' };
  const buttonStyle: CSSProperties = { width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#E1332A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 34px -10px rgba(225,51,42,0.6)', fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif' };

  return (
    <div style={wrapperStyle}>
      {open && (
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={dashStyle} />
            <span style={panelTitleStyle}>{title}</span>
          </div>
          <div style={panelLinksStyle}>
            {links.map((l) => (<a key={l.href} href={l.href} style={linkStyle} onClick={() => setOpen(false)}>{l.label}</a>))}
          </div>
        </div>
      )}
      <button type="button" style={buttonStyle} aria-expanded={open} aria-label={title} onClick={() => setOpen(!open)}>{open ? closeIcon : menuIcon}</button>
    </div>
  );
}

import Link from 'next/link';
import { useSiteContent } from '@/hooks/useSiteContent';
import type { CSSProperties } from 'react';

const phoneIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" />
  </svg>
);

const navList = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Facilities', href: '/facilities' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Events', href: '/events' },
  { label: 'Support Us', href: '/support' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer({ curveFrom = '#EAF5F2' }: { curveFrom?: string }) {
  const { settings: s } = useSiteContent();

  const footerStyle: CSSProperties = { position: 'relative', background: 'linear-gradient(122deg, #05917D 0%, #099099 55%, #2FA9BF 100%)', color: '#DCEDEA' };
  const curveStyle: CSSProperties = { position: 'absolute', top: -1, left: 0, width: '100%', height: 110, background: '#FFFFFF', clipPath: 'ellipse(130% 100% at 50% 0%)', zIndex: 1 };
  const innerStyle: CSSProperties = { position: 'relative', zIndex: 2, maxWidth: 1800, margin: '0 auto', padding: '118px 26px 0' };
  const bandStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', background: 'rgba(255,255,255,0.12)', border: `1px solid rgba(255,255,255,0.26)`, borderRadius: 16, padding: '22px 28px', marginBottom: 52 };
  const bandLeftStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 14 };
  const dotStyle: CSSProperties = { width: 12, height: 12, borderRadius: '50%', background: '#FFFFFF', boxShadow: 'rgba(225, 51, 42, 0.5) 0px 0px 0px 5px', flex: '0 0 auto' };
  const bandTextStyle: CSSProperties = { fontWeight: 700, fontSize: 23, color: '#FFFFFF' };
  const bandSubStyle: CSSProperties = { fontSize: 18, color: '#DCEDEA', marginTop: 3 };
  const bandRightStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12 };
  const telLinkStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 10, background: '#E1332A', color: '#FFFFFF', fontWeight: 700, fontSize: 19, padding: '13px 24px', borderRadius: '999px', textDecoration: 'none' };
  const infoLinkStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFFFF', color: '#0E7D6B', fontWeight: 700, fontSize: 19, padding: '13px 24px', borderRadius: '999px', textDecoration: 'none' };
  const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 44, paddingBottom: 44 };
  const colHeadStyle: CSSProperties = { fontWeight: 600, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C7EDE6', marginBottom: 16 };
  const orgTitleStyle: CSSProperties = { fontWeight: 700, fontSize: 26, lineHeight: 1.25, color: '#FFFFFF', marginBottom: 12 };
  const orgDescStyle: CSSProperties = { margin: '0 0 18px', fontSize: '18.5px', lineHeight: 1.6, color: '#EAF7F4', maxWidth: 420 };
  const orgNoteStyle: CSSProperties = { margin: 0, fontSize: '18.5px', lineHeight: 1.6, color: '#EAF7F4' };
  const addressStyle: CSSProperties = { fontSize: '18.5px', lineHeight: 1.6, color: '#EAF7F4', marginBottom: 14 };
  const getDirectionsStyle: CSSProperties = { fontSize: 18, fontWeight: 600, color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: 4 };
  const hoursListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12, fontSize: '18.5px', lineHeight: 1.5, color: '#EAF7F4' };
  const exploreListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 };
  const exploreLinkStyle: CSSProperties = { fontSize: '18.5px', color: '#EAF7F4', textDecoration: 'none' };
  const copyrightStyle: CSSProperties = { borderTop: '1px solid rgba(255, 255, 255, 0.3)', padding: '20px 0 26px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontSize: 17, color: '#D3EDE8' };
  const mailLinkStyle: CSSProperties = { color: '#D3EDE8', textDecoration: 'none' };

  return (
    <footer style={footerStyle}>
      <div style={curveStyle} aria-hidden="true" />
      <div style={innerStyle}>
        <div style={bandStyle}>
          <div style={bandLeftStyle}>
            <div style={dotStyle} />
            <div>
              <div style={bandTextStyle}>{s.emergency_strip_title}</div>
              <div style={bandSubStyle}>{s.emergency_strip_text}</div>
            </div>
          </div>
          <div style={bandRightStyle}>
            <a href={s.phone_href} style={telLinkStyle}>{phoneIcon} {s.emergency_phone}</a>
            <Link href="/emergency" style={infoLinkStyle}>Emergency information</Link>
          </div>
        </div>

        <div style={gridStyle}>
          <div>
            <div style={orgTitleStyle}>{s.hospital_name}</div>
            <p style={orgDescStyle}>{s.footer_description}</p>
            <p style={orgNoteStyle}>{s.footer_free_note}</p>
          </div>
          <div>
            <div style={colHeadStyle}>Find us</div>
            <div style={addressStyle}>{s.address_line1}<br />{s.address_line2}<br />{s.address_line3}</div>
            <Link href="/contact" style={getDirectionsStyle}>Get directions</Link>
          </div>
          <div>
            <div style={colHeadStyle}>Opening hours</div>
            <div style={hoursListStyle}>
              <div><span style={{ fontWeight: 600, color: '#FFFFFF' }}>OPD</span><br />{s.opd_hours_morning}<br />{s.opd_hours_evening}</div>
              <div><span style={{ fontWeight: 600, color: '#FFFFFF' }}>Casualty</span><br />{s.casualty_hours}</div>
            </div>
          </div>
          <div>
            <div style={colHeadStyle}>Explore</div>
            <div style={exploreListStyle}>
              {navList.slice(1).map((item) => (<Link key={item.href} href={item.href} style={exploreLinkStyle}>{item.label}</Link>))}
            </div>
          </div>
        </div>

        <div style={copyrightStyle}>
          <span>© {new Date().getFullYear()} {s.hospital_name}, {s.town}</span>
          <a href={`mailto:${s.email}`} style={mailLinkStyle}>{s.email}</a>
        </div>
      </div>
    </footer>
  );
}

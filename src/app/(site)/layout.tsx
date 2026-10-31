'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSiteContent } from '@/hooks/useSiteContent';

const FONT = `var(--font-dm-sans), 'DM Sans', sans-serif`;

const BAND_BG = '#2AA5AE';
const BAND_COLOR = '#E4F5F6';
const BORDER_LINE = '#E6ECEA';
const INK = '#16413A';
const NAV_COLOR = '#3A4744';
const EMERGENCY = '#E1332A';
const FOOTER_GRADIENT =
  'linear-gradient(122deg, rgb(5, 145, 125) 0%, rgb(9, 144, 153) 55%, rgb(47, 169, 191) 100%)';
const FOOTER_COLOR = '#DCEDEA';

const locationIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx={12} cy={10} r={2.6} />
  </svg>
);

const clockIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7.5V12l3.4 2" />
  </svg>
);

const phoneIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" />
  </svg>
);

const mailIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x={3} y={5} width={18} height={14} rx={2} />
    <path d="M3.5 6.5 12 13l8.5-6.5" />
  </svg>
);

const alertIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
    <circle cx={12} cy={12} r={9.5} />
    <path d="M12 7.5v6M12 16.6v.4" />
  </svg>
);

const phoneFilledIcon = (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="#CFEDEF" aria-hidden="true">
    <path d="M6.6 2.2c.5-.1 1 .2 1.1.7l1.1 4.6c.1.4-.1.9-.5 1.1L6.4 9.8a13.5 13.5 0 0 0 7.8 7.8l1.2-1.9c.2-.4.7-.6 1.1-.5l4.6 1.1c.5.1.8.6.7 1.1-.5 2.6-2.8 4.4-5.4 4.3C9.1 21.3 2.7 14.9 2.3 7.6 2.2 5 4 2.7 6.6 2.2Z" />
  </svg>
);

const alertBandPhoneIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
    <path d="M6.6 2.2c.5-.1 1 .2 1.1.7l1.1 4.6c.1.4-.1.9-.5 1.1L6.4 9.8a13.5 13.5 0 0 0 7.8 7.8l1.2-1.9c.2-.4.7-.6 1.1-.5l4.6 1.1c.5.1.8.6.7 1.1-.5 2.6-2.8 4.4-5.4 4.3C9.1 21.3 2.7 14.9 2.3 7.6 2.2 5 4 2.7 6.6 2.2Z" />
  </svg>
);

const ADDRESS_LINE = 'Mahabaleshwar - Medha Road, District - Satara – 412 806, Maharashtra';
const PHONE_TEXT = '+91 21682 60247';
const PHONE_HREF = 'tel:+912168260247';
const EMAIL_TEXT = 'info@mgrh-mahabaleshwar.org';
const OPD_SHORT = 'OPD 9:00 – 17:00 · Casualty open 24 hours';
const OPD_CONTACT = 'OPD 09:00 a.m. to 01:00 p.m. and 04:00 p.m. to 06:00 p.m. · Casualty open 24 hours';
const OPD_ABOUT = 'OPD time 09:00 am - 01:00 pm and 04:00 pm -06:00 pm';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Facilities', href: '/facilities' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Events', href: '/events' },
  { label: 'Support Us', href: '/support' },
  { label: 'Contact', href: '/contact' },
];

function TopBand({ pathname }: { pathname: string }) {
  if (pathname === '/emergency') {
    return (
      <div style={{ background: '#E1332A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '11px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', fontSize: '16.5px', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFFFFF', animation: 'mgBlink 1.4s ease-in-out infinite' }} />
            Casualty ward open 24 hours · no appointment, no queue, no payment
          </span>
          <a href={PHONE_HREF} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#FFFFFF', fontWeight: 700, textDecoration: 'none' }}>
            {alertBandPhoneIcon}
            {PHONE_TEXT}
          </a>
        </div>
      </div>
    );
  }

  if (pathname === '/') {
    return (
      <div style={{ background: '#0B6558', color: '#FFFFFF' }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '11px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', fontSize: '16.5px', fontWeight: 500 }}>
          <span>Consultation, tests, medicines and hospital stay — free of charge, for everyone.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ color: '#C7EDE6', textDecoration: 'none' }}>Contact</Link>
            <Link href="/support" style={{ color: '#C7EDE6', textDecoration: 'none' }}>Support us</Link>
            <a href={PHONE_HREF} style={{ color: '#FFFFFF', fontWeight: 700, textDecoration: 'none' }}>{PHONE_TEXT}</a>
          </span>
        </div>
      </div>
    );
  }

  if (pathname === '/contact') {
    return (
      <div style={{ background: BAND_BG, color: BAND_COLOR }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '10px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', fontSize: '15.5px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            {locationIcon}
            {ADDRESS_LINE}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              {clockIcon}
              {OPD_CONTACT}
            </span>
            <a href="https://www.mgrh-mahabaleshwar.org" style={{ color: '#F0FAFB', textDecoration: 'none' }}>www.mgrh-mahabaleshwar.org</a>
          </div>
        </div>
      </div>
    );
  }

  const compact = pathname === '/support' || pathname === '/programmes' || pathname === '/facilities';
  const isFacilities = pathname === '/facilities';
  const opd = pathname === '/about' ? OPD_ABOUT : OPD_SHORT;

  return (
    <div style={{ background: BAND_BG, color: BAND_COLOR }}>
      <div style={{ maxWidth: 1800, margin: '0 auto', padding: '10px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', fontSize: compact ? '15.5px' : '17.5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            {locationIcon}
            {ADDRESS_LINE}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            {clockIcon}
            {opd}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: '#FFFFFF', fontWeight: 600 }}>
            {isFacilities ? phoneFilledIcon : phoneIcon}
            <a href={PHONE_HREF} style={{ color: '#FFFFFF', textDecoration: 'none' }}>{PHONE_TEXT}</a>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            {mailIcon}
            <a href={`mailto:${EMAIL_TEXT}`} style={{ color: '#F0FAFB', textDecoration: 'none' }}>{EMAIL_TEXT}</a>
          </span>
        </div>
      </div>
    </div>
  );
}

function SiteHeader({ pathname, hospitalName }: { pathname: string; hospitalName: string }) {
  const variantA = pathname === '/emergency' || pathname === '/contact' || pathname === '/';
  const showServices = pathname === '/events' || pathname === '/programmes' || pathname === '/doctors' || pathname === '/about';
  const isContact = pathname === '/contact';
  const activeColor = variantA ? '#0A8E7B' : '#06A88C';
  const emergencyStyle: React.CSSProperties = {
    flex: '0 0 auto',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 700,
    fontSize: 18,
    marginLeft: variantA ? 14 : 12,
    background: EMERGENCY,
    color: '#FFFFFF',
    padding: '9px 16px',
    border: 'none',
    borderRadius: 6,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: FONT,
  };
  const emergencyIcon = variantA ? (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <circle cx={12} cy={12} r={9.5} />
      <path d="M12 7.5v6M12 16.6v.4" />
    </svg>
  ) : (
    alertIcon
  );

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 60, background: '#FFFFFF', borderBottom: `1px solid ${variantA ? '#E0EDE9' : BORDER_LINE}` }}>
      <div style={{ maxWidth: 1800, margin: '0 auto', padding: '8px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <Link href="/" style={{ display: 'block', flex: '0 0 auto' }} aria-label={`${hospitalName} — home`}>
          <img src="/images/mgrh-logo.png" alt={hospitalName} style={{ height: 84, width: 'auto', display: 'block' }} />
        </Link>
        <nav style={{ flex: '1 1 0%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0 }}>
          <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }} className="site-nav-scroll">
            {NAV_LINKS.map((item) => {
              const isActive = item.href === pathname;
              const label = showServices && item.label === 'Facilities' ? 'Services' : item.label;
              const itemHref =
                pathname === '/facilities' && item.href === '/facilities'
                  ? '#emergency'
                  : pathname === '/about' && item.href === '/about'
                    ? '#who'
                    : item.href;
              return (
                <Link
                  key={item.href}
                  href={itemHref}
                  className={variantA ? 'site-nav-hover-green' : 'site-nav-hover-teal'}
                  style={{
                    flex: '0 0 auto',
                    fontWeight: 500,
                    fontSize: 20,
                    padding: '7px 13px',
                    borderRadius: 6,
                    color: isActive ? activeColor : variantA ? '#35514B' : NAV_COLOR,
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          {isContact ? (
            <button
              type="button"
              className="site-emergency-hover"
              onClick={() => window.dispatchEvent(new Event('mgrh:open-emergency'))}
              style={emergencyStyle}
            >
              {emergencyIcon} Emergency
            </button>
          ) : (
            <Link
              href={pathname === '/' ? '/emergency' : pathname === '/facilities' ? '#emergency' : PHONE_HREF}
              className="site-emergency-hover"
              style={emergencyStyle}
            >
              {emergencyIcon} Emergency
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, navItems } = useSiteContent();
  const pathname = usePathname();

  return (
    <div style={{ fontFamily: FONT, color: INK, background: '#FFFFFF', minHeight: '100vh' }}>
      <TopBand pathname={pathname} />
      <SiteHeader pathname={pathname} hospitalName={settings.hospital_name} />

      <main>{children}</main>

      <footer style={{ position: 'relative', background: FOOTER_GRADIENT, color: FOOTER_COLOR }}>
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: 0,
            width: '100%',
            height: 110,
            background: '#FFFFFF',
            clipPath: 'ellipse(130% 100% at 50% 0%)',
            zIndex: 1,
          }}
          aria-hidden="true"
        />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1800, margin: '0 auto', padding: '118px 26px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.12)', border: `1px solid rgba(255, 255, 255, 0.26)`, borderRadius: 16, padding: '22px 28px', marginBottom: 52 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: `rgba(225, 51, 42, 0.5) 0px 0px 0px 5px`,
                  flex: '0 0 auto',
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 23, color: '#FFFFFF' }}>In an emergency, come straight in.</div>
                <div style={{ fontSize: 18, color: FOOTER_COLOR, marginTop: 3 }}>Casualty is open 24 hours, every day. No appointment needed.</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a
                href={settings.phone_href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: EMERGENCY,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 19,
                  padding: '13px 24px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                }}
              >
                {phoneIcon} {settings.emergency_phone}
              </a>
              <Link
                href="/emergency"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#FFFFFF',
                  color: '#0E7D6B',
                  fontWeight: 700,
                  fontSize: 19,
                  padding: '13px 24px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                }}
              >
                Emergency information
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 44, paddingBottom: 44 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 26, lineHeight: 1.25, color: '#FFFFFF', marginBottom: 12 }}>{settings.hospital_name}</div>
              <p style={{ margin: '0 0 18px 0', fontSize: '18.5px', lineHeight: 1.6, color: '#EAF7F4', maxWidth: 420 }}>{settings.footer_description}</p>
              <p style={{ margin: 0, fontSize: '18.5px', lineHeight: 1.6, color: '#EAF7F4' }}>{settings.footer_free_note}</p>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C7EDE6', marginBottom: 16 }}>Find us</div>
              <div style={{ fontSize: '18.5px', lineHeight: 1.6, color: '#EAF7F4', marginBottom: 14 }}>{settings.address_line1}<br />{settings.address_line2}<br />{settings.address_line3}</div>
              <Link href="/contact" style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: 4 }}>Get directions</Link>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C7EDE6', marginBottom: 16 }}>Opening hours</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '18.5px', lineHeight: 1.5, color: '#EAF7F4' }}>
                <div><span style={{ fontWeight: 600, color: '#FFFFFF' }}>OPD</span><br />{settings.opd_hours_morning}<br />{settings.opd_hours_evening}</div>
                <div><span style={{ fontWeight: 600, color: '#FFFFFF' }}>Casualty</span><br />{settings.casualty_hours}</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C7EDE6', marginBottom: 16 }}>Explore</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {navItems.slice(1).map((item) => (
                  <Link key={item.href} href={item.href} style={{ fontSize: '18.5px', color: '#EAF7F4', textDecoration: 'none' }}>{item.label}</Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid rgba(255, 255, 255, 0.3)`, padding: '20px 0 26px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontSize: 17, color: '#D3EDE8' }}>
            <span>© {new Date().getFullYear()} {settings.hospital_name}, {settings.town}</span>
            <a href={`mailto:${settings.email}`} style={{ color: '#D3EDE8', textDecoration: 'none' }}>{settings.email}</a>
          </div>
        </div>
      </footer>

      {pathname !== '/' ? (
        <div style={{ position: 'fixed', right: 30, bottom: 30, zIndex: 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
          <button
            type="button"
            aria-expanded={false}
            aria-label="Browse this page"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: EMERGENCY,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `rgba(225, 51, 42, 0.6) 0px 16px 34px -10px`,
              fontFamily: FONT,
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 21V9.4a1 1 0 0 1 .55-.9L11.5 5a1 1 0 0 1 .9 0l7.05 3.5a1 1 0 0 1 .55.9V21" />
              <path d="M2.5 21h19" />
              <path d="M12 9.6v5.2M9.4 12.2h5.2" strokeWidth={2.1} />
              <path d="M9.6 21v-3.1h4.8V21" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}

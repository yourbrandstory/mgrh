'use client';

import { useEffect, useRef, useState } from 'react';
import {
  centres,
  galleryShots,
  glance,
  milestones,
  programmes,
  reachRows,
  support,
} from './data';
import type { EventItem } from './data';
import styles from './home.module.css';

const MAX_W = 1800;

function PlaceholderTile({ label }: { label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(127,127,127,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        textAlign: 'center',
        padding: 12,
        font: '13px/1.3 system-ui, -apple-system, sans-serif',
      }}
    >
      <svg
        width={28}
        height={28}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.45 }}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <div className={styles.placeholderLabel} data-label={label} aria-hidden="true" />
    </div>
  );
}

function SlotRing() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        border: '1.5px dashed currentColor',
        opacity: 0.35,
      }}
    />
  );
}

export default function HomeView({ events }: { events: EventItem[] }) {
  const refs = useRef<Array<HTMLElement | null>>([]);
  const [seen, setSeen] = useState<Record<string, boolean>>({ 0: true, 1: true, 2: true, 3: true, 4: true });
  const [activeProg, setActiveProg] = useState<number | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = refs.current.slice(0, 5);
    if (els.some((el) => !el)) return;

    const h = document.documentElement.clientHeight || 800;
    const initial: Record<string, boolean> = {};
    els.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      initial[i] = r.top < h * 0.9 && r.bottom > 0;
      el.setAttribute('data-sec', String(i));
    });
    setSeen(initial);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const k = e.target.getAttribute('data-sec');
          if (!k) return;
          io.unobserve(e.target);
          setSeen((s) => (s[k] ? s : { ...s, [k]: true }));
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );
    els.forEach((el) => {
      if (el) io.observe(el);
    });

    let scrolled = false;
    const onScroll = () => {
      scrolled = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const safety = setTimeout(() => {
      if (scrolled) return;
      setSeen({ 0: true, 1: true, 2: true, 3: true, 4: true });
    }, 1800);

    return () => {
      io.disconnect();
      clearTimeout(safety);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProg(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const reveal = (index: number) => ({
    opacity: seen[index] ? 1 : 0,
    transform: seen[index] ? 'none' : 'translateY(26px)',
    transition: 'opacity 0.8s ease, transform 0.9s cubic-bezier(0.2,0.85,0.3,1)',
  });

  const active = activeProg === null ? null : programmes[activeProg];
  const closeGallery = () => setActiveProg(null);

  return (
    <div className={styles.page}>
      {/* ===== HERO ===== */}
      <section id="top" style={{ position: 'relative', overflow: 'hidden', background: '#EAF6F3' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img
            src="/images/home-hero-doctors.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '72% 64%', display: 'block' }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(96deg, rgba(240,249,247,0.94) 0%, rgba(240,249,247,0.88) 40%, rgba(240,249,247,0.5) 52%, rgba(240,249,247,0) 64%)',
          }}
        />
        <div
          className={styles.heroCurve}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -2,
            height: 190,
            background: '#ffffff',
            borderTopLeftRadius: '100% 190px',
            borderTopRightRadius: 0,
            transform: 'scaleX(1.06)',
            transformOrigin: 'left bottom',
          }}
        />

        <div className={styles.heroInner} style={{ position: 'relative', zIndex: 3, maxWidth: MAX_W, margin: '0 auto', padding: '74px var(--page-pad) 118px' }}>
          <div className={styles.heroText} style={{ maxWidth: 'min(46%, 680px)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 16.5,
                letterSpacing: '0.14em',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: '#5A6A66',
                marginBottom: 26,
              }}
            >
              <span>MGRH</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span style={{ color: '#5A6A66' }}>Mahabaleshwar</span>
            </div>
            <h1
              style={{
                fontWeight: 500,
                fontSize: 'clamp(44px, 4.6vw, 74px)',
                lineHeight: 0.98,
                margin: '0 0 26px',
                color: '#0B4F45',
                letterSpacing: '-0.035em',
                textWrap: 'balance',
              }}
            >
              Quality healthcare, provided free of charge.
            </h1>
            <p style={{ fontSize: 'clamp(18px, 1.5vw, 24px)', lineHeight: 1.5, color: '#45605A', margin: '0 0 40px' }}>
              Comprehensive healthcare for the local and rural population and tourists, with consultations, diagnostic
              tests, medication and hospital stay provided free of charge under one roof.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <a
                href="/facilities"
                className={styles.heroPrimary}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 11,
                  background: '#0A8E7B',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 21,
                  padding: '17px 32px',
                  borderRadius: 999,
                }}
              >
                Our departments
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
                </svg>
              </a>
              <a
                href="/doctors"
                className={styles.heroSecondary}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 11,
                  border: '1px solid #9FD0C7',
                  background: 'rgba(255,255,255,0.7)',
                  color: '#0B5F55',
                  fontWeight: 700,
                  fontSize: 21,
                  padding: '17px 32px',
                  borderRadius: 999,
                }}
              >
                Find a doctor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT THE HOSPITAL ===== */}
      <section
        ref={(el) => {
          refs.current[0] = el;
        }}
        style={{ maxWidth: MAX_W, margin: '0 auto', padding: '20px var(--page-pad) 0', ...reveal(0) }}
      >
        <div
          className={styles.aboutGrid}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(430px, 100%), 1fr))', gap: 62, alignItems: 'start' }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0B7F73', marginBottom: 16 }}>
              About the hospital
            </div>
            <h2
              style={{
                fontWeight: 600,
                fontSize: 42,
                lineHeight: 1.08,
                letterSpacing: '-0.028em',
                color: '#0B4F45',
                margin: '0 0 22px',
                maxWidth: 720,
                textWrap: 'balance',
              }}
            >
              A legacy of healthcare since 1914.
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 21, lineHeight: 1.62, color: '#45605A', maxWidth: 740 }}>
              Shri Moraji Gokuldas donated the building to the Central Government in 1914. Custody has passed through the
              Zilla Parishad, the municipal council and the Government of Maharashtra. In February 2019, a tripartite
              agreement was signed by the Health Ministry, the Government of Maharashtra, the Red Cross Society and Bel-Air.
            </p>
            <p style={{ margin: '0 0 34px', fontSize: 21, lineHeight: 1.62, color: '#45605A', maxWidth: 740 }}>
              Medical investigations, treatment and operations, hospital stay and medicines are provided free of cost.
            </p>

            <div style={{ position: 'relative', paddingLeft: 30, marginBottom: 36, maxWidth: 700 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 10,
                  bottom: 10,
                  width: 2,
                  background: 'linear-gradient(#0A8E7B, #A8D6CC)',
                }}
              />
              {milestones.map((m) => (
                <div key={m.year} style={{ position: 'relative', padding: '0 0 22px' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: -30,
                      top: 7,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '3px solid #0A8E7B',
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.06em', color: '#0B7F73', marginBottom: 3 }}>{m.year}</div>
                  <div style={{ fontSize: 19.5, lineHeight: 1.5, color: '#45605A' }}>{m.text}</div>
                </div>
              ))}
            </div>

            <a
              href="/about"
              className={styles.readHistory}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 11,
                background: '#0A8E7B',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 20,
                padding: '16px 30px',
                borderRadius: 999,
              }}
            >
              Read our history
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
              </svg>
            </a>
          </div>

          <div>
            <div style={{ position: 'relative', maxWidth: 760 }}>
              <div style={{ borderTop: '4px solid #E1332A', overflow: 'hidden', background: '#EEF3F1', aspectRatio: '4 / 3' }}>
                <img
                  src="/images/contact-building.png"
                  alt="The hospital building on Medha Road"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                className={styles.statBadge}
                style={{
                  position: 'absolute',
                  right: -14,
                  bottom: -30,
                  background: '#ffffff',
                  border: '1px solid #DCEBE7',
                  borderRadius: 16,
                  padding: '22px 26px',
                  boxShadow: '0 26px 52px -36px rgba(6,80,68,0.5)',
                  maxWidth: 300,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 34, lineHeight: 1, letterSpacing: '-0.026em', color: '#0B4F45', marginBottom: 7 }}>
                  112 years
                </div>
                <div style={{ fontSize: 17.5, lineHeight: 1.48, color: '#4E5F5A' }}>of healthcare in Mahabaleshwar</div>
              </div>
            </div>
            <div style={{ margin: '46px 2px 0', fontSize: 17, color: '#5A6A66', maxWidth: 760 }}>
              The hospital on Mahabaleshwar - Medha Road
            </div>

            <div
              style={{
                marginTop: 30,
                background: '#E8F6F3',
                border: '1px solid #BEE3DB',
                borderRadius: 16,
                padding: '28px 30px',
                maxWidth: 760,
              }}
            >
              <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0B6558', marginBottom: 12 }}>
                Our promise
              </div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 22, lineHeight: 1.46, color: '#0B4F45' }}>
                Consultation, diagnostic tests, medication and hospital stay — all provided free of charge, under one roof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NUMBERS BAND ===== */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          marginTop: 58,
          background: '#0B8574',
          boxShadow: 'inset 0 26px 52px -32px rgba(3,42,36,0.9), inset 0 -26px 52px -32px rgba(3,42,36,0.75)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/images/contact-aerial.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.28,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(100deg, rgba(7,102,88,0.95) 0%, rgba(9,124,108,0.88) 46%, rgba(14,148,142,0.74) 78%, rgba(24,168,178,0.6) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: MAX_W, margin: '0 auto', padding: '58px var(--page-pad) 62px' }}>
          <div className={styles.glanceGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 44 }}>
            {glance.map((g) => (
              <div key={g.label} style={{ borderTop: '3px solid rgba(255,255,255,0.46)', paddingTop: 20 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 46,
                    lineHeight: 1,
                    letterSpacing: '-0.026em',
                    color: '#ffffff',
                    marginBottom: 9,
                    textShadow: '0 2px 16px rgba(3,42,36,0.4)',
                  }}
                >
                  {g.value}
                </div>
                <div style={{ fontSize: 18.5, lineHeight: 1.5, color: '#FFFFFF' }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EMERGENCY + REACH ===== */}
      <section
        ref={(el) => {
          refs.current[4] = el;
        }}
        style={{ maxWidth: MAX_W, margin: '0 auto', padding: '80px var(--page-pad) 0', ...reveal(4) }}
      >
        <div
          className={styles.reachGrid}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(430px, 100%), 1fr))', gap: 24, alignItems: 'stretch' }}
        >
          <div className={styles.infoCard} style={{ background: '#FDF1F0', border: '1px solid #F6D8D5', borderRadius: 18, padding: '42px 44px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#9E2018',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#E1332A',
                  animation: 'mgBlinkHome 1.5s ease-in-out infinite',
                }}
              />
              Emergency &amp; casualty
            </div>
            <h3
              style={{
                fontWeight: 600,
                fontSize: 35,
                lineHeight: 1.12,
                letterSpacing: '-0.024em',
                color: '#9E2018',
                margin: '0 0 16px',
              }}
            >
              Emergency and Casualty Care.
            </h3>
            <p style={{ margin: '0 0 30px', fontSize: 20, lineHeight: 1.6, color: '#7C4741', maxWidth: 620 }}>
              The Emergency and Casualty department provides essential facilities for effective and timely care. The hospital
              provides emergency care, intensive care and modern operation theatre facilities.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <a
                href="tel:+912168260247"
                className={styles.emergencyCall}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#E1332A',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 20,
                  padding: '16px 30px',
                  borderRadius: 999,
                }}
              >
                +91 21682 60247
              </a>
              <a
                href="/emergency"
                className={styles.expect}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  border: '1px solid #E9B3AF',
                  color: '#B4251E',
                  fontWeight: 700,
                  fontSize: 20,
                  padding: '16px 30px',
                  borderRadius: 999,
                }}
              >
                What to expect
              </a>
            </div>
          </div>
          <div className={styles.infoCard} style={{ background: '#ffffff', border: '1px solid #DCEBE7', borderRadius: 18, padding: '42px 44px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0B7F73', marginBottom: 16 }}>
              Reach the hospital
            </div>
            <h3
              style={{
                fontWeight: 600,
                fontSize: 35,
                lineHeight: 1.12,
                letterSpacing: '-0.024em',
                color: '#12564C',
                margin: '0 0 22px',
              }}
            >
              Located on Mahabaleshwar-Medha Road.
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 28 }}>
              {reachRows.map((r) => (
                <div
                  key={r.label}
                  className={styles.reachRow}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 140px) 1fr',
                    gap: 20,
                    alignItems: 'baseline',
                    padding: '13px 0',
                    borderBottom: '1px solid #EEF3F1',
                  }}
                >
                  <span style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0B7F73' }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 19.5, lineHeight: 1.5, color: '#23423B' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <a
                href="/contact"
                className={styles.contactBtn}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#0A8E7B',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 20,
                  padding: '16px 30px',
                  borderRadius: 999,
                }}
              >
                Contact &amp; directions
              </a>
              <a
                href="https://wa.me/912168260247"
                className={styles.whatsapp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  border: '1px solid #9FD0C7',
                  color: '#0B5F55',
                  fontWeight: 700,
                  fontSize: 20,
                  padding: '16px 30px',
                  borderRadius: 999,
                }}
              >
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FACILITIES ===== */}
      <section
        ref={(el) => {
          refs.current[1] = el;
        }}
        style={{
          marginTop: 82,
          background: '#EAF5F2',
          borderTop: '1px solid #DCEBE7',
          borderBottom: '1px solid #DCEBE7',
          padding: '64px 0',
          ...reveal(1),
        }}
      >
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '0 var(--page-pad)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ width: 30, height: 4, borderRadius: 2, background: '#0A8E7B', flex: 'none' }} />
            <h2 style={{ fontWeight: 500, fontSize: 36, margin: 0, color: '#1F3A34' }}>
              Our <span style={{ fontWeight: 700 }}>facilities</span>
            </h2>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#5A6A66' }}>14 departments</span>
          </div>
          <p style={{ margin: '0 0 34px', fontSize: 21, lineHeight: 1.6, color: '#45605A', maxWidth: 900 }}>
            The hospital provides OPD, Emergency and Casualty, ICU, operation theatres, diagnostics, maternity care, wards,
            pharmacy and other essential facilities on one campus.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 22,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              paddingBottom: 6,
              marginBottom: 34,
            }}
          >
            {centres.map((c) => (
              <a
                key={c.name}
                href="/facilities"
                className={styles.facilityCard}
                style={{
                  flex: 'none',
                  width: 400,
                  maxWidth: '82vw',
                  scrollSnapAlign: 'start',
                  display: 'block',
                  background: '#ffffff',
                  border: '1px solid #E0EDE9',
                  borderRadius: 16,
                  overflow: 'hidden',
                  color: '#16413A',
                  transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease',
                }}
              >
                <div
                  role="img"
                  aria-label={c.name}
                  style={{
                    aspectRatio: '16 / 10',
                    backgroundColor: '#EEF3F1',
                    backgroundImage: `url("${c.img}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div style={{ padding: '22px 24px 24px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14 }}>
                  <span style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.26, color: '#0B4F45' }}>{c.name}</span>
                  <span style={{ flex: 'none', fontSize: 15.5, fontWeight: 600, color: '#5A6A66' }}>{c.count}</span>
                </div>
              </a>
            ))}
            <a
              href="/facilities"
              className={styles.facilityMore}
              style={{
                flex: 'none',
                width: 300,
                maxWidth: '82vw',
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 14,
                background: '#E8F6F3',
                border: '1px solid #BEE3DB',
                borderRadius: 16,
                padding: '30px 32px',
                color: '#0B4F45',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 23, lineHeight: 1.24 }}>Eleven more departments</span>
              <span style={{ fontSize: 17.5, lineHeight: 1.5, color: '#4E5F5A' }}>
                Theatres, maternity, dental, diagnostics and the wards — all photographed.
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 19, fontWeight: 700, color: '#0A8E7B' }}>
                Read more
                <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#0B6558" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
                </svg>
              </span>
            </a>
          </div>

          <div
            className={styles.facilitiesBand}
            style={{
              background: '#ffffff',
              border: '1px solid #DCEBE7',
              borderRadius: 18,
              padding: '38px 42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 32,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 780 }}>
              <h3 style={{ fontWeight: 600, fontSize: 28, lineHeight: 1.2, margin: '0 0 10px', color: '#0B4F45' }}>
                See the ward you will be treated in.
              </h3>
              <p style={{ margin: 0, fontSize: 19.5, lineHeight: 1.58, color: '#4E5F5A' }}>
                Every department is photographed — theatres, ICU, maternity, the pathology bench and the wards — so you know
                what to expect before you arrive.
              </p>
            </div>
            <a
              href="/facilities"
              className={styles.viewAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 11,
                background: '#0A8E7B',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 20,
                padding: '16px 30px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
              }}
            >
              View all facilities
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== PROGRAMMES ===== */}
      <section
        ref={(el) => {
          refs.current[2] = el;
        }}
        style={{
          marginTop: 82,
          background: '#F4FAF8',
          borderTop: '1px solid #E2EFEB',
          borderBottom: '1px solid #E2EFEB',
          padding: '64px 0',
          ...reveal(2),
        }}
      >
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '0 var(--page-pad)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ width: 30, height: 4, borderRadius: 2, background: '#0A8E7B', flex: 'none' }} />
            <h2 style={{ fontWeight: 500, fontSize: 36, margin: 0, color: '#1F3A34' }}>
              Our <span style={{ fontWeight: 700 }}>programmes</span>
            </h2>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#5A6A66' }}>12 running</span>
          </div>
          <p style={{ margin: '0 0 34px', fontSize: 21, lineHeight: 1.6, color: '#45605A', maxWidth: 900 }}>
            Work that does not wait for a patient to walk in — national control programmes, school clinics and screening
            camps that go out into the villages.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'stretch' }}>
            {programmes.map((p, i) => (
              <div
                key={p.name}
                onClick={() => setActiveProg(i)}
                role="button"
                tabIndex={0}
                className={styles.programmeCard}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  background: '#ffffff',
                  border: '1px solid #E0EDE9',
                  borderRadius: 16,
                  padding: '28px 30px 30px',
                  color: '#16413A',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    background: '#E1F3EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}
                >
                  <svg
                    width={25}
                    height={25}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0A5F52"
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {p.iconPaths.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </svg>
                </div>
                <div className={styles.cardTitle} style={{ fontWeight: 600, fontSize: 21.5, lineHeight: 1.26, color: '#0B4F45', marginBottom: 7 }}>{p.name}</div>
                <div style={{ fontSize: 17.5, lineHeight: 1.5, color: '#5A6A66', marginBottom: 16 }}>{p.desc}</div>
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '16 / 10',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#EEF3F1',
                    margin: 'auto 0 16px',
                  }}
                >
                  <PlaceholderTile label={p.name} />
                  <SlotRing />
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700, color: '#0B6558' }}>
                  View photos
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#0B6558" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 16l5-5 4 4 3-3 6 6" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
          <a
            href="/programmes"
            className={styles.readMore}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 32,
              background: '#0A8E7B',
              border: '1px solid #0A8E7B',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 19,
              padding: '15px 28px',
              borderRadius: 999,
              animation: 'mgHalo 2.6s ease-out infinite',
            }}
          >
            Read more
            <span style={{ display: 'inline-flex', animation: 'mgNudge 2.6s ease-in-out infinite' }}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
              </svg>
            </span>
          </a>
        </div>
      </section>

      {/* ===== EVENTS ===== */}
      <section
        ref={(el) => {
          refs.current[3] = el;
        }}
        style={{
          marginTop: 80,
          background: '#108C89',
          color: '#ffffff',
          ...reveal(3),
        }}
      >
        <div
          className={styles.eventsInner}
          style={{
            maxWidth: MAX_W,
            margin: '0 auto',
            padding: '62px var(--page-pad)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
            gap: 56,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 16 }}>
              Camps &amp; events
            </div>
            <h2
              style={{
                fontWeight: 600,
                fontSize: 40,
                lineHeight: 1.1,
                letterSpacing: '-0.026em',
                margin: '0 0 20px',
                color: '#ffffff',
                maxWidth: 640,
                textWrap: 'balance',
              }}
            >
              Check out our upcoming events.
            </h2>
            <p style={{ margin: '0 0 32px', fontSize: 24, lineHeight: 1.55, color: '#FFFFFF', maxWidth: 660 }}>
              Blood donation drives, eye and cancer screening camps, school health clinics and immunisation rounds — held on
              campus and out in the villages, free to attend.
            </p>
            <a
              href="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 11,
                background: '#ffffff',
                color: '#0B6558',
                fontWeight: 700,
                fontSize: 20,
                padding: '16px 30px',
                borderRadius: 999,
              }}
            >
              See the calendar
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#0B6558" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
              </svg>
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {events.map((e) => (
              <a
                key={`${e.day}-${e.month}-${e.title}`}
                href="/events"
                className={`${styles.eventRow} ${styles.eventRowGrid}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '86px 1fr',
                  gap: 20,
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.16)',
                  border: '1px solid rgba(255,255,255,0.24)',
                  borderRadius: 14,
                  padding: '18px 22px',
                  color: '#ffffff',
                  transition: 'background 0.25s ease',
                }}
              >
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.94)', borderRadius: 10, padding: '9px 6px' }}>
                  <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1, color: '#0B4F45' }}>{e.day}</div>
                  <div style={{ fontWeight: 600, fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C42A21', marginTop: 4 }}>
                    {e.month}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.26, marginBottom: 5 }}>{e.title}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: '#FFFFFF' }}>{e.venue}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUPPORT US ===== */}
      <section style={{ marginTop: 82, background: '#EAF5F2', borderTop: '1px solid #DCEBE7', padding: '64px 0 72px' }}>
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '0 var(--page-pad)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              borderBottom: '1px solid #D6E7E2',
              paddingBottom: 16,
              marginBottom: 26,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ width: 30, height: 4, borderRadius: 2, background: '#0A8E7B', flex: 'none' }} />
            <h2 style={{ fontWeight: 500, fontSize: 34, margin: 0, color: '#1F3A34' }}>
              Support <span style={{ fontWeight: 700 }}>us</span>
            </h2>
            <a href="/support" className={styles.supportLink} style={{ marginLeft: 'auto', fontSize: 18.5, fontWeight: 700, color: '#0B6558' }}>
              Ways to help →
            </a>
          </div>
          <p style={{ margin: '0 0 32px', fontSize: 21, lineHeight: 1.6, color: '#45605A', maxWidth: 1000 }}>
            You can support the hospital through donations, volunteering and essential equipment.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
            {support.map((sp) => (
              <a
                key={sp.title}
                href="/support"
                className={styles.supportCard}
                style={{
                  display: 'block',
                  background: '#ffffff',
                  border: '1px solid #E0EDE9',
                  borderLeft: `6px solid ${sp.accent}`,
                  borderRadius: 16,
                  padding: '30px 32px 32px',
                  color: '#16413A',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                }}
              >
                <h3 style={{ fontWeight: 600, fontSize: 24, lineHeight: 1.22, margin: '0 0 10px', color: '#0B4F45' }}>{sp.title}</h3>
                <p style={{ margin: '0 0 18px', fontSize: 18.5, lineHeight: 1.56, color: '#4E5F5A' }}>{sp.desc}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 18, fontWeight: 700, color: '#0B6558' }}>
                  {sp.cta}
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#0B6558" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROGRAMME GALLERY ===== */}
      {active ? (
        <div
          onClick={closeGallery}
          className={styles.galleryOverlay}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 140,
            background: 'rgba(9,45,40,0.62)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '46px var(--page-pad)',
            overflowY: 'auto',
            animation: 'mgVeil 0.24s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={styles.galleryPanel}
            style={{
              width: '100%',
              maxWidth: 1040,
              background: '#ffffff',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 44px 92px -32px rgba(6,50,44,0.6)',
              animation: 'mgPop 0.34s cubic-bezier(0.2,0.85,0.3,1)',
            }}
          >
            <div
              className={styles.galleryHead}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 24,
                padding: '28px 32px 24px',
                borderBottom: '1px solid #EEF3F1',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0B6558', marginBottom: 9 }}>
                  Programme
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 28, lineHeight: 1.22, margin: '0 0 8px', color: '#0B4F45' }}>{active.name}</h3>
                <p style={{ margin: 0, fontSize: 18.5, lineHeight: 1.56, color: '#4E5F5A', maxWidth: 660 }}>{active.desc}</p>
              </div>
              <button
                type="button"
                onClick={closeGallery}
                aria-label="Close"
                className={styles.closeGallery}
                style={{
                  flex: 'none',
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid #E0EDE9',
                  background: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#E1332A" strokeWidth={2.2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className={styles.galleryBody} style={{ padding: '26px 32px 32px' }}>
              <div className={styles.galleryGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {galleryShots.map((sh) => (
                  <div key={sh.label} style={{ gridColumn: sh.span }}>
                    <div style={{ position: 'relative', aspectRatio: sh.ratio, overflow: 'hidden', borderRadius: 10, background: '#EEF3F1' }}>
                      <PlaceholderTile label={sh.label} />
                      <SlotRing />
                    </div>
                    <div style={{ margin: '8px 2px 0', fontSize: 14, color: '#5A6A66' }}>{sh.label}</div>
                  </div>
                ))}
              </div>
              <a
                href="/programmes"
                className={styles.openProgrammes}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 26,
                  background: '#0A8E7B',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 18,
                  padding: '14px 26px',
                  borderRadius: 999,
                }}
              >
                Open the programmes page
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

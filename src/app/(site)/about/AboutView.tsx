'use client';

import { useEffect, useRef, useState } from 'react';
import { aboutSections, historyItems, historyPills, locationFacts, whyCards } from './data';
import styles from './about.module.css';

const MAX_W = 1800;

const whyIcons = [
  <svg key="bed" width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#0A7A6A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18V8" />
    <path d="M3 13h18v5" />
    <path d="M21 18v-3" />
    <path d="M7 13v-2.5a1.5 1.5 0 0 1 1.5-1.5H11a2 2 0 0 1 2 2v2" />
  </svg>,
  <svg key="clock" width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#0A7A6A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7v5l3 2" />
  </svg>,
  <svg key="specialist" width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#0A7A6A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v3a4 4 0 0 0 8 0v-2" />
    <circle cx={18} cy={12} r={2} />
  </svg>,
  <svg key="community" width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#0A7A6A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20h18" />
    <path d="M5 20V10l5-4 5 4v10" />
    <path d="M15 20v-6h4v6" />
    <path d="M9 20v-4h2v4" />
  </svg>,
];

const phoneIcon = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="#0A8E7B" style={{ flex: 'none' }}>
    <path d="M6.6 2.2c.5-.1 1 .2 1.1.7l1.1 4.6c.1.4-.1.9-.5 1.1L6.4 9.8a13.5 13.5 0 0 0 7.8 7.8l1.2-1.9c.2-.4.7-.6 1.1-.5l4.6 1.1c.5.1.8.6.7 1.1-.5 2.6-2.8 4.4-5.4 4.3C9.1 21.3 2.7 14.9 2.3 7.6 2.2 5 4 2.7 6.6 2.2Z" />
  </svg>
);

function SectionHead({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 14,
        borderBottom: '1px solid #E6ECEA',
        paddingBottom: 14,
      }}
    >
      <span style={{ width: 30, height: 4, borderRadius: 2, background: '#06A88C' }} />
      <h2 style={{ fontWeight: 600, fontSize: 33, margin: 0, color: '#1F3A34' }}>{title}</h2>
    </div>
  );
}

export default function AboutView() {
  const [showJump, setShowJump] = useState(false);
  const [headerH, setHeaderH] = useState(101);
  const [barH, setBarH] = useState(96);
  const [activeId, setActiveId] = useState('');
  const [seen, setSeen] = useState({ vision: false, mission: false });
  const [tl, setTl] = useState({ p: 0, shift: 0, vh: 900, viewH: 520 });

  const jumpBarRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const tlOuterRef = useRef<HTMLDivElement>(null);
  const tlViewRef = useRef<HTMLDivElement>(null);
  const tlTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement | null;
    const bar = jumpBarRef.current;
    const measure = () => {
      if (header) {
        const hh = Math.round(header.getBoundingClientRect().height);
        if (hh) setHeaderH((prev) => (hh !== prev ? hh : prev));
      }
      if (bar) {
        const bh = Math.ceil(bar.getBoundingClientRect().height);
        if (bh) setBarH((prev) => (bh !== prev ? bh : prev));
      }
    };
    measure();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      if (header) ro.observe(header);
      if (bar) ro.observe(bar);
    }
    const onScroll = () => {
      setShowJump((prev) => {
        const show = window.scrollY > 420;
        return show !== prev ? show : prev;
      });
      const line = headerH + barH + 40;
      let active = '';
      ['who', 'vision', 'why', 'location', 'history'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) active = id;
      });
      setActiveId((prev) => (active !== prev ? active : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      ro?.disconnect();
    };
  }, [headerH, barH]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const outer = tlOuterRef.current;
        const view = tlViewRef.current;
        const track = tlTrackRef.current;
        if (!outer || !view || !track) return;
        const vh = window.innerHeight || 900;
        const top = headerH + barH;
        const shift = Math.max(0, track.scrollWidth - view.clientWidth);
        const viewH = view.clientHeight;
        const total = outer.offsetHeight - (vh - top);
        const rect = outer.getBoundingClientRect();
        const p = total > 0 ? Math.min(1, Math.max(0, (top - rect.top) / total)) : 0;
        setTl((prev) =>
          Math.abs(p - prev.p) > 0.001 || shift !== prev.shift || vh !== prev.vh || viewH !== prev.viewH
            ? { p, shift, vh, viewH }
            : prev,
        );
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const timer = setTimeout(update, 80);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headerH, barH]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setSeen({ vision: true, mission: true });
      return;
    }
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        fired = true;
        const next: { vision?: boolean; mission?: boolean } = {};
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === visionRef.current) next.vision = true;
          if (entry.target === missionRef.current) next.mission = true;
          io.unobserve(entry.target);
        });
        if (Object.keys(next).length) setSeen((prev) => ({ ...prev, ...next }));
      },
      { rootMargin: '0px 0px -16% 0px', threshold: 0.15 },
    );
    if (visionRef.current) io.observe(visionRef.current);
    if (missionRef.current) io.observe(missionRef.current);
    const fallback = setTimeout(() => {
      if (!fired) setSeen({ vision: true, mission: true });
    }, 1200);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const jumpBarTop = `${headerH}px`;
  const jumpBarTransform = showJump
    ? 'translateY(0)'
    : `translateY(-${headerH + barH + 260}px)`;
  const jumpBarEvents = showJump ? 'auto' : 'none';

  const roomy = (tl.viewH || 0) >= 520;
  const current = Math.round(tl.p * (historyItems.length - 1));
  const tlHeight = `${Math.round(tl.shift) + (tl.vh || 900)}px`;
  const tlStickyTop = `${headerH + barH}px`;
  const tlStickyH = `calc(100vh - ${headerH + barH}px)`;
  const tlCardMax = `${Math.max(180, (tl.viewH || 520) - 24)}px`;
  const tlImgH = `${Math.max(0, Math.min(150, (tl.viewH || 520) - 250))}px`;
  const tlTransform = `translate3d(${(-tl.p * tl.shift).toFixed(1)}px, 0, 0)`;
  const tlPct = `${Math.max(3, Math.round(tl.p * 100))}%`;
  const tlPctLabel = `${Math.round(tl.p * 100)}%`;

  return (
    <div>
      {/* ===== STICKY SECTION JUMP ===== */}
      <div
        ref={jumpBarRef}
        style={{
          position: 'fixed',
          top: jumpBarTop,
          left: 0,
          right: 0,
          zIndex: 55,
          background: 'rgba(255,255,255,0.97)',
          borderBottom: '1px solid #E6ECEA',
          boxShadow: '0 12px 30px -22px rgba(12,70,62,0.5)',
          transform: jumpBarTransform,
          transition: 'transform 0.28s ease',
          pointerEvents: jumpBarEvents as 'auto' | 'none',
        }}
      >
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '14px 26px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <span
            style={{
              flex: 'none',
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#7A8C87',
            }}
          >
            Jump to a section
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {aboutSections.map((section) => {
              const on = section.href === '#' + activeId;
              return (
                <a
                  key={section.href}
                  href={section.href}
                  className={styles.jumpLink}
                  style={{
                    flex: 'none',
                    border: `1px solid ${on ? '#2FAFAF' : '#D2E8E3'}`,
                    background: on ? '#2FAFAF' : '#ffffff',
                    color: on ? '#ffffff' : '#1F3A34',
                    fontWeight: on ? 700 : 500,
                    fontSize: 18,
                    padding: '7px 14px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease',
                  }}
                >
                  {section.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#27A08E' }} />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '46%',
            right: 0,
            zIndex: 1,
            overflow: 'hidden',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 30%)',
            maskImage: 'linear-gradient(90deg, transparent 0%, #000 30%)',
          }}
        >
          <img
            src="/images/about-hero-aerial.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              display: 'block',
              animation: 'mgPan 28s ease-in-out infinite',
              willChange: 'transform',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background:
              'linear-gradient(90deg, rgba(38,160,142,0.82) 0%, rgba(42,166,149,0.74) 34%, rgba(46,172,156,0.6) 50%, rgba(50,178,162,0.42) 62%, rgba(36,164,150,0.18) 72%, rgba(36,164,150,0) 82%, rgba(36,164,150,0) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 4, maxWidth: MAX_W, margin: '0 auto', padding: '52px 26px 84px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 17,
              letterSpacing: '0.12em',
              fontWeight: 500,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.72)',
              marginBottom: 40,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ cursor: 'pointer' }}>Home</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>About Us</span>
          </div>
          <div style={{ maxWidth: 640 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.28)',
                color: '#EAF7F4',
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '7px 15px',
                borderRadius: '999px',
                marginBottom: 22,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C7EDE6' }} />
              Serving Mahabaleshwar since 1914
            </div>
            <h1
              style={{
                fontWeight: 500,
                fontSize: 66,
                lineHeight: 1.02,
                margin: '0 0 20px',
                color: '#ffffff',
                letterSpacing: '-0.025em',
              }}
            >
              About <span style={{ fontWeight: 700 }}>Us</span>
            </h1>
            <p style={{ fontSize: 24, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)', margin: 0, maxWidth: 560 }}>
              Situated in the lush green landscape of Mahabaleshwar, District Satara, Maharashtra, India
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHO WE ARE ===== */}
      <section id="who" style={{ maxWidth: MAX_W, margin: '0 auto', padding: '48px 26px 10px', scrollMarginTop: 62 }}>
        <div style={{ marginBottom: 34 }}>
          <SectionHead title="Who we are" />
        </div>
        <p
          style={{
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: '#12564C',
            margin: '0 0 30px',
          }}
        >
          Serving Mahabaleshwar <span style={{ fontWeight: 700 }}>since 1914</span>
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: 56,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
            <p style={{ margin: 0, fontSize: 24, lineHeight: 1.6, color: '#4E5F5A' }}>
              Morarji Gokuldas Rural Hospital is situated amidst the lush green landscape of Mahabaleshwar in Satara
              District, Maharashtra. The hospital building was generously donated by Shri Morarji Gokuldas in 1914 and
              has been serving the people of Mahabaleshwar and the surrounding villages ever since. Over the years, the
              hospital has been administered by the Central Government, Zilla Parishad, Municipal Council, and, since
              1988, the Government of Maharashtra.
            </p>
            <p style={{ margin: 0, fontSize: 24, lineHeight: 1.6, color: '#4E5F5A' }}>
              Following a PPP-mode agreement signed in February 2019 between the Health Ministry of the Government of
              Maharashtra and the Indian Red Cross Society’s Bel-Air Hospital, Panchgani. The Rural Hospital has been
              renovated and re-equipped by IRCS, Bel-Air Hospital, Panchgani.
            </p>
            <p style={{ margin: 0, fontSize: 24, lineHeight: 1.6, color: '#4E5F5A' }}>
              Consultations, diagnostic tests, medicines, and inpatient care are provided free of charge under one roof
              to the local and rural population, as well as to visitors to the region. The hospital is managed by a team
              of qualified professionals, and the Mahabaleshwar Rural Hospital Managing Committee is headed by Mr.
              Jayasinh Mariwala, Chairman.
            </p>
          </div>
          <div>
            <div style={{ maxWidth: 695, overflow: 'hidden', background: '#EEF3F1', borderTop: '4px solid #E1332A' }}>
              <img
                src="/images/about-hospital-front.png"
                alt="The renovated hospital building, Mahabaleshwar"
                style={{ width: '100%', maxWidth: 695, display: 'block' }}
              />
            </div>
            <div style={{ margin: '11px 2px 0', fontSize: 18, color: '#5A6A66' }}>Renovated Hospital Building in 2019</div>
          </div>
        </div>
      </section>

      {/* ===== VISION & MISSION ===== */}
      <section id="vision" style={{ maxWidth: MAX_W, margin: '0 auto', padding: '48px 26px 10px', scrollMarginTop: 62 }}>
        <div style={{ marginBottom: 32 }}>
          <SectionHead title="Vision & Mission" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'stretch' }}>
          <div
            ref={visionRef}
            className={styles.visionCard}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#E8F6F3',
              borderRadius: '20px 20px 130px 20px',
              padding: '36px 38px 40px',
              opacity: seen.vision ? 1 : 0,
              transform: seen.vision ? 'none' : 'translateX(-26px)',
              transition:
                'opacity 0.7s ease, transform 0.75s cubic-bezier(0.22,0.85,0.28,1), box-shadow 0.35s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: -40,
                bottom: -60,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,168,140,0.14) 0%, rgba(6,168,140,0) 70%)',
              }}
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: '#06A88C',
                  width: seen.vision ? '44px' : '0px',
                  transition: 'width 0.8s cubic-bezier(0.22,0.85,0.28,1) 0.15s',
                }}
              />
              <h3 style={{ fontWeight: 500, fontSize: 32, margin: 0, color: '#1F3A34', whiteSpace: 'nowrap' }}>
                Our <span style={{ fontWeight: 700 }}>VISION</span>
              </h3>
            </div>
            <p style={{ position: 'relative', margin: 0, fontSize: 24, lineHeight: 1.62, color: '#23423B', maxWidth: 430 }}>
              To be the preferred Primary Care Hospital in the region providing state-of-the-art medical facilities with
              care and compassion
            </p>
          </div>
          <div
            ref={missionRef}
            className={styles.missionCard}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#E4F4F6',
              borderRadius: '20px 20px 130px 20px',
              padding: '36px 38px 40px',
              opacity: seen.mission ? 1 : 0,
              transform: seen.mission ? 'none' : 'translateX(26px)',
              transition:
                'opacity 0.7s ease 0.12s, transform 0.75s cubic-bezier(0.22,0.85,0.28,1) 0.12s, box-shadow 0.35s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: -40,
                bottom: -60,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(69,184,204,0.16) 0%, rgba(69,184,204,0) 70%)',
              }}
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: '#45B8CC',
                  width: seen.mission ? '44px' : '0px',
                  transition: 'width 0.8s cubic-bezier(0.22,0.85,0.28,1) 0.27s',
                }}
              />
              <h3 style={{ fontWeight: 500, fontSize: 32, margin: 0, color: '#1F3A34', whiteSpace: 'nowrap' }}>
                Our <span style={{ fontWeight: 700 }}>MISSION</span>
              </h3>
            </div>
            <p style={{ position: 'relative', margin: 0, fontSize: 24, lineHeight: 1.62, color: '#23423B', maxWidth: 450 }}>
              To deliver Quality Healthcare to both the local &amp; rural population and tourists in the region, offering
              comprehensive services including consultations, diagnostic tests, medication and hospital stay all
              provided free of charge under one roof
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section id="why" style={{ maxWidth: MAX_W, margin: '0 auto', padding: '56px 26px 10px', scrollMarginTop: 62 }}>
        <div style={{ marginBottom: 14 }}>
          <SectionHead title="Why Choose Us?" />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginTop: 32,
          }}
        >
          {whyCards.map((card, i) => (
            <div
              key={card.number}
              className={styles.whyCard}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid #DCEBE7',
                borderRadius: '20px 20px 90px 20px',
                padding: '34px 32px 40px',
                transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 22,
                  top: 12,
                  fontWeight: 700,
                  fontSize: 84,
                  lineHeight: 1,
                  color: '#E8F6F3',
                  letterSpacing: '-0.04em',
                }}
              >
                {card.number}
              </div>
              <div
                style={{
                  position: 'relative',
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: '#E1F3EF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 22,
                }}
              >
                {whyIcons[i]}
              </div>
              <h3
                style={{
                  position: 'relative',
                  fontWeight: 700,
                  fontSize: 26,
                  lineHeight: 1.22,
                  margin: '0 0 12px',
                  color: '#0B4F45',
                }}
              >
                {card.title}
              </h3>
              <p style={{ position: 'relative', margin: 0, fontSize: 21, lineHeight: 1.55, color: '#4E5F5A' }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== LOCATION ===== */}
      <section id="location" style={{ maxWidth: MAX_W, margin: '0 auto', padding: '50px 26px 10px', scrollMarginTop: 62 }}>
        <div style={{ marginBottom: 28 }}>
          <SectionHead title="Where we are" />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
            gap: 44,
            alignItems: 'start',
          }}
        >
          <div>
            <div style={{ borderTop: '4px solid #E1332A', overflow: 'hidden', background: '#EEF3F1', aspectRatio: '16 / 10' }}>
              <img
                src="/images/about-hospital-zoom.png"
                alt="Close aerial view of the hospital building"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 55%',
                  display: 'block',
                  animation: 'mgPan 28s ease-in-out infinite',
                }}
              />
            </div>
            <div style={{ margin: '11px 2px 0', fontSize: 17, color: '#5A6A66' }}>The hospital building, seen from above</div>
          </div>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 28, margin: '0 0 14px', color: '#1F3A34', lineHeight: 1.26 }}>
              Aerial view of MORARJI GOKULDAS RURAL HOSPITAL, in Mahabaleshwar
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 22, lineHeight: 1.62, color: '#4E5F5A' }}>
              Situated in the lush green landscape of Mahabaleshwar, District Satara, Maharashtra, India
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#F1F8F6', borderRadius: 16, padding: '24px 26px' }}>
              {locationFacts.map((fact) => (
                <div
                  key={fact.label}
                  style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 14, alignItems: 'baseline' }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#7A8C87',
                    }}
                  >
                    {fact.label}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 20, lineHeight: 1.5, color: '#23423B' }}>
                    {fact.phone ? phoneIcon : null}
                    <span>{fact.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <img
              src="/images/about-map-full.png"
              alt="Map of Maharashtra showing Mumbai, Pune, Mahabaleshwar and Satara"
              style={{ width: '100%', maxWidth: 360, display: 'block' }}
            />
            <div style={{ margin: '11px 2px 0', fontSize: 17, color: '#5A6A66' }}>
              Mahabaleshwar sits in Satara District, south of Pune
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTRODUCTION / HISTORY ===== */}
      <section
        id="history"
        style={{
          position: 'relative',
          marginTop: 54,
          padding: '52px 0 20px',
          background: 'linear-gradient(180deg, #F4FAF8 0%, #ffffff 100%)',
          scrollMarginTop: 62,
        }}
      >
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '0 26px' }}>
          <div style={{ marginBottom: 12 }}>
            <SectionHead title="Our History" />
          </div>
          <p style={{ margin: '26px 0 0', fontSize: 21, lineHeight: 1.6, color: '#6A7A76', maxWidth: 720 }}>
            A hundred years of care, in eleven decades of custody.
          </p>
        </div>
        <div ref={tlOuterRef} style={{ position: 'relative', height: tlHeight }}>
          <div
            style={{
              position: 'sticky',
              top: tlStickyTop,
              height: tlStickyH,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                maxWidth: MAX_W,
                width: '100%',
                margin: '0 auto',
                padding: '14px 26px 0',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: 17, color: '#5A6A66' }}>Scroll down to explore our timeline</div>
              <div style={{ flex: '0 1 700px', minWidth: 240, height: 8, borderRadius: 999, background: '#E1EEEA', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: tlPct,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #06A88C, #45B8CC)',
                  }}
                />
              </div>
              <div style={{ fontSize: 17, color: '#5A6A66', minWidth: 110, textAlign: 'left' }}>{tlPctLabel} explored</div>
            </div>
            <div ref={tlViewRef} style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: 4,
                  marginTop: -2,
                  background: 'linear-gradient(90deg, #BFE3DB, #0A8E7B 40%, #45B8CC)',
                }}
              />
              <div
                ref={tlTrackRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 36,
                  padding: '0 8vw',
                  transform: tlTransform,
                  willChange: 'transform',
                }}
              >
                {historyItems.map((item, i) => {
                  const lift = current === i ? 'translateY(-8px) scale(1.02)' : 'none';
                  return (
                    <div
                      key={item.year}
                      style={{
                        flex: 'none',
                        width: 360,
                        maxHeight: tlCardMax,
                        overflow: 'hidden',
                        alignSelf: 'center',
                        margin: roomy ? (i % 2 === 0 ? '20px 0 0' : '0 0 20px') : '0',
                        background: '#ffffff',
                        border: '1px solid #E6ECEA',
                        borderRadius: 18,
                        padding: '20px 22px 22px',
                        boxShadow: '0 28px 56px -40px rgba(6,80,68,0.5)',
                        transform: lift,
                        transition: 'transform 0.5s cubic-bezier(0.22,0.85,0.28,1), box-shadow 0.5s ease',
                      }}
                    >
                      {item.img ? (
                        <div
                          style={{
                            borderRadius: 14,
                            backgroundColor: '#EEF3F1',
                            height: tlImgH,
                            backgroundImage: `url("${item.img}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            marginBottom: 14,
                          }}
                          role="img"
                          aria-label={item.caption}
                        />
                      ) : null}
                      <span
                        style={{
                          display: 'inline-block',
                          background: historyPills[i % historyPills.length],
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 16,
                          padding: '5px 13px',
                          borderRadius: 999,
                          marginBottom: 10,
                        }}
                      >
                        {item.year}
                      </span>
                      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: '#3C534D' }}>{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '0 26px' }}>
          <div style={{ height: 0 }} />
        </div>
      </section>

      {/* ===== HELP BAND ===== */}
      <section style={{ maxWidth: MAX_W, margin: '0 auto', padding: '34px 26px 70px' }}>
        <div
          style={{
            background: '#F1F8F6',
            border: '1px solid #E1F3EF',
            borderRadius: 20,
            padding: '38px 42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontWeight: 600, fontSize: 27, margin: '0 0 8px', color: '#1F3A34' }}>Planning a visit?</h3>
            <p style={{ margin: 0, fontSize: 20.5, lineHeight: 1.6, color: '#5A6A66' }}>
              Consultations, diagnostic tests, medication and hospital stay are provided free of charge under one roof
              for the local and rural population and for visitors to the region.
            </p>
          </div>
          <a
            href="tel:+912168260247"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#06A88C',
              color: '#fff',
              fontWeight: 700,
              fontSize: 20,
              padding: '14px 26px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
            }}
          >
            Call the hospital
          </a>
        </div>
      </section>
    </div>
  );
}

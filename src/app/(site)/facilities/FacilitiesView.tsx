'use client';

import { useEffect, useRef, useState } from 'react';
import { fallbackGroups, type FacilityGroup, type FacilityShot } from './data';
import styles from './facilities.module.css';

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

function ShotTile({ shot }: { shot: FacilityShot }) {
  return (
    <div style={{ flex: 'none', width: shot.width, scrollSnapAlign: 'center' }}>
      {shot.src ? (
        <div
          style={{
            height: 300,
            overflow: 'hidden',
            borderRadius: 8,
            backgroundColor: '#EEF3F1',
            backgroundImage: `url("${shot.src}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          role="img"
          aria-label={shot.label}
        />
      ) : (
        <div
          style={{
            height: 300,
            overflow: 'hidden',
            borderRadius: 8,
            background: '#EEF3F1',
            position: 'relative',
          }}
        >
          <PlaceholderTile label={shot.label} />
          <SlotRing />
        </div>
      )}
      <div style={{ margin: '10px 2px 0', fontSize: 15, color: '#5A6A66' }}>{shot.label}</div>
    </div>
  );
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function GroupSection({ group }: { group: FacilityGroup }) {
  return (
    <section id={group.id} style={{ background: group.bg, scrollMarginTop: 82 }}>
      <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '46px 26px 50px' }}>
        <div
          style={{
            background: group.bandBg,
            borderLeft: '6px solid #06A88C',
            borderRadius: 14,
            padding: '24px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 26,
            marginBottom: 34,
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontWeight: 600, fontSize: 27, margin: 0, color: '#12564C' }}>{group.title}</h2>
          <p style={{ margin: 0, fontSize: 18, color: '#4E5F5A', maxWidth: 560 }}>{group.blurb}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
          {group.items.map((f) => (
            <div
              key={f.slot}
              style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 46, alignItems: 'start' }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 14,
                    marginBottom: 10,
                  }}
                >
                  <h3 style={{ fontWeight: 600, fontSize: 24, margin: 0, color: '#1F3A34', lineHeight: 1.26 }}>
                    {f.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {f.paras.map((para, i) => (
                    <p key={i} style={{ margin: 0, fontSize: 18, lineHeight: 1.62, color: '#4E5F5A' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  paddingBottom: 4,
                  alignItems: 'flex-start',
                }}
              >
                {f.shots.map((s) => (
                  <ShotTile key={s.id} shot={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 34 }}>
          <button
            type="button"
            onClick={toTop}
            className={styles.toTop}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#ffffff',
              border: '1px solid #CBE6DF',
              color: '#0A5F52',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 16,
              padding: '10px 18px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'background 0.25s ease, border-color 0.25s ease',
            }}
          >
            <svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0A5F52"
              strokeWidth={2.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5.5M5.5 12 12 5.5 18.5 12" />
            </svg>
            Back to top
          </button>
        </div>
      </div>
    </section>
  );
}

export default function FacilitiesView({
  groupsTop,
  groupsBottom,
}: {
  groupsTop: FacilityGroup[];
  groupsBottom: FacilityGroup[];
}) {
  const [showJump, setShowJump] = useState(false);
  const [headerH, setHeaderH] = useState(101);
  const [barH, setBarH] = useState(96);
  const jumpBarRef = useRef<HTMLDivElement>(null);

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
      const show = window.scrollY > 420;
      setShowJump((prev) => (show !== prev ? show : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      ro?.disconnect();
    };
  }, []);

  const allGroups = [...groupsTop, ...groupsBottom];
  const jumps = allGroups.map((g) => ({ label: g.title, href: '#' + g.id }));
  const jumpBarTop = `${headerH}px`;
  const jumpBarTransform = showJump
    ? 'translateY(0)'
    : `translateY(-${headerH + barH + 12}px)`;
  const jumpBarEvents = showJump ? 'auto' : 'none';

  return (
    <div>
      {/* ===== STICKY JUMP + EMERGENCY BAR ===== */}
      <div
        ref={jumpBarRef}
        style={{
          position: 'fixed',
          top: jumpBarTop,
          left: 0,
          right: 0,
          zIndex: 55,
          boxShadow: '0 12px 30px -22px rgba(12,70,62,0.5)',
          transform: jumpBarTransform,
          transition: 'transform 0.28s ease',
          pointerEvents: jumpBarEvents as 'auto' | 'none',
        }}
      >
        <div style={{ background: '#FDF1F0', borderBottom: '1px solid #F6D8D5' }}>
          <div
            style={{
              maxWidth: MAX_W,
              margin: '0 auto',
              padding: '8px 26px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 15,
              color: '#8A3A33',
            }}
          >
            <svg
              width={17}
              height={17}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E1332A"
              strokeWidth={2.2}
              strokeLinecap="round"
            >
              <circle cx={12} cy={12} r={9.5} />
              <path d="M12 7.5v6M12 16.6v.4" />
            </svg>
            <span style={{ fontWeight: 700, color: '#9E2018' }}>In an emergency</span>
            <span>Go directly to the Casualty Ward — no appointment or queue.</span>
            <a
              href="tel:+912168260247"
              style={{ marginLeft: 'auto', fontWeight: 700, color: '#C42A21', whiteSpace: 'nowrap' }}
            >
              +91 21682 60247
            </a>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid #E6ECEA' }}>
          <div
            style={{
              maxWidth: MAX_W,
              margin: '0 auto',
              padding: '11px 26px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                flex: 'none',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#7A8C87',
              }}
            >
              Jump to a section
            </span>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {jumps.map((j) => (
                <a
                  key={j.href}
                  href={j.href}
                  className={styles.jumpLink}
                  style={{
                    flex: 'none',
                    border: '1px solid #D2E8E3',
                    color: '#1F3A34',
                    fontWeight: 500,
                    fontSize: 15,
                    padding: '7px 15px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {j.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: 'linear-gradient(122deg, #04A08A 0%, #0A9EA2 52%, #45B8CC 100%)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
          <img
            src="/images/facilities-hero.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 55%',
              display: 'block',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, rgba(3,96,84,0.92) 0%, rgba(4,104,94,0.82) 36%, rgba(10,140,140,0.45) 62%, rgba(43,178,196,0.12) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: MAX_W, margin: '0 auto', padding: '52px 26px 84px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 17,
              letterSpacing: '0.12em',
              fontWeight: 500,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.74)',
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ cursor: 'pointer' }}>Home</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Our facilities and Services</span>
          </div>
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
            Fourteen departments under one roof
          </div>
          <div style={{ maxWidth: 760 }}>
            <h1
              style={{
                fontWeight: 500,
                fontSize: 56,
                lineHeight: 1.16,
                margin: '0 0 20px',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Our Facilities <span style={{ fontWeight: 700 }}>and Services</span>
            </h1>
            <p style={{ fontSize: 21, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)', margin: 0 }}>
              Fourteen departments covering emergency care, surgery, diagnostics, maternity and inpatient wards all
              under one roof, and all provided free of charge.
            </p>
          </div>
        </div>
      </section>

      {/* ===== QUICK JUMP ROW ===== */}
      <section style={{ background: '#F4FAF8', borderBottom: '1px solid #E6EFEC' }}>
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span
              style={{
                flex: 'none',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#7A8C87',
              }}
            >
              Jump to a section
            </span>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {jumps.map((j) => (
                <a
                  key={j.href}
                  href={j.href}
                  className={styles.jumpLink}
                  style={{
                    flex: 'none',
                    background: '#ffffff',
                    border: '1px solid #D2E8E3',
                    color: '#1F3A34',
                    fontWeight: 500,
                    fontSize: 17,
                    padding: '11px 19px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {j.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEPARTMENT SECTIONS (first half) ===== */}
      {groupsTop.map((g) => (
        <GroupSection key={g.id} group={g} />
      ))}

      {/* ===== BREAKER: NOT SURE WHICH DEPARTMENT ===== */}
      <section style={{ background: 'linear-gradient(122deg, #0A8E7B 0%, #0C9497 55%, #38ADBE 100%)' }}>
        <div
          style={{
            maxWidth: MAX_W,
            margin: '0 auto',
            padding: '54px 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 34,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <h3 style={{ fontWeight: 600, fontSize: 27, margin: '0 0 10px', color: '#ffffff' }}>
              Not sure which department you need?
            </h3>
            <p style={{ margin: 0, fontSize: 18.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)' }}>
              Visit the OPD counter when you arrive. Our staff will direct you to the right department, explain any
              tests the doctor orders, and share details of government health care schemes you may be eligible for.
            </p>
          </div>
          <a
            href="tel:+912168260247"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#ffffff',
              color: '#0B6558',
              fontWeight: 700,
              fontSize: 17,
              padding: '15px 28px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
            }}
          >
            Call the hospital
          </a>
        </div>
      </section>

      {/* ===== DEPARTMENT SECTIONS (second half) ===== */}
      {groupsBottom.map((g) => (
        <GroupSection key={g.id} group={g} />
      ))}

      {/* ===== HELP BAND ===== */}
      <section style={{ background: '#EDF6F3' }}>
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '54px 26px 78px' }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #DCEBE7',
              borderRadius: 20,
              padding: '40px 44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 30,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 700 }}>
              <h3 style={{ fontWeight: 600, fontSize: 25, margin: '0 0 9px', color: '#1F3A34' }}>
                Every service here costs nothing
              </h3>
              <p style={{ margin: 0, fontSize: 18.5, lineHeight: 1.6, color: '#5A6A66' }}>
                Consultation, diagnostic tests, medication and hospital stay are provided free of charge for the rural
                community around Mahabaleshwar and for visitors to the region.
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
                fontSize: 17,
                padding: '15px 28px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
              }}
            >
              Call the hospital
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

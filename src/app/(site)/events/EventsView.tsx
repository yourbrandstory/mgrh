'use client';

import { useEffect, useMemo, useState } from 'react';
import { baseFilters, tagStyle, type EventItem } from './data';
import styles from './events.module.css';

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

export default function EventsView({ items }: { items: EventItem[] }) {
  const [filter, setFilter] = useState('All events');
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filters = useMemo(() => {
    const extra = items
      .map((e) => e.category)
      .filter((c) => !baseFilters.includes(c));
    return [...baseFilters, ...Array.from(new Set(extra))];
  }, [items]);

  const shown = filter === 'All events' ? items : items.filter((e) => e.category === filter);
  const activeEvent = items.find((e) => e.id === activeId) || null;

  const activeShots = activeEvent
    ? activeEvent.shots.map((label, n) => {
        const ratio = n === 0 ? '16/9' : ['3/2', '4/3', '3/2'][n % 3];
        return {
          id: `ev-${activeEvent.id}-${n + 1}`,
          label,
          url: activeEvent.photos?.[n] ?? null,
          ratio,
          span: n === 0 ? 'span 2' : 'auto',
        };
      })
    : [];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: 'linear-gradient(100deg, #10A08A 0%, #14A695 34%, #1BAAA8 66%, #2BB2C4 100%)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
          <img
            src="/images/events-hero-banner.jpg"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            right: -120,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 68%)',
            animation: 'mgBloom 18s ease-in-out infinite',
          }}
        />
        <div style={{ position: 'relative', zIndex: 4, maxWidth: 1800, margin: '0 auto', padding: '52px 26px 84px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 56,
              alignItems: 'end',
            }}
          >
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
                  borderRadius: 999,
                  marginBottom: 22,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#C7EDE6',
                    animation: 'mgPulse 2.6s ease-in-out infinite',
                  }}
                />
                Camps, drives and clinics
              </div>
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
                  marginBottom: 20,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ cursor: 'pointer' }}>Home</span>
                <span style={{ opacity: 0.5 }}>/</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Camps &amp; Events</span>
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
                Camps &amp; <span style={{ fontWeight: 700 }}>Events</span>
              </h1>
              <p
                style={{
                  fontSize: 24,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.92)',
                  margin: 0,
                  maxWidth: 820,
                }}
              >
                We regularly organises free health camps, awareness programmes, screening activities, and community events to
                bring healthcare services closer to people in Mahabaleshwar and the surrounding rural areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION HEAD ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '34px 26px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: '3px solid #E1332A',
            paddingBottom: 16,
          }}
        >
          <span style={{ width: 34, height: 20, borderRadius: 3, background: '#06A88C', flex: 'none' }} />
          <h2 style={{ fontWeight: 500, fontSize: 34, margin: 0, color: '#1F3A34' }}>
            Recent <span style={{ fontWeight: 700 }}>Events</span>
          </h2>
          <span style={{ marginLeft: 'auto', fontSize: 19, fontWeight: 600, color: '#7A8C87' }}>
            {items.length} events
          </span>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '22px 26px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {filters.map((label) => {
            const on = label === filter;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setFilter(label)}
                className={styles.filter}
                style={{
                  border: `1px solid ${on ? '#06A88C' : '#D2E8E3'}`,
                  background: on ? '#06A88C' : '#ffffff',
                  color: on ? '#ffffff' : '#1F3A34',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  fontSize: 19,
                  padding: '10px 17px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== EVENT CARDS ===== */}
      <section id="events" style={{ maxWidth: 1800, margin: '0 auto', padding: '28px 26px 20px', scrollMarginTop: 52 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 26,
            alignItems: 'start',
          }}
        >
          {shown.map((e, i) => {
            const t = tagStyle(e.category);
            const [day, month] = e.dateShort ? e.dateShort.split(' ') : ['', ''];
            const cover = e.coverImageUrl || e.photos?.[0] || null;
            return (
              <div
                key={e.id}
                onClick={() => setActiveId(e.id)}
                role="button"
                tabIndex={0}
                className={styles.card}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid #E6ECEA',
                  borderRadius: 16,
                  animation: `mgCardIn 0.6s cubic-bezier(0.22,0.85,0.28,1) both ${(i % 3) * 0.08}s`,
                  transition:
                    'opacity 0.6s ease 0s, transform 0.5s cubic-bezier(0.22,0.85,0.28,1), box-shadow 0.4s ease, border-color 0.4s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '4/3', background: '#EEF3F1', overflow: 'hidden' }}>
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <>
                      <PlaceholderTile label={e.title} />
                      <SlotRing />
                    </>
                  )}
                  {e.dateShort ? (
                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: 14,
                        zIndex: 2,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 10,
                        padding: '8px 11px 9px',
                        textAlign: 'center',
                        minWidth: 54,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1, color: '#12564C' }}>{day}</div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14.5,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#E1332A',
                          marginTop: 3,
                        }}
                      >
                        {month}
                      </div>
                    </div>
                  ) : null}
                  <div
                    style={{
                      position: 'absolute',
                      right: 14,
                      bottom: 14,
                      zIndex: 2,
                      background: 'rgba(9,45,40,0.72)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: 16,
                      padding: '6px 11px',
                      borderRadius: 999,
                    }}
                  >
                    {e.shots.length} photos
                  </div>
                </div>
                <div style={{ padding: '18px 22px 22px' }}>
                  <div
                    style={{
                      fontSize: 15.5,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: t.tagColor,
                      marginBottom: 7,
                    }}
                  >
                    {e.category}
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: 23, lineHeight: 1.28, margin: '0 0 6px', color: '#12564C' }}>
                    {e.title}
                  </h3>
                  <div style={{ fontSize: 17.5, color: '#6A7A76' }}>{e.venue}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== GALLERY OVERLAY ===== */}
      {activeEvent ? (
        <div
          onClick={() => setActiveId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(9,45,40,0.62)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '48px 32px',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 1040,
              background: '#ffffff',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 40px 90px -30px rgba(6,50,44,0.6)',
              animation: 'mgFadeUp 0.34s cubic-bezier(0.22,0.85,0.28,1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 24,
                padding: '26px 30px 22px',
                borderBottom: '1px solid #EEF3F1',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: tagStyle(activeEvent.category).tagBg,
                      color: tagStyle(activeEvent.category).tagColor,
                      fontWeight: 600,
                      fontSize: 16,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '6px 11px',
                      borderRadius: 999,
                    }}
                  >
                    {activeEvent.category}
                  </span>
                  <span style={{ fontSize: 18.5, fontWeight: 600, color: '#12564C' }}>{activeEvent.dateLong}</span>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 30, lineHeight: 1.24, margin: '0 0 8px', color: '#1F3A34' }}>
                  {activeEvent.title}
                </h3>
                <p style={{ margin: 0, fontSize: 20.5, lineHeight: 1.6, color: '#4E5F5A', maxWidth: 660 }}>
                  {activeEvent.summary}
                </p>
                <div style={{ marginTop: 10, fontSize: 18.5, color: '#6A7A76' }}>{activeEvent.venue}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                aria-label="Close gallery"
                className={styles.galleryClose}
                style={{
                  flex: 'none',
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid #E6ECEA',
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
            <div style={{ padding: '26px 30px 32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {activeShots.map((s) => (
                  <div key={s.id} style={{ gridColumn: s.span }}>
                    <div style={{ aspectRatio: s.ratio, overflow: 'hidden', borderRadius: 10, background: '#EEF3F1', position: 'relative' }}>
                      {s.url ? (
                        <img
                          src={s.url}
                          alt=""
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <>
                          <PlaceholderTile label={s.label} />
                          <SlotRing />
                        </>
                      )}
                    </div>
                    <div style={{ margin: '8px 2px 0', fontSize: 17, color: '#5A6A66' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===== HELP BAND ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '46px 26px 70px' }}>
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
            <h3 style={{ fontWeight: 600, fontSize: 25, margin: '0 0 8px', color: '#1F3A34' }}>Hosting or joining a camp?</h3>
            <p style={{ margin: 0, fontSize: 20.5, lineHeight: 1.6, color: '#5A6A66' }}>
              Schools, colleges and local groups can arrange a camp with the hospital. Call for upcoming dates and to register as
              a blood donor.
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
              fontSize: 22,
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

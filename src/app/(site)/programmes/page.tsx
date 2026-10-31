'use client';

import { useState } from 'react';
import { introFacts, programmeGroups, programmeItems } from './data';
import styles from './programmes.module.css';

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

export default function ProgrammesPage() {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className={styles.page}>
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
            src="/images/programmes-hero-clinic.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '78% 30%', display: 'block' }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background:
              'linear-gradient(90deg, rgba(3,96,84,0.86) 0%, rgba(4,110,100,0.7) 36%, rgba(10,140,140,0.2) 56%, rgba(69,184,204,0) 70%)',
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

        <div className={styles.heroInner} style={{ position: 'relative', zIndex: 4, maxWidth: 1800, margin: '0 auto', padding: '52px var(--page-pad) 84px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 15,
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
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Programmes</span>
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
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '7px 15px',
                borderRadius: 999,
                marginBottom: 22,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C7EDE6' }} />
              Twelve programmes, free of charge
            </div>
            <h1
              style={{
                fontWeight: 500,
                fontSize: 62,
                lineHeight: 1.02,
                margin: '0 0 20px',
                color: '#ffffff',
                letterSpacing: '-0.025em',
              }}
            >
              Our <span style={{ fontWeight: 700 }}>Programmes</span>
            </h1>
            <p style={{ fontSize: 22, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)', margin: 0, maxWidth: 560 }}>
              Preventive and continuing care for the rural community around Mahabaleshwar, delivered from one campus.
            </p>
          </div>
        </div>
      </section>

      {/* ===== COUNT STRIP ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '34px var(--page-pad) 0' }}>
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
          <h2 style={{ fontWeight: 500, fontSize: 32, margin: 0, color: '#1F3A34' }}>
            Programmes and <span style={{ fontWeight: 700 }}>community service</span>
          </h2>
          <span style={{ marginLeft: 'auto', fontSize: 17, fontWeight: 600, color: '#7A8C87' }}>
            {programmeItems.length} programmes
          </span>
        </div>
      </section>

      {/* ===== INTRODUCTION ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '30px var(--page-pad) 4px' }}>
        <div
          className={styles.introGrid}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.7fr)',
            gap: 56,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.62, color: '#23423B' }}>
              Alongside the hospital’s day-to-day services, twelve ongoing programmes extend healthcare beyond the hospital and into
              schools, village centres, community halls, and surrounding villages across Mahabaleshwar.
            </p>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.62, color: '#4E5F5A' }}>
              Some of these are national health programmes implemented locally, including tuberculosis, leprosy, family planning,
              immunisation, and non-communicable disease control. Others are hospital-led clinics and health camps for mothers,
              children, school students, and blood donors.
            </p>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.62, color: '#4E5F5A' }}>
              Select any programme below to learn more about the services it provides. All consultations, diagnostic tests,
              medicines, and hospitalisation related to these programmes are provided free of charge.
            </p>
          </div>
          <div
            style={{
              background: '#F1F8F6',
              borderRadius: 16,
              padding: '26px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {introFacts.map((f) => (
              <div key={f.label}>
                <div style={{ fontWeight: 700, fontSize: 27, lineHeight: 1, color: '#0A5F52' }}>{f.value}</div>
                <div style={{ fontSize: 17, lineHeight: 1.5, color: '#4E5F5A', marginTop: 6 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROGRAMME CARDS ===== */}
      <section id="programmes" style={{ maxWidth: 1800, margin: '0 auto', padding: '34px var(--page-pad) 20px', scrollMarginTop: 52 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 46 }}>
          {programmeGroups.map((g) => {
            const rows = g.names
              .map((name) => programmeItems.findIndex((it) => it.name === name))
              .filter((i) => i >= 0)
              .map((i) => ({ index: i, item: programmeItems[i] }));

            return (
              <div
                key={g.title}
                id={`grp-${g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                style={{
                  scrollMarginTop: 72,
                  background: '#ffffff',
                  border: '1px solid #E0EDE9',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 28px 56px -46px rgba(6,80,68,0.45)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(440px, 100%), 1fr))',
                    alignItems: 'stretch',
                  }}
                >
                  <div className={styles.groupBody} style={{ padding: '40px 44px 42px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <span style={{ width: 34, height: 5, borderRadius: 3, background: g.accent, flex: 'none' }} />
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#7A8C87',
                        }}
                      >
                        {rows.length} programmes
                      </span>
                    </div>
                    <h2
                      style={{
                        fontWeight: 600,
                        fontSize: 32,
                        lineHeight: 1.16,
                        letterSpacing: '-0.02em',
                        margin: '0 0 14px',
                        color: '#0B4F45',
                      }}
                    >
                      {g.title}
                    </h2>
                    <p style={{ margin: '0 0 28px', fontSize: 20, lineHeight: 1.6, color: '#4E5F5A', maxWidth: 640 }}>
                      {g.desc}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {rows.map(({ index, item }) => {
                        const isOpen = Boolean(open[index]);
                        return (
                          <div
                            key={item.name}
                            style={{
                              border: `1px solid ${isOpen ? '#A8D6CC' : '#E0EDE9'}`,
                              background: isOpen ? '#F4FAF8' : '#ffffff',
                              borderRadius: 12,
                              overflow: 'hidden',
                              transition: 'border-color 0.3s ease, background 0.3s ease',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setOpen((prev) => (prev[index] ? {} : { [index]: true }))}
                              aria-expanded={isOpen ? 'true' : 'false'}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: '15px 18px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                              }}
                            >
                              <span style={{ flex: 'none', width: 10, height: 10, borderRadius: '50%', background: g.accent }} />
                              <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 19.5, lineHeight: 1.3, color: '#12564C' }}>
                                {item.name}
                              </span>
                              <svg
                                width={20}
                                height={20}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#0A8E7B"
                                strokeWidth={2.2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                  flex: 'none',
                                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.35s cubic-bezier(0.22,0.85,0.28,1)',
                                }}
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                            <div
                              style={{
                                overflow: 'hidden',
                                maxHeight: isOpen ? '220px' : '0px',
                                opacity: isOpen ? 1 : 0,
                                transition:
                                  'max-height 0.42s cubic-bezier(0.22,0.85,0.28,1), opacity 0.3s ease',
                              }}
                            >
                              <p className={styles.accText} style={{ margin: 0, padding: '0 18px 18px 42px', fontSize: 18, lineHeight: 1.6, color: '#4E5F5A' }}>
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className={styles.groupImage} style={{ position: 'relative', minHeight: 420, background: '#EEF3F1' }}>
                    <PlaceholderTile label={g.title} />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        border: '1.5px dashed currentColor',
                        opacity: 0.35,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== COMMUNITY BAND ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '46px var(--page-pad) 0' }}>
        <div
          className={styles.communityGrid}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 520px)',
            gap: 56,
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 28, margin: '0 0 12px', color: '#1F3A34', lineHeight: 1.24 }}>
              Reaching the town, not only the ward
            </h3>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.62, color: '#4E5F5A', maxWidth: 560 }}>
              School clinics, immunisation drives, screening camps and blood donation camps take the hospital out into Mahabaleshwar
              and the villages around it every service free of charge
            </p>
          </div>
          <div className={styles.communityImage}>
            <div
              style={{
                borderTop: '4px solid #E1332A',
                overflow: 'hidden',
                background: '#EEF3F1',
                aspectRatio: '4 / 5',
              }}
            >
              <img
                src="/images/programmes-town-v2.png"
                alt="Mahabaleshwar town from above, with the hospital's forested campus alongside"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 45%', display: 'block' }}
              />
            </div>
            <div style={{ margin: '9px 2px 0', fontSize: 15, color: '#5A6A66' }}>Mahabaleshwar town, served by the hospital</div>
          </div>
        </div>
      </section>

      {/* ===== HELP BAND ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '46px var(--page-pad) 70px' }}>
        <div
          className={styles.helpBand}
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
            <h3 style={{ fontWeight: 600, fontSize: 25, margin: '0 0 8px', color: '#1F3A34' }}>Want to join a camp or clinic?</h3>
            <p style={{ margin: 0, fontSize: 18.5, lineHeight: 1.6, color: '#5A6A66' }}>
              Call the hospital for clinic days, camp dates and referral guidance. Consultations, tests and medication are provided
              free of charge.
            </p>
          </div>
          <a
            href="tel:+912168260247"
            className={styles.helpBtn}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#06A88C',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
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

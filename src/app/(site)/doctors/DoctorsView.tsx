'use client';

import { useState } from 'react';
import type { DoctorItem, SupportRow } from './data';
import styles from './doctors.module.css';

export default function DoctorsView({
  doctors,
  filters,
  support,
}: {
  doctors: DoctorItem[];
  filters: string[];
  support: SupportRow[];
}) {
  const [filter, setFilter] = useState('All doctors');

  const shown = filter === 'All doctors' ? doctors : doctors.filter((d) => d.speciality === filter);

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
            src="/images/doctors-hero.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', display: 'block' }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background:
              'linear-gradient(90deg, rgba(3,96,84,0.93) 0%, rgba(4,110,100,0.82) 38%, rgba(10,140,140,0.38) 68%, rgba(69,184,204,0.08) 100%)',
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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))',
              gap: 56,
              alignItems: 'end',
            }}
          >
            <div style={{ maxWidth: 700 }}>
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
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Doctors</span>
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
                  borderRadius: 999,
                  marginBottom: 20,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C7EDE6' }} />
                Run by professionals
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
                Our <span style={{ fontWeight: 700 }}>Medical Team</span>
              </h1>
              <p style={{ fontSize: 24, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)', margin: 0, maxWidth: 780 }}>
                Meet our resident medical officers and visiting specialists providing clinical care across the hospital's
                departments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTRODUCTION ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '46px var(--page-pad) 6px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
          <p style={{ margin: 0, fontSize: 24, lineHeight: 1.62, color: '#23423B' }}>
            The hospital is staffed by Resident Medical Officers (RMOs) and specialists, including MD Medicine, Gynaecology.
            Visiting specialists also conduct clinics on designated days of the week. Nursing and paramedical staff provide
            round-the-clock care and support in the wards, casualty, and operating theatres.
          </p>
          <p style={{ margin: 0, fontSize: 22, lineHeight: 1.62, color: '#4E5F5A' }}>
            You do not need to request a specific doctor. Simply register at the OPD counter, and our staff will guide you to the
            doctor on duty based on your medical needs. If required, you will be referred to the appropriate specialist clinic.
            Consultation with all doctors listed here is provided free of charge. Diagnostic tests, medicines, and hospitalisation,
            when required, are also provided free of charge.
          </p>
        </div>
      </section>

      {/* ===== SECTION HEAD ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '40px var(--page-pad) 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: '1px solid #E6ECEA',
            paddingBottom: 16,
          }}
        >
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#06A88C', flex: 'none' }} />
          <h2 style={{ fontWeight: 500, fontSize: 34, margin: 0, color: '#1F3A34' }}>
            Our Medical <span style={{ fontWeight: 700 }}>Team</span>
          </h2>
          <span style={{ marginLeft: 'auto', fontSize: 19, fontWeight: 600, color: '#7A8C87' }}>
            {doctors.length} doctors
          </span>
        </div>
        <p style={{ margin: '18px 0 0', fontSize: 21, lineHeight: 1.6, color: '#4E5F5A', maxWidth: 900 }}>
          Meet our resident medical officers and visiting specialists providing clinical care across the hospital's departments.
        </p>
      </section>

      {/* ===== FILTERS ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '22px var(--page-pad) 0' }}>
        <div className={styles.filterRow} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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

      {/* ===== DOCTOR CARDS ===== */}
      <section id="team" style={{ maxWidth: 1800, margin: '0 auto', padding: '28px var(--page-pad) 20px', scrollMarginTop: 52 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(400px, 100%), 1fr))',
            gap: 26,
            alignItems: 'start',
          }}
        >
          {shown.map((d) => (
            <div
              key={`${d.name}-${d.role}`}
              className={styles.card}
              style={{
                background: '#ffffff',
                border: '1px solid #E6ECEA',
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', padding: '26px 28px 28px' }}>
                {d.imageUrl ? (
                  <img
                    src={d.imageUrl}
                    alt={d.imageAlt || d.name}
                    style={{
                      width: 112,
                      height: 112,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      marginBottom: 18,
                      border: '1px solid #E6ECEA',
                    }}
                  />
                ) : null}
                <div>
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: 24,
                      lineHeight: 1.26,
                      margin: '0 0 6px',
                      color: '#12564C',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {d.name}
                  </h3>
                  <div style={{ fontSize: 19, fontWeight: 600, color: '#0A5F52' }}>{d.role}</div>
                  <div style={{ fontSize: 17.5, color: '#7A8C87', marginTop: 3 }}>{d.qualification}</div>
                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 15,
                      borderTop: '1px solid #F1F5F3',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      fontSize: 18,
                      color: '#5A6A66',
                    }}
                  >
                    <span>{d.hours}</span>
                    <span>{d.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SUPPORT TEAM ===== */}
      <section style={{ background: '#F7FBFA', borderTop: '1px solid #E6EFEC', marginTop: 44 }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '46px var(--page-pad) 50px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              borderBottom: '1px solid #DCEBE7',
              paddingBottom: 16,
              marginBottom: 30,
            }}
          >
            <span style={{ width: 30, height: 4, borderRadius: 2, background: '#45B8CC', flex: 'none' }} />
            <h2 style={{ fontWeight: 500, fontSize: 34, margin: 0, color: '#1F3A34' }}>
              Nursing &amp; <span style={{ fontWeight: 700 }}>Support Staff</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1100 }}>
            {support.map((s, i) => (
              <div
                key={`${s.title}-${i}`}
                className={styles.supportRow}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px minmax(0, 280px) 1fr',
                  gap: 26,
                  alignItems: 'baseline',
                  padding: '20px 0',
                  borderBottom: '1px solid #E1EEEA',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 24, color: '#0A5F52' }}>{s.count}</div>
                <h3 style={{ fontWeight: 600, fontSize: 21, margin: 0, color: '#12564C' }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 19, lineHeight: 1.56, color: '#4E5F5A' }}>{s.desc}</p>
              </div>
            ))}
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
          <div style={{ maxWidth: 700 }}>
            <h3 style={{ fontWeight: 600, fontSize: 27, margin: '0 0 8px', color: '#1F3A34' }}>Which doctor should you see?</h3>
            <p style={{ margin: 0, fontSize: 20.5, lineHeight: 1.6, color: '#5A6A66' }}>
              Register at the OPD counter and staff will direct you to the doctor on duty, or tell you which day the specialist
              clinic you need is held.
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
              fontSize: 19,
              padding: '15px 28px',
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

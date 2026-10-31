'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './emergency.module.css';
import { contacts, steps, routes, faqs } from './data';

const MAX_W = 1800;

function RouteIcon({ paths }: { paths: string[] }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#0A5F52" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export default function EmergencyPage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [barOpen, setBarOpen] = useState(true);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const dismissed = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopupOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const timer = setTimeout(() => {
      if (!dismissed.current) setPopupOpen(true);
    }, 3500);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timer);
    };
  }, []);

  const closePopup = () => {
    dismissed.current = true;
    setPopupOpen(false);
  };

  const toggleFaq = (i: number) => setOpen((s) => ({ ...s, [i]: !s[i] }));

  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#2DB6B0' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src="/images/emergency-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', display: 'block' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(12,140,122,0.92) 0%, rgba(16,150,136,0.8) 40%, rgba(27,160,160,0.36) 70%, rgba(43,178,196,0.08) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: MAX_W, margin: '0 auto', padding: '52px 26px 78px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 17, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 20, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link><span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>Emergency</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 11, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)', color: '#EAF7F4', fontSize: 17, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 15px', borderRadius: 999, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff', animation: 'mgBlink 1.4s ease-in-out infinite' }} />
            Open every hour of the year
          </div>
          <h1 style={{ fontWeight: 500, fontSize: 66, lineHeight: 1.0, margin: '0 0 22px', color: '#ffffff', letterSpacing: '-0.032em' }}>
            If it is an emergency,<br /><span style={{ fontWeight: 700 }}>just come.</span>
          </h1>
          <p style={{ fontSize: 23, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', margin: '0 0 34px', maxWidth: 820 }}>
            24×7 emergency and casualty care for urgent medical needs. No appointment is required.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            <a href="tel:+912168260247" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#ffffff', color: '#B4251E', fontWeight: 700, fontSize: 24, padding: '18px 34px', borderRadius: 999, animation: 'mgRing 2.4s ease-out infinite' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B4251E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" /></svg>
              +91 21682 60247
            </a>
            <a href="#directions" style={{ display: 'inline-flex', alignItems: 'center', gap: 11, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.44)', color: '#ffffff', fontWeight: 700, fontSize: 20, padding: '18px 32px', borderRadius: 999 }}>
              Directions to the hospital
            </a>
          </div>
        </div>
      </section>

      {/* IMPORTANT CONTACTS */}
      <section id="contacts" style={{ maxWidth: MAX_W, margin: '0 auto', padding: '56px 26px 0', scrollMarginTop: 60 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 14, marginBottom: 30 }}>
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#E1332A', flex: 'none' }} />
          <h2 style={{ fontWeight: 600, fontSize: 31, margin: 0, color: '#1F3A34' }}>Important contacts</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 22 }}>
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className={styles.contactCard}
              style={{ display: 'block', background: c.bg, border: `1px solid ${c.border}`, borderLeft: `6px solid ${c.accent}`, borderRadius: 14, padding: '28px 30px 30px', color: '#16413A', transition: 'box-shadow 0.3s ease, transform 0.3s ease' }}
            >
              <div style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.labelColor, marginBottom: 10 }}>{c.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 28, lineHeight: 1.16, color: c.valueColor, letterSpacing: '-0.01em', marginBottom: 10 }}>
                {c.phone && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#E1332A" style={{ flex: 'none' }}><path d="M6.6 2.2c.5-.1 1 .2 1.1.7l1.1 4.6c.1.4-.1.9-.5 1.1L6.4 9.8a13.5 13.5 0 0 0 7.8 7.8l1.2-1.9c.2-.4.7-.6 1.1-.5l4.6 1.1c.5.1.8.6.7 1.1-.5 2.6-2.8 4.4-5.4 4.3C9.1 21.3 2.7 14.9 2.3 7.6 2.2 5 4 2.7 6.6 2.2Z" /></svg>
                )}
                <span>{c.value}</span>
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.5, color: '#4E5F5A' }}>{c.note}</div>
            </a>
          ))}
        </div>
      </section>

      {/* WHEN SHOULD I COME */}
      <section style={{ maxWidth: MAX_W, margin: '0 auto', padding: '56px 26px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 14, marginBottom: 30 }}>
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#E1332A', flex: 'none' }} />
          <h2 style={{ fontWeight: 600, fontSize: 31, margin: 0, color: '#1F3A34' }}>When should I come?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 0, borderRadius: 18, overflow: 'hidden', border: '1px solid #F6D8D5' }}>
          <div style={{ background: '#FDF1F0', borderLeft: '6px solid #E1332A', padding: '44px 46px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E2018' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E1332A', animation: 'mgBlink 1.4s ease-in-out infinite' }} />
              Casualty open 24 hours
            </span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 38, lineHeight: 1.14, letterSpacing: '-0.024em', color: '#9E2018' }}>Do not wait. Come straight to the Emergency Department.</p>
          </div>
          <div style={{ background: '#ffffff', padding: '44px 46px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>
            <p style={{ margin: 0, fontSize: 21, lineHeight: 1.62, color: '#45605A' }}>If you or someone with you has a serious or sudden medical problem, come to the hospital for urgent attention. The casualty ward is staffed day and night.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <a href="tel:+912168260247" className={styles.redButton} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#E1332A', color: '#ffffff', fontWeight: 700, fontSize: 19, padding: '15px 28px', borderRadius: 999 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M6.6 2.2c.5-.1 1 .2 1.1.7l1.1 4.6c.1.4-.1.9-.5 1.1L6.4 9.8a13.5 13.5 0 0 0 7.8 7.8l1.2-1.9c.2-.4.7-.6 1.1-.5l4.6 1.1c.5.1.8.6.7 1.1-.5 2.6-2.8 4.4-5.4 4.3C9.1 21.3 2.7 14.9 2.3 7.6 2.2 5 4 2.7 6.6 2.2Z" /></svg>
                +91 21682 60247
              </a>
              <a href="#directions" className={styles.outlineButton} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid #E9B3AF', color: '#B4251E', fontWeight: 700, fontSize: 19, padding: '15px 28px', borderRadius: 999 }}>
                Get directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT HAPPENS */}
      <section style={{ maxWidth: MAX_W, margin: '0 auto', padding: '56px 26px 0' }}>
        <div style={{ background: '#FDF1F0', border: '1px solid #F6D8D5', borderRadius: 18, padding: '40px 44px' }}>
          <h3 style={{ fontWeight: 700, fontSize: 27, margin: '0 0 10px', color: '#9E2018' }}>When you arrive</h3>
          <p style={{ margin: '0 0 30px', fontSize: 20, lineHeight: 1.6, color: '#7C4741', maxWidth: 900 }}>Bring the patient straight to the casualty entrance. Registration happens after the patient is seen, not before.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 16, alignItems: 'start' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E1332A', color: '#ffffff', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 20, color: '#9E2018', marginBottom: 5 }}>{s.title}</div>
                  <div style={{ fontSize: 18, lineHeight: 1.5, color: '#7C4741' }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIRECTIONS */}
      <section id="directions" style={{ maxWidth: MAX_W, margin: '0 auto', padding: '60px 26px 0', scrollMarginTop: 60 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 14, marginBottom: 30 }}>
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#E1332A', flex: 'none' }} />
          <h2 style={{ fontWeight: 600, fontSize: 31, margin: 0, color: '#1F3A34' }}>Getting to the hospital</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 52, alignItems: 'start' }}>
          <div>
            <p style={{ margin: '0 0 26px', fontSize: 21, lineHeight: 1.6, color: '#45605A' }}>Morarji Gokuldas Rural Hospital sits on Mahabaleshwar - Medha Road, set back among the trees, a short drive from the town centre.</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {routes.map((r) => (
                <div key={r.title} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 18, alignItems: 'start', padding: '20px 0', borderBottom: '1px solid #F1F5F3' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: '#E1F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RouteIcon paths={r.icon} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 20, color: '#12564C', marginBottom: 5 }}>{r.title}</div>
                    <div style={{ fontSize: '18.5px', lineHeight: 1.55, color: '#4E5F5A' }}>{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26, fontSize: 20, lineHeight: 1.6, color: '#23423B' }}>
              Morarji Gokuldas Rural Hospital, Mahabaleshwar - Medha Road<br />
              District - Satara – 412 806, Maharashtra.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 26 }}>
              <a href="https://www.openstreetmap.org/?mlat=17.9247&mlon=73.6577#map=15/17.9247/73.6577" className={styles.tealButton} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0A8E7B', color: '#ffffff', fontWeight: 700, fontSize: 19, padding: '15px 28px', borderRadius: 999 }}>
                Open in maps
              </a>
              <a href="https://wa.me/912168260247" className={styles.waButton} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1FA855', color: '#ffffff', fontWeight: 700, fontSize: 19, padding: '15px 28px', borderRadius: 999 }}>
                WhatsApp us
              </a>
            </div>
          </div>
          <div>
            <div style={{ borderTop: '4px solid #E1332A', overflow: 'hidden', background: '#EEF3F1', aspectRatio: '16/10', maxWidth: 700 }}>
              <iframe
                src="https://www.google.com/maps?q=Morarji+Gokuldas+Rural+Hospital,+Medha+Road,+Mahabaleshwar&z=15&output=embed"
                title="Map showing Morarji Gokuldas Rural Hospital, Mahabaleshwar"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
              />
            </div>
            <div style={{ margin: '11px 2px 0', fontSize: 17, color: '#5A6A66', maxWidth: 700 }}>Morarji Gokuldas Rural Hospital, Mahabaleshwar - Medha Road — drag or zoom the map, or open it in Google Maps.</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ maxWidth: MAX_W, margin: '0 auto', padding: '60px 26px 90px', scrollMarginTop: 60 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 14, marginBottom: 8 }}>
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#E1332A', flex: 'none' }} />
          <h2 style={{ fontWeight: 600, fontSize: 31, margin: 0, color: '#1F3A34' }}>Frequently asked</h2>
        </div>
        <div style={{ maxWidth: 1100 }}>
          {faqs.map((f, i) => {
            const isOpen = !!open[i];
            return (
              <div key={f.q} style={{ borderBottom: '1px solid #EEF3F1' }}>
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '24px 4px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  <span style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.35, color: '#12564C' }}>{f.q}</span>
                  <span style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: '#FDF1F0', color: '#E1332A', fontWeight: 700, fontSize: 22, lineHeight: '33px', textAlign: 'center', transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.3,1.4,0.5,1)' }}>+</span>
                </button>
                <div style={{ overflow: 'hidden', maxHeight: isOpen ? '220px' : '0px', opacity: isOpen ? 1 : 0, transition: 'max-height 0.42s cubic-bezier(0.22,0.85,0.28,1), opacity 0.3s ease' }}>
                  <p style={{ margin: '0 4px 24px', fontSize: 20, lineHeight: 1.6, color: '#4E5F5A', maxWidth: 900 }}>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STICKY CALL BAR */}
      {barOpen && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100, background: '#E1332A', color: '#ffffff', boxShadow: '0 -14px 40px -20px rgba(90,16,12,0.7)', animation: 'mgSlideUp 0.5s cubic-bezier(0.2,0.85,0.3,1)' }}>
          <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '16px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 13, fontWeight: 600, fontSize: '19.5px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgb(255, 255, 255)', animation: '1.4s ease-in-out 0s infinite normal none running mgBlink' }} />
              Casualty is open right now — walk in, or call ahead so the team is ready
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="tel:+912168260247" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ffffff', color: '#B4251E', fontWeight: 700, fontSize: 19, padding: '12px 24px', borderRadius: 999 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#B4251E"><path d="M6.6 2.2c.5-.1 1 .2 1.1.7l1.1 4.6c.1.4-.1.9-.5 1.1L6.4 9.8a13.5 13.5 0 0 0 7.8 7.8l1.2-1.9c.2-.4.7-.6 1.1-.5l4.6 1.1c.5.1.8.6.7 1.1-.5 2.6-2.8 4.4-5.4 4.3C9.1 21.3 2.7 14.9 2.3 7.6 2.2 5 4 2.7 6.6 2.2Z" /></svg>
                +91 21682 60247
              </a>
              <button
                type="button"
                onClick={() => setBarOpen(false)}
                aria-label="Dismiss"
                className={styles.ghostButton}
                style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.44)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </span>
          </div>
        </div>
      )}

      {/* ARRIVAL POPUP */}
      {popupOpen && (
        <div
          onClick={closePopup}
          style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(60,12,9,0.58)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 26px', animation: 'mgFade 0.24s ease' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 700, background: '#ffffff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 46px 90px -34px rgba(90,16,12,0.6)', animation: 'mgPopIn 0.34s cubic-bezier(0.2,0.85,0.3,1)' }}
          >
            <div style={{ background: '#E1332A', padding: '26px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'mgRing 2.2s ease-out infinite' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 7v6.4M12 16.6v.4" /></svg>
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 25, color: '#ffffff', lineHeight: 1.15 }}>Need help right now?</div>
                  <div style={{ fontSize: '16.5px', color: 'rgba(255,255,255,0.9)', marginTop: 3 }}>Casualty is open and staffed</div>
                </div>
              </div>
              <button
                type="button"
                onClick={closePopup}
                aria-label="Close"
                className={styles.ghostButton}
                style={{ flex: 'none', width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div style={{ padding: '30px 32px 34px' }}>
              <a href="tel:+912168260247" className={styles.callCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, background: '#FDF1F0', border: '1px solid #F6D8D5', borderRadius: 14, padding: '22px 26px', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E2018', marginBottom: 6 }}>Call the hospital</div>
                  <div style={{ fontWeight: 700, fontSize: 30, color: '#C42A21', letterSpacing: '-0.01em' }}>+91 21682 60247</div>
                </div>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E1332A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" /></svg>
              </a>
              <p style={{ margin: '0 0 22px', fontSize: 19, lineHeight: 1.6, color: '#45605A' }}>Calling ahead lets the duty team prepare, but it is never a requirement. If the patient is critical, start moving and call from the road.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <a href="#directions" onClick={closePopup} className={styles.tealButton} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0A8E7B', color: '#ffffff', fontWeight: 700, fontSize: 18, padding: '14px 26px', borderRadius: 999 }}>
                  Directions
                </a>
                <a href="https://wa.me/912168260247" className={styles.waButton} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1FA855', color: '#ffffff', fontWeight: 700, fontSize: 18, padding: '14px 26px', borderRadius: 999 }}>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

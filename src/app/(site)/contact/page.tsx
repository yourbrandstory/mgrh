'use client';

import { useEffect, useState } from 'react';
import { contactDetails, contactHours, emergencyPoints, type ContactDetailIcon } from './data';
import styles from './contact.module.css';

function DetailIcon({ kind }: { kind: ContactDetailIcon }) {
  const common = {
    width: 25,
    height: 25,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#0A5F52',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (kind === 'location') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
        <path d="M12 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" />
      </svg>
    );
  }
  if (kind === 'phone') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }
  if (kind === 'mail') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 5.5h18v13H3z" />
        <path d="M3.5 6.5 12 13l8.5-6.5" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M3.2 12h17.6" />
      <path d="M12 3a14 14 0 0 1 0 18A14 14 0 0 1 12 3Z" />
    </svg>
  );
}

export default function ContactPage() {
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [aerialOpen, setAerialOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEmergencyOpen(false);
        setAerialOpen(false);
      }
    };
    const onOpenEmergency = () => setEmergencyOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mgrh:open-emergency', onOpenEmergency);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mgrh:open-emergency', onOpenEmergency);
    };
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, #10A08A 0%, #14A695 34%, #1BAAA8 66%, #2BB2C4 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: '#48A8A2' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '52%', overflow: 'hidden' }}>
          <img src="/images/contact-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 52%', display: 'block' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,96,84,0.92) 0%, rgba(4,110,100,0.8) 40%, rgba(40,150,144,0.25) 62%, rgba(72,168,162,0) 78%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1800, margin: '0 auto', padding: '52px 26px 76px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 400px)', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 17, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(255,255,255,0.74)', marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ cursor: 'pointer' }}>Home</span><span style={{ opacity: 0.5 }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Contact Us</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', color: '#EAF7F4', fontSize: 17, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 15px', borderRadius: 999, marginBottom: 22 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C7EDE6' }} />
              Open everyday of the year
            </div>
            <h1 style={{ fontWeight: 500, fontSize: 62, lineHeight: 1.02, margin: '0 0 20px', color: '#FFFFFF', letterSpacing: '-0.03em' }}>Contact <span style={{ fontWeight: 700 }}>Us</span></h1>
            <p style={{ fontSize: 23, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', margin: 0, maxWidth: 780 }}>Have a question, need information about our services, or need help reaching the hospital?</p>
          </div>
          <div />
        </div>
      </section>

      {/* ===== CONTACT DETAILS + PHOTO ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '56px 26px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 56, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 14, marginBottom: 30 }}>
              <span style={{ width: 30, height: 4, borderRadius: 2, background: '#06A88C', flex: 'none' }} />
              <h2 style={{ fontWeight: 600, fontSize: 31, margin: 0, color: '#1F3A34' }}>Reach the hospital</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {contactDetails.map((d) => (
                <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 20, alignItems: 'start', padding: '22px 0', borderBottom: '1px solid #F1F5F3' }}>
                  <div style={{ width: 54, height: 54, borderRadius: 12, background: '#E1F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DetailIcon kind={d.icon} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0B7F73', marginBottom: 7 }}>{d.label}</div>
                    <div style={{ fontSize: 21, lineHeight: 1.55, color: '#23423B' }}>{d.value}</div>
                    {d.hasExtra && <div style={{ fontSize: 21, lineHeight: 1.55, color: '#23423B' }}>{d.extra}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 32 }}>
              <a
                href="https://wa.me/912168260247"
                className={styles.whatsappButton}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 11, background: '#1FA855', color: '#FFFFFF', fontWeight: 700, fontSize: 20, padding: '16px 30px', borderRadius: 999, textDecoration: 'none' }}
              >
                <svg width={21} height={21} viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9c1.6.6 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" />
                </svg>
                WhatsApp us
              </a>
              <a
                href="mailto:info@mgrh-mahabaleshwar.org"
                className={styles.emailButton}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 11, border: '1px solid #9FD0C7', color: '#0B5F55', fontWeight: 700, fontSize: 20, padding: '16px 30px', borderRadius: 999, textDecoration: 'none' }}
              >
                Send an email
              </a>
            </div>
          </div>

          <div>
            <div style={{ borderTop: '4px solid #E1332A', overflow: 'hidden', background: '#EEF3F1', aspectRatio: '693/484' }}>
              <img src="/images/contact-building.png" alt="The hospital building at Mahabaleshwar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ margin: '11px 2px 0', fontSize: 17, color: '#5A6A66' }}>The hospital on Medha Road, Mahabaleshwar</div>

            <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, background: '#E6EFEC', borderRadius: 14, overflow: 'hidden' }}>
              {contactHours.map((h) => (
                <div key={h.title} style={{ background: '#F4FAF8', padding: '24px 26px' }}>
                  <div style={{ fontWeight: 600, fontSize: 19, color: '#12564C', marginBottom: 6 }}>{h.title}</div>
                  <div style={{ fontSize: 18, lineHeight: 1.5, color: '#4E5F5A' }}>{h.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '60px 26px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 14, marginBottom: 26 }}>
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#06A88C', flex: 'none' }} />
          <h2 style={{ fontWeight: 600, fontSize: 31, margin: 0, color: '#1F3A34' }}>Finding us</h2>
        </div>
        <p style={{ margin: '0 0 26px', fontSize: 21, lineHeight: 1.6, color: '#45605A', maxWidth: 900 }}>The hospital sits on Medha Road, a short drive from the Mahabaleshwar bus stand, with the campus set back among the trees.</p>
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #DDEEEA', background: '#EEF3F1' }}>
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=73.63%2C17.895%2C73.72%2C17.955&layer=mapnik&marker=17.9247%2C73.6577"
            title="Map of Morarji Gokuldas Rural Hospital, Mahabaleshwar"
            style={{ width: '100%', height: 760, border: 0, display: 'block' }}
          />
          <button
            type="button"
            onClick={() => setAerialOpen(true)}
            aria-label="See the campus from above"
            className={styles.redPill}
            style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'inline-flex', alignItems: 'center', gap: 11, background: '#E1332A', color: '#FFFFFF', fontFamily: 'inherit', fontWeight: 700, fontSize: 19, padding: '15px 26px', border: 'none', borderRadius: 999, cursor: 'pointer', boxShadow: '0 18px 40px -14px rgba(120,20,14,0.6)', animation: 'mgRing 2.6s ease-out infinite' }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
              <circle cx={12} cy={10} r={2.6} />
            </svg>
            See the campus from above
          </button>
        </div>
        <div style={{ margin: '12px 2px 0', fontSize: 17, color: '#5A6A66' }}>Mahabaleshwar - Medha Road, District - Satara – 412 806, Maharashtra</div>
      </section>

      {/* ===== EMERGENCY BAND ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '60px 26px 90px' }}>
        <div style={{ background: '#FDF1F0', borderLeft: '6px solid #E1332A', borderRadius: 16, padding: '40px 42px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 900 }}>
            <h3 style={{ fontWeight: 700, fontSize: 27, margin: '0 0 10px', color: '#9E2018' }}>If it is an emergency, just come</h3>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.6, color: '#7C4741' }}>The casualty ward is open every hour of the year — no appointment, no queue, no payment.</p>
          </div>
          <button
            type="button"
            onClick={() => setEmergencyOpen(true)}
            className={styles.redPill}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#E1332A', color: '#FFFFFF', fontFamily: 'inherit', fontWeight: 700, fontSize: 20, padding: '16px 30px', border: 'none', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer', animation: 'mgRing 2.4s ease-out infinite' }}
          >
            Emergency numbers
          </button>
        </div>
      </section>

      {/* ===== AERIAL LIGHTBOX ===== */}
      {aerialOpen && (
        <div
          onClick={() => setAerialOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 150, background: '#04302A', overflow: 'hidden', animation: 'mgFade 0.3s ease', cursor: 'zoom-out' }}
        >
          <img src="/images/contact-aerial.png" alt="The hospital campus at Mahabaleshwar, seen from above" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'mgAerial 40s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,52,45,0.62) 0%, rgba(4,52,45,0.05) 34%, rgba(4,52,45,0.72) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: '34px 40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 11, fontSize: 16, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9FDFD6', marginBottom: 14 }}>
                <span style={{ width: 42, height: 3, borderRadius: 2, background: '#E1332A' }} />
                Mahabaleshwar · Satara District
              </div>
              <h3 style={{ fontWeight: 500, fontSize: 46, lineHeight: 1.06, margin: 0, color: '#FFFFFF', letterSpacing: '-0.03em' }}>The campus, <span style={{ fontWeight: 700 }}>from above.</span></h3>
            </div>
            <button
              type="button"
              onClick={() => setAerialOpen(false)}
              aria-label="Close"
              className={styles.aerialClose}
              style={{ flex: 'none', width: 50, height: 50, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.44)', background: 'rgba(0,0,0,0.24)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div style={{ position: 'absolute', left: 40, right: 40, bottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: 21, lineHeight: 1.55, color: 'rgba(255,255,255,0.92)', maxWidth: 700 }}>Green roofs among the evergreen canopy on Medha Road — the hospital wards, theatres and OPD block sit at the centre of the frame.</p>
            <span style={{ fontSize: '16.5px', color: 'rgba(255,255,255,0.72)' }}>Click anywhere to close</span>
          </div>
        </div>
      )}

      {/* ===== EMERGENCY POPUP ===== */}
      {emergencyOpen && (
        <div
          onClick={() => setEmergencyOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 140, background: 'rgba(60,12,9,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 26px', animation: 'mgFade 0.22s ease' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 720, background: '#FFFFFF', borderRadius: 20, overflow: 'hidden', boxShadow: '0 46px 90px -34px rgba(90,16,12,0.6)', animation: 'mgPopInContact 0.32s cubic-bezier(0.2,0.85,0.3,1)' }}
          >
            <div style={{ background: '#E1332A', padding: '26px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'mgRing 2.2s ease-out infinite' }}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                    <circle cx={12} cy={12} r={9.5} />
                    <path d="M12 7v6.4M12 16.6v.4" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 25, color: '#FFFFFF', lineHeight: 1.15 }}>Emergency</div>
                  <div style={{ fontSize: '16.5px', color: 'rgba(255,255,255,0.88)', marginTop: 3 }}>Casualty ward open 24 hours</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmergencyOpen(false)}
                aria-label="Close"
                className={styles.modalClose}
                style={{ flex: 'none', width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '30px 32px 34px' }}>
              <a
                href="tel:+912168260247"
                className={styles.helpline}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, background: '#FDF1F0', border: '1px solid #F6D8D5', borderRadius: 14, padding: '22px 26px', marginBottom: 18, textDecoration: 'none' }}
              >
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E2018', marginBottom: 6 }}>Hospital helpline</div>
                  <div style={{ fontWeight: 700, fontSize: 30, color: '#C42A21', letterSpacing: '-0.01em' }}>+91 21682 60247</div>
                </div>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#E1332A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" />
                </svg>
              </a>
              <p style={{ margin: '0 0 22px', fontSize: 19, lineHeight: 1.6, color: '#45605A' }}>In a serious emergency, come straight to the casualty ward — no appointment, no queue, no payment. Intensive care and both operation theatres are on the same floor.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {emergencyPoints.map((p) => (
                  <div key={p} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, alignItems: 'start' }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0A8E7B" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 3 }} aria-hidden="true">
                      <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
                    </svg>
                    <span style={{ fontSize: '18.5px', lineHeight: 1.5, color: '#45605A' }}>{p}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
                <a
                  href="https://wa.me/912168260247"
                  className={styles.whatsappButton}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1FA855', color: '#FFFFFF', fontWeight: 700, fontSize: 18, padding: '14px 26px', borderRadius: 999, textDecoration: 'none' }}
                >
                  WhatsApp
                </a>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '17.5px', color: '#6A7A76' }}>Mahabaleshwar - Medha Road, Satara – 412 806</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

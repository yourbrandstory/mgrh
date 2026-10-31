import { giveWays, roles } from './data';
import styles from './support.module.css';

export default function SupportPage() {
  return (
    <div>
      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(100deg, #10A08A 0%, #14A695 34%, #1BAAA8 66%, #2BB2C4 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
          <img src="/images/support-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 68%', display: 'block' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(90deg, rgba(3,96,84,0.93) 0%, rgba(4,110,100,0.82) 38%, rgba(10,140,140,0.38) 68%, rgba(69,184,204,0.08) 100%)' }} />
        <div style={{ position: 'absolute', zIndex: 2, right: -120, top: -160, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 68%)', animation: 'mgBloom 18s ease-in-out infinite' }} />

        <div style={{ position: 'relative', zIndex: 4, maxWidth: 1800, margin: '0 auto', padding: '52px 26px 84px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 400px)', gap: 56, alignItems: 'end' }}>
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', color: '#EAF7F4', fontSize: 15, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 15px', borderRadius: 999, marginBottom: 22 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C7EDE6' }} />
                Donate · Volunteer · Partner
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ cursor: 'pointer' }}>Home</span><span style={{ opacity: 0.5 }}>/</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Support Us</span>
              </div>
              <h1 style={{ fontWeight: 500, fontSize: 62, lineHeight: 1.02, margin: 0, color: '#FFFFFF', letterSpacing: '-0.025em' }}>Support <span style={{ fontWeight: 700 }}>Us Mission</span></h1>
            </div>
          </div>
          <p style={{ fontSize: 22, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', margin: '22px 0 0' }}>Every consultation, test and medicine here is free of charge. That is possible because of donors, volunteers and partners.</p>
        </div>
      </section>

      {/* ===== INTRODUCTION ===== */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '46px 26px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 14, marginBottom: 26 }}>
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#06A88C', flex: 'none' }} />
          <h2 style={{ fontWeight: 600, fontSize: 31, margin: 0, color: '#1F3A34' }}>Why we need you</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 56, alignItems: 'start' }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 30, lineHeight: 1.2, letterSpacing: '-0.015em', color: '#12564C', margin: '0 0 30px' }}>Free for every patient <span style={{ fontWeight: 700 }}>since 1914</span></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
              <p style={{ margin: 0, fontSize: 22, lineHeight: 1.62, color: '#23423B' }}>Your support helps us continue providing free and quality healthcare to people in Mahabaleshwar and the surrounding rural areas. Your contribution can help us improve hospital facilities, purchase essential medical equipment and medicines, support healthcare camps, and reach more people in need.</p>
              <p style={{ margin: 0, fontSize: 20, lineHeight: 1.62, color: '#4E5F5A' }}>Together, we can strengthen rural healthcare and make a lasting difference in our community.</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: '4px solid #E1332A', overflow: 'hidden', background: '#EEF3F1', aspectRatio: '16/9', maxWidth: 640 }}>
              <img src="/images/contact-aerial.png" alt="The hospital campus at Mahabaleshwar, seen from above" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ margin: '11px 2px 0', fontSize: 17, color: '#5A6A66', maxWidth: 640 }}>The campus at Mahabaleshwar, Medha Road</div>
          </div>
        </div>
      </section>

      {/* ===== DONATE ===== */}
      <section id="donate" style={{ maxWidth: 1800, margin: '0 auto', padding: '46px 26px 10px', scrollMarginTop: 62 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #E6ECEA', paddingBottom: 16, marginBottom: 30 }}>
          <span style={{ width: 30, height: 4, borderRadius: 2, background: '#06A88C', flex: 'none' }} />
          <h2 style={{ fontWeight: 500, fontSize: 32, margin: 0, color: '#1F3A34' }}>Make a <span style={{ fontWeight: 700 }}>Donation</span></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 40, alignItems: 'start', maxWidth: 1200 }}>
          <div style={{ background: '#F1F8F6', border: '1px solid #E1F3EF', borderRadius: 16, padding: '30px 32px' }}>
            <h3 style={{ fontWeight: 600, fontSize: 22, margin: '0 0 6px', color: '#12564C' }}>How to give</h3>
            <p style={{ margin: '0 0 22px', fontSize: 17, lineHeight: 1.56, color: '#5A6A66' }}>Contact the hospital office for account details, UPI, or to arrange a donation in kind.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {giveWays.map((g) => (
                <div key={g.title} style={{ paddingBottom: 16, borderBottom: '1px solid #DCEBE7' }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#12564C', marginBottom: 4 }}>{g.title}</div>
                  <div style={{ fontSize: 17, lineHeight: 1.55, color: '#4E5F5A' }}>{g.detail}</div>
                </div>
              ))}
            </div>
            <a href="tel:+912168260247" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#06A88C', color: '#FFFFFF', fontWeight: 700, fontSize: 17, padding: '14px 26px', borderRadius: 999, textDecoration: 'none' }}>Call the hospital office</a>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #DCEBE7', borderRadius: 16, padding: '32px 34px' }}>
            <h3 style={{ fontWeight: 600, fontSize: 25, margin: '0 0 10px', color: '#1F3A34' }}>Not sure how you can help?</h3>
            <p style={{ margin: '0 0 26px', fontSize: '18.5px', lineHeight: 1.6, color: '#5A6A66' }}>Call the hospital office and ask what is needed this month. It may be a donation, a few hours at a camp, or equipment the wards are waiting on.</p>
            <a href="tel:+912168260247" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#06A88C', color: '#FFFFFF', fontWeight: 700, fontSize: 17, padding: '15px 28px', borderRadius: 999, whiteSpace: 'nowrap', textDecoration: 'none' }}>Call the hospital</a>
            <p style={{ margin: '26px 0 0', fontSize: 17, lineHeight: 1.6, color: '#6A7A76' }}>Donations to the hospital are eligible for tax exemption under Section 80G of the Income Tax Act. A receipt and exemption certificate are issued for every contribution.</p>
          </div>
        </div>
      </section>

      {/* ===== VOLUNTEER ===== */}
      <section id="volunteer" style={{ background: '#F7FBFA', borderTop: '1px solid #E6EFEC', marginTop: 50, scrollMarginTop: 62 }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '46px 26px 52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #DCEBE7', paddingBottom: 16, marginBottom: 30 }}>
            <span style={{ width: 30, height: 4, borderRadius: 2, background: '#45B8CC', flex: 'none' }} />
            <h2 style={{ fontWeight: 500, fontSize: 32, margin: 0, color: '#1F3A34' }}>WHERE YOUR <span style={{ fontWeight: 700 }}>SUPPORT HELPS</span></h2>
          </div>
          <p style={{ margin: '0 0 32px', fontSize: 20, lineHeight: 1.62, color: '#4E5F5A', maxWidth: 900 }}>Every contribution goes directly into care. These are the four areas where support makes the biggest difference.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 26 }}>
            {roles.map((r) => (
              <div key={r.title} className={styles.roleCard} style={{ background: '#FFFFFF', border: '1px solid #E1EEEA', borderRadius: 12, padding: '26px 28px', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#E1F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#0A5F52" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {r.icon.map((d, i) => (
                      <path key={i} d={d} />
                    ))}
                  </svg>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 21, margin: '0 0 8px', color: '#12564C' }}>{r.title}</h3>
                <p style={{ margin: 0, fontSize: '17.5px', lineHeight: 1.56, color: '#4E5F5A' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

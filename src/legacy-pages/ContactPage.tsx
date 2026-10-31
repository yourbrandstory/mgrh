'use client';

import { useEffect, useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import PageHero from '../components/PageHero';
import { Container, PillLink } from '../components/ui';

export default function ContactPage() {
  const { settings: s } = useSiteContent();

  const [aerialOpen, setAerialOpen] = useState(false);

  useEffect(() => {
    document.title = `Contact Us | ${s.hospital_name}`;
  }, [s.hospital_name]);

  useEffect(() => {
    if (!aerialOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAerialOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aerialOpen]);

  return (
    <>
      <PageHero src="/images/08-contact/contact-hero.png" />
      <section className="bg-white">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <a href="/" className="text-muted hover:text-primary-dark">Home</a> <span className="mx-2">/</span> <span className="text-ink">Contact</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[56px] lg:text-[62px]">
            Contact <span className="font-bold">Us</span>
          </h1>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-[28px] font-semibold text-primary-deep md:text-[31px]">Reach the hospital</h2>
              <p className="mb-6 text-[18px] leading-[1.6] text-body md:text-[23px]">Have a question, need information about our services, or want to get directions? Reach us below.</p>
              <div className="mb-6 space-y-3 text-[18px] text-body md:text-[21px]">
                <div><span className="font-semibold text-primary-deep">Address:</span><br />{s.address_single_line}</div>
                <div><span className="font-semibold text-primary-deep">Telephone:</span> <a href={s.phone_href} className="text-primary-dark">{s.phone}</a></div>
                <div><span className="font-semibold text-primary-deep">Email:</span> <a href={`mailto:${s.email}`} className="text-primary-dark">{s.email}</a></div>
                <div><span className="font-semibold text-primary-deep">OPD:</span> {s.opd_hours_morning}, {s.opd_hours_evening}</div>
                <div><span className="font-semibold text-primary-deep">Casualty:</span> {s.casualty_hours}</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <PillLink to={s.phone_href}>Call the hospital</PillLink>
                <PillLink to="/emergency" variant="outline">Emergency</PillLink>
              </div>
            </div>
            <div>
              <div className="mb-3 aspect-[693/484] overflow-hidden border-t-4 border-emergency bg-surface">
                <img
                  src="/images/08-contact/contact-reach-hospital-building.png"
                  alt="The hospital building at Mahabaleshwar"
                  className="block h-full w-full object-cover"
                />
              </div>
              <div className="mb-6 mx-[2px] text-[17px] text-muted">The hospital on Medha Road, Mahabaleshwar</div>
              <div className="relative overflow-hidden rounded-xl border border-line">
                <iframe
                  src="https://www.google.com/maps?q=Morarji+Gokuldas+Rural+Hospital,+Medha+Road,+Mahabaleshwar&z=15&output=embed"
                  title="Map showing Morarji Gokuldas Rural Hospital"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[400px] w-full"
                />
                <button
                  type="button"
                  onClick={() => setAerialOpen(true)}
                  className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-[11px] rounded-full bg-emergency px-[26px] py-[15px] text-[17px] font-bold text-white shadow-[0_18px_40px_-14px_rgba(120,20,14,0.6)] animate-halo"
                >
                  See the campus from above
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {aerialOpen && (
        <div
          className="fixed inset-0 z-[140] flex animate-veil items-center justify-center overflow-y-auto bg-[rgba(9,45,40,0.62)] p-4 backdrop-blur-[3px] md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Aerial view of the hospital campus"
          onClick={() => setAerialOpen(false)}
        >
          <div
            className="w-full max-w-[1200px] animate-pop overflow-hidden rounded-[20px] bg-white shadow-[0_44px_92px_-32px_rgba(6,50,44,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/images/08-contact/contact-aerial-lightbox.png"
              alt="Aerial view of Morarji Gokuldas Rural Hospital among the trees"
              className="block h-auto w-full"
            />
            <div className="flex items-center justify-between gap-6 px-6 py-4">
              <span className="text-[15px] text-muted">Morarji Gokuldas Rural Hospital, Mahabaleshwar</span>
              <button
                type="button"
                onClick={() => setAerialOpen(false)}
                aria-label="Close"
                className="h-[42px] w-[42px] flex-none rounded-full border border-line-2 bg-white hover:border-[#F6BDB8] hover:bg-[#FDF1F0]"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

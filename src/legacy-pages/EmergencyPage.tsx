'use client';

import { useEffect, useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import PageHero from '../components/PageHero';
import { Container } from '../components/ui';

export default function EmergencyPage() {
  const { settings: s } = useSiteContent();
  const [open, setOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = `Emergency | ${s.hospital_name}`;
  }, [s.hospital_name]);

  const faqs = [
    { q: 'Do I need an appointment for the casualty ward?', a: 'No. Bring the patient straight in at any hour. Registration happens at the casualty desk on arrival.' },
    { q: 'Is the casualty really open 24 hours?', a: 'Yes. The Emergency and Casualty department is open and staffed 24 hours a day, every day of the year.' },
    { q: 'What should I bring when coming in an emergency?', a: 'Bring the patient and any available medical records or medicines. If possible, have someone to stay with the patient for details.' },
    { q: 'Can I call ahead?', a: 'Calling ahead lets the duty team prepare, but it is not required. Do not delay coming in for a serious emergency.' },
  ];

  return (
    <>
      <PageHero src="/images/09-emergency/emergency-hero.png" />
      <section className="bg-[#FDF1F0]">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <a href="/" className="text-muted hover:text-primary-dark">Home</a> <span className="mx-2">/</span> <span className="text-ink">Emergency</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.0] tracking-[-0.03em] text-[#9E2018] md:text-[56px] lg:text-[66px]">
            If it is an emergency, <span className="font-bold">just come.</span>
          </h1>
          <p className="mb-6 max-w-[900px] text-[22px] font-semibold leading-[1.4] text-[#7C4741] md:text-[38px]">Do not wait. Come straight to the Emergency Department.</p>
          <p className="mb-8 max-w-[880px] text-[18px] leading-[1.6] text-body md:text-[23px]">24×7 emergency and casualty care for urgent medical conditions. Consultation, tests, medicines and hospital stay are free of charge.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setOpen(true)} className="rounded-full bg-emergency px-7 py-3 text-[18px] font-bold text-white">Need help right now?</button>
            <a href={s.phone_href} className="rounded-full bg-white px-7 py-3 text-[18px] font-bold text-emergency border border-[#E9B3AF]">{s.phone}</a>
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-[50px]">
          <h2 className="mb-6 text-[28px] font-semibold text-primary-deep md:text-[31px]">Important contacts</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-line p-6">
              <div className="mb-2 text-[15px] font-semibold uppercase tracking-[0.12em] text-teal">Casualty</div>
              <a href={s.phone_href} className="text-[28px] font-bold text-primary-deep">{s.phone}</a>
              <div className="text-[16px] text-body">{s.casualty_hours}</div>
            </div>
            <div className="rounded-2xl border border-line p-6">
              <div className="mb-2 text-[15px] font-semibold uppercase tracking-[0.12em] text-teal">Ambulance</div>
              <div className="text-[28px] font-bold text-primary-deep">{s.ambulance_number}</div>
            </div>
            <div className="rounded-2xl border border-line p-6">
              <div className="mb-2 text-[15px] font-semibold uppercase tracking-[0.12em] text-teal">Email</div>
              <a href={`mailto:${s.email}`} className="text-[18px] font-semibold text-primary-dark">{s.email}</a>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-[40px]">
          <h2 className="mb-6 text-[28px] font-semibold text-primary-deep md:text-[31px]">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div key={idx} className="rounded-xl border border-line">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="flex w-full items-center justify-between p-4 text-left">
                  <span className="text-[18px] font-semibold text-primary-deep md:text-[22px]">{f.q}</span>
                  <span className="text-[24px]">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-[17px] leading-[1.6] text-body md:text-[20px]">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[24px] font-bold text-emergency">Need help right now?</h3>
              <button onClick={() => setOpen(false)} className="text-[28px] leading-none">×</button>
            </div>
            <p className="mb-4 text-[17px] text-body">For a life-threatening emergency, come straight to the casualty entrance.</p>
            <a href={s.phone_href} className="block w-full rounded-full bg-emergency py-3 text-center text-[18px] font-bold text-white">Call {s.phone}</a>
          </div>
        </div>
      )}
    </>
  );
}

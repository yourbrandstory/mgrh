'use client';

import { useEffect } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Container } from '../components/ui';

export default function SupportPage() {
  const { settings: s } = useSiteContent();

  useEffect(() => {
    document.title = `Support Us | ${s.hospital_name}`;
  }, [s.hospital_name]);

  return (
    <>
      <section className="bg-white">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <a href="/" className="text-muted hover:text-primary-dark">Home</a> <span className="mx-2">/</span> <span className="text-ink">Support Us</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[52px] lg:text-[62px]">
            Support <span className="font-bold">Us</span>
          </h1>
          <p className="mb-10 max-w-[880px] text-[18px] leading-[1.6] text-body md:text-[22px]">{s.support_intro}</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
              <h3 className="mb-3 text-[24px] font-semibold text-primary-deep">Volunteer with us</h3>
              <p className="mb-4 text-[17px] leading-[1.6] text-body">Camp support, patient guidance at the OPD counter, or clinical volunteering for qualified staff and students.</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
              <h3 className="mb-3 text-[24px] font-semibold text-primary-deep">Donate</h3>
              <p className="mb-4 text-[17px] leading-[1.6] text-body">Contact the hospital office for account details to make a donation in support of our free services.</p>
              <a href={`mailto:${s.email}`} className="font-semibold text-primary-dark">Contact for details</a>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
              <h3 className="mb-3 text-[24px] font-semibold text-primary-deep">Donate equipment</h3>
              <p className="mb-4 text-[17px] leading-[1.6] text-body">Call the hospital office and ask what is needed this month.</p>
              <a href={s.phone_href} className="font-semibold text-primary-dark">{s.phone}</a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

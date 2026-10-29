'use client';

import { useEffect } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Container, PillLink } from '../components/ui';

export default function ContactPage() {
  const { settings: s } = useSiteContent();

  useEffect(() => {
    document.title = `Contact Us | ${s.hospital_name}`;
  }, [s.hospital_name]);

  return (
    <>
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
              <div className="overflow-hidden rounded-xl border border-line">
                <iframe
                  src="https://www.google.com/maps?q=Morarji+Gokuldas+Rural+Hospital,+Medha+Road,+Mahabaleshwar&z=15&output=embed"
                  title="Map showing Morarji Gokuldas Rural Hospital"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[400px] w-full"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

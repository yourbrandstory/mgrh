'use client';

import { useEffect } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import PageHero from '../components/PageHero';
import { Container } from '../components/ui';

export default function SupportPage() {
  const { settings: s } = useSiteContent();

  useEffect(() => {
    document.title = `Support Us | ${s.hospital_name}`;
  }, [s.hospital_name]);

  return (
    <>
      <PageHero src="/images/07-support/support-hero.png" />
      <section className="bg-white">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <a href="/" className="text-muted hover:text-primary-dark">Home</a> <span className="mx-2">/</span> <span className="text-ink">Support Us</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[52px] lg:text-[62px]">
            Support <span className="font-bold">Us</span>
          </h1>
          <p className="mb-10 max-w-[880px] text-[18px] leading-[1.6] text-body md:text-[22px]">{s.support_intro}</p>

          {/* Why we need you */}
          <div className="mb-10">
            <div className="mb-[26px] flex items-baseline gap-[14px] border-b border-line pb-[14px]">
              <span className="h-1 w-[30px] flex-none rounded-sm bg-primary" />
              <h2 className="m-0 text-[28px] font-semibold text-primary-deep md:text-[31px]">Why we need you</h2>
            </div>
            <div className="grid gap-11 lg:grid-cols-2">
              <div>
                <p className="mb-[30px] text-[26px] font-medium leading-[1.2] tracking-[-0.015em] text-[#12564C] md:text-[30px]">
                  Free for every patient <span className="font-bold">since 1914</span>
                </p>
                <div className="flex max-w-[900px] flex-col gap-[18px]">
                  <p className="m-0 text-[19px] leading-[1.62] text-[#23423B] md:text-[22px]">
                    Your support helps us continue providing free and quality healthcare to people in Mahabaleshwar and the
                    surrounding rural areas. Your contribution can help us improve hospital facilities, purchase essential
                    medical equipment and medicines, support healthcare camps, and reach more people in need.
                  </p>
                  <p className="m-0 text-[18px] leading-[1.62] text-body md:text-[20px]">
                    Together, we can strengthen rural healthcare and make a lasting difference in our community.
                  </p>
                </div>
              </div>
              <div>
                <div className="aspect-[16/9] max-w-[640px] overflow-hidden border-t-4 border-emergency bg-surface">
                  <img
                    src="/images/07-support/support-why-we-need-you-aerial.png"
                    alt="The hospital campus at Mahabaleshwar, seen from above"
                    className="block h-full w-full object-cover"
                  />
                </div>
                <div className="mx-[2px] mt-[11px] max-w-[640px] text-[17px] text-muted">
                  The campus at Mahabaleshwar, Medha Road
                </div>
              </div>
            </div>
          </div>

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

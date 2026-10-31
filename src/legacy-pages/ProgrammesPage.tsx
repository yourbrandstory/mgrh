'use client';

import { useEffect } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import PageHero from '../components/PageHero';
import { Container } from '../components/ui';

export default function ProgrammesPage() {
  const { settings: s, programmes } = useSiteContent();

  useEffect(() => {
    document.title = `Programmes | ${s.hospital_name}`;
  }, [s.hospital_name]);

  return (
    <>
      <PageHero src="/images/05-programmes/programmes-hero-clinic.png" />
      <section className="bg-white">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <a href="/" className="text-muted hover:text-primary-dark">Home</a> <span className="mx-2">/</span> <span className="text-ink">Programmes</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[52px] lg:text-[62px]">
            Our <span className="font-bold">Programmes</span>
          </h1>
          <p className="mb-10 max-w-[880px] text-[18px] leading-[1.6] text-body md:text-[22px]">{s.programmes_intro}</p>
          <div className="grid gap-6 md:grid-cols-2">
            {programmes.map((p) => (
              <div key={p.slug} className="rounded-2xl border border-line bg-white p-6 md:p-8">
                <h3 className="mb-3 text-[24px] font-semibold text-primary-deep md:text-[32px]">{p.name}</h3>
                <p className="mb-4 text-[17px] leading-[1.6] text-body md:text-[20px]">{p.short_description}</p>
                <div className="text-[16px] text-muted">Photos coming soon</div>
              </div>
            ))}
          </div>

          {/* Reaching the town */}
          <div className="mt-[46px] grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)]">
            <div>
              <h3 className="mb-3 text-[26px] font-semibold leading-[1.24] text-primary-deep md:text-[28px]">
                Reaching the town, not only the ward
              </h3>
              <p className="m-0 max-w-[560px] text-[18px] leading-[1.62] text-body md:text-[20px]">
                School clinics, immunisation drives, screening camps and blood donation camps take the hospital out into
                Mahabaleshwar and the villages around it every service free of charge
              </p>
            </div>
            <div>
              <div className="aspect-[4/5] overflow-hidden border-t-4 border-emergency bg-surface">
                <img
                  src="/images/05-programmes/programmes-community-band-town.png"
                  alt="Mahabaleshwar town from above, with the hospital's forested campus alongside"
                  className="block h-full w-full object-cover object-[50%_45%]"
                />
              </div>
              <div className="mx-[2px] mt-[9px] text-[15px] text-muted">Mahabaleshwar town, served by the hospital</div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

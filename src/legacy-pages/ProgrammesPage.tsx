'use client';

import { useEffect } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Container } from '../components/ui';

export default function ProgrammesPage() {
  const { settings: s, programmes } = useSiteContent();

  useEffect(() => {
    document.title = `Programmes | ${s.hospital_name}`;
  }, [s.hospital_name]);

  return (
    <>
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
        </Container>
      </section>
    </>
  );
}

'use client';

import { useEffect } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Container, PillLink } from '../components/ui';

export default function ComingSoon({ title, notFound = false }: { title: string; notFound?: boolean }) {
  const { settings: s } = useSiteContent();

  useEffect(() => {
    document.title = `${title} | ${s.hospital_name}`;
  }, [title, s.hospital_name]);

  return (
    <section className="bg-mint">
      <Container className="py-24 md:py-32">
        <div className="mb-4 text-[14px] font-semibold uppercase tracking-[0.14em] text-teal md:text-[16px]">
          {notFound ? '404' : 'Coming soon'}
        </div>
        <h1 className="mb-5 text-[36px] font-semibold leading-[1.08] tracking-[-0.028em] text-primary-deep md:text-[52px]">{title}</h1>
        <p className="mb-9 max-w-[640px] text-[18px] leading-[1.6] text-body md:text-[21px]">
          {notFound
            ? 'We couldn’t find that page.'
            : 'This page is being prepared. For anything urgent, please call the hospital — casualty is open 24 hours.'}
        </p>
        <div className="flex flex-wrap gap-[14px]">
          <PillLink to="/" arrow>Back to home</PillLink>
          <PillLink to={s.phone_href} variant="outline">Call {s.phone}</PillLink>
        </div>
      </Container>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSiteContent } from '../../hooks/useSiteContent';
import type { Programme } from '../../data/siteContent';
import Reveal from '../Reveal';
import { ArrowRight, CloseIcon, PhotoIcon, ProgrammeGlyph } from '../Icons';
import { Container, PillLink, SectionHeading } from '../ui';

export interface HomeFacility {
  id: string;
  name: string;
  imageUrl: string | null;
  unitCountLabel: string;
}

export function Facilities({ homeFacilities }: { homeFacilities?: HomeFacility[] }) {
  const { settings: s, homeFacilities: fallback } = useSiteContent();
  const facilities: HomeFacility[] =
    homeFacilities ||
    fallback.map((f) => ({
      id: f.slug,
      name: f.name,
      imageUrl: f.image_url,
      unitCountLabel: f.unit_count_label,
    }));

  return (
    <Reveal className="mt-[82px] border-y border-line bg-mint py-[64px]">
      <Container>
        <SectionHeading lead="Our" bold="facilities" meta={<span className="text-[16px] font-semibold text-muted md:text-[18px]">{s.facilities_count_label}</span>} />
        <p className="mb-[34px] max-w-[900px] text-[18px] leading-[1.6] text-body md:text-[21px]">{s.facilities_intro}</p>

        <div className="-mx-4 mb-[34px] flex snap-x snap-mandatory gap-[22px] overflow-x-auto px-4 pb-[6px] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {facilities.map((f) => (
            <Link
              key={f.id}
              href="/facilities"
              className="block w-[400px] max-w-[82vw] flex-none snap-start overflow-hidden rounded-2xl border border-line-2 bg-white text-ink transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#BEE3DB] hover:text-ink hover:shadow-[0_22px_44px_-30px_rgba(6,80,68,0.55)]"
            >
              <div role="img" aria-label={f.name} className="aspect-[16/10] bg-surface bg-cover bg-center" style={{ backgroundImage: `url("${f.imageUrl || '/images/hospital-building.jpg'}")` }} />
              <div className="flex items-baseline justify-between gap-[14px] px-6 pb-6 pt-[22px]">
                <span className="text-[19px] font-semibold leading-[1.26] text-primary-deep md:text-[21px]">{f.name}</span>
                <span className="flex-none text-[14px] font-semibold text-muted md:text-[15.5px]">{f.unitCountLabel}</span>
              </div>
            </Link>
          ))}
          <Link
            href="/facilities"
            className="flex w-[300px] max-w-[82vw] flex-none snap-start flex-col justify-center gap-[14px] rounded-2xl border border-[#BEE3DB] bg-mint-2 px-8 py-[30px] text-primary-deep hover:text-primary-deep"
          >
            <span className="text-[21px] font-semibold leading-[1.24] md:text-[23px]">{s.facilities_more_title}</span>
            <span className="text-[16px] leading-[1.5] text-soft md:text-[17.5px]">{s.facilities_more_text}</span>
            <span className="inline-flex items-center gap-[9px] text-[18px] font-bold text-primary md:text-[19px]">
              Read more <ArrowRight color="#0B6558" />
            </span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[18px] border border-line bg-white px-6 py-8 md:px-[42px] md:py-[38px]">
          <div className="max-w-[780px]">
            <h3 className="mb-[10px] text-[23px] font-semibold leading-[1.2] text-primary-deep md:text-[28px]">{s.facilities_cta_title}</h3>
            <p className="m-0 text-[17px] leading-[1.58] text-soft md:text-[19.5px]">{s.facilities_cta_text}</p>
          </div>
          <PillLink to="/facilities" arrow className="whitespace-nowrap">View all facilities</PillLink>
        </div>
      </Container>
    </Reveal>
  );
}

function PhotoSlot({ src, label, ratio }: { src: string | null; label: string; ratio: string }) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-surface" style={{ aspectRatio: ratio }}>
      {src ? (
        <img src={src} alt={label} className="block h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-[#C9DCD7] text-center text-[13px] text-muted">
          <PhotoIcon size={22} color="#8FA9A2" />
          <span className="px-3">{label}</span>
        </div>
      )}
    </div>
  );
}

function ProgrammeGallery({ programme, onClose }: { programme: Programme; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const ratios = ['3/2', '4/3'];
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[140] flex animate-veil items-start justify-center overflow-y-auto bg-[rgba(9,45,40,0.62)] px-4 py-8 backdrop-blur-[3px] md:px-[26px] md:py-[46px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${programme.name} photos`}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[1040px] animate-pop overflow-hidden rounded-[20px] bg-white shadow-[0_44px_92px_-32px_rgba(6,50,44,0.6)]">
        <div className="flex items-start justify-between gap-6 border-b border-surface px-6 pb-6 pt-7 md:px-8">
          <div>
            <div className="mb-[9px] text-[14px] font-semibold uppercase tracking-[0.12em] text-primary-dark md:text-[15px]">Programme</div>
            <h3 className="mb-2 text-[24px] font-semibold leading-[1.22] text-primary-deep md:text-[28px]">{programme.name}</h3>
            <p className="m-0 max-w-[660px] text-[17px] leading-[1.56] text-soft md:text-[18.5px]">{programme.short_description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full border border-line-2 bg-white hover:border-[#F6BDB8] hover:bg-[#FDF1F0]"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 pb-8 pt-[26px] md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {programme.photos.map((p, n) => (
              <div key={n} className={n === 0 ? 'col-span-2' : ''}>
                <PhotoSlot src={p.image_url} label={p.caption} ratio={n === 0 ? '16/9' : ratios[n % 2]} />
                <div className="mx-[2px] mt-2 text-[14px] text-muted">{p.caption}</div>
              </div>
            ))}
          </div>
          <PillLink to="/programmes" className="mt-[26px] md:!px-[26px] md:!py-[14px] md:!text-[18px]">Open the programmes page</PillLink>
        </div>
      </div>
    </div>
  );
}

export function Programmes() {
  const { settings: s, programmes } = useSiteContent();
  const [active, setActive] = useState<Programme | null>(null);

  return (
    <Reveal className="mt-[82px] border-y border-[#E2EFEB] bg-mint-3 py-[64px]">
      <Container>
        <SectionHeading lead="Our" bold="programmes" meta={<span className="text-[16px] font-semibold text-muted md:text-[18px]">{s.programmes_count_label}</span>} />
        <p className="mb-[34px] max-w-[900px] text-[18px] leading-[1.6] text-body md:text-[21px]">{s.programmes_intro}</p>

        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {programmes.map((p) => (
            <div
              key={p.slug}
              role="button"
              tabIndex={0}
              onClick={() => setActive(p)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActive(p))}
              className="flex h-full cursor-pointer flex-col rounded-2xl border border-line-2 bg-white px-[30px] pb-[30px] pt-7 text-ink transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#BEE3DB] hover:shadow-[0_22px_44px_-30px_rgba(6,80,68,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="mb-[18px] flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#E1F3EF]">
                <ProgrammeGlyph name={p.icon_key} />
              </div>
              <div className="mb-[7px] text-[20px] font-semibold leading-[1.26] text-primary-deep md:text-[21.5px]">{p.name}</div>
              <div className="mb-4 text-[16px] leading-[1.5] text-muted md:text-[17.5px]">{p.short_description}</div>
              <div className="mb-4 mt-auto">
                <PhotoSlot src={p.cover_image_url} label={p.name} ratio="16/10" />
              </div>
              <span className="inline-flex items-center gap-2 text-[16px] font-bold text-primary-dark md:text-[17px]">
                View photos <PhotoIcon />
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/programmes"
          className="mt-8 inline-flex animate-halo items-center gap-[10px] rounded-full border border-primary bg-primary px-7 py-[15px] text-[18px] font-bold text-white hover:bg-primary-dark hover:text-white md:text-[19px]"
        >
          Read more
          <span className="inline-flex animate-nudge"><ArrowRight /></span>
        </Link>
      </Container>

      {active && createPortal(<ProgrammeGallery programme={active} onClose={() => setActive(null)} />, document.body)}
    </Reveal>
  );
}

import Image from 'next/image';

export interface PageHeroCredit {
  label: string;
  href: string;
}

export default function PageHero({
  src,
  alt = '',
  credit,
  drift = false,
}: {
  src: string;
  alt?: string;
  credit?: PageHeroCredit;
  drift?: boolean;
}) {
  return (
    <section className="relative h-[240px] w-full overflow-hidden bg-surface sm:h-[320px] lg:h-[420px]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        priority
        className={`object-cover${drift ? ' animate-[mgPan_28s_ease-in-out_infinite]' : ''}`}
        style={{ willChange: 'transform' }}
      />
      {credit && (
        <a
          href={credit.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-4 z-[2] text-[12px] leading-[1.4] text-white/70 hover:text-white"
        >
          {credit.label}
        </a>
      )}
    </section>
  );
}

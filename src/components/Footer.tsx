import Link from 'next/link';
import { useSiteContent } from '../hooks/useSiteContent';
import { PhoneFilled } from './Icons';

const exploreLinks = [
  { label: 'Facilities', href: '/facilities' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Camps & Events', href: '/events' },
  { label: 'Support Us', href: '/support' },
  { label: 'Contact', href: '/contact' },
];

const colHead = 'mb-4 text-[15px] font-semibold uppercase tracking-[0.12em] text-[#C7EDE6] md:text-[16px]';

/** `curveFrom` is the colour of the section above the footer, so the wave blends into it. */
export default function Footer({ curveFrom = '#EAF5F2' }: { curveFrom?: string }) {
  const { settings: s } = useSiteContent();

  return (
    <footer className="relative bg-[#10908C] text-[#DCEDEA]">
      <svg aria-hidden="true" viewBox="0 0 1000 190" preserveAspectRatio="none"
        className="absolute left-0 top-[-1px] z-[1] block h-[96px] w-full md:h-[191px]">
        <path d="M0 0h1000v190H0z" fill={curveFrom} />
        <path d="M0 26C300 -18 700 122 1000 178V191H0Z" fill="#10908C" />
      </svg>

      <div className="relative z-[2] mx-auto max-w-site px-4 pt-[100px] sm:px-[26px] md:pt-[168px]">
        <div className="mb-[52px] flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/[0.26] bg-white/[0.12] px-6 py-[22px] md:px-7">
          <div className="flex items-center gap-[14px]">
            <span className="h-3 w-3 flex-none rounded-full bg-white shadow-[0_0_0_5px_rgba(225,51,42,0.5)]" />
            <div>
              <div className="text-[20px] font-bold text-white md:text-[23px]">{s.emergency_strip_title}</div>
              <div className="mt-[3px] text-[16px] text-[#DCEDEA] md:text-[18px]">{s.emergency_strip_text}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={s.phone_href} className="inline-flex items-center gap-[10px] rounded-full bg-emergency px-6 py-[13px] text-[17px] font-bold text-white hover:text-white md:text-[19px]">
              <PhoneFilled /> {s.emergency_phone}
            </a>
            <Link href="/emergency" className="inline-flex items-center gap-[10px] rounded-full bg-white px-6 py-[13px] text-[17px] font-bold text-[#0E7D6B] hover:text-[#0E7D6B] md:text-[19px]">
              Emergency information
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-11 pb-11 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 text-[24px] font-bold leading-[1.25] text-white md:text-[26px]">{s.hospital_name}</div>
            <p className="mb-[18px] max-w-[420px] text-[17px] leading-[1.6] text-[#EAF7F4] md:text-[18.5px]">{s.footer_description}</p>
            <p className="text-[17px] leading-[1.6] text-[#EAF7F4] md:text-[18.5px]">{s.footer_free_note}</p>
          </div>

          <div>
            <div className={colHead}>Find us</div>
            <div className="mb-[14px] text-[17px] leading-[1.6] text-[#EAF7F4] md:text-[18.5px]">
              {s.address_line1}<br />{s.address_line2}<br />{s.address_line3}
            </div>
            <Link href="/contact" className="text-[17px] font-semibold text-white underline underline-offset-4 hover:text-white md:text-[18px]">
              Get directions
            </Link>
          </div>

          <div>
            <div className={colHead}>Opening hours</div>
            <div className="flex flex-col gap-3 text-[17px] leading-[1.5] text-[#EAF7F4] md:text-[18.5px]">
              <div>
                <span className="font-semibold text-white">OPD</span><br />
                {s.opd_hours_morning}<br />{s.opd_hours_evening}
              </div>
              <div>
                <span className="font-semibold text-white">Casualty</span><br />
                {s.casualty_hours}
              </div>
            </div>
          </div>

          <div>
            <div className={colHead}>Explore</div>
            <div className="flex flex-col gap-[10px]">
              {exploreLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-[17px] text-[#EAF7F4] hover:text-white md:text-[18.5px]">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-white/30 pb-[26px] pt-5 text-[15px] text-[#D3EDE8] md:text-[17px]">
          <span>© {new Date().getFullYear()} {s.hospital_name}, {s.town}</span>
          <a href={`mailto:${s.email}`} className="text-[#D3EDE8] hover:text-white">{s.email}</a>
        </div>
      </div>
    </footer>
  );
}

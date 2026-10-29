import Link from 'next/link';
import { useSiteContent } from '../../hooks/useSiteContent';
import Reveal from '../Reveal';
import { ArrowRight } from '../Icons';
import { Container, PillLink, SectionHeading } from '../ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface HomeEvent {
  id: string;
  title: string;
  eventDate: string | null;
  venue: string;
}

export function Events({ homeEvents }: { homeEvents?: HomeEvent[] }) {
  const { settings: s, homeEvents: fallback } = useSiteContent();
  const events: HomeEvent[] =
    homeEvents ||
    fallback.map((e, i) => ({
      id: `${e.title}-${i}`,
      title: e.title,
      eventDate: e.event_date,
      venue: e.venue,
    }));

  return (
    <Reveal className="mt-20 bg-[#108C89] text-white">
      <Container className="grid grid-cols-1 items-center gap-10 py-[62px] lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="mb-4 text-[16px] font-bold uppercase tracking-[0.14em] text-white md:text-[19px]">Camps &amp; events</div>
          <h2 className="mb-5 max-w-[640px] text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.026em] text-white md:text-[40px]">{s.events_title}</h2>
          <p className="mb-8 max-w-[660px] text-[18px] leading-[1.55] text-white md:text-[24px]">{s.events_intro}</p>
          <PillLink to="/events" variant="white" arrow>See the calendar</PillLink>
        </div>

        <div className="flex flex-col gap-[14px]">
          {events.map((e) => {
            const date = e.eventDate || '';
            const [, m, d] = date.split('-');
            return (
              <Link
                key={e.id}
                href="/events"
                className="grid grid-cols-[72px_1fr] items-center gap-4 rounded-[14px] border border-white/[0.24] bg-black/[0.16] px-4 py-[18px] text-white transition-colors duration-[250ms] hover:bg-black/[0.24] hover:text-white sm:grid-cols-[86px_1fr] sm:gap-5 sm:px-[22px]"
              >
                <div className="rounded-[10px] bg-white/[0.94] px-[6px] py-[9px] text-center">
                  <div className="text-[24px] font-bold leading-none text-primary-deep">{d || '—'}</div>
                  <div className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#C42A21]">{m ? MONTHS[Number(m) - 1] : ''}</div>
                </div>
                <div>
                  <div className="mb-[5px] text-[18px] font-semibold leading-[1.26] md:text-[21px]">{e.title}</div>
                  <div className="text-[16px] font-bold text-white md:text-[19px]">{e.venue}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </Reveal>
  );
}

export function Support() {
  const { settings: s, supportOptions } = useSiteContent();

  return (
    <section className="mt-[82px] border-t border-line bg-mint pb-[72px] pt-[64px]">
      <Container>
        <div className="mb-[26px] flex flex-wrap items-baseline gap-[14px] border-b border-[#D6E7E2] pb-4">
          <div className="[&>div]:mb-0">
            <SectionHeading lead="Support" bold="us" size="sm" />
          </div>
          <Link href="/support" className="ml-auto text-[17px] font-bold text-primary-dark hover:text-primary md:text-[18.5px]">Ways to help →</Link>
        </div>
        <p className="mb-8 max-w-[1000px] text-[18px] leading-[1.6] text-body md:text-[21px]">{s.support_intro}</p>

        <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
          {supportOptions.map((o) => (
            <Link
              key={o.title}
              href={o.cta_link}
              className="block rounded-2xl border border-l-[6px] border-line-2 bg-white px-8 pb-8 pt-[30px] text-ink transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:text-ink hover:shadow-[0_22px_44px_-30px_rgba(6,80,68,0.55)]"
              style={{ borderLeftColor: o.accent_color }}
            >
              <h3 className="mb-[10px] text-[22px] font-semibold leading-[1.22] text-primary-deep md:text-[24px]">{o.title}</h3>
              <p className="mb-[18px] text-[17px] leading-[1.56] text-soft md:text-[18.5px]">{o.description}</p>
              <span className="inline-flex items-center gap-[9px] text-[17px] font-bold text-primary-dark md:text-[18px]">
                {o.cta_label} <ArrowRight color="#0B6558" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

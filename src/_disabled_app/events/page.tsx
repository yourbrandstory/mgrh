import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import PageHero from '@/components/PageHero';
import DraftBanner from '@/components/DraftBanner';
import { settings } from '@/data/siteContent';
import { getEvents, sortUpcoming, type PublicEvent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Camps & Events | ${settings.hospital_name}`,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const today = () => new Date().toISOString().slice(0, 10);

function EventCard({ event }: { event: PublicEvent }) {
  const [, month, day] = (event.eventDate || '').split('-');
  const upcoming = Boolean(event.eventDate && event.eventDate >= today());
  const gallery = event.gallery.slice(0, 4);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-[16/9] bg-[#FDF1F0]">
        {event.coverImageUrl ? (
          <img src={event.coverImageUrl} alt={event.coverAlt || event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#B98A84]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-[22px]">+</div>
            <span className="text-[14px] font-medium">Photos coming soon</span>
          </div>
        )}
        <div className="absolute left-4 top-4 overflow-hidden rounded-xl bg-white text-center shadow-sm">
          <div className="px-4 pb-1 pt-2 text-[26px] font-bold leading-none text-primary-deep">{day || '—'}</div>
          <div className="px-4 pb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-emergency">
            {month ? MONTHS[Number(month) - 1] : 'Date to be confirmed'}
          </div>
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[12.5px] font-semibold text-[#0B5F55]">
          {upcoming ? 'Upcoming' : 'Past event'}
        </div>
      </div>
      <div className="p-6">
        <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">{event.category}</div>
        <h2 className="text-[23px] font-semibold leading-[1.25] text-primary-deep">{event.title}</h2>
        <div className="mt-2 text-[16px] text-body">{event.venue}</div>
        {event.summary && <p className="mt-3 text-[16.5px] leading-[1.6] text-body">{event.summary}</p>}
        {event.organiser && <p className="mt-2 text-[14.5px] text-muted">Organised by {event.organiser}</p>}
        {gallery.length > 0 && (
          <div className="mt-5 grid grid-cols-4 gap-2">
            {gallery.map((image) => (
              <div key={image.id} className="aspect-square overflow-hidden rounded-lg bg-surface">
                <img src={image.url} alt={image.alt || event.title} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
        {gallery.length === 0 && event.placeholderSlots > 0 && (
          <div className="mt-5 grid grid-cols-4 gap-2">
            {Array.from({ length: Math.min(4, event.placeholderSlots) }).map((_, i) => (
              <div key={i} className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[#E8D5D2] bg-[#FDF1F0] text-[18px] text-[#C9A29D]">+</div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview: previewParam } = await searchParams;
  const preview = previewParam === '1';
  const result = await getEvents(preview);
  const events = sortUpcoming(result.rows);

  return (
    <>
      {result.preview && <DraftBanner />}
      <PageHero
        src="/images/06-events/events-hero-banner.jpg"
        credit={{
          label: 'Photo by LuAnn Hunt on Unsplash',
          href: 'https://unsplash.com/@luann_hunt',
        }}
      />
      <section className="bg-white">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <Link href="/" className="text-muted hover:text-primary-dark">Home</Link> <span className="mx-2">/</span> <span className="text-ink">Events</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[56px] lg:text-[66px]">
            Camps & <span className="font-bold">Events</span>
          </h1>
          <p className="max-w-[880px] text-[18px] leading-[1.6] text-body md:text-[21px]">{settings.events_intro}</p>
        </Container>
      </section>

      <section className="bg-[#F7FBFA]">
        <Container className="py-14 md:py-16">
          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[17px] text-muted">
              No events are published yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-12">
          <div className="rounded-2xl bg-[#EDF6F3] px-6 py-8 md:px-10">
            <h3 className="mb-2 text-[25px] font-semibold text-[#1F3A34]">Want to bring a camp to your village or school?</h3>
            <p className="max-w-[760px] text-[17px] leading-[1.6] text-body">
              The hospital runs blood donation drives, screening camps, school clinics and immunisation days through the year. Call the office to plan one with us.
            </p>
            <a href={settings.phone_href} className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 text-[16px] font-bold text-white hover:bg-primary-dark">
              Call {settings.phone}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

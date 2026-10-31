import { About, EmergencyReach, Hero, StatsBand } from '@/components/home/HeroAbout';
import { Facilities, Programmes } from '@/components/home/FacilitiesProgrammes';
import { Events, Support } from '@/components/home/EventsSupport';
import DraftBanner from '@/components/DraftBanner';
import { getEvents, getFacilities, sortUpcoming } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview: previewParam } = await searchParams;
  const preview = previewParam === '1';
  const [facilitiesResult, eventsResult] = await Promise.all([
    getFacilities(preview),
    getEvents(preview),
  ]);

  const homeFacilities = facilitiesResult.rows.slice(0, 3).map((f) => ({
    id: f.id,
    name: f.name,
    imageUrl: f.coverImageUrl,
    unitCountLabel: f.subitems.length
      ? `${f.subitems.length} ${f.subitems.length === 1 ? 'unit' : 'units'}`
      : f.category,
  }));

  const homeEvents = sortUpcoming(eventsResult.rows)
    .filter((e) => e.eventDate && e.eventDate >= new Date().toISOString().slice(0, 10))
    .slice(0, 3)
    .map((e) => ({ id: e.id, title: e.title, eventDate: e.eventDate, venue: e.venue }));

  return (
    <>
      {(facilitiesResult.preview || eventsResult.preview) && <DraftBanner />}
      <Hero />
      <About />
      <StatsBand />
      <EmergencyReach />
      <Facilities homeFacilities={homeFacilities} />
      <Programmes />
      <Events homeEvents={homeEvents} />
      <Support />
    </>
  );
}

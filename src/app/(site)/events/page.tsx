import { getEvents, type PublicEvent } from '@/lib/content';
import EventsView from './EventsView';
import { canonicalCategory, dateParts, events as fallbackEvents, type EventItem } from './data';

function toItem(row: PublicEvent): EventItem {
  const { dateShort, dateLong } = dateParts(row.eventDate);
  const shots = row.gallery.map((g, n) => g.caption || g.alt || `Photo ${n + 1}`);
  const photos = row.gallery.map((g) => g.url || null);

  if (!shots.length && row.placeholderSlots > 0) {
    for (let n = 0; n < row.placeholderSlots; n += 1) {
      shots.push('');
      photos.push(null);
    }
  }

  return {
    id: row.id,
    category: canonicalCategory(row.category),
    title: row.title,
    dateShort,
    dateLong,
    venue: row.venue,
    summary: row.summary,
    shots,
    photos,
    coverImageUrl: row.coverImageUrl,
  };
}

export default async function EventsPage() {
  const { rows } = await getEvents();
  const items = rows.length ? rows.map(toItem) : fallbackEvents;

  return <EventsView items={items} />;
}

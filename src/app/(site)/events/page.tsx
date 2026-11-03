import { getCategoryRecords, getEvents, type PublicEvent } from '@/lib/content';
import EventsView from './EventsView';
import { baseFilters, dateParts, events as fallbackEvents, type EventItem } from './data';

function canonical(value: string, names: string[]) {
  const match = names.find((name) => name.toLowerCase() === value.trim().toLowerCase());
  return match || value.trim();
}

function displayName(value: string) {
  const match = baseFilters.find((name) => name.toLowerCase() === value.trim().toLowerCase());
  return match || value.trim();
}

function toItem(row: PublicEvent, names: string[]): EventItem {
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
    category: canonical(row.category, names),
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

function buildFilters(items: EventItem[], names: string[]) {
  const filters = ['All events'];
  for (const name of [...names, ...items.map((item) => item.category)]) {
    const value = name.trim();
    if (value && !filters.some((existing) => existing.toLowerCase() === value.toLowerCase())) filters.push(value);
  }
  return filters;
}

export default async function EventsPage() {
  const [{ rows }, categories] = await Promise.all([getEvents(), getCategoryRecords('events')]);
  const names = categories.map((category) => displayName(category.name));
  const items = rows.length ? rows.map((row) => toItem(row, names)) : fallbackEvents;
  const filters = rows.length ? buildFilters(items, names) : baseFilters;

  return <EventsView items={items} filters={filters} />;
}

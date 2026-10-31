import { getEvents, type PublicEvent } from '@/lib/content';
import HomeView from './home/HomeView';
import { events as fallbackEvents, type EventItem } from './home/data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toHomeEvent(row: PublicEvent): EventItem {
  if (!row.eventDate) return { day: '', month: '', title: row.title, venue: row.venue };
  const [year, month, day] = row.eventDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: MONTHS[date.getMonth()],
    title: row.title,
    venue: row.venue,
  };
}

function todayString() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

export default async function HomePage() {
  const { rows } = await getEvents();
  const today = todayString();
  const upcomingFirst = [...rows].sort((a, b) => {
    const aUpcoming = a.eventDate && a.eventDate >= today ? 0 : 1;
    const bUpcoming = b.eventDate && b.eventDate >= today ? 0 : 1;
    if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming;
    if (aUpcoming === 0) return (a.eventDate || '').localeCompare(b.eventDate || '');
    return 0;
  });
  const events = upcomingFirst.length ? upcomingFirst.slice(0, 3).map(toHomeEvent) : fallbackEvents;

  return <HomeView events={events} />;
}

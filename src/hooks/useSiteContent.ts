import {
  settings,
  navItems,
  milestones,
  stats,
  facilities,
  programmes,
  events,
  supportOptions,
  type HospitalEvent,
} from '../data/siteContent';

/**
 * Single access point for site content.
 *
 * Today it returns the static data from src/data/siteContent.ts.
 * When Supabase is added, replace the body of this hook with Supabase
 * queries (e.g. via React Query) that return the same shape — every
 * component keeps working unchanged.
 */
export function useSiteContent() {
  const bySort = <T extends { sort_order: number }>(list: T[]) =>
    [...list].sort((a, b) => a.sort_order - b.sort_order);

  return {
    settings,
    navItems,
    milestones: bySort(milestones),
    stats: bySort(stats),
    facilities: bySort(facilities),
    homeFacilities: bySort(facilities).filter((f) => f.show_on_home),
    programmes: bySort(programmes),
    homeEvents: pickHomeEvents(events, 3),
    supportOptions: bySort(supportOptions),
  };
}

/** Upcoming events first (soonest first); if fewer than `count`, fill with the most recent past ones. */
function pickHomeEvents(list: HospitalEvent[], count: number) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = list.filter((e) => e.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = list.filter((e) => e.event_date < today).sort((a, b) => b.event_date.localeCompare(a.event_date));
  return [...upcoming, ...past].slice(0, count);
}

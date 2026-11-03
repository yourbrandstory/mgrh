import { getCategoryRecords, getFacilities, type PublicCategory, type PublicFacility } from '@/lib/content';
import FacilitiesView from './FacilitiesView';
import {
  buildParas,
  buildShots,
  fallbackGroups,
  normalizeName,
  type FacilityGroup,
  type FacilityItem,
} from './data';

function itemsFor(group: FacilityGroup, rows: PublicFacility[]): FacilityItem[] {
  return rows.map((row, i) => {
    const sourceItem =
      group.items.find((item) => normalizeName(item.name) === normalizeName(row.name)) || group.items[i];
    const slot = sourceItem ? sourceItem.slot : `db-${group.id}-${i}`;
    const labels = sourceItem ? sourceItem.shots.map((shot) => shot.label) : [];

    return {
      slot,
      name: row.name,
      paras: buildParas(row, sourceItem?.paras || []),
      shots: buildShots(slot, labels, row.images),
    };
  });
}

function slug(value: string) {
  return `sec-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'facilities'}`;
}

function buildGroups(rows: PublicFacility[], categories: PublicCategory[]): FacilityGroup[] {
  if (!rows.length) return fallbackGroups;

  const names: string[] = [];
  const add = (value: string) => {
    const name = value.trim();
    if (name && !names.some((existing) => normalizeName(existing) === normalizeName(name))) names.push(name);
  };
  categories.forEach((category) => add(category.name));
  rows.forEach((row) => add(row.category));
  if (!names.length) return fallbackGroups;

  return names.flatMap((name, i) => {
    const groupRows = rows.filter((row) => normalizeName(row.category) === normalizeName(name));
    if (!groupRows.length) return [];

    const fallback = fallbackGroups.find((g) => normalizeName(g.title) === normalizeName(name));
    const category = categories.find((c) => normalizeName(c.name) === normalizeName(name));
    const group: FacilityGroup = {
      id: fallback?.id || slug(name),
      title: name,
      blurb: category?.tagline || fallback?.blurb || '',
      bg: i % 2 === 0 ? '#ffffff' : '#F7FBFA',
      bandBg: i % 2 === 0 ? '#F1F8F6' : '#E9F4F1',
      items: [],
    };

    return [{ ...group, items: itemsFor(fallback || group, groupRows) }];
  });
}

export default async function FacilitiesPage() {
  const [{ rows }, categories] = await Promise.all([getFacilities(), getCategoryRecords('facilities')]);
  const groups = buildGroups(rows, categories);

  return <FacilitiesView groupsTop={groups.slice(0, 3)} groupsBottom={groups.slice(3)} />;
}

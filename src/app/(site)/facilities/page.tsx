import { getFacilities, type PublicFacility } from '@/lib/content';
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

function buildGroups(rows: PublicFacility[]): FacilityGroup[] {
  if (!rows.length) return fallbackGroups;

  return fallbackGroups.map((group) => {
    const groupRows = rows.filter((row) => row.category === group.title);
    if (!groupRows.length) return group;
    return { ...group, items: itemsFor(group, groupRows) };
  });
}

export default async function FacilitiesPage() {
  const { rows } = await getFacilities();
  const groups = buildGroups(rows);

  return <FacilitiesView groupsTop={groups.slice(0, 3)} groupsBottom={groups.slice(3)} />;
}

'use client';

import { useMemo, useState, type DragEvent as ReactDragEvent, type ReactNode } from 'react';
import { errorMessage, useAdmin } from './AdminProvider';
import Icon from './Icon';
import LastChanged from './LastChanged';
import type { Collection, DoctorRecord, EventRecord, FacilityRecord } from '@/lib/admin/types';

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function labelOf(record: DoctorRecord | FacilityRecord | EventRecord) {
  return 'name' in record ? record.name : record.title;
}

export default function RecordList({
  kind,
  onEdit,
}: {
  kind: Collection;
  onEdit: (id: string) => void;
}) {
  const admin = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [when, setWhen] = useState<'all' | 'up' | 'past'>('all');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const all = admin.db[kind] as (DoctorRecord | FacilityRecord | EventRecord)[];
  const specialties = admin.db.categories.doctors;
  const sections = admin.db.categories.facilities;
  const categories = admin.db.categories.events;

  const rows = useMemo(() => {
    const text = query.toLowerCase();
    let list = all.filter((item) => {
      const label = labelOf(item).toLowerCase();
      const role = 'role' in item ? item.role.toLowerCase() : '';
      const matchesText = !text || label.includes(text) || role.includes(text);
      const matchesFilter =
        !filter ||
        (kind === 'doctors'
          ? (item as DoctorRecord).spec === filter
          : kind === 'facilities'
            ? (item as FacilityRecord).section === filter
            : (item as EventRecord).cat === filter);
      return matchesText && matchesFilter;
    });
    if (kind === 'events') {
      const today = new Date().toISOString().slice(0, 10);
      list = list
        .filter((item) => {
          const date = (item as EventRecord).date;
          return when === 'all' || (when === 'up' ? date >= today : date < today);
        })
        .slice()
        .sort((a, b) => (b as EventRecord).date.localeCompare((a as EventRecord).date));
    }
    return list;
  }, [all, filter, kind, query, when]);

  const movable = kind !== 'events' && !query && !filter;

  const remove = async (record: DoctorRecord | FacilityRecord | EventRecord) => {
    const label = labelOf(record);
    const ok = await admin.confirm({
      title: `Delete “${label}”?`,
      text: 'It will disappear from the website. You can undo for 10 seconds. To keep it saved but not shown, use Hide instead.',
      ok: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await admin.removeRecord(kind, record);
      admin.toast(`Deleted “${label}”.`, '', {
        undo: async () => {
          try {
            await admin.restoreRecord(kind, record);
            admin.toast('Restored.');
          } catch (failure) {
            admin.toast(errorMessage(failure), 'err');
          }
        },
      });
    } catch (failure) {
      admin.toast(errorMessage(failure), 'err');
    }
  };

  const toggle = async (record: DoctorRecord | FacilityRecord | EventRecord) => {
    try {
      await admin.toggleVisibility(kind, record);
    } catch (failure) {
      admin.toast(errorMessage(failure), 'err');
    }
  };

  const drop = async (targetId: string) => {
    const from = dragId;
    setDragId(null);
    setOverId(null);
    if (!from || from === targetId) return;
    try {
      await admin.reorderRecord(kind, from, targetId);
    } catch (failure) {
      admin.toast(errorMessage(failure), 'err');
    }
  };

  const filterOptions: { value: string; label: string }[] =
    kind === 'doctors'
      ? [{ value: '', label: 'All specialities' }, ...specialties.map((item) => ({ value: item.name, label: item.name }))]
      : kind === 'facilities'
        ? [{ value: '', label: 'All sections' }, ...sections.map((item) => ({ value: item.name, label: item.name }))]
        : [{ value: '', label: 'All categories' }, ...categories.map((item) => ({ value: item.name, label: item.name }))];

  return (
    <>
      <div className="tb">
        <div className="grow">
          <label className="sr" htmlFor="q">
            Search
          </label>
          <input
            type="search"
            id="q"
            placeholder="Search by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select id="fsel" aria-label="Filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
          {filterOptions.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {kind === 'events' ? (
          <select
            id="tsel"
            aria-label="Time"
            value={when}
            onChange={(event) => setWhen(event.target.value as 'all' | 'up' | 'past')}
          >
            <option value="all">Past and upcoming</option>
            <option value="up">Upcoming</option>
            <option value="past">Past</option>
          </select>
        ) : null}
      </div>
      <div className="rows" id="rows">
        {rows.length ? (
          rows.map((item) => {
            const record = item as DoctorRecord | FacilityRecord | EventRecord;
            let thumb: ReactNode = null;
            let main: ReactNode = null;
            let on = false;

            if (kind === 'doctors') {
              const doctor = item as DoctorRecord;
              on = doctor.visible;
              thumb = doctor.photo ? (
                <img className="th round" src={doctor.photo.out} alt="" />
              ) : (
                <div className="th round ph">{initials(doctor.name)}</div>
              );
              main = (
                <>
                  <b>{doctor.name}</b>
                  <span>
                    {doctor.role} · {doctor.spec}
                  </span>
                  {doctor.photo ? null : <span className="chip warn">No photo yet</span>}
                </>
              );
            } else if (kind === 'facilities') {
              const facility = item as FacilityRecord;
              on = facility.visible;
              const section = sections.find((entry) => entry.name === facility.section);
              const photo = facility.slots.find((slot) => slot.photo)?.photo;
              const have = facility.slots.filter((slot) => slot.photo).length;
              const total = facility.slots.filter((slot) => slot.caption || slot.photo).length;
              thumb = photo ? (
                <img className="th wide" src={photo.out} alt="" />
              ) : (
                <div className="th wide ph" style={{ fontSize: 12 }}>
                  No photo
                </div>
              );
              main = (
                <>
                  <b>{facility.name}</b>
                  <span>
                    {section ? section.name : 'No section'}
                    {facility.extra ? ' · Not counted as a department' : ''}
                  </span>
                  <span className={'chip ' + (have ? 'ok' : 'warn')}>
                    {have} of {total} photos added
                  </span>
                </>
              );
            } else {
              const event = item as EventRecord;
              on = event.status === 'published';
              const parts = (event.date || '').split('-');
              thumb = event.cover ? (
                <img className="th wide" src={event.cover.out} alt="" />
              ) : (
                <div className="th wide ph" style={{ flexDirection: 'column', lineHeight: 1.1 }}>
                  <b style={{ fontSize: 19 }}>{parts[2] || ''}</b>
                  <span style={{ fontSize: 11.5 }}>
                    {parts[1] ? MON[Number(parts[1]) - 1] : ''} {parts[0] || ''}
                  </span>
                </div>
              );
              main = (
                <>
                  <b>{event.title}</b>
                  <span>
                    {event.cat} · {event.loc}
                  </span>
                  <span>
                    <span className={'chip ' + (on ? 'ok' : 'warn')}>{on ? 'Published' : 'Draft'}</span>{' '}
                    <span className="count">{event.gallery.length} photos</span>
                  </span>
                </>
              );
            }

            return (
              <div
                key={item.id}
                className={
                  'row ' +
                  (kind === 'events'
                    ? (item as EventRecord).status !== 'published'
                      ? 'off'
                      : ''
                    : !(item as DoctorRecord | FacilityRecord).visible
                      ? 'off'
                      : '') +
                  (overId === item.id ? ' over' : '')
                }
                draggable={movable}
                data-id={item.id}
                data-t={kind}
                onDragStart={(event: ReactDragEvent<HTMLDivElement>) => {
                  if (!movable) return;
                  setDragId(item.id);
                  event.dataTransfer.effectAllowed = 'move';
                  try {
                    event.dataTransfer.setData('text/plain', item.id);
                  } catch {
                    /* some browsers block the payload */
                  }
                }}
                onDragOver={(event: ReactDragEvent<HTMLDivElement>) => {
                  if (!dragId) return;
                  event.preventDefault();
                  if (overId !== item.id) setOverId(item.id);
                }}
                onDrop={(event: ReactDragEvent<HTMLDivElement>) => {
                  if (!dragId) return;
                  event.preventDefault();
                  void drop(item.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
              >
                {movable ? (
                  <span className="grip" title="Drag to reorder" aria-hidden="true">
                    <Icon name="drag" size={18} />
                  </span>
                ) : null}
                {thumb}
                <div className="rmain">
                  {main}
                  <LastChanged record={record} />
                </div>
                <div className="rctl">
                  <button
                    className="sw"
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => void toggle(record)}
                  >
                    <i></i>
                    {kind === 'events' ? (on ? 'Published' : 'Draft') : on ? 'Visible' : 'Hidden'}
                  </button>
                  {movable ? (
                    <>
                      <button
                        className="ibtn"
                        type="button"
                        aria-label="Move up"
                        onClick={() => void admin.moveRecord(kind, item.id, -1)}
                      >
                        <Icon name="up" size={17} />
                      </button>
                      <button
                        className="ibtn"
                        type="button"
                        aria-label="Move down"
                        onClick={() => void admin.moveRecord(kind, item.id, 1)}
                      >
                        <Icon name="down" size={17} />
                      </button>
                    </>
                  ) : null}
                  <button className="btn sm" type="button" onClick={() => onEdit(item.id)}>
                    <Icon name="edit" size={15} /> Edit
                  </button>
                  {admin.user?.role === 'Admin' ? (
                    <button
                      className="ibtn"
                      type="button"
                      aria-label="Delete"
                      onClick={() => void remove(record)}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty">
            {all.length
              ? 'Nothing matches your search.'
              : 'Nothing here yet. Use the Add button to create the first one.'}
          </div>
        )}
      </div>
    </>
  );
}

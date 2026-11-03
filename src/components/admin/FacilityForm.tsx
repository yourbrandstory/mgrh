'use client';

import { useState } from 'react';
import Drawer from './Drawer';
import GalleryField from './GalleryField';
import Icon from './Icon';
import ImageField from './ImageField';
import { PH, pickFiles, useImageEditor } from './ImageEditor';
import { lastChangedText } from './LastChanged';
import { useAdmin } from './AdminProvider';
import type { FacilityRecord, FacilitySlot, Photo } from '@/lib/admin/types';

const DEFAULT_CAPTIONS = ['General view', 'Detail', 'In use'];

function emptyFacility(order: number, section: string): FacilityRecord {
  return {
    id: crypto.randomUUID(),
    name: '',
    section,
    desc: '',
    visible: true,
    extra: false,
    slots: DEFAULT_CAPTIONS.map((caption) => ({ caption, photo: null })) as [
      FacilitySlot,
      FacilitySlot,
      FacilitySlot,
    ],
    more: [],
    review: false,
    coverIndex: 0,
    order,
    status: 'published',
  };
}

export default function FacilityForm({
  record,
  isNew,
  onClose,
}: {
  record?: FacilityRecord;
  isNew: boolean;
  onClose: () => void;
}) {
  const admin = useAdmin();
  const { editImage } = useImageEditor();
  const sections = admin.db.categories.facilities;
  const [draft, setDraft] = useState<FacilityRecord>(() => {
    if (record) return JSON.parse(JSON.stringify(record)) as FacilityRecord;
    return emptyFacility(admin.db.facilities.length, sections[0]?.name || '');
  });
  const [initial] = useState(() => JSON.stringify(draft));

  const update = <K extends keyof FacilityRecord>(key: K, value: FacilityRecord[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateSlot = (index: number, patch: Partial<FacilitySlot>) => {
    setDraft((current) => ({
      ...current,
      slots: current.slots.map((slot, position) =>
        position === index ? { ...slot, ...patch } : slot,
      ) as [FacilitySlot, FacilitySlot, FacilitySlot],
    }));
  };

  const addMore = async () => {
    const files = await pickFiles(true);
    if (!files.length) return;
    let next = draft.more.slice();
    for (const file of files) {
      const result = await editImage({
        file,
        type: 'gallery',
        title: draft.name || 'Facility name',
        subtitle: '',
      });
      if (!result) break;
      next = [...next, result as Photo];
      setDraft((current) => ({ ...current, more: next }));
    }
  };

  return (
    <Drawer
      title={isNew ? 'Add a facility' : 'Edit facility'}
      draft={draft}
      initial={initial}
      buttons={[{ label: 'Save' }]}
      validate={(value) =>
        !value.name
          ? 'Please enter the facility name.'
          : !value.section
            ? 'Please add a section first (Facilities > Sections).'
            : null
      }
      onSave={async (value) => {
        await admin.saveFacility(value);
      }}
      onClose={onClose}
    >
      {!isNew && record && lastChangedText(record) ? (
        <p className="hint" style={{ marginBottom: 14 }}>
          {lastChangedText(record)}
        </p>
      ) : null}
      <div className="fld">
        <label htmlFor="f-name">Facility name</label>
        <input
          type="text"
          id="f-name"
          value={draft.name}
          placeholder="Example: Pathology Lab"
          onChange={(event) => update('name', event.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="f-sec">Section</label>
        <select id="f-sec" value={draft.section} onChange={(event) => update('section', event.target.value)}>
          {sections.length ? null : <option value="">No sections yet</option>}
          {sections.map((section) => (
            <option key={section.id} value={section.name}>
              {section.name}
            </option>
          ))}
          {draft.section && !sections.some((section) => section.name === draft.section) ? (
            <option value={draft.section}>{draft.section}</option>
          ) : null}
        </select>
      </div>
      <div className="fld">
        <label htmlFor="f-desc">Description</label>
        <textarea
          id="f-desc"
          rows={6}
          value={draft.desc}
          onChange={(event) => update('desc', event.target.value)}
        />
        <span className="hint">Leave a blank line between paragraphs to start a new one.</span>
      </div>
      <h3>Photos</h3>
      {draft.slots.map((slot, index) => (
        <div className="card" key={index} style={{ marginBottom: 12, padding: 14 }}>
          <div className="fld">
            <label htmlFor={'f-cap' + index}>Caption for photo {index + 1}</label>
            <input
              type="text"
              id={'f-cap' + index}
              value={slot.caption}
              placeholder="Example: General view"
              onChange={(event) => updateSlot(index, { caption: event.target.value })}
            />
            <span className="hint">Leave the caption and photo empty to hide this spot on the website.</span>
          </div>
          <ImageField
            label={'Photo ' + (index + 1)}
            hint={PH}
            type="facility"
            photo={slot.photo}
            title={draft.name || 'Facility name'}
            subtitle=""
            onChange={(photo) => updateSlot(index, { photo })}
          />
        </div>
      ))}
      <div id="gal">
        <GalleryField
          photos={draft.more}
          title={draft.name || 'Facility name'}
          subtitle=""
          hideEmpty
          onChange={(more) => update('more', more)}
        />
      </div>
      <div className="acts" style={{ margin: '4px 0 16px' }}>
        <button className="btn sm" type="button" onClick={() => void addMore()}>
          <Icon name="plus" size={16} /> Add more photos
        </button>
      </div>
      <label className="chk">
        <input
          type="checkbox"
          id="f-vis"
          checked={draft.visible}
          onChange={(event) => {
            const visible = event.target.checked;
            setDraft((current) => ({
              ...current,
              visible,
              status: visible ? 'published' : 'draft',
            }));
          }}
        />{' '}
        Show on the website
      </label>
    </Drawer>
  );
}

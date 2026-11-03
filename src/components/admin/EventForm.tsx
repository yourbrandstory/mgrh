'use client';

import { useState } from 'react';
import Drawer from './Drawer';
import GalleryField from './GalleryField';
import Icon from './Icon';
import ImageField from './ImageField';
import { PH, pickFiles, useImageEditor } from './ImageEditor';
import { lastChangedText } from './LastChanged';
import { useAdmin } from './AdminProvider';
import type { EventRecord, Photo } from '@/lib/admin/types';

export default function EventForm({
  record,
  isNew,
  onClose,
}: {
  record?: EventRecord;
  isNew: boolean;
  onClose: () => void;
}) {
  const admin = useAdmin();
  const { editImage } = useImageEditor();
  const categories = admin.db.categories.events;
  const [draft, setDraft] = useState<EventRecord>(() => {
    if (record) return JSON.parse(JSON.stringify(record)) as EventRecord;
    return {
      id: crypto.randomUUID(),
      title: '',
      date: new Date().toISOString().slice(0, 10),
      endDate: '',
      start: '',
      end: '',
      cat: categories[0]?.name || '',
      loc: '',
      desc: '',
      description: '',
      organiser: '',
      highlights: '',
      status: 'draft',
      featured: false,
      cover: null,
      gallery: [],
      shotLabels: 0,
      order: admin.db.events.length,
    };
  });
  const [initial] = useState(() => JSON.stringify(draft));

  const update = <K extends keyof EventRecord>(key: K, value: EventRecord[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const addPhotos = async () => {
    const files = await pickFiles(true);
    if (!files.length) return;
    let next = draft.gallery.slice();
    for (const file of files) {
      const result = await editImage({
        file,
        type: 'gallery',
        title: draft.title || 'Event title',
        subtitle: draft.loc,
      });
      if (!result) break;
      next = [...next, result as Photo];
      setDraft((current) => ({ ...current, gallery: next }));
    }
  };

  return (
    <Drawer
      title={isNew ? 'Add an event' : 'Edit event'}
      draft={draft}
      initial={initial}
      buttons={isNew ? [{ label: 'Save', status: 'published' }] : [{ label: 'Save' }]}
      validate={(value) =>
        !value.title ? 'Please enter the event title.' : !value.date ? 'Please choose the date.' : null
      }
      onSave={async (value) => {
        await admin.saveEvent(value);
      }}
      onClose={onClose}
    >
      {!isNew && record && lastChangedText(record) ? (
        <p className="hint" style={{ marginBottom: 14 }}>
          {lastChangedText(record)}
        </p>
      ) : null}
      <div className="fld">
        <label htmlFor="f-title">Event title</label>
        <input
          type="text"
          id="f-title"
          value={draft.title}
          placeholder="Example: Voluntary Blood Donation Camp"
          onChange={(event) => update('title', event.target.value)}
        />
      </div>
      <div className="fgrid">
        <div className="fld">
          <label htmlFor="f-date">Date</label>
          <input
            type="date"
            id="f-date"
            value={draft.date}
            onChange={(event) => update('date', event.target.value)}
          />
        </div>
        <div className="fld">
          <label htmlFor="f-cat">Category</label>
          <select id="f-cat" value={draft.cat} onChange={(event) => update('cat', event.target.value)}>
            {categories.length ? null : <option value="">No categories yet</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
            {draft.cat && !categories.some((category) => category.name === draft.cat) ? (
              <option value={draft.cat}>{draft.cat}</option>
            ) : null}
          </select>
        </div>
      </div>
      <div className="fld">
        <label htmlFor="f-loc">Place</label>
        <input
          type="text"
          id="f-loc"
          value={draft.loc}
          placeholder="Example: Community hall, Mahabaleshwar"
          onChange={(event) => update('loc', event.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="f-desc">Short description (optional)</label>
        <textarea
          id="f-desc"
          rows={3}
          value={draft.desc}
          onChange={(event) => update('desc', event.target.value)}
        />
      </div>
      <ImageField
        label="Cover photo"
        hint={PH}
        type="cover"
        photo={draft.cover}
        title={draft.title || 'Event title'}
        subtitle={draft.loc}
        onChange={(cover) => update('cover', cover)}
      />
      <h3>Photo gallery</h3>
      <div id="gal">
        <GalleryField
          photos={draft.gallery}
          title={draft.title || 'Event title'}
          subtitle={draft.loc}
          onChange={(gallery) => update('gallery', gallery)}
        />
      </div>
      <div className="acts" style={{ margin: '10px 0 16px' }}>
        <button className="btn sm" type="button" onClick={() => void addPhotos()}>
          <Icon name="plus" size={16} /> Add photos
        </button>
      </div>
      <span className="hint">
        You can choose several photos at once. Each one is up to 500 KB and can be moved or cropped.
      </span>
    </Drawer>
  );
}

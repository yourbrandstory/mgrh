'use client';

import { useRef, useState } from 'react';
import Drawer from './Drawer';
import Icon from './Icon';
import ImageField from './ImageField';
import { PH } from './ImageEditor';
import { lastChangedText } from './LastChanged';
import { useAdmin } from './AdminProvider';
import type { DoctorRecord } from '@/lib/admin/types';

export default function DoctorForm({
  record,
  isNew,
  onClose,
}: {
  record?: DoctorRecord;
  isNew: boolean;
  onClose: () => void;
}) {
  const admin = useAdmin();
  const specialties = admin.db.categories.doctors;
  const [draft, setDraft] = useState<DoctorRecord>(() =>
    record
      ? { ...record, photo: record.photo ? { ...record.photo } : null }
      : {
          id: crypto.randomUUID(),
          name: '',
          role: '',
          qual: '',
          exp: '',
          spec: specialties[0]?.name || '',
          schedule: '',
          location: '',
          bio: '',
          days: [],
          start: '',
          end: '',
          contact: '',
          showContact: false,
          visible: true,
          photo: null,
          order: admin.db.doctors.length,
          status: 'published',
        },
  );
  const [initial] = useState(() => JSON.stringify(draft));
  const [showSpec, setShowSpec] = useState(false);
  const [newSpec, setNewSpec] = useState('');
  const [adding, setAdding] = useState(false);
  const specInput = useRef<HTMLInputElement>(null);

  const update = <K extends keyof DoctorRecord>(key: K, value: DoctorRecord[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const openSpec = () => {
    setShowSpec(true);
    requestAnimationFrame(() => specInput.current?.focus());
  };

  const addSpec = async () => {
    const name = newSpec.trim();
    if (!name) {
      admin.toast('Type the speciality name first.', 'err');
      specInput.current?.focus();
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      const existing = specialties.find((item) => item.name.toLowerCase() === name.toLowerCase());
      let chosen = existing?.name;
      if (!existing) {
        await admin.addManage('specialties', name);
        chosen = name;
      }
      update('spec', chosen || name);
      setNewSpec('');
      setShowSpec(false);
      admin.toast(`“${chosen || name}” added. It now shows as a filter button on the Doctors page.`);
    } catch {
      admin.toast('The speciality could not be added. Please try again.', 'err');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Drawer
      title={isNew ? 'Add a doctor' : 'Edit doctor'}
      draft={draft}
      initial={initial}
      buttons={[{ label: 'Save' }]}
      validate={(value) =>
        !value.name
          ? 'Please enter the doctor’s name.'
          : !value.role
            ? 'Please enter the designation, for example Medical Officer.'
            : null
      }
      onSave={async (value) => {
        await admin.saveDoctor(value);
      }}
      onClose={onClose}
    >
      {!isNew && record && lastChangedText(record) ? (
        <p className="hint" style={{ marginBottom: 14 }}>
          {lastChangedText(record)}
        </p>
      ) : null}
      <div className="fld">
        <label htmlFor="f-name">Full name</label>
        <input
          type="text"
          id="f-name"
          value={draft.name}
          placeholder="Dr. First Middle Last"
          onChange={(event) => update('name', event.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="f-role">Designation</label>
        <input
          type="text"
          id="f-role"
          value={draft.role}
          placeholder="Example: Pediatrician, Medical Officer"
          onChange={(event) => update('role', event.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor="f-spec">Speciality group</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            id="f-spec"
            style={{ flex: '1 1 200px', width: 'auto' }}
            value={draft.spec}
            onChange={(event) => update('spec', event.target.value)}
          >
            {specialties.length ? null : <option value="">No specialities yet</option>}
            {specialties.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
            {draft.spec && !specialties.some((item) => item.name === draft.spec) ? (
              <option value={draft.spec}>{draft.spec}</option>
            ) : null}
          </select>
          <button className="btn sm" type="button" onClick={openSpec}>
            <Icon name="plus" size={16} /> Add speciality
          </button>
        </div>
        <div
          id="specbox"
          hidden={!showSpec}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}
        >
          <input
            ref={specInput}
            type="text"
            id="specNewIn"
            placeholder="New speciality, for example Cardiology"
            style={{ flex: '1 1 200px', width: 'auto' }}
            aria-label="New speciality name"
            value={newSpec}
            onChange={(event) => setNewSpec(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void addSpec();
              }
            }}
          />
          <button className="btn sm pri" type="button" disabled={adding} onClick={() => void addSpec()}>
            Add
          </button>
          <button
            className="btn sm"
            type="button"
            onClick={() => {
              setShowSpec(false);
              setNewSpec('');
            }}
          >
            Cancel
          </button>
        </div>
        <span className="hint">Decides which filter button on the website shows this doctor.</span>
      </div>
      <div className="fld">
        <label htmlFor="f-sch">Tagline</label>
        <input
          type="text"
          id="f-sch"
          value={draft.schedule}
          placeholder="Example: Caring for every child"
          onChange={(event) => update('schedule', event.target.value)}
        />
        <span className="hint">One short line shown on the doctor’s card.</span>
      </div>
      <ImageField
        label="Photo"
        hint={PH}
        type="doctor"
        photo={draft.photo}
        title={draft.name || 'Doctor name'}
        subtitle={draft.role}
        onChange={(photo) => update('photo', photo)}
      />
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

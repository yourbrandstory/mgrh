'use client';

import { useEffect, useState } from 'react';
import { errorMessage, useAdmin } from './AdminProvider';
import Icon from './Icon';
import type { CategoryRecord, ManageKey, SupportRecord } from '@/lib/admin/types';

interface Field {
  key: 'name' | 'tagline' | 'count' | 'title' | 'description';
  label: string;
  textarea?: boolean;
  wide?: boolean;
}

interface Config {
  p: string;
  fields: Field[];
  unit: string;
  used: (record: CategoryRecord | SupportRecord, db: ReturnType<typeof useAdmin>['db']) => number;
  addLabel: string;
}

const CONFIG: Record<ManageKey, Config> = {
  specialties: {
    p: 'These make the filter buttons on the Doctors page.',
    fields: [{ key: 'name', label: 'Name' }],
    unit: 'doctors',
    used: (record, db) =>
      db.doctors.filter((doctor) => doctor.spec === (record as CategoryRecord).name).length,
    addLabel: 'Add speciality',
  },
  categories: {
    p: 'These make the filter buttons on the Events page.',
    fields: [{ key: 'name', label: 'Name' }],
    unit: 'events',
    used: (record, db) =>
      db.events.filter((event) => event.cat === (record as CategoryRecord).name).length,
    addLabel: 'Add',
  },
  sections: {
    p: 'Each section becomes a group and a “Jump to a section” button on the Facilities page.',
    fields: [
      { key: 'name', label: 'Section name' },
      { key: 'tagline', label: 'One-line tagline' },
    ],
    unit: 'facilities',
    used: (record, db) =>
      db.facilities.filter((facility) => facility.section === (record as CategoryRecord).name).length,
    addLabel: 'Add',
  },
  support: {
    p: 'The table at the bottom of the Doctors page.',
    fields: [
      { key: 'count', label: 'Number' },
      { key: 'title', label: 'Role' },
      { key: 'description', label: 'Description', textarea: true, wide: true },
    ],
    unit: '',
    used: () => 0,
    addLabel: 'Add',
  },
};

function labelOf(record: CategoryRecord | SupportRecord) {
  return 'name' in record ? record.name : record.title;
}

export default function ListManager({ manage }: { manage: ManageKey }) {
  const admin = useAdmin();
  const config = CONFIG[manage];
  const list = admin.listFor(manage) as (CategoryRecord | SupportRecord)[];
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) return;
    const field = CONFIG[manage].fields[0].key;
    const element = document.getElementById(`${manage}-${focusId}-${field}`);
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.focus();
      element.select();
    }
    setFocusId(null);
  }, [focusId, manage]);

  const add = async () => {
    try {
      const id = await admin.addManage(manage);
      setFocusId(id);
    } catch (failure) {
      admin.toast(errorMessage(failure), 'err');
    }
  };

  const commit = async (
    record: CategoryRecord | SupportRecord,
    field: Field,
    input: HTMLInputElement | HTMLTextAreaElement,
  ) => {
    const value = input.value.trim();
    const before = String((record as unknown as Record<string, unknown>)[field.key] ?? '');
    if (field.key === 'name' && !value) {
      input.value = before;
      admin.toast('A name cannot be empty.', 'err');
      return;
    }
    if (value === before) return;
    try {
      await admin.updateManage(manage, record, field.key, value);
    } catch (failure) {
      input.value = before;
      admin.toast(errorMessage(failure), 'err');
    }
  };

  const remove = async (record: CategoryRecord | SupportRecord) => {
    const used = config.used(record, admin.db);
    if (used) {
      admin.toast(`${used} ${config.unit} still use this. Move them to another one first.`, 'err');
      return;
    }
    const label = labelOf(record);
    const ok = await admin.confirm({
      title: `Delete “${label}”?`,
      text: 'It will disappear from the website. You can undo for 10 seconds. To keep it saved but not shown, use Hide instead.',
      ok: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await admin.removeManage(manage, record);
      admin.toast(`Deleted “${label}”.`, '', {
        undo: async () => {
          try {
            await admin.restoreManage(manage, record);
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

  return (
    <>
      <div className="note info" style={{ marginBottom: 14 }}>
        {config.p}
      </div>
      <div className="rows">
        {list.map((record, index) => (
          <div className="lrow" key={record.id} data-id={record.id}>
            <div className="lfields">
              {config.fields.map((field) => {
                const id = `${manage}-${record.id}-${field.key}`;
                const value = String((record as unknown as Record<string, unknown>)[field.key] ?? '');
                return (
                  <div className={field.wide ? 'wide' : ''} key={field.key}>
                    <label htmlFor={id}>{field.label}</label>
                    {field.textarea ? (
                      <textarea
                        id={id}
                        rows={2}
                        defaultValue={value}
                        onBlur={(event) => void commit(record, field, event.target)}
                      />
                    ) : (
                      <input
                        type="text"
                        id={id}
                        defaultValue={value}
                        onBlur={(event) => void commit(record, field, event.target)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="rctl">
              <button
                className="ibtn"
                type="button"
                aria-label="Move up"
                disabled={!index}
                onClick={() => void admin.moveManage(manage, record.id, -1)}
              >
                <Icon name="up" size={17} />
              </button>
              <button
                className="ibtn"
                type="button"
                aria-label="Move down"
                disabled={index >= list.length - 1}
                onClick={() => void admin.moveManage(manage, record.id, 1)}
              >
                <Icon name="down" size={17} />
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
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <button className="btn pri" type="button" onClick={() => void add()}>
          <Icon name="plus" size={16} /> {config.addLabel}
        </button>
      </div>
    </>
  );
}

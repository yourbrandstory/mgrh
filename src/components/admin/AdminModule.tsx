'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from './AdminProvider';
import DoctorForm from './DoctorForm';
import EventForm from './EventForm';
import FacilityForm from './FacilityForm';
import Icon from './Icon';
import ListManager from './ListManager';
import PageHead from './PageHead';
import RecordList from './RecordList';
import Tabs from './Tabs';
import type { Collection, ManageKey } from '@/lib/admin/types';

const CONFIG = {
  doctors: {
    path: '/admin/doctors',
    title: 'Doctors',
    sub: 'Doctors and support staff shown on the Doctors page.',
    add: 'Add doctor',
    tabs: [
      ['list', 'Doctors'],
      ['support', 'Support staff'],
    ],
    manage: 'support',
  },
  facilities: {
    path: '/admin/facilities',
    title: 'Facilities',
    sub: 'Departments and services shown on the Facilities page.',
    add: 'Add facility',
    tabs: [
      ['list', 'Facilities'],
      ['sections', 'Sections'],
    ],
    manage: 'sections',
  },
  events: {
    path: '/admin/events',
    title: 'Events',
    sub: 'Camps, drives and rallies shown on the Events page.',
    add: 'Add event',
    tabs: [
      ['list', 'Events'],
      ['categories', 'Categories'],
    ],
    manage: 'categories',
  },
} as const;

type Kind = keyof typeof CONFIG;

export default function AdminModule({ kind, tab }: { kind: Kind; tab: string }) {
  const admin = useAdmin();
  const router = useRouter();
  const [editor, setEditor] = useState<{ id: string | null; isNew: boolean } | null>(null);
  const config = CONFIG[kind];
  const current = (config.tabs as readonly (readonly [string, string])[]).some(([key]) => key === tab)
    ? tab
    : 'list';

  const add = (
    <button
      className="btn pri"
      type="button"
      onClick={() => setEditor({ id: null, isNew: true })}
    >
      <Icon name="plus" size={16} /> {config.add}
    </button>
  );

  const editingDoctor =
    editor && !editor.isNew ? admin.db.doctors.find((item) => item.id === editor.id) : undefined;
  const editingFacility =
    editor && !editor.isNew ? admin.db.facilities.find((item) => item.id === editor.id) : undefined;
  const editingEvent =
    editor && !editor.isNew ? admin.db.events.find((item) => item.id === editor.id) : undefined;
  const close = () => setEditor(null);

  return (
    <>
      <PageHead title={config.title} sub={config.sub} action={current === 'list' ? add : undefined} />
      <Tabs
        items={config.tabs}
        current={current}
        onSelect={(key) => router.push(config.path + '?tab=' + key)}
      />
      {current === 'list' ? (
        <RecordList kind={kind as Collection} onEdit={(id) => setEditor({ id, isNew: false })} />
      ) : (
        <ListManager manage={config.manage as ManageKey} />
      )}

      {editor && kind === 'doctors' && (editor.isNew || editingDoctor) ? (
        <DoctorForm
          isNew={editor.isNew}
          record={editor.isNew ? undefined : editingDoctor}
          onClose={close}
        />
      ) : null}
      {editor && kind === 'facilities' && (editor.isNew || editingFacility) ? (
        <FacilityForm
          isNew={editor.isNew}
          record={editor.isNew ? undefined : editingFacility}
          onClose={close}
        />
      ) : null}
      {editor && kind === 'events' && (editor.isNew || editingEvent) ? (
        <EventForm
          isNew={editor.isNew}
          record={editor.isNew ? undefined : editingEvent}
          onClose={close}
        />
      ) : null}
    </>
  );
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  addCategory,
  addSupport,
  deleteRow,
  loadAll,
  restoreCategory,
  restoreSupport,
  saveDoctor as saveDoctorRow,
  saveEvent as saveEventRow,
  saveFacility as saveFacilityRow,
  setStatus,
  updateCategoryFields,
  updateOrder,
  updateSupportFields,
} from '@/lib/admin/store';
import { clearAdminSession, readAdminSession, writeAdminSession } from '@/lib/admin/session';
import type {
  AdminDb,
  AdminRole,
  CategoryRecord,
  Collection,
  DoctorRecord,
  EventRecord,
  FacilityRecord,
  ManageKey,
  SessionUser,
  SupportRecord,
} from '@/lib/admin/types';
import ConfirmBox, { type ConfirmOptions } from './ConfirmBox';
import Toasts, { type ToastItem } from './Toasts';

interface AdminContextValue {
  ready: boolean;
  user: SessionUser | null;
  db: AdminDb;
  refresh: () => Promise<void>;
  login: (name: string, role: AdminRole) => Promise<SessionUser>;
  logout: () => Promise<void>;
  toast: (message: string, kind?: 'err' | '', options?: { undo?: () => void | Promise<void> }) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  saveDoctor: (record: DoctorRecord) => Promise<void>;
  saveFacility: (record: FacilityRecord) => Promise<void>;
  saveEvent: (record: EventRecord) => Promise<void>;
  toggleVisibility: (collection: Collection, record: DoctorRecord | FacilityRecord | EventRecord) => Promise<void>;
  removeRecord: (collection: Collection, record: DoctorRecord | FacilityRecord | EventRecord) => Promise<void>;
  restoreRecord: (
    collection: Collection,
    record: DoctorRecord | FacilityRecord | EventRecord,
  ) => Promise<void>;
  moveRecord: (collection: Collection, id: string, direction: -1 | 1) => Promise<void>;
  reorderRecord: (collection: Collection, fromId: string, toId: string) => Promise<void>;
  listFor: (key: ManageKey) => (CategoryRecord | SupportRecord)[];
  addManage: (key: ManageKey, name?: string) => Promise<string>;
  updateManage: (
    key: ManageKey,
    record: CategoryRecord | SupportRecord,
    field: string,
    value: string,
  ) => Promise<void>;
  removeManage: (key: ManageKey, record: CategoryRecord | SupportRecord) => Promise<void>;
  restoreManage: (key: ManageKey, record: CategoryRecord | SupportRecord) => Promise<void>;
  moveManage: (key: ManageKey, id: string, direction: -1 | 1) => Promise<void>;
}

const EMPTY_DB: AdminDb = {
  doctors: [],
  facilities: [],
  events: [],
  support: [],
  categories: { doctors: [], facilities: [], events: [] },
};

const AdminContext = createContext<AdminContextValue | null>(null);

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return 'Something went wrong. Please try again.';
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdmin must be used inside AdminProvider');
  return value;
}

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [db, setDb] = useState<AdminDb>(EMPTY_DB);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { resolve: (value: boolean) => void }) | null
  >(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (message: string, kind: 'err' | '' = '', options?: { undo?: () => void | Promise<void> }) => {
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { id, message, kind, undo: options?.undo };
      setToasts((current) => [...current, item]);
      const timer = setTimeout(() => {
        setToasts((current) => current.filter((row) => row.id !== id));
        timers.current.delete(id);
      }, options?.undo ? 10000 : 4500);
      timers.current.set(id, timer);
    },
    [],
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const resolveConfirm = useCallback(
    (value: boolean) => {
      setConfirmState((current) => {
        if (current) current.resolve(value);
        return null;
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    const next = await loadAll();
    setDb(next);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sessionUser = readAdminSession();
        if (!active) return;
        setUser(sessionUser);
        if (sessionUser) {
          const next = await loadAll();
          if (active) setDb(next);
        }
      } catch (error) {
        console.error('MGRH admin could not load content.', error);
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  const login = useCallback(async (name: string, role: AdminRole) => {
    const sessionUser: SessionUser = { name: name.trim() || 'Hospital staff', role };
    writeAdminSession(sessionUser);
    setUser(sessionUser);
    try {
      const next = await loadAll();
      setDb(next);
    } catch (error) {
      console.error('MGRH admin could not load content.', error);
    }
    return sessionUser;
  }, []);

  const logout = useCallback(async () => {
    clearAdminSession();
    setUser(null);
    setDb(EMPTY_DB);
  }, []);

  const saveDoctor = useCallback(
    async (record: DoctorRecord) => {
      await saveDoctorRow(record);
      await refresh();
    },
    [refresh],
  );

  const saveFacility = useCallback(
    async (record: FacilityRecord) => {
      await saveFacilityRow(record);
      await refresh();
    },
    [refresh],
  );

  const saveEvent = useCallback(
    async (record: EventRecord) => {
      await saveEventRow(record);
      await refresh();
    },
    [refresh],
  );

  const toggleVisibility = useCallback(
    async (collection: Collection, record: DoctorRecord | FacilityRecord | EventRecord) => {
      if (collection === 'events') {
        const event = record as EventRecord;
        const next = event.status === 'published' ? 'draft' : 'published';
        await setStatus('events', event.id, next);
        await refresh();
        toast(next === 'published' ? 'Published.' : 'Moved to draft.');
        return;
      }
      const visible = (record as DoctorRecord | FacilityRecord).visible;
      await setStatus(collection, record.id, visible ? 'draft' : 'published');
      await refresh();
      toast(visible ? 'Hidden from the website.' : 'Now shown on the website.');
    },
    [refresh, toast],
  );

  const removeRecord = useCallback(
    async (collection: Collection, record: DoctorRecord | FacilityRecord | EventRecord) => {
      await deleteRow(collection, record.id);
      await refresh();
    },
    [refresh],
  );

  const restoreRecord = useCallback(
    async (collection: Collection, record: DoctorRecord | FacilityRecord | EventRecord) => {
      if (collection === 'doctors') await saveDoctorRow(record as DoctorRecord);
      else if (collection === 'facilities') await saveFacilityRow(record as FacilityRecord);
      else await saveEventRow(record as EventRecord);
      await refresh();
    },
    [refresh],
  );

  const orderedFor = useCallback(
    (collection: Collection) => {
      if (collection === 'doctors') return db.doctors;
      if (collection === 'facilities') return db.facilities;
      return db.events;
    },
    [db],
  );

  const moveRecord = useCallback(
    async (collection: Collection, id: string, direction: -1 | 1) => {
      const list = [...orderedFor(collection)];
      const index = list.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return;
      [list[index], list[target]] = [list[target], list[index]];
      await updateOrder(collection, list);
      await refresh();
    },
    [orderedFor, refresh],
  );

  const reorderRecord = useCallback(
    async (collection: Collection, fromId: string, toId: string) => {
      const list = [...orderedFor(collection)];
      const from = list.findIndex((item) => item.id === fromId);
      const to = list.findIndex((item) => item.id === toId);
      if (from < 0 || to < 0 || from === to) return;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      await updateOrder(collection, list);
      await refresh();
    },
    [orderedFor, refresh],
  );

  const listFor = useCallback(
    (key: ManageKey) => {
      if (key === 'support') return db.support;
      if (key === 'specialties') return db.categories.doctors;
      if (key === 'sections') return db.categories.facilities;
      return db.categories.events;
    },
    [db],
  );

  const categoryKind = (key: ManageKey): Collection =>
    key === 'specialties' ? 'doctors' : key === 'sections' ? 'facilities' : 'events';

  const addManage = useCallback(
    async (key: ManageKey, requested?: string) => {
      const list = listFor(key);
      if (key === 'support') {
        const record: SupportRecord = {
          id: crypto.randomUUID(),
          count: '',
          title: requested?.trim() || 'New role',
          description: '',
          order: list.length,
        };
        await addSupport(record);
        await refresh();
        return record.id;
      }
      const fallback =
        key === 'specialties' ? 'New specialty' : key === 'sections' ? 'New section' : 'New category';
      const name = requested?.trim() || fallback;
      const record = await addCategory(categoryKind(key), name, '', list.length);
      await refresh();
      return record.id;
    },
    [listFor, refresh],
  );

  const updateManage = useCallback(
    async (
      key: ManageKey,
      record: CategoryRecord | SupportRecord,
      field: string,
      value: string,
    ) => {
      if (key === 'support') {
        await updateSupportFields(record.id, { [field]: value });
      } else {
        await updateCategoryFields(record as CategoryRecord, {
          [field === 'tagline' ? 'tagline' : 'name']: value,
        });
      }
      await refresh();
    },
    [refresh],
  );

  const removeManage = useCallback(
    async (key: ManageKey, record: CategoryRecord | SupportRecord) => {
      await deleteRow(key, record.id);
      await refresh();
    },
    [refresh],
  );

  const restoreManage = useCallback(
    async (key: ManageKey, record: CategoryRecord | SupportRecord) => {
      if (key === 'support') await restoreSupport(record as SupportRecord);
      else await restoreCategory(record as CategoryRecord);
      await refresh();
    },
    [refresh],
  );

  const moveManage = useCallback(
    async (key: ManageKey, id: string, direction: -1 | 1) => {
      const list = [...listFor(key)];
      const index = list.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return;
      [list[index], list[target]] = [list[target], list[index]];
      await updateOrder(key, list);
      await refresh();
    },
    [listFor, refresh],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      ready,
      user,
      db,
      refresh,
      login,
      logout,
      toast,
      confirm,
      saveDoctor,
      saveFacility,
      saveEvent,
      toggleVisibility,
      removeRecord,
      restoreRecord,
      moveRecord,
      reorderRecord,
      listFor,
      addManage,
      updateManage,
      removeManage,
      restoreManage,
      moveManage,
    }),
    [
      ready,
      user,
      db,
      refresh,
      login,
      logout,
      toast,
      confirm,
      saveDoctor,
      saveFacility,
      saveEvent,
      toggleVisibility,
      removeRecord,
      restoreRecord,
      moveRecord,
      reorderRecord,
      listFor,
      addManage,
      updateManage,
      removeManage,
      restoreManage,
      moveManage,
    ],
  );

  return (
    <AdminContext.Provider value={value}>
      {children}
      <ConfirmBox
        state={confirmState}
        onCancel={() => resolveConfirm(false)}
        onConfirm={() => resolveConfirm(true)}
      />
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </AdminContext.Provider>
  );
}

export function errorMessage(error: unknown) {
  return messageOf(error);
}

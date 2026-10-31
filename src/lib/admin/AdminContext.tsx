'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  clampEd,
  drawTo,
  PRESETS,
  titleOf,
} from './format';
import * as S from './store';
import type {
  AdminDb,
  ConfirmState,
  EditorSrc,
  EditorState,
  MediaTarget,
  PreviewState,
  SessionUser,
  ToastState,
} from './types';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 5 * 1024 * 1024;

interface AdminContextValue {
  ready: boolean;
  db: AdminDb;
  user: SessionUser | null;
  topQ: string;
  setTopQ: (value: string) => void;
  setUser: (user: SessionUser | null) => void;
  signIn: (email: string, password: string) => Promise<SessionUser>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateSessionUser: (user: SessionUser) => void;
  guard: (fn: () => void) => void;
  toast: (msg: string, kind?: 'ok' | 'err') => void;
  confirm: (state: ConfirmState) => void;
  persist: (mut: (next: AdminDb) => void, act?: { action: string; type: string; title: string }) => boolean;
  can: (what: 'publish' | 'delete' | 'admin') => boolean;
  dirty: boolean;
  setDirty: (value: boolean) => void;
  preview: PreviewState | null;
  setPreview: (value: PreviewState | null) => void;
  picker: { target: MediaTarget } | null;
  setPicker: (value: { target: MediaTarget } | null) => void;
  pickFile: (target: MediaTarget, multiple?: boolean) => void;
  editMedia: (mediaId: string | null | undefined, target: MediaTarget) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  editor: EditorState | null;
  edSaving: boolean;
  queueCount: number;
  edSet: (patch: Partial<EditorState>) => void;
  edCancel: () => void;
  edRetry: () => void;
  edSave: () => void;
  toastState: ToastState | null;
  clearToast: () => void;
  confirmState: ConfirmState | null;
  closeConfirm: () => void;
  confirmOk: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdmin must be used inside AdminProvider');
  return value;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [db, setDb] = useState<AdminDb>(() => S.load());
  const [user, setUser] = useState<SessionUser | null>(null);
  const [topQ, setTopQ] = useState('');
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [picker, setPicker] = useState<{ target: MediaTarget } | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [edSaving, setEdSaving] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [dirty, setDirty] = useState(false);

  const dbRef = useRef(db);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef<File[]>([]);
  const targetRef = useRef<MediaTarget | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    dbRef.current = db;
  }, [db]);

  useEffect(() => {
    let alive = true;
    const unsubscribe = S.subscribe((next) => {
      if (alive) setDb(next);
    });
    S.init().then(() => {
      if (!alive) return;
      setDb(S.load());
      setUser(S.session());
      setReady(true);
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const toast = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastState({ msg, kind });
    toastTimer.current = setTimeout(() => setToastState(null), kind === 'err' ? 6000 : 3400);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const confirm = useCallback((state: ConfirmState) => setConfirmState(state), []);

  const guard = useCallback(
    (fn: () => void) => {
      if (!dirty) {
        fn();
        return;
      }
      setConfirmState({
        title: 'Discard unsaved changes?',
        body: 'You have changes on this page that haven’t been saved. If you leave now they will be lost.',
        confirmLabel: 'Discard changes',
        danger: true,
        onConfirm: () => {
          setDirty(false);
          fn();
        },
      });
    },
    [dirty],
  );

  const persist = useCallback(
    (mut: (next: AdminDb) => void, act?: { action: string; type: string; title: string }) => {
      try {
        const next: AdminDb = JSON.parse(JSON.stringify(dbRef.current));
        mut(next);
        if (act) {
          next.activity.unshift({ at: S.now(), who: (S.session() || {}).name || 'Admin', ...act });
          next.activity = next.activity.slice(0, 200);
        }
        S.commit(next);
        setDb(next);
        return true;
      } catch {
        toast('Couldn’t save. The browser’s storage is full. Delete unused images in the Media Library, then try again.', 'err');
        return false;
      }
    },
    [toast],
  );

  const can = useCallback(
    (what: 'publish' | 'delete' | 'admin') => {
      const current = S.session();
      if (!current) return false;
      if (current.role === 'Administrator') return true;
      if (what === 'publish') return !!dbRef.current.settings.editorsCanPublish;
      if (what === 'delete' || what === 'admin') return false;
      return true;
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const nextUser = await S.signIn(email.trim(), password);
    setDb(S.load());
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    await S.signOut();
    setDb(S.load());
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const updateSessionUser = useCallback((nextUser: SessionUser) => {
    S.setSession(nextUser);
    setUser(nextUser);
  }, []);

  const pickFile = useCallback((target: MediaTarget, multiple = false) => {
    targetRef.current = target;
    const el = fileInputRef.current;
    if (!el) return;
    el.value = '';
    el.multiple = !!multiple;
    el.click();
  }, []);

  const presetFor = useCallback((target: MediaTarget): 'doctor' | 'facility' | 'event' => {
    if (target.kind === 'doctor') return 'doctor';
    if (target.kind === 'cover') return 'event';
    return (target.preset as 'doctor' | 'facility' | 'event') || 'facility';
  }, []);

  const editFile = useCallback((file: File, target: MediaTarget) => {
    const preset = presetFor(target);
    setEditor({
      target,
      preset,
      loading: true,
      error: '',
      src: { name: file.name, size: file.size, type: file.type, w: 0, h: 0 },
      zoom: 1,
      x: 0,
      y: 0,
      rot: 0,
      img: null,
      fileUrl: null,
    });
    const fr = new FileReader();
    fr.onerror = () =>
      setEditor((prev) =>
        prev ? { ...prev, loading: false, error: 'The file couldn’t be read. Try choosing it again.' } : prev,
      );
    fr.onload = () => {
      const img = new Image();
      img.onload = () =>
        setEditor((prev) =>
          prev
            ? {
                ...prev,
                loading: false,
                img,
                fileUrl: String(fr.result),
                src: { ...prev.src, w: img.naturalWidth, h: img.naturalHeight },
              }
            : prev,
        );
      img.onerror = () =>
        setEditor((prev) =>
          prev
            ? { ...prev, loading: false, error: 'This file couldn’t be opened as an image. Try a different JPG, PNG or WebP file.' }
            : prev,
        );
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  }, [presetFor]);

  const editMedia = useCallback((mediaId: string | null | undefined, target: MediaTarget) => {
    const m = dbRef.current.media.find((x) => x.id === mediaId);
    if (!m) return;
    const url = m.originalDataUrl || m.originalSrc || m.src || m.dataUrl || '';
    const preset = presetFor(target);
    const keepCrop = m.crop && m.preset === preset;
    setEditor({
      target,
      preset,
      loading: true,
      error: '',
      src: { name: m.name, size: m.size, type: m.type, w: 0, h: 0 },
      zoom: keepCrop && m.crop ? m.crop.zoom : 1,
      x: keepCrop && m.crop ? m.crop.x : 0,
      y: keepCrop && m.crop ? m.crop.y : 0,
      rot: keepCrop && m.crop ? m.crop.rot : 0,
      img: null,
      fileUrl: null,
      origUrl: m.originalDataUrl || null,
      origSrc: m.originalSrc || m.src || null,
      parentId: m.parentId || m.id,
    });
    const img = new Image();
    img.onload = () =>
      setEditor((prev) =>
        prev
          ? { ...prev, loading: false, img, src: { ...prev.src, w: img.naturalWidth, h: img.naturalHeight } }
          : prev,
      );
    img.onerror = () =>
      setEditor((prev) => (prev ? { ...prev, loading: false, error: 'The original image couldn’t be loaded.' } : prev));
    img.src = url;
  }, [presetFor]);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;
      const ok: File[] = [];
      files.forEach((f) => {
        if (!ACCEPT.includes(f.type)) toast('“' + f.name + '” isn’t a supported image. Use a JPG, PNG or WebP file.', 'err');
        else if (f.size > MAX) toast('“' + f.name + '” is ' + (f.size / 1048576).toFixed(1) + ' MB. The maximum is 5 MB.', 'err');
        else ok.push(f);
      });
      if (!ok.length) return;
      const target = targetRef.current;
      if (!target) return;
      queueRef.current = ok.slice(1);
      setQueueCount(queueRef.current.length);
      editFile(ok[0], target);
    },
    [editFile, toast],
  );

  const nextQueued = useCallback(() => {
    const f = queueRef.current.shift();
    setQueueCount(queueRef.current.length);
    const target = targetRef.current;
    if (f && target) setTimeout(() => editFile(f, target), 120);
  }, [editFile]);

  const edSet = useCallback((patch: Partial<EditorState>) => {
    setEditor((prev) => (prev ? clampEd({ ...prev, ...patch }) : prev));
  }, []);

  const edCancel = useCallback(() => {
    setEditor(null);
    nextQueued();
  }, [nextQueued]);

  const edRetry = useCallback(() => {
    const target = editor && editor.target;
    setEditor(null);
    if (target) pickFile(target, false);
  }, [editor, pickFile]);

  const edSave = useCallback(() => {
    const ed = editor;
    if (!ed || !ed.img) return;
    const P = PRESETS[ed.preset];
    const c = document.createElement('canvas');
    c.width = P.w;
    c.height = P.h;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    drawTo(ctx, P.w, P.h, ed, false);
    let url: string;
    try {
      url = c.toDataURL('image/jpeg', 0.86);
    } catch {
      setEditor((prev) => (prev ? { ...prev, error: 'This image couldn’t be processed. Try uploading it again.' } : prev));
      return;
    }
    const t = ed.target;
    const asset = {
      id: S.uid('m'),
      name: (ed.src.name || 'image').replace(/\.[a-z]+$/i, '') + '.jpg',
      dataUrl: url,
      src: '',
      width: P.w,
      height: P.h,
      size: Math.round(url.length * 0.75),
      type: 'image/jpeg',
      uploadedAt: S.now(),
      preset: ed.preset,
      crop: { zoom: ed.zoom, x: ed.x, y: ed.y, rot: ed.rot },
      source: { ...ed.src },
      originalDataUrl: ed.fileUrl && ed.fileUrl.length < 1600000 ? ed.fileUrl : ed.origUrl || null,
      originalSrc: ed.origSrc || null,
      parentId: ed.parentId || null,
    };
    setEdSaving(true);
    setTimeout(() => {
      let ok = false;
      if (t.kind === 'media') {
        ok = persist(
          (next) => {
            const i = next.media.findIndex((m) => m.id === t.mediaId);
            if (i >= 0) next.media[i] = { ...asset, id: t.mediaId as string, uploadedAt: next.media[i].uploadedAt, name: next.media[i].name };
          },
          { action: 'Replaced image', type: 'Media', title: asset.name },
        );
        if (ok) toast('Image replaced. Every page using it now shows the new version.');
      } else {
        ok = persist(
          (next) => {
            next.media.unshift(asset);
          },
          { action: 'Uploaded image', type: 'Media', title: asset.name },
        );
        if (ok) {
          if (t.kind !== 'library' && t.assign) t.assign(asset.id);
          toast(t.kind === 'library' ? 'Image added to the Media Library.' : 'Image ready. Save the record to keep this change.');
        }
      }
      setEdSaving(false);
      if (ok) {
        setEditor(null);
        nextQueued();
      }
    }, 300);
  }, [editor, nextQueued, persist, toast]);

  const closeConfirm = useCallback(() => setConfirmState(null), []);
  const confirmOk = useCallback(() => {
    const fn = confirmState && confirmState.onConfirm;
    setConfirmState(null);
    if (fn) fn();
  }, [confirmState]);
  const clearToast = useCallback(() => setToastState(null), []);

  const value: AdminContextValue = {
    ready,
    db,
    user,
    topQ,
    setTopQ,
    setUser,
    signIn,
    signOut,
    logout,
    updateSessionUser,
    guard,
    toast,
    confirm,
    persist,
    can,
    dirty,
    setDirty,
    preview,
    setPreview,
    picker,
    setPicker,
    pickFile,
    editMedia,
    fileInputRef,
    editor,
    edSaving,
    queueCount,
    edSet,
    edCancel,
    edRetry,
    edSave,
    toastState,
    clearToast,
    confirmState,
    closeConfirm,
    confirmOk,
    onFileChange,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
    </AdminContext.Provider>
  );
}

export function recordTitleOf(rec: { name?: string; title?: string } | null | undefined): string {
  return titleOf(rec);
}

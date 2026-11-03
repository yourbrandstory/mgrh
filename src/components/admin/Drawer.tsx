'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { errorMessage, useAdmin } from './AdminProvider';
import Icon from './Icon';
import type { Status } from '@/lib/admin/types';

export interface DrawerButton {
  label: string;
  status?: Status;
}

export default function Drawer<T>({
  title,
  draft,
  initial,
  buttons,
  validate,
  onSave,
  onClose,
  children,
}: {
  title: string;
  draft: T;
  initial: string;
  buttons: DrawerButton[];
  validate: (draft: T) => string | null;
  onSave: (draft: T, status?: Status) => Promise<void>;
  onClose: () => void;
  children: ReactNode;
}) {
  const admin = useAdmin();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const close = useCallback(async () => {
    if (busy) return;
    if (JSON.stringify(draft) !== initial) {
      const ok = await admin.confirm({
        title: 'Discard your changes?',
        text: 'You have changes that are not saved yet.',
        ok: 'Discard',
        danger: true,
      });
      if (!ok) return;
    }
    onClose();
  }, [admin, busy, draft, initial, onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.querySelector('.ed, .cback')) return;
      void close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    const first = document.querySelector('.drawer input[type=text]') as HTMLInputElement | null;
    first?.focus();
  }, []);

  const save = async (index: number) => {
    if (busy) return;
    const button = buttons[index];
    const record = button.status ? { ...(draft as Record<string, unknown>), status: button.status } : draft;
    const message = validate(record as T);
    if (message) {
      setError(message);
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ block: 'nearest' }));
      return;
    }
    setError('');
    setBusy(true);
    try {
      await onSave(record as T, button.status);
      onClose();
      admin.toast(
        button.status === 'draft'
          ? 'Saved as draft. It is not on the website yet.'
          : 'Saved. The website now shows your changes.',
      );
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(false);
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ block: 'nearest' }));
    }
  };

  return (
    <div
      className="back"
      id="dback"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) void close();
      }}
    >
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dh">
          <h2>{title}</h2>
          <button className="ibtn" type="button" aria-label="Close" onClick={() => void close()}>
            <Icon name="x" />
          </button>
        </div>
        <div className="db">
          <div id="derr" ref={errorRef}>
            {error ? (
              <div className="err" role="alert">
                {error}
              </div>
            ) : null}
          </div>
          {children}
        </div>
        <div className="df">
          <button className="btn" type="button" onClick={() => void close()}>
            Cancel
          </button>
          {buttons.map((button, index) => (
            <button
              key={button.label + index}
              className="btn pri"
              type="button"
              disabled={busy}
              onClick={() => void save(index)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

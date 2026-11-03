'use client';

import { useEffect, useRef } from 'react';

export interface ConfirmOptions {
  title: string;
  text: string;
  ok?: string;
  danger?: boolean;
}

export default function ConfirmBox({
  state,
  onCancel,
  onConfirm,
}: {
  state: (ConfirmOptions & { resolve: (value: boolean) => void }) | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!state) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state, onCancel]);

  if (!state) return null;

  return (
    <div className="back cback" role="presentation">
      <div className="cbox" role="alertdialog" aria-modal="true" aria-label={state.title}>
        <h2 style={{ fontSize: 20 }}>{state.title}</h2>
        <p style={{ color: 'var(--mut)' }}>{state.text}</p>
        <div className="acts">
          <button className="btn" ref={cancelRef} type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={'btn pri ' + (state.danger ? 'dng' : '')}
            type="button"
            onClick={onConfirm}
          >
            {state.ok || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

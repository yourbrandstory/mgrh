'use client';

export interface ToastItem {
  id: string;
  message: string;
  kind: 'err' | '';
  undo?: () => void | Promise<void>;
}

export default function Toasts({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div id="toasts" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className={'toast ' + item.kind}>
          <span>{item.message}</span>
          {item.undo ? (
            <button
              type="button"
              onClick={async () => {
                onDismiss(item.id);
                await item.undo?.();
              }}
            >
              Undo
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

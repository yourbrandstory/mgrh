'use client';

import { useEffect } from 'react';
import { AdminIcon } from './icons';

export const inputClass =
  'w-full rounded-lg border border-[#D5E2DE] bg-white px-3.5 text-[15.5px] text-[#16413A] placeholder:text-[#9AABA6] focus:border-[#9FD0C7]';

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14.5px] font-semibold text-[#23423B]">
        {label} {required && <span className="text-[#C42A21]">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-[13px] text-[#7A8C87]">{hint}</span>}
      {error && <span className="mt-1 block text-[13px] font-medium text-[#B4251E]">{error}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} h-[44px] ${props.className || ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-[92px] py-2.5 leading-[1.55] ${props.className || ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} h-[44px] ${props.className || ''}`} />;
}

export function StatusBadge({ status }: { status: string }) {
  const live = status === 'published';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${
        live ? 'bg-[#E3F5F0] text-[#0B7A69]' : 'bg-[#F3F5F4] text-[#7A8C87]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-[#0A8E7B]' : 'bg-[#9AABA6]'}`} />
      {live ? 'Published' : 'Draft'}
    </span>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-[rgba(9,45,40,0.5)] px-4 py-8 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`admin-modal-anim my-auto w-full ${wide ? 'max-w-[1000px]' : 'max-w-[720px]'} overflow-hidden rounded-2xl bg-white shadow-[0_44px_92px_-32px_rgba(6,50,44,0.6)]`}
      >
        <div className="flex items-start justify-between gap-5 border-b border-[#E2ECE9] px-6 py-5">
          <div>
            <h2 className="text-[23px] font-semibold leading-tight text-[#0B3C49]">{title}</h2>
            {subtitle && <p className="mt-1 text-[14.5px] text-[#5A6A66]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-[#E2ECE9] text-[#45605A] hover:bg-[#F1F8F6]">
            <AdminIcon name="close" size={18} />
          </button>
        </div>
        <div className="max-h-[calc(100vh-230px)] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-[#E2ECE9] bg-[#FAFCFB] px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger'; icon?: string }) {
  const styles = {
    primary: 'bg-[#0A8E7B] text-white hover:bg-[#0B7F73]',
    outline: 'border border-[#9FD0C7] bg-white text-[#0B5F55] hover:border-[#0A8E7B]',
    ghost: 'bg-transparent text-[#45605A] hover:bg-[#F1F8F6]',
    danger: 'border border-[#F6D8D5] bg-white text-[#B4251E] hover:bg-[#FDF1F0]',
  };
  return (
    <button
      {...props}
      className={`inline-flex h-[42px] items-center justify-center gap-2 rounded-lg px-4 text-[14.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
    >
      {icon && <AdminIcon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D5E2DE] bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F8F6] text-[#0A8E7B]">
        <AdminIcon name="image" size={24} />
      </div>
      <h3 className="text-[19px] font-semibold text-[#0B3C49]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[460px] text-[15px] leading-[1.6] text-[#5A6A66]">{text}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Toast({ message, tone = 'ok' }: { message: string; tone?: 'ok' | 'err' }) {
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-[160] -translate-x-1/2 rounded-xl px-5 py-3 text-[14.5px] font-semibold shadow-[0_22px_44px_-20px_rgba(10,50,44,0.5)] ${
        tone === 'err' ? 'bg-[#9E2018] text-white' : 'bg-[#0B3C49] text-white'
      }`}
    >
      {message}
    </div>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Confirm',
  tone = 'primary',
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            className={tone === 'danger' ? '!border-[#C42A21] !bg-[#C42A21] !text-white' : ''}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[15.5px] leading-[1.65] text-[#45605A]">{body}</p>
    </Modal>
  );
}

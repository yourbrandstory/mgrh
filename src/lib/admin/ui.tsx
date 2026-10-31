'use client';

import type { CSSProperties, ChangeEvent } from 'react';

export const IC = {
  dash: ['M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z'],
  doc: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 20.5a7.5 7.5 0 0 1 15 0'],
  fac: ['M4 20.5V9.4l8-5 8 5v11.1', 'M2.5 20.5h19', 'M12 10.4v5.2M9.4 13h5.2'],
  evt: ['M4 6.5h16v14H4z', 'M4 11h16', 'M8.5 4v4M15.5 4v4'],
  media: ['M4 5h16v14H4z', 'M4 16l5-5 4 4 3-3 4 4', 'M15.5 9.5h.01'],
  set: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
  ],
};

export function Icon({ paths, color, size = 19 }: { paths: string[]; color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export const selStyle: CSSProperties = {
  height: 44,
  padding: '0 12px',
  border: '1px solid #D5E2DE',
  borderRadius: 8,
  background: '#fff',
  fontFamily: 'inherit',
  fontSize: 15.5,
  color: '#16413A',
  minWidth: 170,
};

export function Sel({
  value,
  options,
  onChange,
  extra,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  extra?: CSSProperties;
}) {
  return (
    <select value={value} onChange={onChange} style={{ ...selStyle, ...(extra || {}) }}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

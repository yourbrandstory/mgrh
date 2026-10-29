import type { ProgrammeIcon } from '../data/siteContent';

type IconProps = { size?: number; color?: string; className?: string };

export function ArrowRight({ size = 17, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h13M12 5.5l6.5 6.5L12 18.5" />
    </svg>
  );
}

export function AlertCircle({ size = 18, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}
      strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5v6M12 16.6v.4" />
    </svg>
  );
}

export function PhoneFilled({ size = 19, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className="flex-none" aria-hidden="true">
      <path d="M6.6 2.2c.5-.1 1 .2 1.1.7l1.1 4.6c.1.4-.1.9-.5 1.1L6.4 9.8a13.5 13.5 0 0 0 7.8 7.8l1.2-1.9c.2-.4.7-.6 1.1-.5l4.6 1.1c.5.1.8.6.7 1.1-.5 2.6-2.8 4.4-5.4 4.3C9.1 21.3 2.7 14.9 2.3 7.6 2.2 5 4 2.7 6.6 2.2Z" />
    </svg>
  );
}

export function PhotoIcon({ size = 15, color = '#0B6558' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
    </svg>
  );
}

export function CloseIcon({ size = 18, color = '#0B4F45' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}
      strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon({ size = 26, color = '#0B4F45' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}
      strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

const programmePaths: Record<ProgrammeIcon, string[]> = {
  heart: ['M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20Z'],
  building: ['M4 20.5V9.4l8-5 8 5v11.1', 'M2.5 20.5h19', 'M12 10.4v5.2M9.4 13h5.2'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'M16.2 16.2 21 21'],
  school: ['M3.5 9 12 5l8.5 4-8.5 4L3.5 9Z', 'M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11'],
};

export function ProgrammeGlyph({ name, size = 25, color = '#0A5F52' }: IconProps & { name: ProgrammeIcon }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {programmePaths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

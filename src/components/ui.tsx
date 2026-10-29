import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from './Icons';

/** Pill button. Internal paths use the router; tel:, mailto: and http links use a plain <a>. */
export function PillLink({
  to,
  children,
  variant = 'primary',
  arrow = false,
  className = '',
}: {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'white' | 'danger' | 'danger-outline';
  arrow?: boolean;
  className?: string;
}) {
  const styles: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:text-white',
    outline: 'border border-[#9FD0C7] bg-white/70 text-[#0B5F55] hover:bg-white hover:text-[#0B5F55]',
    white: 'bg-white text-primary-dark hover:bg-mint-2 hover:text-primary-dark',
    danger: 'bg-emergency text-white hover:bg-[#C42A21] hover:text-white',
    'danger-outline': 'border border-[#E9B3AF] text-[#B4251E] hover:bg-white hover:text-[#B4251E]',
  };
  const cls = `inline-flex items-center gap-[11px] rounded-full px-6 py-[14px] text-[17px] font-bold transition-colors md:px-[30px] md:py-4 md:text-[20px] ${styles[variant]} ${className}`;
  const content = (
    <>
      {children}
      {arrow && <ArrowRight />}
    </>
  );
  const external = /^(https?:|tel:|mailto:)/.test(to);
  return external ? (
    <a href={to} className={cls} {...(to.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {content}
    </a>
  ) : (
    <Link href={to} className={cls}>
      {content}
    </Link>
  );
}

/** "— Our facilities  14 departments" style heading used across sections. */
export function SectionHeading({
  lead,
  bold,
  meta,
  size = 'md',
}: {
  lead: string;
  bold: string;
  meta?: ReactNode;
  size?: 'md' | 'sm';
}) {
  return (
    <div className="mb-[14px] flex flex-wrap items-baseline gap-4">
      <span className="h-1 w-[30px] flex-none rounded-sm bg-primary" />
      <h2 className={`m-0 font-medium text-heading ${size === 'md' ? 'text-[30px] md:text-[36px]' : 'text-[29px] md:text-[34px]'}`}>
        {lead} <span className="font-bold">{bold}</span>
      </h2>
      {meta}
    </div>
  );
}

export const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`mb-4 text-[14px] font-semibold uppercase tracking-[0.14em] text-teal md:text-[16px] ${className}`}>{children}</div>
);

export const Container = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto max-w-site px-4 sm:px-[26px] ${className}`}>{children}</div>
);

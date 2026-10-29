'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * Fades its content up (opacity 0 → 1, translateY 26px → 0) the first time it scrolls into view.
 * Content already on screen at load appears immediately.
 */
export default function Reveal({
  as: Tag = 'section',
  className = '',
  children,
  id,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      style={{ transition: 'opacity 0.8s, transform 0.9s cubic-bezier(0.2, 0.85, 0.3, 1)' }}
      className={`${className} motion-reduce:!transition-none ${
        shown ? 'opacity-100' : 'translate-y-[26px] opacity-0 motion-reduce:transform-none motion-reduce:opacity-100'
      }`}
    >
      {children}
    </Tag>
  );
}

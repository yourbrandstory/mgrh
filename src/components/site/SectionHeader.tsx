import type { CSSProperties } from 'react';

export function SectionHeader({ title, count, dashColor = '#0A8E7B', headingSize = 36, headingWeight = 500, headingColor = '#1F3A34', countColor = '#5A6A66', marginBottom = 14 }: { title: string; count?: string; dashColor?: string; headingSize?: number; headingWeight?: number; headingColor?: string; countColor?: string; marginBottom?: number }) {
  const wrapperStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: 16, marginBottom, flexWrap: 'wrap' };
  const dashStyle: CSSProperties = { width: 30, height: 4, borderRadius: 2, background: dashColor, flex: 'none' };
  const headingStyle: CSSProperties = { fontWeight: headingWeight, fontSize: headingSize, margin: 0, color: headingColor };
  const countStyle: CSSProperties = { fontSize: 18, fontWeight: 600, color: countColor };

  return (
    <div style={wrapperStyle}>
      <span style={dashStyle} />
      <h2 style={headingStyle}>{title}</h2>
      {count && <span style={countStyle}>{count}</span>}
    </div>
  );
}

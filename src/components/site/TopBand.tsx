'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

const locationIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx={12} cy={10} r={2.6} />
  </svg>
);

const clockIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7.5V12l3.4 2" />
  </svg>
);

const phoneIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" />
  </svg>
);

const mailIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CFEDEF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x={3} y={5} width={18} height={14} rx={2} />
    <path d="M3.5 6.5 12 13l8.5-6.5" />
  </svg>
);

const bandStyle: CSSProperties = { background: '#2AA5AE', color: '#E4F5F6' };
const containerStyle: CSSProperties = { maxWidth: 1800, margin: '0 auto', padding: '10px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', fontSize: '17.5px' };
const leftGroupStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' };
const rightGroupStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' };
const itemStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 9 };
const telItemStyle: CSSProperties = { ...itemStyle, color: '#ffffff', fontWeight: 600 };
const telLinkStyle: CSSProperties = { color: '#ffffff', textDecoration: 'none' };
const mailLinkStyle: CSSProperties = { color: '#F0FAFB', textDecoration: 'none' };

export function TopBand() {
  return (
    <div style={bandStyle}>
      <div style={containerStyle}>
        <div style={leftGroupStyle}>
          <span style={itemStyle}>{locationIcon}Mahabaleshwar - Medha Road, District - Satara – 412 806, Maharashtra</span>
          <span style={itemStyle}>{clockIcon}OPD time 09:00 am - 01:00 pm and 04:00 pm - 06:00 pm</span>
        </div>
        <div style={rightGroupStyle}>
          <span style={telItemStyle}>{phoneIcon}<a href="tel:+912168260247" style={telLinkStyle}>+91 21682 60247</a></span>
          <span style={itemStyle}>{mailIcon}<a href="mailto:info@mgrh-mahabaleshwar.org" style={mailLinkStyle}>info@mgrh-mahabaleshwar.org</a></span>
        </div>
      </div>
    </div>
  );
}

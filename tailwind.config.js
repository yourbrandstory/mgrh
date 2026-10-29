/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        primary: '#0A8E7B',        // buttons, active nav, accents
        'primary-dark': '#0B6558', // top band, link colour
        'primary-deep': '#0B4F45', // headings
        teal: '#0B7F73',           // eyebrow labels
        ink: '#16413A',            // body text
        body: '#45605A',           // paragraph text
        muted: '#5A6A66',
        soft: '#4E5F5A',
        nav: '#35514B',
        heading: '#1F3A34',
        mint: '#EAF5F2',
        'mint-2': '#E8F6F3',
        'mint-3': '#F4FAF8',
        line: '#DCEBE7',
        'line-2': '#E0EDE9',
        surface: '#EEF3F1',
        emergency: '#E1332A',
        'emergency-dark': '#9E2018',
        cyan: '#2BB2C4',
      },
      maxWidth: {
        site: '1800px',
      },
      keyframes: {
        mgBlink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.28' } },
        mgNudge: {
          '0%, 72%, 100%': { transform: 'translateX(0)' },
          '80%': { transform: 'translateX(5px)' },
          '90%': { transform: 'translateX(2px)' },
        },
        mgHalo: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(10,142,123,0.34)' },
          '55%': { boxShadow: '0 0 0 13px rgba(10,142,123,0)' },
        },
        mgPop: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.97)' },
          to: { opacity: '1', transform: 'none' },
        },
        mgVeil: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        blink: 'mgBlink 1.5s ease-in-out infinite',
        nudge: 'mgNudge 2.6s ease-in-out infinite',
        halo: 'mgHalo 2.6s ease-out infinite',
        pop: 'mgPop 0.34s cubic-bezier(0.2,0.85,0.3,1)',
        veil: 'mgVeil 0.24s ease',
      },
    },
  },
  plugins: [],
};

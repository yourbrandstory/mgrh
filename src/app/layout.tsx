import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mgrh-mahabaleshwar.org'),
  title: 'Morarji Gokuldas Rural Hospital, Mahabaleshwar | Free Healthcare Since 1914',
  description:
    'A 30-bed government rural hospital in Mahabaleshwar. Consultation, diagnostic tests, medicines and hospital stay — free of charge, for everyone. Casualty open 24 hours.',
  icons: { icon: '/images/logo.png' },
  openGraph: {
    title: 'Morarji Gokuldas Rural Hospital, Mahabaleshwar',
    description: 'Quality healthcare, provided free of charge — since 1914.',
    images: ['/images/hospital-building.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>{children}</body>
    </html>
  );
}

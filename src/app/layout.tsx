import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mgrh-mahabaleshwar.org'),
  title: 'Morarji Gokuldas Rural Hospital, Mahabaleshwar | Free Healthcare Since 1914',
  description:
    'A 30-bed government rural hospital in Mahabaleshwar. Consultation, diagnostic tests, medicines and hospital stay — free of charge, for everyone. Casualty open 24 hours.',
  icons: { icon: '/images/00-shared/logo.png' },
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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

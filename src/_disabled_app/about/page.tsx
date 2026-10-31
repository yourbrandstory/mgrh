import type { Metadata } from 'next';
import AboutPage from '@/legacy-pages/AboutPage';
import { settings } from '@/data/siteContent';

export const metadata: Metadata = { title: `About Us | ${settings.hospital_name}` };

export default function Page() {
  return <AboutPage />;
}

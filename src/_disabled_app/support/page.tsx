import type { Metadata } from 'next';
import SupportPage from '@/legacy-pages/SupportPage';
import { settings } from '@/data/siteContent';

export const metadata: Metadata = { title: `Support Us | ${settings.hospital_name}` };

export default function Page() {
  return <SupportPage />;
}

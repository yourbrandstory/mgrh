import type { Metadata } from 'next';
import EmergencyPage from '@/legacy-pages/EmergencyPage';
import { settings } from '@/data/siteContent';

export const metadata: Metadata = { title: `Emergency | ${settings.hospital_name}` };

export default function Page() {
  return <EmergencyPage />;
}

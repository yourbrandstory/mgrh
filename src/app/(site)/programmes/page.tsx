import type { Metadata } from 'next';
import ProgrammesPage from '@/legacy-pages/ProgrammesPage';
import { settings } from '@/data/siteContent';

export const metadata: Metadata = { title: `Programmes | ${settings.hospital_name}` };

export default function Page() {
  return <ProgrammesPage />;
}

import type { Metadata } from 'next';
import ContactPage from '@/legacy-pages/ContactPage';
import { settings } from '@/data/siteContent';

export const metadata: Metadata = { title: `Contact | ${settings.hospital_name}` };

export default function Page() {
  return <ContactPage />;
}

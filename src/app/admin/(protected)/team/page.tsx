import { redirect } from 'next/navigation';

// Team management now lives in Settings as the "Team & permissions" card.
export default function TeamPage() {
  redirect('/admin/settings');
}

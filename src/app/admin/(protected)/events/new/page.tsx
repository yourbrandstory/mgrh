import { redirect } from 'next/navigation';

export default function NewEventPage() {
  redirect('/admin/events?new=1');
}

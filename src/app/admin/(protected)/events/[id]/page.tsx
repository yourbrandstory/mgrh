import { redirect } from 'next/navigation';

export default function EditEventPage({ params }: { params: { id: string } }) {
  redirect(`/admin/events?edit=${params.id}`);
}

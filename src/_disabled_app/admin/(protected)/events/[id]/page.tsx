import { redirect } from 'next/navigation';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/events?edit=${id}`);
}

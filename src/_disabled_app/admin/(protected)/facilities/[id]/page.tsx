import { redirect } from 'next/navigation';

export default async function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/facilities?edit=${id}`);
}

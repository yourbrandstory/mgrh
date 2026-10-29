import { redirect } from 'next/navigation';

export default function EditFacilityPage({ params }: { params: { id: string } }) {
  redirect(`/admin/facilities?edit=${params.id}`);
}

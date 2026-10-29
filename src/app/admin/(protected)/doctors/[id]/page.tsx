import { redirect } from 'next/navigation';

export default function EditDoctorPage({ params }: { params: { id: string } }) {
  redirect(`/admin/doctors?edit=${params.id}`);
}

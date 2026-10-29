import { redirect } from 'next/navigation';

export default function NewDoctorPage() {
  redirect('/admin/doctors?new=1');
}

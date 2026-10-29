import { redirect } from 'next/navigation';

export default function NewFacilityPage() {
  redirect('/admin/facilities?new=1');
}

import { getDoctors } from '@/lib/content';
import DoctorsView from './DoctorsView';
import { canonicalSpeciality, fallbackDoctors, type DoctorItem } from './data';

function toItem(row: Awaited<ReturnType<typeof getDoctors>>['rows'][number]): DoctorItem {
  const hours =
    row.schedule ||
    [[...row.days].join(', '), row.start && row.end ? `${row.start} – ${row.end}` : ''].filter(Boolean).join(', ');

  return {
    name: row.name,
    role: row.designation,
    speciality: canonicalSpeciality(row.speciality),
    qualification: [row.qualifications, row.experience && `${row.experience} experience`].filter(Boolean).join(' · '),
    bio: row.bio,
    hours,
    location: row.location,
  };
}

export default async function DoctorsPage() {
  const { rows } = await getDoctors();
  const doctors = rows.length ? rows.map(toItem) : fallbackDoctors;

  return <DoctorsView doctors={doctors} />;
}

import { getCategoryRecords, getDoctors, getSupportStaff } from '@/lib/content';
import DoctorsView from './DoctorsView';
import { fallbackDoctors, supportRows, type DoctorItem, type SupportRow } from './data';

function canonical(value: string, names: string[]) {
  const match = names.find((name) => name.toLowerCase() === value.trim().toLowerCase());
  return match || value.trim();
}

function toItem(
  row: Awaited<ReturnType<typeof getDoctors>>['rows'][number],
  names: string[],
): DoctorItem {
  const hours =
    row.schedule ||
    [[...row.days].join(', '), row.start && row.end ? `${row.start} – ${row.end}` : ''].filter(Boolean).join(', ');

  return {
    name: row.name,
    role: row.designation,
    speciality: canonical(row.speciality, names),
    qualification: [row.qualifications, row.experience && `${row.experience} experience`].filter(Boolean).join(' · '),
    bio: row.bio,
    hours,
    location: row.location,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
  };
}

function buildFilters(doctors: DoctorItem[], names: string[]) {
  const filters = ['All doctors'];
  for (const name of [...names, ...doctors.map((doctor) => doctor.speciality)]) {
    const value = name.trim();
    if (value && !filters.some((existing) => existing.toLowerCase() === value.toLowerCase())) filters.push(value);
  }
  return filters;
}

export default async function DoctorsPage() {
  const [{ rows }, supportDb, categories] = await Promise.all([
    getDoctors(),
    getSupportStaff(),
    getCategoryRecords('doctors'),
  ]);

  const names = categories.map((category) => category.name);
  const doctors = rows.length ? rows.map((row) => toItem(row, names)) : fallbackDoctors;
  const support: SupportRow[] = supportDb
    ? supportDb
        .filter((row) => row.title.trim())
        .map((row) => ({ count: row.count, title: row.title, desc: row.description }))
    : supportRows;

  return <DoctorsView doctors={doctors} filters={buildFilters(doctors, names)} support={support} />;
}

export interface Milestone {
  year: string;
  text: string;
}

export interface Glance {
  value: string;
  label: string;
}

export interface Centre {
  name: string;
  count: string;
  img: string;
}

export interface Programme {
  name: string;
  desc: string;
  iconPaths: string[];
}

export interface EventItem {
  day: string;
  month: string;
  title: string;
  venue: string;
}

export interface SupportItem {
  title: string;
  desc: string;
  cta: string;
  accent: string;
}

export interface ReachRow {
  label: string;
  value: string;
}

export interface GalleryShot {
  label: string;
  ratio: string;
  span: string;
}

export const milestones: Milestone[] = [
  { year: '1914', text: 'Shri Moraji Gokuldas donates the hospital building to the Central Government.' },
  { year: '1962', text: 'Handed to the Zilla Parishad, Satara, running as a primary health centre.' },
  { year: '1988', text: 'Transferred to the Government of Maharashtra on 1st February.' },
  { year: '2019', text: 'Tripartite agreement with the Indian Red Cross Society and Bel-Air, Panchgani.' },
];

export const glance: Glance[] = [
  { value: '1914', label: 'The year the hospital was donated' },
  { value: '14', label: 'Departments on a single campus' },
  { value: '24 hrs', label: 'Casualty, every day of the year' },
  { value: '₹0', label: 'Charged — consultation to discharge' },
];

export const centres: Centre[] = [
  { name: 'Casualty & Critical Care', count: '3 units', img: '/images/contact-building.png' },
  { name: 'Operation Theatres', count: '2 theatres', img: '/images/photo-ot-banner.png' },
  { name: 'Maternity & Newborn', count: '4 units', img: '/images/photo-icu-bed.png' },
];

export const programmes: Programme[] = [
  {
    name: 'Mother and Child Health',
    desc: 'Mother and Child Health Clinic services are provided as part of the hospital’s community health programmes.',
    iconPaths: ['M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20Z'],
  },
  {
    name: 'National Control Programmes',
    desc: 'Tuberculosis, leprosy and non-communicable disease care under the national schemes.',
    iconPaths: ['M4 20.5V9.4l8-5 8 5v11.1', 'M2.5 20.5h19', 'M12 10.4v5.2M9.4 13h5.2'],
  },
  {
    name: 'Screening Camps',
    desc: 'The hospital conducts screening programmes for cancer as part of its community health initiatives.',
    iconPaths: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'M16.2 16.2 21 21'],
  },
  {
    name: 'School Health Clinics',
    desc: 'The hospital conducts School Health Clinics as part of its community health programmes.',
    iconPaths: ['M3.5 9 12 5l8.5 4-8.5 4L3.5 9Z', 'M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11'],
  },
];

export const events: EventItem[] = [
  { day: '12', month: 'Jul', title: 'Voluntary Blood Donation Camp', venue: 'Hospital campus, Mahabaleshwar' },
  { day: '21', month: 'Jun', title: 'Free Eye Screening & Cataract Camp', venue: 'OPD block, Mahabaleshwar' },
  { day: '08', month: 'May', title: 'School Health Check-up Drive', venue: 'Zilla Parishad School, Metgutad' },
];

export const support: SupportItem[] = [
  {
    title: 'Volunteer with us',
    desc: 'Camp support, patient guidance at the OPD counter, or clinical volunteering for qualified staff and students.',
    cta: 'See the roles',
    accent: '#2BB2C4',
  },
  {
    title: 'Not sure how you can help?',
    desc: 'Call the office and ask what is needed this month — equipment, a few hours, or a camp to host.',
    cta: 'Talk to the office',
    accent: '#E1332A',
  },
  {
    title: 'Make a donation',
    desc: 'Your support can help the hospital continue providing essential healthcare services free of charge.',
    cta: 'How to give',
    accent: '#0A8E7B',
  },
];

export const reachRows: ReachRow[] = [
  { label: 'Address', value: 'Mahabaleshwar - Medha Road, District - Satara – 412 806, Maharashtra' },
  { label: 'Telephone', value: '+91 21682 60247' },
  { label: 'Email', value: 'info@mgrh-mahabaleshwar.org' },
  { label: 'OPD hours', value: '09:00 am – 01:00 pm and 04:00 pm – 06:00 pm' },
];

export const galleryShots: GalleryShot[] = [
  { label: 'General view', ratio: '16/9', span: 'span 2' },
  { label: 'Clinic in progress', ratio: '4/3', span: 'auto' },
  { label: 'Staff and health workers', ratio: '3/2', span: 'auto' },
  { label: 'Records and follow-up', ratio: '4/3', span: 'auto' },
  { label: 'Out in the villages', ratio: '3/2', span: 'auto' },
];

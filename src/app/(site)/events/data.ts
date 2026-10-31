export interface EventItem {
  id: string;
  category: string;
  title: string;
  dateShort: string;
  dateLong: string;
  venue: string;
  summary: string;
  shots: string[];
  photos?: (string | null)[];
  coverImageUrl?: string | null;
}

export const events: EventItem[] = [
  {
    id: 'blood-jul-2026',
    category: 'Blood donation',
    title: 'Voluntary Blood Donation Camp',
    dateShort: '12 Jul 2026',
    dateLong: 'Sunday, 12 July 2026',
    venue: 'Hospital campus, Mahabaleshwar',
    summary: 'Held with local youth groups; units collected support maternity and emergency cases at the hospital.',
    shots: ['Registration desk', 'Donors at the couches', 'Screening and haemoglobin check', 'Collected units logged', 'Volunteers and staff', 'Refreshment counter'],
  },
  {
    id: 'eye-jun-2026',
    category: 'Screening camp',
    title: 'Free Eye Screening & Cataract Camp',
    dateShort: '21 Jun 2026',
    dateLong: 'Sunday, 21 June 2026',
    venue: 'OPD block, Mahabaleshwar',
    summary: 'Vision testing for villagers from surrounding hamlets, with referral for cataract surgery where needed.',
    shots: ['Vision chart testing', 'Waiting area', 'Ophthalmologist consultation', 'Spectacles handed out', 'Referral counter'],
  },
  {
    id: 'school-may-2026',
    category: 'School clinic',
    title: 'School Health Check-up Drive',
    dateShort: '08 May 2026',
    dateLong: 'Friday, 8 May 2026',
    venue: 'Zilla Parishad School, Metgutad',
    summary: 'General check-ups, vision testing and deworming for primary school children across three village schools.',
    shots: ['Height and weight records', 'Dental check', 'Vision testing', 'Deworming tablets', 'Class group photo', 'Teachers briefing'],
  },
  {
    id: 'immun-apr-2026',
    category: 'Immunization',
    title: 'Pulse Immunization Day',
    dateShort: '05 Apr 2026',
    dateLong: 'Sunday, 5 April 2026',
    venue: 'Hospital and village booths',
    summary: 'Booths in the town and nearby villages, with a house-to-house round in the afternoon for missed children.',
    shots: ['Booth setup', 'Child receiving drops', 'Mothers waiting', 'Vaccine cold box', 'House-to-house round'],
  },
  {
    id: 'ncd-mar-2026',
    category: 'Screening camp',
    title: 'Diabetes & Hypertension Screening',
    dateShort: '15 Mar 2026',
    dateLong: 'Sunday, 15 March 2026',
    venue: 'Community hall, Mahabaleshwar',
    summary: 'Blood sugar and blood pressure checks for adults over forty, with enrolment for continuing treatment.',
    shots: ['Blood sugar testing', 'Blood pressure check', 'Counselling table', 'Medication dispensed', 'Enrolment register'],
  },
  {
    id: 'tb-feb-2026',
    category: 'Awareness',
    title: 'TB Awareness & Sputum Collection Drive',
    dateShort: '28 Feb 2026',
    dateLong: 'Saturday, 28 February 2026',
    venue: 'Village outreach, Satara District',
    summary: 'Awareness sessions on symptoms and treatment, with sputum collection for suspected cases and contact tracing.',
    shots: ['Awareness session', 'Sputum collection point', 'Health worker home visit', 'Posters and leaflets'],
  },
  {
    id: 'cancer-jan-2026',
    category: 'Screening camp',
    title: 'Cancer Screening Camp for Women',
    dateShort: '18 Jan 2026',
    dateLong: 'Sunday, 18 January 2026',
    venue: 'Maternity block, Mahabaleshwar',
    summary: 'Breast and cervical screening with women health workers on hand; positive findings referred the same week.',
    shots: ['Registration', 'Examination room', 'Counselling', 'Referral desk', 'Health worker team'],
  },
  {
    id: 'tobacco-dec-2025',
    category: 'Awareness',
    title: 'Anti-Tobacco Awareness Rally',
    dateShort: '09 Dec 2025',
    dateLong: 'Tuesday, 9 December 2025',
    venue: 'Mahabaleshwar town',
    summary: 'A rally with college students through the town, followed by counselling sessions for those who wanted to quit.',
    shots: ['Rally through the market', 'Students with placards', 'Street-corner session', 'Counselling stall'],
  },
  {
    id: 'blood-nov-2025',
    category: 'Blood donation',
    title: 'Blood Donation Camp with Local College',
    dateShort: '22 Nov 2025',
    dateLong: 'Saturday, 22 November 2025',
    venue: 'College campus, Mahabaleshwar',
    summary: 'First-time donors from the college; the largest single collection of the year for the hospital blood store.',
    shots: ['Donor briefing', 'Collection in progress', 'Certificates handed out', 'Staff and volunteers', 'Units in the cold chain'],
  },
];

export const baseFilters = ['All events', 'Blood donation', 'Screening camp', 'School clinic', 'Immunization', 'Awareness'];

export function canonicalCategory(category: string) {
  const match = baseFilters.find((f) => f.toLowerCase() === category.trim().toLowerCase());
  return match || category.trim();
}

export function tagStyle(category: string) {
  if (category === 'Blood donation') return { tagBg: '#FDE7E5', tagColor: '#B4251E' };
  if (category === 'Awareness') return { tagBg: '#E4F4F6', tagColor: '#0B6A76' };
  return { tagBg: '#E1F3EF', tagColor: '#0A5F52' };
}

export function dateParts(eventDate: string | null) {
  if (!eventDate) return { dateShort: '', dateLong: '', day: '', month: '' };
  const date = new Date(`${eventDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return { dateShort: '', dateLong: '', day: '', month: '' };
  const day = String(date.getUTCDate()).padStart(2, '0');
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getUTCMonth()];
  const monthLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getUTCMonth()];
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()];
  const year = date.getUTCFullYear();
  return {
    dateShort: `${day} ${monthShort} ${year}`,
    dateLong: `${weekday}, ${date.getUTCDate()} ${monthLong} ${year}`,
    day,
    month: monthShort,
  };
}

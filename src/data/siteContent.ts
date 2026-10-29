/**
 * ALL website content lives in this file.
 *
 * Each export matches a future Supabase table (same field names, snake_case),
 * so when the admin panel is added you only replace this file with Supabase
 * queries inside src/hooks/useSiteContent.ts — no component needs to change.
 */

// ---------- Types (mirror the planned Supabase tables) ----------

export interface SiteSettings {
  hospital_name: string;
  short_name: string;
  town: string;
  top_band_text: string;
  phone: string;
  phone_href: string;
  emergency_phone: string;
  ambulance_number: string;
  email: string;
  secondary_email: string;
  whatsapp_number: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  address_single_line: string;
  opd_hours_morning: string;
  opd_hours_evening: string;
  casualty_hours: string;
  logo_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  about_eyebrow: string;
  about_title: string;
  about_text: string;
  about_text_2: string;
  about_image_url: string;
  about_image_caption: string;
  founded_year: number;
  promise_text: string;
  emergency_title: string;
  emergency_text: string;
  reach_title: string;
  facilities_intro: string;
  facilities_count_label: string;
  facilities_more_title: string;
  facilities_more_text: string;
  facilities_cta_title: string;
  facilities_cta_text: string;
  programmes_intro: string;
  programmes_count_label: string;
  events_title: string;
  events_intro: string;
  support_intro: string;
  footer_description: string;
  footer_free_note: string;
  emergency_strip_title: string;
  emergency_strip_text: string;
  stats_background_url: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Milestone {
  year: string;
  text: string;
  sort_order: number;
}

export interface Stat {
  value: string;
  label: string;
  sort_order: number;
}

export interface Facility {
  name: string;
  slug: string;
  unit_count_label: string;
  description: string;
  units: string[];
  image_url: string;
  show_on_home: boolean;
  sort_order: number;
}

export type ProgrammeIcon = 'heart' | 'building' | 'search' | 'school';

export interface ProgrammePhoto {
  image_url: string | null; // null = shows a placeholder until a photo is uploaded
  caption: string;
}

export interface Programme {
  name: string;
  slug: string;
  short_description: string;
  icon_key: ProgrammeIcon;
  cover_image_url: string | null;
  photos: ProgrammePhoto[];
  sort_order: number;
}

export interface HospitalEvent {
  title: string;
  event_date: string; // ISO date, e.g. 2026-07-12
  venue: string;
  category: 'blood donation' | 'eye camp' | 'school health' | 'immunisation' | 'other';
}

export interface SupportOption {
  title: string;
  description: string;
  cta_label: string;
  cta_link: string;
  accent_color: string;
  sort_order: number;
}

// ---------- Content ----------

export const settings: SiteSettings = {
  hospital_name: 'Morarji Gokuldas Rural Hospital',
  short_name: 'MGRH',
  town: 'Mahabaleshwar',
  top_band_text: 'Consultation, tests, medicines and hospital stay — free of charge, for everyone.',
  phone: '+91 21682 60247',
  phone_href: 'tel:+912168260247',
  emergency_phone: '+91 21682 60247',
  ambulance_number: '108',
  email: 'info@mgrh-mahabaleshwar.org',
  secondary_email: 'msmshwar@gmail.com',
  whatsapp_number: '912168260247',
  address_line1: 'Mahabaleshwar – Medha Road',
  address_line2: 'District Satara – 412 806',
  address_line3: 'Maharashtra, India',
  address_single_line: 'Mahabaleshwar - Medha Road, District - Satara – 412 806, Maharashtra',
  opd_hours_morning: '09:00 am – 01:00 pm',
  opd_hours_evening: '04:00 pm – 06:00 pm',
  casualty_hours: 'Open 24 hours',
  logo_url: '/images/logo.png',
  hero_title: 'Quality healthcare, provided free of charge.',
  hero_subtitle:
    'Comprehensive healthcare for the local and rural population and tourists, with consultations, diagnostic tests, medication and hospital stay provided free of charge under one roof.',
  hero_image_url: '/images/hero-doctors.jpg',
  about_eyebrow: 'About the hospital',
  about_title: 'A legacy of healthcare since 1914.',
  about_text:
    'Shri Moraji Gokuldas donated the building to the Central Government in 1914. Custody has passed through the Zilla Parishad, the municipal council and the Government of Maharashtra. In February 2019, a tripartite agreement was signed by the Health Ministry, the Government of Maharashtra, the Red Cross Society and Bel-Air.',
  about_text_2:
    'Medical investigations, treatment and operations, hospital stay and medicines are provided free of cost.',
  about_image_url: '/images/hospital-building.jpg',
  about_image_caption: 'The hospital on Mahabaleshwar - Medha Road',
  founded_year: 1914,
  promise_text:
    'Consultation, diagnostic tests, medication and hospital stay — all provided free of charge, under one roof.',
  emergency_title: 'Emergency and Casualty Care.',
  emergency_text:
    'The Emergency and Casualty department provides essential facilities for effective and timely care. The hospital provides emergency care, intensive care and modern operation theatre facilities.',
  reach_title: 'Located on Mahabaleshwar-Medha Road.',
  facilities_intro:
    'The hospital provides OPD, Emergency and Casualty, ICU, operation theatres, diagnostics, maternity care, wards, pharmacy and other essential facilities on one campus.',
  facilities_count_label: '14 departments',
  facilities_more_title: 'Eleven more departments',
  facilities_more_text: 'Theatres, maternity, dental, diagnostics and the wards — all photographed.',
  facilities_cta_title: 'See the ward you will be treated in.',
  facilities_cta_text:
    'Every department is photographed — theatres, ICU, maternity, the pathology bench and the wards — so you know what to expect before you arrive.',
  programmes_intro:
    'Work that does not wait for a patient to walk in — national control programmes, school clinics and screening camps that go out into the villages.',
  programmes_count_label: '12 running',
  events_title: 'Check out our upcoming events.',
  events_intro:
    'Blood donation drives, eye and cancer screening camps, school health clinics and immunisation rounds — held on campus and out in the villages, free to attend.',
  support_intro: 'You can support the hospital through donations, volunteering and essential equipment.',
  footer_description:
    'A 30-bed government rural hospital in Mahabaleshwar, serving the town, nearby villages and visitors since 1914.',
  footer_free_note: 'All consultations, tests, medicines and stays are free of charge.',
  emergency_strip_title: 'In an emergency, come straight in.',
  emergency_strip_text: 'Casualty is open 24 hours, every day. No appointment needed.',
  stats_background_url: '/images/stats-background.jpg',
};

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Facilities', href: '/facilities' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Events', href: '/events' },
  { label: 'Support Us', href: '/support' },
  { label: 'Contact', href: '/contact' },
];

export const milestones: Milestone[] = [
  { year: '1914', text: 'Shri Moraji Gokuldas donates the hospital building to the Central Government.', sort_order: 1 },
  { year: '1962', text: 'Handed to the Zilla Parishad, Satara, running as a primary health centre.', sort_order: 2 },
  { year: '1988', text: 'Transferred to the Government of Maharashtra on 1st February.', sort_order: 3 },
  { year: '2019', text: 'Tripartite agreement with the Indian Red Cross Society and Bel-Air, Panchgani.', sort_order: 4 },
];

export const stats: Stat[] = [
  { value: '1914', label: 'The year the hospital was donated', sort_order: 1 },
  { value: '14', label: 'Departments on a single campus', sort_order: 2 },
  { value: '24 hrs', label: 'Casualty, every day of the year', sort_order: 3 },
  { value: '₹0', label: 'Charged — consultation to discharge', sort_order: 4 },
];

export const facilities: Facility[] = [
  {
    name: 'Casualty & Critical Care',
    slug: 'casualty-critical-care',
    unit_count_label: '3 units',
    description:
      'The door that never closes. Triage, resuscitation and an intensive care unit with monitored beds, ventilator support and a resident officer through the night.',
    units: ['Casualty ward', 'Intensive Care Unit', 'Ambulance service'],
    image_url: '/images/hospital-building.jpg',
    show_on_home: true,
    sort_order: 1,
  },
  {
    name: 'Operation Theatres',
    slug: 'operation-theatres',
    unit_count_label: '2 theatres',
    description:
      'A major theatre for abdominal, orthopaedic and obstetric surgery, and a minor theatre for procedures that need sterile conditions but not a full list.',
    units: ['Major OT', 'Minor OT', 'Post-operative recovery'],
    image_url: '/images/operation-theatre.jpg',
    show_on_home: true,
    sort_order: 2,
  },
  {
    name: 'Maternity & Newborn',
    slug: 'maternity-newborn',
    unit_count_label: '4 units',
    description:
      'Antenatal visits through every trimester, supervised deliveries with round-the-clock nursing cover, and postnatal care for mother and baby before discharge.',
    units: ['Labour room', 'Antenatal clinic', 'Postnatal ward', 'Immunisation'],
    image_url: '/images/maternity-ward.jpg',
    show_on_home: true,
    sort_order: 3,
  },
  {
    name: 'Diagnostics & Imaging',
    slug: 'diagnostics-imaging',
    unit_count_label: '5 units',
    description:
      'Blood work, X-ray, sonography and 2D echo on the same campus, so the doctor who ordered a test reads the result the same visit rather than the next week.',
    units: ['Pathology Lab', 'X-ray', 'Sonography', '2D Echo', 'ECG'],
    image_url: '/images/pathology-lab.jpg',
    show_on_home: false,
    sort_order: 4,
  },
  {
    name: 'Outpatient & Dental',
    slug: 'outpatient-dental',
    unit_count_label: '3 units',
    description:
      'General consultation from nine to five, visiting specialist clinics on fixed days, and a dental chair for extractions, fillings and oral cancer screening.',
    units: ['General OPD', 'Specialist clinics', 'Dental'],
    image_url: '/images/corridor.png',
    show_on_home: false,
    sort_order: 5,
  },
  {
    name: 'Wards & Support',
    slug: 'wards-support',
    unit_count_label: '4 units',
    description:
      'Separate male and female wards, a paediatric corner, and the pharmacy, linen and kitchen that keep an inpatient stay running — without a bill at the end.',
    units: ['Male ward', 'Female ward', 'Paediatric beds', 'Pharmacy'],
    image_url: '/images/general-ward.png',
    show_on_home: false,
    sort_order: 6,
  },
];

const galleryCaptions = [
  'General view',
  'Clinic in progress',
  'Staff and health workers',
  'Records and follow-up',
  'Out in the villages',
];
const placeholderPhotos = (): ProgrammePhoto[] =>
  galleryCaptions.map((caption) => ({ image_url: null, caption }));

export const programmes: Programme[] = [
  {
    name: 'Mother and Child Health',
    slug: 'mother-and-child-health',
    short_description:
      'Mother and Child Health Clinic services are provided as part of the hospital’s community health programmes.',
    icon_key: 'heart',
    cover_image_url: null,
    photos: placeholderPhotos(),
    sort_order: 1,
  },
  {
    name: 'National Control Programmes',
    slug: 'national-control-programmes',
    short_description: 'Tuberculosis, leprosy and non-communicable disease care under the national schemes.',
    icon_key: 'building',
    cover_image_url: null,
    photos: placeholderPhotos(),
    sort_order: 2,
  },
  {
    name: 'Screening Camps',
    slug: 'screening-camps',
    short_description:
      'The hospital conducts screening programmes for cancer as part of its community health initiatives.',
    icon_key: 'search',
    cover_image_url: null,
    photos: placeholderPhotos(),
    sort_order: 3,
  },
  {
    name: 'School Health Clinics',
    slug: 'school-health-clinics',
    short_description: 'The hospital conducts School Health Clinics as part of its community health programmes.',
    icon_key: 'school',
    cover_image_url: null,
    photos: placeholderPhotos(),
    sort_order: 4,
  },
];

export const events: HospitalEvent[] = [
  {
    title: 'Voluntary Blood Donation Camp',
    event_date: '2026-07-12',
    venue: 'Hospital campus, Mahabaleshwar',
    category: 'blood donation',
  },
  {
    title: 'Free Eye Screening & Cataract Camp',
    event_date: '2026-06-21',
    venue: 'OPD block, Mahabaleshwar',
    category: 'eye camp',
  },
  {
    title: 'School Health Check-up Drive',
    event_date: '2026-05-08',
    venue: 'Zilla Parishad School, Metgutad',
    category: 'school health',
  },
];

export const supportOptions: SupportOption[] = [
  {
    title: 'Volunteer with us',
    description:
      'Camp support, patient guidance at the OPD counter, or clinical volunteering for qualified staff and students.',
    cta_label: 'See the roles',
    cta_link: '/support',
    accent_color: '#2BB2C4',
    sort_order: 1,
  },
  {
    title: 'Not sure how you can help?',
    description:
      'Call the office and ask what is needed this month — equipment, a few hours, or a camp to host.',
    cta_label: 'Talk to the office',
    cta_link: '/contact',
    accent_color: '#E1332A',
    sort_order: 2,
  },
  {
    title: 'Make a donation',
    description:
      'Your support can help the hospital continue providing essential healthcare services free of charge.',
    cta_label: 'How to give',
    cta_link: '/support',
    accent_color: '#0A8E7B',
    sort_order: 3,
  },
];

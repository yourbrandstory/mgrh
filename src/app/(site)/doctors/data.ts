export interface DoctorItem {
  name: string;
  role: string;
  speciality: string;
  qualification: string;
  bio: string;
  hours: string;
  location: string;
  imageUrl?: string | null;
  imageAlt?: string;
}

export const fallbackDoctors: DoctorItem[] = [
  {
    name: 'Dr. Pandit Kishanrao Deshmukh',
    role: 'Medical Superintendent',
    speciality: 'Medicine',
    qualification: 'M.B.B.S., D.P.H., M.D. (Medicine) · 49 years experience',
    bio: 'Heads the hospital and its outpatient department, and oversees the medical team across all fourteen departments.',
    hours: 'OPD, Monday to Saturday, 9:00 – 13:00',
    location: 'OPD block, first floor',
  },
  {
    name: 'Dr. Jeetendrasingh Jalimsingh Rajput',
    role: 'Gynecologist',
    speciality: 'Surgery',
    qualification: 'M.D. Obstetrics & Gynaecology · 32 years experience',
    bio: 'Runs the antenatal clinic and supervises deliveries in the labour room, with postnatal follow-up for mother and newborn.',
    hours: 'ANC clinic, Tuesday and Friday, 10:00 – 14:00',
    location: 'Maternity block',
  },
  {
    name: 'Dr. Nikita Viraj Yerramalla',
    role: 'Pediatrician',
    speciality: 'Pediatrics',
    qualification: 'M.B.B.S. DCH · 7 years experience',
    bio: 'Sees infants and children in the paediatric ward and at the Mother and Child Health Clinic, and supervises immunisation days.',
    hours: 'Paediatric clinic, Monday and Thursday, 10:00 – 13:00',
    location: 'Paediatric ward',
  },
  {
    name: 'Dr. Sunil Tukaram Pise',
    role: 'Orthopedist',
    speciality: 'Orthopedics',
    qualification: 'M.B.B.S. DNB · 28 years experience',
    bio: 'Treats fractures, joint and bone conditions, and performs orthopaedic procedures in the renovated operation theatres.',
    hours: 'Orthopaedic clinic, Wednesday and Saturday',
    location: 'OPD block and operation theatre',
  },
  {
    name: 'Dr. Aruna Prashant Rasal',
    role: 'Dr. Consultant (Anaesthetist)',
    speciality: 'Anaesthesia',
    qualification: 'M.B.B.S. DA · 26 years experience',
    bio: 'Provides anaesthesia for surgical and obstetric procedures and supports monitoring in the intensive care unit.',
    hours: 'On call for operating lists',
    location: 'Operation theatre and ICU',
  },
  {
    name: 'Dr. Dhimant Harischandra Kambley',
    role: 'M. O. Dentist',
    speciality: 'Dental Surgeon',
    qualification: 'B.D.S. · 32 years experience',
    bio: 'Treats tooth and gum complaints at the dental clinic, including extractions, fillings and school dental checks.',
    hours: 'Dental clinic, Monday to Friday, 10:00 – 15:00',
    location: 'Dental clinic, ground floor',
  },
  {
    name: 'Dr. Chandrashekhar Vaman Lele',
    role: 'Dr. Consultant (Intensivist)',
    speciality: 'General',
    qualification: 'M.B.B.S. · 48 years experience',
    bio: 'Leads care in the intensive care unit, managing critically ill patients and advising on casualty admissions.',
    hours: 'ICU, daily rounds and on call',
    location: 'Intensive Care Unit',
  },
  {
    name: 'Dr. Mohammed Kashid Mohammed Hashim Khokar',
    role: 'Medical Officer',
    speciality: 'General',
    qualification: 'M.B.B.S. · 4 years experience',
    bio: 'On duty for casualty admissions and general consultations, and coordinates transfers when specialist care is needed.',
    hours: 'Casualty, rotating shifts, 24 hours',
    location: 'Casualty ward, ground floor',
  },
  {
    name: 'Dr. Ashish Ashok Rai',
    role: 'Medical Officer',
    speciality: 'General',
    qualification: 'M.B.B.S. · 2 years experience',
    bio: 'Sees patients at the general OPD and in the wards, and covers casualty shifts on rotation.',
    hours: 'OPD and casualty, rotating shifts',
    location: 'OPD block and casualty',
  },
  {
    name: 'Dr. Suyash Nanasaheb Deshmukh',
    role: 'Medical Officer',
    speciality: 'General',
    qualification: 'M.B.B.S. · 6 months experience',
    bio: 'Supports the general OPD and ward rounds, and joins casualty and night duty on rotation.',
    hours: 'OPD and casualty, rotating shifts',
    location: 'OPD block and casualty',
  },
];

export interface SupportRow {
  count: string;
  title: string;
  desc: string;
}

export const supportRows: SupportRow[] = [
  { count: '15', title: 'Nursing staff', desc: 'Ward, casualty and theatre nursing cover in rotating shifts, day and night.' },
  { count: '10', title: 'Paramedical staff', desc: 'Laboratory technicians, radiographers and pharmacy staff supporting diagnostics and dispensing.' },
  { count: '9', title: 'Health workers', desc: 'ANMs and community health workers running village clinics, immunisation booths and home visits.' },
  { count: '16', title: 'Administration & housekeeping', desc: 'The hospital is supported by administrative staff, registration and records staff, ambulance drivers, and housekeeping staff who help keep the hospital running smoothly.' },
];

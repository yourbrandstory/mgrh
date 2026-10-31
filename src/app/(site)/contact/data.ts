export type ContactDetailIcon = 'location' | 'phone' | 'mail' | 'website';

export type ContactDetail = {
  label: string;
  value: string;
  extra: string;
  hasExtra: boolean;
  icon: ContactDetailIcon;
};

export const contactDetails: ContactDetail[] = [
  {
    label: 'Address',
    value: 'Morarji Gokuldas Rural Hospital, Mahabaleshwar - Medha Road',
    extra: 'District - Satara – 412 806, Maharashtra.',
    hasExtra: true,
    icon: 'location',
  },
  {
    label: 'Telephone',
    value: '+91 21682 60247',
    extra: '',
    hasExtra: false,
    icon: 'phone',
  },
  {
    label: 'Email',
    value: 'E: info@mgrh-mahabaleshwar.org',
    extra: 'msmshwar@gmail.com',
    hasExtra: true,
    icon: 'mail',
  },
  {
    label: 'Website',
    value: 'www.mgrh-mahabaleshwar.org',
    extra: '',
    hasExtra: false,
    icon: 'website',
  },
];

export const contactHours = [
  { title: 'OPD', detail: '09:00 a.m. to 01:00 p.m. and 04:00 p.m. to 06:00 p.m.' },
  { title: 'Casualty', detail: 'Open 24 hours, every day of the year' },
  { title: 'Visiting', detail: '11:00 a.m. to 01:00 p.m. and 04:00 p.m. to 06:00 p.m.' },
];

export const emergencyPoints = [
  'Casualty and nursing cover staffed every hour of the year',
  'Intensive care and both operation theatres on the same floor',
  'Ambulance available for transfers and referrals',
];

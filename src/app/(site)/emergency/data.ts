export type EmergencyContact = {
  label: string;
  value: string;
  phone?: boolean;
  note: string;
  href: string;
  bg: string;
  border: string;
  accent: string;
  labelColor: string;
  valueColor: string;
};

export type EmergencyStep = {
  n: string;
  title: string;
  detail: string;
};

export type EmergencyRoute = {
  title: string;
  detail: string;
  icon: string[];
};

export type EmergencyFaq = {
  q: string;
  a: string;
};

export const contacts: EmergencyContact[] = [
  {
    label: 'Casualty · 24 hours',
    value: '+91 21682 60247',
    phone: true,
    note: 'The hospital line reaches the duty desk at any hour of the day or night.',
    href: 'tel:+912168260247',
    bg: '#FDF1F0',
    border: '#F6D8D5',
    accent: '#E1332A',
    labelColor: '#9E2018',
    valueColor: '#C42A21',
  },
  {
    label: 'National ambulance',
    value: '108 / 102',
    phone: true,
    note: 'Free state ambulance services. 108 for emergencies, 102 for pregnant women and infants.',
    href: 'tel:108',
    bg: '#FDF1F0',
    border: '#F6D8D5',
    accent: '#E1332A',
    labelColor: '#9E2018',
    valueColor: '#C42A21',
  },
  {
    label: 'Email',
    value: 'info@mgrh-mahabaleshwar.org',
    note: 'msmshwar@gmail.com · for non-urgent enquiries and records.',
    href: 'mailto:info@mgrh-mahabaleshwar.org',
    bg: '#F1F8F6',
    border: '#E1F3EF',
    accent: '#06A88C',
    labelColor: '#0A5F52',
    valueColor: '#12564C',
  },
];

export const steps: EmergencyStep[] = [
  {
    n: '1',
    title: 'Come to the casualty entrance',
    detail: 'On the near side of the main block, signposted from the campus gate.',
  },
  {
    n: '2',
    title: 'The duty team sees the patient',
    detail: 'Triage happens immediately; the most serious cases are taken first.',
  },
  {
    n: '3',
    title: 'Tests and treatment follow',
    detail: 'Laboratory, X-ray and the theatres are on the same campus, at no cost.',
  },
  {
    n: '4',
    title: 'Registration afterwards',
    detail: 'Paperwork is completed once the patient is stable never before.',
  },
];

export const routes: EmergencyRoute[] = [
  {
    title: 'From Mahabaleshwar bus stand',
    detail: 'Roughly ten minutes by road along Medha Road, heading out of the town centre.',
    icon: ['M4 6.5h16v10H4z', 'M6.5 16.5v2M17.5 16.5v2', 'M4 11h16'],
  },
  {
    title: 'From Satara',
    detail: 'About 55 km via the Satara – Mahabaleshwar road; allow around an hour and a half.',
    icon: [
      'M5 17.5h14l-1.6-5.4a2 2 0 0 0-1.9-1.4H8.5a2 2 0 0 0-1.9 1.4Z',
      'M7.5 20.5v-3M16.5 20.5v-3',
    ],
  },
  {
    title: 'By ambulance',
    detail: 'Dial 108 for the free state service, or call the hospital and the duty officer will advise.',
    icon: [
      'M3 16.5h14v-8H3z',
      'M17 11h2.6l1.4 3v2.5H17z',
      'M7 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 7 19ZM18 19a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
      'M10 10.6v3.4M8.3 12.3h3.4',
    ],
  },
];

export const faqs: EmergencyFaq[] = [
  {
    q: 'Do I need an appointment for the casualty ward?',
    a: 'No. Bring the patient straight in at any hour. Registration is completed after the patient has been seen.',
  },
  {
    q: 'Will I be charged for emergency treatment?',
    a: 'No. Consultation, tests, medicines, surgery and the hospital stay are all free of charge, for residents and visitors alike.',
  },
  {
    q: 'Is a doctor available at night?',
    a: 'Yes. A resident medical officer and nursing staff are on duty around the clock, with specialists called in when a case requires it.',
  },
  {
    q: 'Can the hospital send an ambulance?',
    a: 'An ambulance is available for transfers and referrals. Call the hospital and the duty officer will advise whether to wait or start moving.',
  },
  {
    q: 'What should I bring with me?',
    a: 'Nothing is required to be seen. If they are to hand, bring any earlier prescriptions, discharge papers or test reports they help the doctor decide faster.',
  },
  {
    q: 'What if the case needs a bigger hospital?',
    a: 'Patients are stabilised here first, then referred onward with the paperwork and, where needed, transport arranged by the duty team.',
  },
];

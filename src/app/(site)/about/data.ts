export interface AboutSection {
  label: string;
  href: string;
}

export interface LocationFact {
  label: string;
  value: string;
  phone?: boolean;
}

export interface HistoryItem {
  year: string;
  text: string;
  img?: string;
  ratio?: string;
  caption?: string;
}

export interface WhyCard {
  number: string;
  title: string;
  text: string;
}

export const aboutSections: AboutSection[] = [
  { label: 'Who we are', href: '#who' },
  { label: 'Vision & Mission', href: '#vision' },
  { label: 'Why choose us', href: '#why' },
  { label: 'Where we are', href: '#location' },
  { label: 'Our History', href: '#history' },
];

export const locationFacts: LocationFact[] = [
  { label: 'Address', value: 'Mahabaleshwar - Medha Road, District - Satara – 412 806, Maharashtra, India' },
  { label: 'Nearest city', value: 'Pune, about 120 km north-east' },
  {
    label: 'Serving',
    value: 'Mahabaleshwar town, surrounding villages and visitors to the region',
  },
  { label: 'contact', value: '+91 21682 60247', phone: true },
];

export const historyItems: HistoryItem[] = [
  {
    year: '1914',
    text: 'Shri Moraji Gokuldas donated the Hospital Building to the Central Government in 1914.',
    img: '/images/about-foundation-stone.png',
    ratio: '432 / 285',
    caption: 'Foundation stone, laid 22nd May 1914',
  },
  {
    year: '1914-62',
    text: 'The Hospital was run by the Central Government under the name of “Moraji Gokuldas General Hospital” till 1962.',
    img: '/images/about-building.png',
    ratio: '613 / 345',
    caption: 'The original hospital building, donated in 1914',
  },
  {
    year: '1962-74',
    text: 'The Hospital was handed over to the Zilla Parisahad, Satara in 1962. It was working as a Primary Health Care Centre till 1974.',
  },
  {
    year: '1974-88',
    text: 'The Hospital was handed over to the Municipal Corporation of Mahabaleshwar in 1974. The Hospital was run by the Municipal Corporation till 1988.',
  },
  {
    year: '1988-2019',
    text: 'It was handed over to Government of Maharashtra on 1st February 1988. Since then, the Hospital is working under the name of ‘Morarji Gokuldas Rural Hospital’ Mahabaleshwar.',
  },
  {
    year: '2019 - present',
    text: 'In February 2019, a tripartite agreement was signed by Health Ministry, Government of Maharashtra, the Red Cross Society and Bel-Air.',
    img: '/images/about-building-new.png',
    ratio: '515 / 216',
    caption: 'The hospital today, after renovation',
  },
];

export const whyCards: WhyCard[] = [
  { number: '01', title: '30-Bed Hospital', text: 'Comprehensive inpatient and outpatient care.' },
  {
    number: '02',
    title: '24×7 Emergency Care',
    text: 'Emergency and casualty services available round the clock.',
  },
  {
    number: '03',
    title: 'Specialist Services',
    text: 'Physician, Gynaecology, Paediatrics, Orthopaedics, General Surgery, Anaesthesia and Ophthalmic services.',
  },
  {
    number: '04',
    title: 'Rural & Community Focus',
    text: 'Healthcare for local communities, surrounding villages and visitors.',
  },
];

export const historyPills = ['#0A8E7B', '#2BA3B8', '#E1332A', '#0B6558'];

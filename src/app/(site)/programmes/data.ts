export interface ProgrammeItem {
  name: string;
  desc: string;
}

export const programmeItems: ProgrammeItem[] = [
  { name: 'Mother and Child Health Clinic', desc: 'Routine check-ups for mothers and young children under one roof. Growth monitoring, nutrition advice and referral when specialist care is needed.' },
  { name: 'Maternity', desc: 'Supervised deliveries with round-the-clock nursing cover. Postnatal care for mother and newborn before discharge.' },
  { name: 'ANC Clinic', desc: 'Antenatal visits through every trimester, with blood tests, sonography and iron supplementation. High-risk pregnancies are flagged early and followed closely.' },
  { name: 'Immunization', desc: 'The full national schedule for infants and children, given on fixed clinic days. Records are maintained so no dose is missed.' },
  { name: 'National Family Planning Control', desc: 'Counselling for couples on spacing and contraceptive options. Services and supplies are provided free of charge.' },
  { name: 'National Tuberculosis (TB) Control', desc: 'Sputum testing, diagnosis and supervised treatment under the national programme. Household contacts are traced and screened.' },
  { name: 'National Leprosy (Hansen’s disease) Control', desc: 'Early detection through skin examination and community case-finding. Multidrug therapy and disability care are followed up locally.' },
  { name: 'Non-communicable Diseases Control', desc: 'Screening and continuing treatment for diabetes, hypertension and heart disease. Medication and follow-up visits at no cost.' },
  { name: 'Anti-tobacco', desc: 'Awareness sessions for schools and the wider community on tobacco harm. Counselling support for those who want to quit.' },
  { name: 'Screening for Cancer', desc: 'Oral, breast and cervical screening camps for the rural population. Suspicious findings are referred onward without delay.' },
  { name: 'School Health Clinic', desc: 'Visits to local schools for general check-ups, vision testing and deworming. Children needing treatment are brought to the hospital.' },
  { name: 'Blood Donation Camps', desc: 'Voluntary donation camps held with local groups and colleges. Collected units support maternity and emergency cases in the region.' },
];

export interface ProgrammeGroup {
  title: string;
  desc: string;
  accent: string;
  names: string[];
}

export const programmeGroups: ProgrammeGroup[] = [
  {
    title: 'Mother & Child Health',
    accent: '#06A88C',
    names: ['Maternity', 'ANC Clinic', 'Immunization', 'Mother and Child Health Clinic'],
    desc: 'Care for mothers and children from the first antenatal visit through delivery, immunisation and early childhood.',
  },
  {
    title: 'Communicable Disease Control',
    accent: '#2BB2C4',
    names: ['National Tuberculosis (TB) Control', 'National Leprosy (Hansen’s disease) Control'],
    desc: 'National control programmes for tuberculosis and leprosy, from early detection to supervised treatment and follow-up.',
  },
  {
    title: 'Non-Communicable Disease & Prevention',
    accent: '#0A8E7B',
    names: ['Non-communicable Diseases Control', 'Screening for Cancer', 'Anti-tobacco'],
    desc: 'Screening and continuing care for diabetes, hypertension, heart disease and cancer, with support to stop tobacco use.',
  },
  {
    title: 'Community Outreach',
    accent: '#45B8CC',
    names: ['School Health Clinic', 'Blood Donation Camps', 'National Family Planning Control'],
    desc: 'Programmes that take care into schools, colleges and villages, including school clinics, blood donation camps and family planning.',
  },
];

export const introFacts = [
  { value: '12', label: 'continuing programmes' },
  { value: '5', label: 'National programmes' },
  { value: 'Free', label: 'consultation, Medicine, stay' },
];

export interface FacilityShot {
  id: string;
  label: string;
  src: string;
  width: string;
}

export interface FacilityItem {
  slot: string;
  name: string;
  paras: string[];
  shots: FacilityShot[];
}

export interface FacilityGroup {
  id: string;
  title: string;
  blurb: string;
  bg: string;
  bandBg: string;
  items: FacilityItem[];
}

export interface FacilityImage {
  url: string;
  caption: string;
  alt: string;
}

const RHY = ['450px', '260px', '450px'];
const DEFAULT_VIEWS = ['General view', 'Detail', 'In use'];

type SourceView = string | { label: string; src?: string };

const sourceGroups: {
  id: string;
  title: string;
  blurb: string;
  items: {
    slot: string;
    name: string;
    desc: string;
    src?: string;
    views?: SourceView[];
  }[];
}[] = [
  {
    id: 'emergency',
    title: 'Emergency & Critical Care',
    blurb: 'Immediate treatment and close monitoring.',
    items: [
      {
        slot: 'p-casualty',
        views: ['Casualty entrance', 'Treatment bay', 'Emergency equipment'],
        name: 'Emergency / Casualty Ward',
        desc: 'First treatment for accidents, injuries and sudden illness. Go directly here no appointment needed.',
      },
      {
        slot: 'p-icu',
        views: [
          { label: 'Patient under care', src: '/images/photo-icu-bed.png' },
          { label: 'Monitoring equipment' },
          { label: 'ICU bay' },
        ],
        name: 'Intensive Care Unit (ICU)',
        desc: 'ICU is designed for patients with life threatening conditions that require constant monitoring and advanced medical care.',
      },
    ],
  },
  {
    id: 'consult',
    title: 'Consultation & Clinics',
    blurb: 'Where most visits begin with examinations and everyday care.',
    items: [
      {
        slot: 'p-opd',
        name: 'Outpatient Department (OPD)',
        desc: 'At the counter, patients can receive information about various government health care schemes.\n\nIt combines professionalism with a personal touch, ensuring that patients feel both respected and comfortable during their visit.',
      },
      {
        slot: 'p-dental',
        name: 'Dental Clinic',
        desc: 'Dental clinic provides basic dental services, such as checkups, fillings and root canals.',
      },
    ],
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics',
    blurb: 'Tests and imaging that let treatment begin without delay.',
    items: [
      {
        slot: 'p-path',
        src: '/images/photo-pathology.png',
        name: 'Pathology Lab',
        desc: 'The latest diagnostic methods are available and results are generated quickly and accurately with state-of-the-art instruments and equipment.',
      },
      {
        slot: 'p-radio',
        name: 'Radiology',
        desc: 'X-Ray: The digital X-ray facility is equipped with advanced technology to capture x-ray images digitally.\n\n2D Echo: A High Quality 2D Echocardiogram for accurate diagnosis and effective treatment planning for various heart conditions.\n\nSonography Machine: The department has a modern sonography machine for ultrasound imaging, commonly used during pregnancy to monitor fetal development.',
      },
    ],
  },
  {
    id: 'surgery',
    title: 'Surgery',
    blurb: 'Newly renovated theatres for major and minor procedures.',
    items: [
      {
        slot: 'p-ot',
        src: '/images/photo-ot-banner.png',
        name: 'Operation Theatre (OT)',
        desc: 'Modern Operation Theatre is equipped with advanced technology equipments.',
      },
      {
        slot: 'p-minorot',
        name: 'Minor Operation Theatre',
        desc: 'Minor OT provides the highest standards of safety and hygiene and is staffed by experienced and qualified medical professionals.',
      },
    ],
  },
  {
    id: 'mother',
    title: 'Maternity & Child Care',
    blurb: 'Support through pregnancy, delivery and childhood.',
    items: [
      {
        slot: 'p-maternity',
        name: 'Maternity Ward',
        desc: 'A dedicated area in the hospital where pregnant women receive care, before, during and after childbirth. The environment is designed to be warm, welcoming and comfortable providing support for mothers and newborns.',
      },
      {
        slot: 'p-labour',
        name: 'Labour Room',
        desc: 'Labour Room provides a safe and comfortable environment for both the mother and the baby during labor and delivery.',
      },
      {
        slot: 'p-paed',
        name: 'Paediatric Ward',
        desc: 'A specialized section within the hospital that provides medical care specifically for infants, children, and adolescents.',
      },
    ],
  },
  {
    id: 'wards',
    title: 'Wards & Support Services',
    blurb: 'Inpatient beds, medicines and everyday patient amenities.',
    items: [
      {
        slot: 'p-wards',
        name: 'Male & Female Wards',
        desc: 'A healthcare facility equipped for the treatment and care of male and female patients.',
      },
      {
        slot: 'p-pharmacy',
        name: 'Pharmacy',
        desc: 'Dispenses medicines at no cost to patients, often based on prescriptions from doctors within the hospital.',
      },
      {
        slot: 'p-additional',
        src: '/images/photo-corridor.png',
        name: 'Additional Facilities',
        desc: 'The hospital campus has doctors and other staff quarters to ensure that medical personnel are available during medical emergencies.\n\nMeals provided for staff and patients typically include breakfast, lunch, and dinner, as well as snacks and beverages throughout the day.\n\nAmbulance services are available round the clock, every day of the week for emergency medical situations.\n\nAutoclave Room dedicated to sterilizing medical equipment, instruments, and supplies. A special device that uses high pressure steam to eliminate bacteria, viruses, fungi, and spores, ensuring that all items are sterile and safe for patient use.',
      },
    ],
  },
];

function splitParas(desc: string) {
  return desc
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export const fallbackGroups: FacilityGroup[] = sourceGroups.map((group, gi) => ({
  id: group.id,
  title: group.title,
  blurb: group.blurb,
  bg: gi % 2 === 0 ? '#ffffff' : '#F7FBFA',
  bandBg: gi % 2 === 0 ? '#F1F8F6' : '#E9F4F1',
  items: group.items.map((item) => {
    const views = item.views || DEFAULT_VIEWS;
    return {
      slot: item.slot,
      name: item.name,
      paras: splitParas(item.desc),
      shots: views.map((v, n) => {
        const o = typeof v === 'string' ? { label: v } : v;
        const src = o.src || (n === 0 ? item.src || '' : '');
        return {
          id: `${item.slot}-${n + 1}`,
          label: o.label,
          src,
          width: RHY[n % RHY.length],
        };
      }),
    };
  }),
}));

export function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function buildParas(
  row: {
    shortDescription: string;
    fullDescription: string;
    subitems: { name: string; text: string }[];
  },
  sourceParas: string[] = [],
) {
  if (row.subitems.length) {
    return row.subitems
      .map((sub, i) => {
        const source = (sourceParas[i] || '').trim();
        const name = sub.name.trim();
        const text = sub.text.trim();
        if (!source || !name) return text;
        if (source.toLowerCase().startsWith(`${name.toLowerCase()}:`)) return `${name}: ${text}`;
        if (source.toLowerCase().startsWith(name.toLowerCase()) && !text.toLowerCase().startsWith(name.toLowerCase())) {
          return `${name} ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
        }
        return text;
      })
      .filter(Boolean);
  }

  const paras = [row.shortDescription, row.fullDescription].map((s) => s.trim()).filter(Boolean);
  if (!paras.length) return sourceParas;
  if (paras.length > 1 && sourceParas.length === 1) return [paras.join(' ')];
  return paras;
}

export function buildShots(slot: string, labels: string[], images: FacilityImage[]): FacilityShot[] {
  const total = Math.max(3, images.length);
  return Array.from({ length: total }, (_, n) => {
    const image = images[n];
    const label = labels[n] || image?.caption || image?.alt || DEFAULT_VIEWS[n % DEFAULT_VIEWS.length];
    return {
      id: `${slot}-${n + 1}`,
      label,
      src: image?.url || '',
      width: RHY[n % RHY.length],
    };
  });
}

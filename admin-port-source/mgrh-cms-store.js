/* MGRH CMS data layer (prototype).
   Persists to localStorage under KEY. In production, replace load()/commit()
   with calls to the content API (see CMS README). Public pages call
   MGRHStore.published(type) and never see drafts unless an admin preview
   session is active. */
(function () {
  // Production: a Supabase adapter sets this flag and defines window.MGRHStore itself.
  if (window.__MGRH_EXTERNAL_STORE) return;
  const KEY = 'mgrh-cms-v1';
  const now = () => new Date().toISOString();
  const uid = p => p + '-' + Math.random().toString(36).slice(2, 9);
  const ago = d => new Date(Date.now() - d * 86400000).toISOString();

  const doctorSeed = [
    ['Dr. Pandit Kishanrao Deshmukh', 'Medical Superintendent', 'Medicine', 'M.B.B.S., D.P.H., M.D. (Medicine)', '49 years', 'Heads the hospital and its outpatient department, and oversees the medical team across all fourteen departments.', 'OPD, Monday to Saturday, 9:00 – 13:00', 'OPD block, first floor'],
    ['Dr. Jeetendrasingh Jalimsingh Rajput', 'Gynecologist', 'Surgery', 'M.D. Obstetrics & Gynaecology', '32 years', 'Runs the antenatal clinic and supervises deliveries in the labour room, with postnatal follow-up for mother and newborn.', 'ANC clinic, Tuesday and Friday, 10:00 – 14:00', 'Maternity block'],
    ['Dr. Nikita Viraj Yerramalla', 'Pediatrician', 'Pediatrics', 'M.B.B.S. DCH', '7 years', 'Sees infants and children in the paediatric ward and at the Mother and Child Health Clinic, and supervises immunisation days.', 'Paediatric clinic, Monday and Thursday, 10:00 – 13:00', 'Paediatric ward'],
    ['Dr. Sunil Tukaram Pise', 'Orthopedist', 'Orthopedics', 'M.B.B.S. DNB', '28 years', 'Treats fractures, joint and bone conditions, and performs orthopaedic procedures in the renovated operation theatres.', 'Orthopaedic clinic, Wednesday and Saturday', 'OPD block and operation theatre'],
    ['Dr. Aruna Prashant Rasal', 'Dr. Consultant (Anaesthetist)', 'Anaesthesia', 'M.B.B.S. DA', '26 years', 'Provides anaesthesia for surgical and obstetric procedures and supports monitoring in the intensive care unit.', 'On call for operating lists', 'Operation theatre and ICU'],
    ['Dr. Dhimant Harischandra Kambley', 'M. O. Dentist', 'Dental Surgeon', 'B.D.S.', '32 years', 'Treats tooth and gum complaints at the dental clinic, including extractions, fillings and school dental checks.', 'Dental clinic, Monday to Friday, 10:00 – 15:00', 'Dental clinic, ground floor'],
    ['Dr. Chandrashekhar Vaman Lele', 'Dr. Consultant (Intensivist)', 'General', 'M.B.B.S.', '48 years', 'Leads care in the intensive care unit, managing critically ill patients and advising on casualty admissions.', 'ICU, daily rounds and on call', 'Intensive Care Unit'],
    ['Dr. Mohammed Kashid Mohammed Hashim Khokar', 'Medical Officer', 'General', 'M.B.B.S.', '4 years', 'On duty for casualty admissions and general consultations, and coordinates transfers when specialist care is needed.', 'Casualty, rotating shifts, 24 hours', 'Casualty ward, ground floor'],
    ['Dr. Ashish Ashok Rai', 'Medical Officer', 'General', 'M.B.B.S.', '2 years', 'Sees patients at the general OPD and in the wards, and covers casualty shifts on rotation.', 'OPD and casualty, rotating shifts', 'OPD block and casualty'],
    ['Dr. Suyash Nanasaheb Deshmukh', 'Medical Officer', 'General', 'M.B.B.S.', '6 months', 'Supports the general OPD and ward rounds, and joins casualty and night duty on rotation.', 'OPD and wards, rotating shifts', 'OPD block'],
  ];

  const facilityCats = ['Emergency & Critical Care', 'Consultation & Clinics', 'Surgery', 'Diagnostics', 'Maternity & Child Care', 'Wards & Support Services'];
  const F = (name, cat, short, extra) => Object.assign({ name, category: cat, short, full: '', subcategory: '', subitems: [], images: [], review: !short }, extra || {});
  const facilitySeed = [
    F('Emergency / Casualty Ward', facilityCats[0], ''),
    F('Intensive Care Unit (ICU)', facilityCats[0], 'ICU is designed for patients with life threatening conditions that require constant monitoring and advanced medical care.', { images: [{ mediaId: 'm-icu', caption: 'Patient under care', alt: 'ICU bed with monitoring equipment' }] }),
    F('Outpatient Department (OPD)', facilityCats[1], 'At the counter, patients can receive information about various government health care schemes.', { full: 'It combines professionalism with a personal touch, ensuring that patients feel both respected and comfortable during their visit.' }),
    F('Dental Clinic', facilityCats[1], 'Dental clinic provides basic dental services, such as checkups, fillings and root canals.'),
    F('Operation Theatre', facilityCats[2], 'Modern Operation Theatre is equipped with advanced technology equipments.', { images: [{ mediaId: 'm-ot', caption: 'Operation theatre', alt: 'Operation theatre with surgical lights' }] }),
    F('Minor Operation Theatre', facilityCats[2], 'Minor OT provides the highest standards of safety and hygiene and is staffed by experienced and qualified medical professionals.'),
    F('Pathology Lab', facilityCats[3], 'The latest diagnostic methods are available and results are generated quickly and accurately with state-of-the-art instruments and equipment.', { images: [{ mediaId: 'm-path', caption: 'Pathology laboratory', alt: 'Laboratory bench with analysers' }] }),
    F('Radiology', facilityCats[3], 'X-ray, 2D echo and sonography services.', { subitems: [
      { name: 'X-Ray', text: 'The digital X-ray facility is equipped with advanced technology to capture x-ray images digitally.' },
      { name: '2D Echo', text: 'A High Quality 2D Echocardiogram for accurate diagnosis and effective treatment planning for various heart conditions.' },
      { name: 'Sonography Machine', text: 'The department has a modern sonography machine for ultrasound imaging, commonly used during pregnancy to monitor fetal development.' }] }),
    F('Maternity Ward', facilityCats[4], 'A dedicated area in the hospital where pregnant women receive care, before, during and after childbirth.', { full: 'The environment is designed to be warm, welcoming and comfortable providing support for mothers and newborns.' }),
    F('Labour Room', facilityCats[4], 'Labour Room provides a safe and comfortable environment for both the mother and the baby during labor and delivery.'),
    F('Paediatric Ward', facilityCats[4], 'A specialized section within the hospital that provides medical care specifically for infants, children, and adolescents.'),
    F('Male & Female Wards', facilityCats[5], 'A healthcare facility equipped for the treatment and care of male and female patients.'),
    F('Pharmacy', facilityCats[5], 'Dispenses medicines at no cost to patients, often based on prescriptions from doctors within the hospital.'),
    F('Additional Facilities', facilityCats[5], 'Staff quarters, meals, ambulance and sterilisation services.', { images: [{ mediaId: 'm-corr', caption: 'Hospital corridor', alt: 'Hospital corridor' }], subitems: [
      { name: 'Staff quarters', text: 'The hospital campus has doctors and other staff quarters to ensure that medical personnel are available during medical emergencies.' },
      { name: 'Meals', text: 'Meals provided for staff and patients typically include breakfast, lunch, and dinner, as well as snacks and beverages throughout the day.' },
      { name: 'Ambulance', text: 'Ambulance services are available round the clock, every day of the week for emergency medical situations.' },
      { name: 'Autoclave Room', text: 'Dedicated to sterilizing medical equipment, instruments, and supplies. A special device that uses high pressure steam to eliminate bacteria, viruses, fungi, and spores, ensuring that all items are sterile and safe for patient use.' }] }),
  ];

  const eventCats = ['Blood Donation', 'Screening Camp', 'School Clinic', 'Immunization', 'Awareness'];
  const E = (title, category, date, venue, summary, shots) => ({ title, category, date, venue, summary, shotLabels: shots });
  const eventSeed = [
    E('Voluntary Blood Donation Camp', 'Blood Donation', '2026-07-12', 'Hospital campus, Mahabaleshwar', 'Held with local youth groups; units collected support maternity and emergency cases at the hospital.', 6),
    E('Free Eye Screening & Cataract Camp', 'Screening Camp', '2026-06-21', 'OPD block, Mahabaleshwar', 'Vision testing for villagers from surrounding hamlets, with referral for cataract surgery where needed.', 5),
    E('School Health Check-up Drive', 'School Clinic', '2026-05-08', 'Zilla Parishad School, Metgutad', 'General check-ups, vision testing and deworming for primary school children across three village schools.', 6),
    E('Pulse Immunization Day', 'Immunization', '2026-04-05', 'Hospital and village booths', 'Booths in the town and nearby villages, with a house-to-house round in the afternoon for missed children.', 5),
    E('Diabetes & Hypertension Screening', 'Screening Camp', '2026-03-15', 'Community hall, Mahabaleshwar', 'Blood sugar and blood pressure checks for adults over forty, with enrolment for continuing treatment.', 5),
    E('TB Awareness & Sputum Collection Drive', 'Awareness', '2026-02-28', 'Village outreach, Satara District', 'Awareness sessions on symptoms and treatment, with sputum collection for suspected cases and contact tracing.', 4),
    E('Cancer Screening Camp for Women', 'Screening Camp', '2026-01-18', 'Maternity block, Mahabaleshwar', 'Breast and cervical screening with women health workers on hand; positive findings referred the same week.', 5),
    E('Anti-Tobacco Awareness Rally', 'Awareness', '2025-12-09', 'Mahabaleshwar town', 'A rally with college students through the town, followed by counselling sessions for those who wanted to quit.', 4),
    E('Blood Donation Camp with Local College', 'Blood Donation', '2025-11-22', 'College campus, Mahabaleshwar', 'First-time donors from the college; the largest single collection of the year for the hospital blood store.', 5),
  ];

  function seed() {
    const t = now();
    const base = (o, i, p) => Object.assign({ id: uid(p), order: i + 1, status: 'published', createdAt: ago(30), updatedAt: ago(30 - i), updatedBy: 'System import' }, o);
    const media = [
      { id: 'm-icu', name: 'photo-icu-bed.png', src: 'assets/photo-icu-bed.png' },
      { id: 'm-ot', name: 'photo-ot-banner.png', src: 'assets/photo-ot-banner.png' },
      { id: 'm-path', name: 'photo-pathology.png', src: 'assets/photo-pathology.png' },
      { id: 'm-corr', name: 'photo-corridor.png', src: 'assets/photo-corridor.png' },
    ].map(m => Object.assign({ width: 0, height: 0, size: 0, type: 'image/png', uploadedAt: ago(30), preset: 'facility', imported: true }, m));
    return {
      version: 1,
      doctors: doctorSeed.map((d, i) => base({ name: d[0], designation: d[1], speciality: d[2], qualifications: d[3], experience: d[4], bio: d[5], schedule: d[6], days: [], start: '', end: '', location: d[7], contact: '', showContact: false, imageId: null, imageAlt: '' }, i, 'doc')),
      facilities: facilitySeed.map((f, i) => base(Object.assign({ coverIndex: 0 }, f), i, 'fac')),
      events: eventSeed.map((e, i) => base(Object.assign({ endDate: '', start: '', end: '', description: '', organiser: '', highlights: '', coverId: null, gallery: [] }, e), i, 'evt')),
      categories: {
        doctors: ['Medicine', 'Surgery', 'Pediatrics', 'Orthopedics', 'Anaesthesia', 'Dental Surgeon', 'General'],
        facilities: facilityCats.slice(),
        events: eventCats.slice(),
      },
      media,
      activity: [{ at: t, who: 'System import', action: 'Imported', type: 'Content', title: 'Initial content from the MGRH website' }],
      settings: {
        editorsCanPublish: false,
        users: [
          { email: 'admin@mgrh-mahabaleshwar.org', password: 'mgrh-admin', name: 'Hospital Administrator', role: 'Administrator' },
          { email: 'editor@mgrh-mahabaleshwar.org', password: 'mgrh-editor', name: 'Content Editor', role: 'Editor' },
        ],
      },
    };
  }

  let db = null;
  const subs = new Set();
  function load() {
    if (db) return db;
    try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
    if (!db || db.version !== 1) { db = seed(); try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
    return db;
  }
  function commit(next) {
    const s = JSON.stringify(next);
    localStorage.setItem(KEY, s); // throws QuotaExceededError — callers surface it
    db = next;
    subs.forEach(f => { try { f(db); } catch (e) {} });
    return db;
  }
  window.addEventListener('storage', e => { if (e.key === KEY) { db = null; load(); subs.forEach(f => f(db)); } });

  function session() {
    try { const s = JSON.parse(localStorage.getItem(KEY + ':session') || 'null'); return s && s.expires > Date.now() ? s : null; } catch (e) { return null; }
  }
  function mediaSrc(id) {
    const m = load().media.find(x => x.id === id);
    return m ? (m.dataUrl || m.src || '') : '';
  }
  function published(type, opts) {
    const d = load();
    const preview = (opts && opts.preview) || (/[?&]preview=1/.test(location.search) && !!session());
    return (d[type] || []).filter(r => preview || r.status === 'published').slice().sort((a, b) => a.order - b.order);
  }

  window.MGRHStore = {
    KEY, uid, now, load, commit, seed, session, mediaSrc, published,
    subscribe(f) { subs.add(f); return () => subs.delete(f); },
    setSession(user) { localStorage.setItem(KEY + ':session', JSON.stringify({ email: user.email, name: user.name, role: user.role, expires: Date.now() + 8 * 3600000 })); },
    clearSession() { localStorage.removeItem(KEY + ':session'); },
    reset() { localStorage.removeItem(KEY); db = null; return load(); },
  };
})();

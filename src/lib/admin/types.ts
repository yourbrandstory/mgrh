export type Status = 'published' | 'draft';
export type AdminRole = 'Admin' | 'Editor';
export type Collection = 'doctors' | 'facilities' | 'events';
export type ManageKey = 'specialties' | 'categories' | 'sections' | 'support';
export type EditorType = 'doctor' | 'facility' | 'cover' | 'gallery';

export interface Crop {
  s: number;
  xf: number;
  yf: number;
  r: number;
  asp: number;
}

export interface Photo {
  id?: string;
  src: string;
  out: string;
  alt: string;
  nat: { w: number; h: number };
  crop?: Crop | null;
  outW?: number;
  outH?: number;
  dirty?: boolean;
}

export interface DoctorRecord {
  id: string;
  name: string;
  role: string;
  qual: string;
  exp: string;
  spec: string;
  schedule: string;
  location: string;
  bio: string;
  days: string[];
  start: string;
  end: string;
  contact: string;
  showContact: boolean;
  visible: boolean;
  photo: Photo | null;
  order: number;
  status: Status;
  updatedByName?: string;
  updatedByRole?: string;
  updatedAt?: string;
}

export interface FacilitySlot {
  caption: string;
  photo: Photo | null;
}

export interface FacilityRecord {
  id: string;
  name: string;
  section: string;
  desc: string;
  visible: boolean;
  extra: boolean;
  slots: [FacilitySlot, FacilitySlot, FacilitySlot];
  more: Photo[];
  review: boolean;
  coverIndex: number;
  order: number;
  status: Status;
  updatedByName?: string;
  updatedByRole?: string;
  updatedAt?: string;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  endDate: string;
  start: string;
  end: string;
  cat: string;
  loc: string;
  desc: string;
  description: string;
  organiser: string;
  highlights: string;
  status: Status;
  featured: boolean;
  cover: Photo | null;
  gallery: Photo[];
  shotLabels: number;
  order: number;
  updatedByName?: string;
  updatedByRole?: string;
  updatedAt?: string;
}

export interface SupportRecord {
  id: string;
  count: string;
  title: string;
  description: string;
  order: number;
}

export interface CategoryRecord {
  id: string;
  kind: Collection;
  name: string;
  tagline: string;
  order: number;
}

export interface CategoriesState {
  doctors: CategoryRecord[];
  facilities: CategoryRecord[];
  events: CategoryRecord[];
}

export interface AdminDb {
  doctors: DoctorRecord[];
  facilities: FacilityRecord[];
  events: EventRecord[];
  support: SupportRecord[];
  categories: CategoriesState;
}

export interface SessionUser {
  name: string;
  role: AdminRole;
}

export interface DeleteSnapshot {
  collection: Collection | ManageKey;
  record: unknown;
}

export interface ImageResult {
  src: string;
  out: string;
  alt: string;
  nat: { w: number; h: number };
  crop: Crop;
  outW: number;
  outH: number;
  dirty: true;
}

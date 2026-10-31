export type Status = 'published' | 'draft';

export interface Crop {
  zoom: number;
  x: number;
  y: number;
  rot: number;
}

export interface Doctor {
  id: string;
  order: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  name: string;
  designation: string;
  speciality: string;
  qualifications: string;
  experience: string;
  bio: string;
  schedule: string;
  days: string[];
  start: string;
  end: string;
  location: string;
  contact: string;
  showContact: boolean;
  imageId: string | null;
  imageAlt: string;
}

export interface GalleryItem {
  mediaId: string;
  caption: string;
  alt: string;
}

export interface SubItem {
  name: string;
  text: string;
}

export interface Facility {
  id: string;
  order: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  name: string;
  category: string;
  short: string;
  full: string;
  subcategory: string;
  subitems: SubItem[];
  images: GalleryItem[];
  coverIndex: number;
  review: boolean;
}

export interface EventRecord {
  id: string;
  order: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  title: string;
  category: string;
  date: string;
  endDate: string;
  start: string;
  end: string;
  venue: string;
  summary: string;
  description: string;
  organiser: string;
  highlights: string;
  coverId: string | null;
  coverAlt: string;
  shotLabels: number;
  gallery: GalleryItem[];
}

export type RecordItem = Doctor | Facility | EventRecord;
export type Collection = 'doctors' | 'facilities' | 'events';

export interface MediaItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  size: number;
  type: string;
  uploadedAt: string;
  preset: string;
  crop?: Crop | null;
  storagePath?: string;
  originalPath?: string;
  originalSrc?: string | null;
  dataUrl?: string | null;
  originalDataUrl?: string | null;
  source?: Record<string, unknown>;
  parentId?: string | null;
}

export interface ActivityItem {
  id?: string;
  at: string;
  who: string;
  action: string;
  type: string;
  title: string;
}

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  password?: string;
}

export interface SettingsState {
  editorsCanPublish: boolean;
  users: AdminUser[];
}

export interface CategoriesState {
  doctors: string[];
  facilities: string[];
  events: string[];
}

export interface AdminDb {
  version: 1;
  doctors: Doctor[];
  facilities: Facility[];
  events: EventRecord[];
  categories: CategoriesState;
  media: MediaItem[];
  activity: ActivityItem[];
  settings: SettingsState;
}

export interface SessionUser {
  email: string;
  name: string;
  role: string;
}

export type PresetKey = 'doctor' | 'facility' | 'event';

export interface Preset {
  label: string;
  w: number;
  h: number;
  ratio: string;
  round: boolean;
  vw: number;
  vh: number;
}

export interface MediaTarget {
  kind: 'doctor' | 'cover' | 'gallery' | 'media' | 'library';
  index?: number;
  preset?: string;
  mediaId?: string;
  assign?: (mediaId: string) => void;
}

export interface EditorSrc {
  name: string;
  size: number;
  type: string;
  w: number;
  h: number;
}

export interface EditorState {
  target: MediaTarget;
  preset: PresetKey;
  loading: boolean;
  error: string;
  src: EditorSrc;
  zoom: number;
  x: number;
  y: number;
  rot: number;
  img: HTMLImageElement | null;
  fileUrl: string | null;
  origUrl?: string | null;
  origSrc?: string | null;
  parentId?: string | null;
}

export interface PreviewState {
  type: 'doctors' | 'facilities' | 'events' | 'media';
  rec: RecordItem | MediaItem;
}

export interface ConfirmState {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  infoOnly?: boolean;
  onConfirm: () => void;
}

export interface ToastState {
  msg: string;
  kind: 'ok' | 'err';
}

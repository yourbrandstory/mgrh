'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useAdmin } from './AdminProvider';
import Icon from './Icon';
import type { Crop, EditorType, ImageResult, Photo } from '@/lib/admin/types';

export const PH = 'Up to 500 KB. You can move or crop the photo after adding it.';
const MAX_KB = 500;

const TYPES: Record<
  EditorType,
  { asp: number; w: number; h: number; label: string; min: string; round?: boolean; free?: boolean }
> = {
  doctor: { asp: 1, w: 600, h: 600, label: 'Square (1:1)', min: '600 × 600 px', round: true },
  facility: { asp: 3 / 2, w: 1200, h: 800, label: 'Landscape (3:2)', min: '1200 × 800 px' },
  cover: { asp: 4 / 3, w: 1200, h: 900, label: 'Landscape (4:3)', min: '1200 × 900 px' },
  gallery: {
    asp: 4 / 3,
    w: 1200,
    h: 900,
    label: 'Pick a shape below',
    min: '1200 px wide',
    free: true,
  },
};

const ASPECTS = [
  { value: 1.3333, label: 'Landscape 4:3' },
  { value: 1.5, label: 'Landscape 3:2' },
  { value: 1.7778, label: 'Wide 16:9' },
  { value: 1, label: 'Square 1:1' },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That file does not look like a photo. Try a different one.'));
    image.src = src;
  });
}

async function readFile(file: File): Promise<{ src: string; nat: { w: number; h: number } }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error('Please choose a JPG, PNG or WebP photo.');
  }
  if (file.size > MAX_KB * 1024) {
    throw new Error(
      `That photo is ${Math.round(file.size / 1024)} KB. Please choose one up to ${MAX_KB} KB.`,
    );
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('We could not read that file. Try a different photo.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
  const image = await loadImage(dataUrl);
  const nat = { w: image.naturalWidth, h: image.naturalHeight };
  const scale = Math.min(1, 1400 / Math.max(nat.w, nat.h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(nat.w * scale);
  canvas.height = Math.round(nat.h * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('That file does not look like a photo. Try a different one.');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { src: canvas.toDataURL('image/jpeg', 0.82), nat };
}

export function pickFiles(multi: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.multiple = multi;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    const finish = (files: File[]) => {
      input.remove();
      resolve(files);
    };
    input.addEventListener('change', () => finish([...(input.files || [])]));
    input.addEventListener('cancel', () => finish([]));
    document.body.appendChild(input);
    input.click();
  });
}

interface EditOptions {
  file?: File;
  img?: Photo;
  type: EditorType;
  title: string;
  subtitle: string;
}

interface ActiveEditor {
  id: number;
  src: string;
  nat: { w: number; h: number };
  alt: string;
  crop: Crop | null;
  type: EditorType;
  title: string;
  subtitle: string;
  resolve: (result: ImageResult | null) => void;
}

const ImageEditorContext = createContext<{ editImage: (options: EditOptions) => Promise<ImageResult | null> } | null>(
  null,
);

export function useImageEditor() {
  const value = useContext(ImageEditorContext);
  if (!value) throw new Error('useImageEditor must be used inside ImageEditorProvider');
  return value;
}

export function ImageEditorProvider({ children }: { children: ReactNode }) {
  const { toast } = useAdmin();
  const [active, setActive] = useState<ActiveEditor | null>(null);
  const nextId = useRef(1);

  const editImage = useCallback(
    async (options: EditOptions): Promise<ImageResult | null> => {
      try {
        let src = '';
        let nat = { w: 1, h: 1 };
        let alt = '';
        let crop: Crop | null = null;
        if (options.file) {
          const file = await readFile(options.file);
          src = file.src;
          nat = file.nat;
        } else if (options.img) {
          src = options.img.src || options.img.out;
          nat = options.img.nat;
          alt = options.img.alt || '';
          crop = options.img.crop || null;
          if (!src) throw new Error('That photo could not be opened. Try adding it again.');
        } else {
          return null;
        }
        await loadImage(src);
        return await new Promise<ImageResult | null>((resolve) => {
          setActive({
            id: nextId.current++,
            src,
            nat,
            alt,
            crop,
            type: options.type,
            title: options.title,
            subtitle: options.subtitle,
            resolve,
          });
        });
      } catch (error) {
        toast((error as Error).message, 'err');
        return null;
      }
    },
    [toast],
  );

  return (
    <ImageEditorContext.Provider value={{ editImage }}>
      {children}
      {active ? (
        <ImageEditorModal
          key={active.id}
          active={active}
          onDone={(result) => {
            const resolve = active.resolve;
            setActive(null);
            resolve(result);
          }}
        />
      ) : null}
    </ImageEditorContext.Provider>
  );
}

function ImageEditorModal({
  active,
  onDone,
}: {
  active: ActiveEditor;
  onDone: (result: ImageResult | null) => void;
}) {
  const { toast } = useAdmin();
  const type = TYPES[active.type];
  const crop = useRef<Crop>(
    active.crop
      ? {
          s: active.crop.s || 1,
          xf: active.crop.xf || 0,
          yf: active.crop.yf || 0,
          r: active.crop.r || 0,
          asp: active.crop.asp || type.asp,
        }
      : { s: 1, xf: 0, yf: 0, r: 0, asp: type.asp },
  );
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const altInputRef = useRef<HTMLInputElement>(null);
  const points = useRef(new Map<number, { x: number; y: number }>());
  const distance = useRef(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const [ready, setReady] = useState(false);
  const [small, setSmall] = useState(false);
  const [alt, setAlt] = useState(active.alt);
  const [shape, setShape] = useState(() => {
    if (!active.crop) return type.asp;
    return ASPECTS.reduce((best, option) =>
      Math.abs(option.value - active.crop!.asp) < Math.abs(best.value - active.crop!.asp) ? option : best,
    ).value;
  });

  useEffect(() => {
    let cancelled = false;
    loadImage(active.src)
      .then((image) => {
        if (cancelled) return;
        imageRef.current = image;
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        doneRef.current(null);
      });
    return () => {
      cancelled = true;
    };
  }, [active.src]);

  const paint = (target: HTMLCanvasElement, width: number, height: number) => {
    const image = imageRef.current;
    if (!image) return;
    const context = target.getContext('2d');
    if (!context) return;
    const e = crop.current;
    context.fillStyle = '#dfe9e7';
    context.fillRect(0, 0, width, height);
    const rotated = e.r % 2;
    const iw = rotated ? image.naturalHeight : image.naturalWidth;
    const ih = rotated ? image.naturalWidth : image.naturalHeight;
    const scale = Math.max(width / iw, height / ih) * e.s;
    const mx = Math.max(0, (iw * scale - width) / 2) / width;
    const my = Math.max(0, (ih * scale - height) / 2) / height;
    e.xf = clamp(e.xf, -mx, mx);
    e.yf = clamp(e.yf, -my, my);
    context.save();
    context.translate(width / 2 + e.xf * width, height / 2 + e.yf * height);
    context.rotate((e.r * Math.PI) / 2);
    context.scale(scale, scale);
    context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    context.restore();
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    if (!canvas || !preview) return;
    if (rangeRef.current) rangeRef.current.value = String(crop.current.s);
    paint(canvas, canvas.width, canvas.height);
    const context = preview.getContext('2d');
    if (context) context.drawImage(canvas, 0, 0, preview.width, preview.height);
  };

  const layout = () => {
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    if (!canvas || !preview || !imageRef.current) return;
    const e = crop.current;
    const maxWidth = Math.min(440, Math.max(220, window.innerWidth - 80));
    const maxHeight = Math.min(360, window.innerHeight * 0.45);
    let width = maxWidth;
    let height = width / e.asp;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * e.asp;
    }
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const previewWidth = type.round ? 96 : e.asp >= 1.3 ? 190 : 110;
    preview.width = previewWidth;
    preview.height = Math.round(previewWidth / e.asp);
    preview.style.width = previewWidth + 'px';
    preview.style.height = preview.height + 'px';
    const low = Math.min(active.nat.w, active.nat.h);
    const high = Math.max(active.nat.w, active.nat.h);
    const need = type.free ? [900, 600] : [Math.max(type.w, type.h), Math.min(type.w, type.h)];
    setSmall(high < need[0] || low < need[1]);
    redraw();
  };

  const setZoom = (value: number) => {
    crop.current.s = clamp(value, 1, 4);
    redraw();
  };

  useEffect(() => {
    if (!ready) return;
    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    canvasRef.current?.focus();
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom(crop.current.s * Math.exp(-event.deltaY * 0.0018));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') doneRef.current(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    distance.current = 0;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = points.current.get(event.pointerId);
    if (!point) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (points.current.size === 1) {
      crop.current.xf += (event.clientX - point.x) / rect.width;
      crop.current.yf += (event.clientY - point.y) / rect.height;
      points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      redraw();
      return;
    }
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const [a, b] = Array.from(points.current.values());
    const next = Math.hypot(a.x - b.x, a.y - b.y);
    if (distance.current) {
      crop.current.s = clamp((crop.current.s * next) / distance.current, 1, 4);
    }
    distance.current = next;
    redraw();
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    points.current.delete(event.pointerId);
    distance.current = 0;
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
    const key = event.key;
    const step = 0.03;
    if (key === 'ArrowLeft') crop.current.xf -= step;
    else if (key === 'ArrowRight') crop.current.xf += step;
    else if (key === 'ArrowUp') crop.current.yf -= step;
    else if (key === 'ArrowDown') crop.current.yf += step;
    else if (key === '+' || key === '=') crop.current.s = clamp(crop.current.s + 0.1, 1, 4);
    else if (key === '-') crop.current.s = clamp(crop.current.s - 0.1, 1, 4);
    else return;
    event.preventDefault();
    redraw();
  };

  const save = () => {
    if (!imageRef.current) return;
    try {
      const output = document.createElement('canvas');
      output.width = type.w;
      output.height = Math.round(type.w / crop.current.asp);
      paint(output, output.width, output.height);
      const result: ImageResult = {
        src: active.src,
        out: output.toDataURL('image/jpeg', 0.86),
        alt: alt.trim(),
        nat: active.nat,
        crop: {
          s: crop.current.s,
          xf: crop.current.xf,
          yf: crop.current.yf,
          r: crop.current.r,
          asp: crop.current.asp,
        },
        outW: output.width,
        outH: output.height,
        dirty: true,
      };
      doneRef.current(result);
    } catch {
      toast('That photo could not be processed. Try a different one.', 'err');
    }
  };

  return (
    <div className="back cback" role="presentation">
      <div className="ed" role="dialog" aria-modal="true" aria-label="Adjust photo">
        <div className="dh">
          <h2>Adjust photo</h2>
          <button className="ibtn" type="button" aria-label="Close" onClick={() => doneRef.current(null)}>
            <Icon name="x" />
          </button>
        </div>
        <div className="edbody">
          <div>
            <div className="frame">
              <canvas
                ref={canvasRef}
                tabIndex={0}
                aria-label="Photo crop area. Drag to move, plus and minus to zoom."
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={onKeyDown}
              />
            </div>
            <div className="zrow">
              <button className="ibtn" type="button" aria-label="Zoom out" onClick={() => setZoom(crop.current.s - 0.2)}>
                <Icon name="zo" />
              </button>
              <input
                ref={rangeRef}
                type="range"
                min="1"
                max="4"
                step="0.01"
                defaultValue="1"
                aria-label="Zoom"
                onChange={(event) => setZoom(parseFloat(event.target.value))}
              />
              <button className="ibtn" type="button" aria-label="Zoom in" onClick={() => setZoom(crop.current.s + 0.2)}>
                <Icon name="zi" />
              </button>
              <button
                className="btn sm"
                type="button"
                onClick={() => {
                  crop.current.r = (crop.current.r + 1) % 4;
                  crop.current.xf = 0;
                  crop.current.yf = 0;
                  redraw();
                }}
              >
                <Icon name="rot" size={16} /> Rotate
              </button>
              <button
                className="btn sm"
                type="button"
                onClick={() => {
                  crop.current.s = 1;
                  crop.current.xf = 0;
                  crop.current.yf = 0;
                  crop.current.r = 0;
                  redraw();
                }}
              >
                Reset
              </button>
            </div>
            <p className="hint" style={{ marginTop: 8 }}>
              Drag the photo to move it. Zoom with the slider, mouse wheel or two fingers.
            </p>
          </div>
          <div>
            <div className="rec">
              Photo size: up to <b>{MAX_KB} KB</b>. Drag to move it, or use the zoom to crop it.
            </div>
            <div id="edwarn">
              {ready ? (
                small ? (
                  <div className="note" style={{ marginTop: 10 }}>
                    This photo is small. It may look blurry on the website. Try a larger one.
                  </div>
                ) : (
                  <div className="note info" style={{ marginTop: 10 }}>
                    This photo looks good.
                  </div>
                )
              ) : null}
            </div>
            {type.free ? (
              <div className="fld" style={{ marginTop: 12 }}>
                <label htmlFor="edasp">Shape</label>
                <select
                  id="edasp"
                  value={shape}
                  onChange={(event) => {
                    const value = parseFloat(event.target.value);
                    crop.current.asp = value;
                    crop.current.xf = 0;
                    crop.current.yf = 0;
                    setShape(value);
                    layout();
                  }}
                >
                  {ASPECTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="pvlab">How it will look on the website</div>
            <div className={'pv ' + (type.round ? 'round' : '')}>
              <canvas ref={previewRef} />
              <div className="pt">
                <b>{active.title}</b>
                <span>{active.subtitle}</span>
              </div>
            </div>
            <div className="fld" style={{ marginTop: 16 }}>
              <label htmlFor="edalt">Photo description</label>
              <input
                ref={altInputRef}
                type="text"
                id="edalt"
                value={alt}
                maxLength={140}
                placeholder="Example: Dr. Rasal in the operation theatre"
                onChange={(event) => setAlt(event.target.value)}
              />
              <span className="hint">Describe the photo for people who cannot see it.</span>
            </div>
          </div>
        </div>
        <div className="df">
          <button className="btn" type="button" onClick={() => doneRef.current(null)}>
            Cancel
          </button>
          <button className="btn pri" type="button" onClick={save}>
            Save photo
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { drawCrop, useAdmin, type Preset, type Row } from './AdminProvider';
import { AdminIcon } from './icons';
import { Button } from './ui';

const PRESET_SIZE: Record<Preset, [number, number]> = {
  doctor: [800, 800],
  facility: [1200, 900],
  event: [1200, 900],
};

function CropDialog({
  file,
  preset,
  onCancel,
  onDone,
}: {
  file: File;
  preset: Preset;
  onCancel: () => void;
  onDone: (media: Row) => void;
}) {
  const { uploadImage } = useAdmin();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setImg(image);
    image.onerror = () => setError('That file could not be read as an image.');
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const [tw, th] = PRESET_SIZE[preset];
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    if (ctx) drawCrop(ctx, img, preset, { zoom, x, y });
  }, [img, preset, zoom, x, y]);

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      const media = await uploadImage(file, preset, { zoom, x, y });
      onDone(media);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const [tw, th] = PRESET_SIZE[preset];
  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-[rgba(9,45,40,0.6)] px-4 py-8 backdrop-blur-[2px]">
      <div className="admin-modal-anim my-auto w-full max-w-[760px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E2ECE9] px-6 py-5">
          <div>
            <h2 className="text-[22px] font-semibold text-[#0B3C49]">Adjust photo</h2>
            <p className="mt-1 text-[14px] text-[#5A6A66]">
              Cropped to {tw} × {th}px. Drag the sliders to frame the image.
            </p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2ECE9]">
            <AdminIcon name="close" size={18} />
          </button>
        </div>
        <div className="grid gap-6 px-6 py-5 md:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-[#E2ECE9] bg-[#F4F7F6]">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-[14px] font-semibold text-[#23423B]">Zoom</span>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#0A8E7B]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[14px] font-semibold text-[#23423B]">Move left / right</span>
              <input type="range" min={-1} max={1} step={0.01} value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full accent-[#0A8E7B]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[14px] font-semibold text-[#23423B]">Move up / down</span>
              <input type="range" min={-1} max={1} step={0.01} value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full accent-[#0A8E7B]" />
            </label>
            <p className="rounded-lg bg-[#F1F8F6] px-3 py-2 text-[13px] leading-[1.5] text-[#45605A]">
              The original is kept too, so a photo can be re-cropped later.
            </p>
            {img && (img.naturalWidth < tw || img.naturalHeight < th) && (
              <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 text-[13px] font-medium leading-[1.5] text-[#8A6A2A]">
                This photo is smaller than {tw} × {th}px, so it may look soft on large screens.
              </p>
            )}
            {error && <p className="text-[13.5px] font-medium text-[#B4251E]">{error}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E2ECE9] bg-[#FAFCFB] px-6 py-4">
          <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button onClick={confirm} disabled={busy || !img}>{busy ? 'Uploading…' : 'Use this photo'}</Button>
        </div>
      </div>
    </div>
  );
}

export default function ImageField({
  value,
  preset,
  onChange,
  label = 'Photo',
  hint,
}: {
  value: string | null;
  preset: Preset;
  onChange: (media: Row) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  return (
    <div>
      <div className="mb-1.5 text-[14.5px] font-semibold text-[#23423B]">{label}</div>
      <div className="flex items-center gap-4 rounded-xl border border-[#E2ECE9] bg-[#FAFCFB] p-3">
        <div className="flex h-[84px] w-[84px] flex-none items-center justify-center overflow-hidden rounded-lg border border-[#E2ECE9] bg-white">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <AdminIcon name="image" size={24} color="#9AABA6" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" icon="upload" onClick={() => inputRef.current?.click()}>
              {value ? 'Replace photo' : 'Upload photo'}
            </Button>
            {value && (
              <Button type="button" variant="ghost" onClick={() => onChange({ id: null } as Row)}>
                Remove
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#7A8C87]">
            {hint || `JPG, PNG or WebP · up to 5 MB · ${preset === 'doctor' ? 'square' : '4:3'} crop`}
          </p>
          {error && <p className="mt-1 text-[12.5px] font-medium text-[#B4251E]">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          e.target.value = '';
          if (!selected) return;
          if (!selected.type.match(/^image\/(jpeg|png|webp)$/)) {
            setError('Choose a JPG, PNG or WebP image.');
            return;
          }
          if (selected.size > 5 * 1024 * 1024) {
            setError('That image is larger than 5 MB.');
            return;
          }
          setError('');
          setFile(selected);
        }}
      />
      {file && (
        <CropDialog
          file={file}
          preset={preset}
          onCancel={() => setFile(null)}
          onDone={(media) => {
            setFile(null);
            onChange(media);
          }}
        />
      )}
    </div>
  );
}

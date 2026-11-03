'use client';

import { PH, pickFiles, useImageEditor } from './ImageEditor';
import Icon from './Icon';
import type { EditorType, Photo } from '@/lib/admin/types';

const SHAPE: Partial<Record<EditorType, string>> = {
  doctor: 'round',
  facility: 'r32',
  cover: 'r43',
};

export default function ImageField({
  label,
  hint,
  type,
  photo,
  title,
  subtitle,
  onChange,
}: {
  label: string;
  hint?: string;
  type: EditorType;
  photo: Photo | null;
  title: string;
  subtitle: string;
  onChange: (photo: Photo | null) => void;
}) {
  const { editImage } = useImageEditor();

  const add = async () => {
    const files = await pickFiles(false);
    if (!files.length) return;
    const result = await editImage({ file: files[0], type, title, subtitle });
    if (result) onChange(result as Photo);
  };

  const adjust = async () => {
    if (!photo) return;
    const result = await editImage({ img: photo, type, title, subtitle });
    if (result) onChange(result as Photo);
  };

  return (
    <div className="imgf">
      <label className="lb" style={{ fontWeight: 600, fontSize: 14.5 }}>
        {label}
      </label>
      <div style={{ display: 'grid', gap: 10 }}>
        <div className={'imgbox ' + (SHAPE[type] || '') + (photo ? ' filled' : '')}>
          {photo ? <img src={photo.out} alt={photo.alt} /> : <span>No photo yet</span>}
        </div>
        <div className="acts">
          <button className="btn sm" type="button" onClick={() => void add()}>
            <Icon name="img" size={16} /> {photo ? 'Replace' : 'Add photo'}
          </button>
          {photo ? (
            <>
              <button className="btn sm" type="button" onClick={() => void adjust()}>
                Adjust
              </button>
              <button className="btn sm dng" type="button" onClick={() => onChange(null)}>
                Remove
              </button>
            </>
          ) : null}
        </div>
      </div>
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

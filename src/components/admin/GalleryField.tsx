'use client';

import { useImageEditor } from './ImageEditor';
import Icon from './Icon';
import type { Photo } from '@/lib/admin/types';

export default function GalleryField({
  photos,
  title,
  subtitle,
  hideEmpty,
  onChange,
}: {
  photos: Photo[];
  title: string;
  subtitle: string;
  hideEmpty?: boolean;
  onChange: (photos: Photo[]) => void;
}) {
  const { editImage } = useImageEditor();

  const adjust = async (index: number) => {
    const result = await editImage({ img: photos[index], type: 'gallery', title, subtitle });
    if (!result) return;
    const next = photos.slice();
    next[index] = result as Photo;
    onChange(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const next = photos.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  if (!photos.length) {
    return hideEmpty ? null : <div className="empty">No gallery photos yet.</div>;
  }

  return (
    <div className="gal">
      {photos.map((photo, index) => (
        <div className="gi" key={index}>
          <img src={photo.out} alt={photo.alt} />
          <div>
            <button
              className="ibtn"
              type="button"
              aria-label="Move earlier"
              disabled={!index}
              onClick={() => move(index, -1)}
            >
              <Icon name="up" size={15} />
            </button>
            <button
              className="ibtn"
              type="button"
              aria-label="Move later"
              disabled={index >= photos.length - 1}
              onClick={() => move(index, 1)}
            >
              <Icon name="down" size={15} />
            </button>
            <button className="ibtn" type="button" aria-label="Adjust photo" onClick={() => void adjust(index)}>
              <Icon name="edit" size={15} />
            </button>
            <button
              className="ibtn"
              type="button"
              aria-label="Remove photo"
              onClick={() => onChange(photos.filter((_, position) => position !== index))}
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

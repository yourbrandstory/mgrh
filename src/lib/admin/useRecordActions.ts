'use client';

import { useCallback } from 'react';
import { useAdmin } from './AdminContext';
import { SING, titleOf, usage } from './format';
import type { Collection } from './types';

export function useRecordActions() {
  const admin = useAdmin();

  const toggleStatus = useCallback(
    (type: Collection, id: string) => {
      if (!admin.can('publish')) return admin.toast('Your role can’t publish or unpublish. Ask an administrator.', 'err');
      const rec = admin.db[type].find((r) => r.id === id);
      if (!rec) return;
      const to = rec.status === 'published' ? 'draft' : 'published';
      const ok = admin.persist(
        (db) => {
          const r = (db[type] as { id: string; status: string; updatedAt: string; updatedBy: string }[]).find((x) => x.id === id);
          if (!r) return;
          r.status = to;
          r.updatedAt = new Date().toISOString();
          r.updatedBy = admin.user ? admin.user.name : 'Admin';
        },
        { action: to === 'published' ? 'Published' : 'Unpublished', type: SING[type], title: titleOf(rec) },
      );
      if (ok) {
        admin.toast(
          to === 'published'
            ? '“' + titleOf(rec) + '” is now live on the website.'
            : '“' + titleOf(rec) + '” has been hidden from the website.',
        );
      }
    },
    [admin],
  );

  const deleteRecord = useCallback(
    (type: Collection, id: string, onDeleted?: () => void) => {
      if (!admin.can('delete')) return admin.toast('Only administrators can delete content.', 'err');
      const rec = admin.db[type].find((r) => r.id === id);
      if (!rec) return;
      admin.confirm({
        title: 'Delete “' + titleOf(rec) + '”?',
        body:
          'This permanently removes the ' +
          SING[type].toLowerCase() +
          ' from the CMS and the website. Images stay in the Media Library. This can’t be undone.',
        confirmLabel: 'Delete permanently',
        danger: true,
        onConfirm: () => {
          if (admin.persist((db) => { db[type] = db[type].filter((r) => r.id !== id) as never; }, { action: 'Deleted', type: SING[type], title: titleOf(rec) })) {
            admin.toast('“' + titleOf(rec) + '” was deleted.');
            if (onDeleted) onDeleted();
          }
        },
      });
    },
    [admin],
  );

  const move = useCallback(
    (type: Collection, id: string, dir: number) => {
      const list = admin.db[type].slice().sort((a, b) => a.order - b.order);
      const i = list.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      const a = list[i];
      const b = list[j];
      admin.persist(
        (db) => {
          const A = (db[type] as { id: string; order: number }[]).find((r) => r.id === a.id);
          const B = (db[type] as { id: string; order: number }[]).find((r) => r.id === b.id);
          if (!A || !B) return;
          const t = A.order;
          A.order = B.order;
          B.order = t;
        },
        { action: 'Reordered', type: SING[type], title: titleOf(a) },
      );
    },
    [admin],
  );

  const deleteMedia = useCallback(
    (id: string) => {
      const m = admin.db.media.find((x) => x.id === id);
      if (!m) return;
      const u = usage(admin.db, id);
      if (u.length) {
        admin.confirm({
          title: 'This image is still in use',
          body:
            'It appears on ' +
            u.map((x) => x.title + ' (' + x.label.toLowerCase() + ')').join(', ') +
            '. Remove it from those records first, then delete it here.',
          confirmLabel: 'OK',
          infoOnly: true,
          onConfirm: () => {},
        });
        return;
      }
      if (!admin.can('delete')) return admin.toast('Only administrators can delete images.', 'err');
      admin.confirm({
        title: 'Delete “' + m.name + '”?',
        body: 'It isn’t used anywhere on the website. This can’t be undone.',
        confirmLabel: 'Delete image',
        danger: true,
        onConfirm: () => {
          if (admin.persist((db) => { db.media = db.media.filter((x) => x.id !== id); }, { action: 'Deleted image', type: 'Media', title: m.name })) {
            admin.toast('Image deleted.');
          }
        },
      });
    },
    [admin],
  );

  const replaceMedia = useCallback(
    (id: string) => {
      const u = usage(admin.db, id).filter((x) => x.status === 'published');
      const go = () => {
        const preset = (admin.db.media.find((m) => m.id === id) || {}).preset || 'facility';
        admin.pickFile({ kind: 'media', mediaId: id, preset }, false);
      };
      if (!u.length) return go();
      admin.confirm({
        title: 'Replace an image that’s live?',
        body:
          'This image is used on ' +
          u.length +
          ' published ' +
          (u.length === 1 ? 'page' : 'pages') +
          ': ' +
          u.map((x) => x.title).join(', ') +
          '. Replacing it updates all of them as soon as you save.',
        confirmLabel: 'Choose new image',
        onConfirm: go,
      });
    },
    [admin],
  );

  return { toggleStatus, deleteRecord, move, deleteMedia, replaceMedia };
}

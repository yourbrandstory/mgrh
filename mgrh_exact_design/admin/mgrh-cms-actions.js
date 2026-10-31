/* MGRH CMS — admin actions. Installed onto the admin component as methods.
   Every write goes through persist(), which commits to MGRHStore. */
(function () {
  const PRESETS = {
    doctor: { label: 'Doctor profile', w: 800, h: 800, ratio: '1:1', round: true, vw: 420, vh: 420 },
    facility: { label: 'Facility image', w: 1200, h: 900, ratio: '4:3', round: false, vw: 560, vh: 420 },
    event: { label: 'Event image', w: 1200, h: 900, ratio: '4:3', round: false, vw: 560, vh: 420 },
  };
  const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX = 5 * 1024 * 1024;
  const SING = { doctors: 'Doctor', facilities: 'Facility', events: 'Event' };
  const titleOf = r => (r && (r.name || r.title)) || 'Untitled';

  function blank(type, db) {
    const order = Math.max(0, ...db[type].map(r => r.order || 0)) + 1;
    if (type === 'doctors') return { name: '', designation: '', speciality: '', qualifications: '', experience: '', bio: '', schedule: '', days: [], start: '', end: '', location: '', contact: '', showContact: false, imageId: null, imageAlt: '', order, status: 'draft' };
    if (type === 'facilities') return { name: '', category: '', subcategory: '', short: '', full: '', subitems: [], images: [], coverIndex: 0, order, status: 'draft' };
    return { title: '', category: '', date: '', endDate: '', start: '', end: '', venue: '', summary: '', description: '', organiser: '', highlights: '', coverId: null, coverAlt: '', gallery: [], shotLabels: 0, order, status: 'draft' };
  }

  function validate(type, d) {
    const e = {};
    if (type === 'doctors') { if (!d.name.trim()) e.name = 'Enter the doctor’s full name.'; if (!d.speciality) e.speciality = 'Choose a speciality.'; if (d.start && d.end && d.end <= d.start) e.end = 'End time must be after the start time.'; }
    if (type === 'facilities') { if (!d.name.trim()) e.name = 'Enter the facility name.'; if (!d.category) e.category = 'Choose the section this facility appears under.'; }
    if (type === 'events') { if (!d.title.trim()) e.title = 'Enter the event title.'; if (!d.category) e.category = 'Choose a category.'; if (d.endDate && d.date && d.endDate < d.date) e.endDate = 'End date must be on or after the event date.'; }
    return e;
  }

  function usage(db, id) {
    const u = [];
    db.doctors.forEach(r => { if (r.imageId === id) u.push({ type: 'doctors', label: 'Doctor profile', title: r.name, status: r.status, id: r.id }); });
    db.facilities.forEach(r => { if ((r.images || []).some(i => i.mediaId === id)) u.push({ type: 'facilities', label: 'Facility gallery', title: r.name, status: r.status, id: r.id }); });
    db.events.forEach(r => {
      if (r.coverId === id) u.push({ type: 'events', label: 'Event cover', title: r.title, status: r.status, id: r.id });
      if ((r.gallery || []).some(i => i.mediaId === id)) u.push({ type: 'events', label: 'Event gallery', title: r.title, status: r.status, id: r.id });
    });
    return u;
  }

  function drawTo(ctx, W, H, ed, mask) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#E7EEEC'; ctx.fillRect(0, 0, W, H);
    if (!ed.img) return;
    const r = ((ed.rot % 360) + 360) % 360;
    const nw = ed.img.naturalWidth, nh = ed.img.naturalHeight;
    const sw = r % 180 ? nh : nw, sh = r % 180 ? nw : nh;
    const s = Math.max(W / sw, H / sh) * ed.zoom;
    ctx.save();
    ctx.translate(W / 2 + ed.x * W, H / 2 + ed.y * H);
    ctx.rotate(r * Math.PI / 180); ctx.scale(s, s);
    ctx.drawImage(ed.img, -nw / 2, -nh / 2);
    ctx.restore();
    if (!mask) return;
    const P = PRESETS[ed.preset];
    ctx.save();
    if (P.round) {
      ctx.fillStyle = 'rgba(12,34,32,0.55)';
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H / 2, Math.min(W, H) / 2 - 3, 0, Math.PI * 2); ctx.fill('evenodd');
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) / 2 - 3, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
      for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(W * i / 3, 0); ctx.lineTo(W * i / 3, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, H * i / 3); ctx.lineTo(W, H * i / 3); ctx.stroke(); }
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
    }
    ctx.restore();
  }

  function clampEd(ed) {
    if (!ed.img) return ed;
    const P = PRESETS[ed.preset];
    const r = ((ed.rot % 360) + 360) % 360;
    const nw = ed.img.naturalWidth, nh = ed.img.naturalHeight;
    const sw = r % 180 ? nh : nw, sh = r % 180 ? nw : nh;
    const s = Math.max(P.w / sw, P.h / sh) * ed.zoom;
    const mx = Math.max(0, (sw * s - P.w) / 2) / P.w, my = Math.max(0, (sh * s - P.h) / 2) / P.h;
    return Object.assign({}, ed, { x: Math.min(mx, Math.max(-mx, ed.x)), y: Math.min(my, Math.max(-my, ed.y)) });
  }

  const methods = {
    toast(msg, kind) {
      clearTimeout(this._toastT);
      this.setState({ toast: { msg, kind: kind || 'ok' } });
      this._toastT = setTimeout(() => this.setState({ toast: null }), kind === 'err' ? 6000 : 3400);
    },
    persist(mut, act) {
      const S = window.MGRHStore;
      const next = JSON.parse(JSON.stringify(this.state.db));
      mut(next);
      if (act) { next.activity.unshift(Object.assign({ at: S.now(), who: (this.state.user || {}).name || 'Admin' }, act)); next.activity = next.activity.slice(0, 200); }
      try { S.commit(next); this.setState({ db: next }); return true; }
      catch (e) { this.toast('Couldn’t save. The browser’s storage is full. Delete unused images in the Media Library, then try again.', 'err'); return false; }
    },
    can(what) {
      const u = this.state.user; if (!u) return false;
      if (u.role === 'Administrator') return true;
      if (what === 'publish') return !!this.state.db.settings.editorsCanPublish;
      if (what === 'delete' || what === 'admin') return false;
      return true;
    },
    dirty() { return !!this.state.draft && JSON.stringify(this.state.draft) !== this.state.draftOrig; },
    guard(fn) {
      if (!this.dirty()) return fn();
      this.setState({ confirm: { title: 'Discard unsaved changes?', body: 'You have changes on this page that haven’t been saved. If you leave now they will be lost.', confirmLabel: 'Discard changes', danger: true, onConfirm: () => { this.setState({ draft: null, draftOrig: '', editId: null }); fn(); } } });
    },
    go(view) {
      this.guard(() => this.setState({ view, draft: null, draftOrig: '', editId: null, editType: null, errors: {}, q: '', filter: 'all', status: 'all', dateF: 'all', sort: view === 'events' ? 'dateDesc' : 'order', topQ: '' }));
    },
    openForm(type, id) {
      this.guard(() => {
        const db = this.state.db;
        const rec = id ? db[type].find(r => r.id === id) : blank(type, db);
        if (!rec) return this.toast('That record no longer exists.', 'err');
        const draft = JSON.parse(JSON.stringify(rec));
        this.setState({ view: 'form', editType: type, editId: id || null, draft, draftOrig: JSON.stringify(draft), errors: {}, topQ: '' });
        window.scrollTo(0, 0);
      });
    },
    setDraft(key, val) { this.setState(s => ({ draft: Object.assign({}, s.draft, { [key]: val }), errors: Object.assign({}, s.errors, { [key]: '' }) })); },
    saveRecord(mode) {
      const { editType: type, editId, draft, user } = this.state;
      const errs = validate(type, draft);
      if (Object.keys(errs).length) { this.setState({ errors: errs }); return this.toast('Some required details are missing. Check the fields marked in red.', 'err'); }
      if ((mode === 'publish' || mode === 'unpublish') && !this.can('publish')) return this.toast('Your role can save drafts but not publish. Ask an administrator to publish this.', 'err');
      const status = mode === 'publish' ? 'published' : mode === 'keep' ? draft.status : 'draft';
      this.setState({ saving: mode });
      setTimeout(() => {
        const S = window.MGRHStore; const t = S.now();
        const id = editId || S.uid({ doctors: 'doc', facilities: 'fac', events: 'evt' }[type]);
        const rec = Object.assign({}, draft, { id, status, updatedAt: t, updatedBy: user.name, createdAt: draft.createdAt || t });
        if (type === 'facilities') rec.review = !String(rec.short || '').trim();
        const action = !editId ? 'Added' : mode === 'publish' && draft.status !== 'published' ? 'Published' : mode === 'unpublish' ? 'Unpublished' : 'Updated';
        const ok = this.persist(db => { const a = db[type]; const i = a.findIndex(r => r.id === id); if (i >= 0) a[i] = rec; else a.push(rec); }, { action, type: SING[type], title: titleOf(rec) });
        if (!ok) return this.setState({ saving: null });
        this.setState({ saving: null, editId: id, draft: rec, draftOrig: JSON.stringify(rec) });
        this.toast(status === 'published' ? (mode === 'keep' ? 'Changes saved and live on the website.' : 'Published. It is now visible on the website.') : mode === 'unpublish' ? 'Unpublished. It has been removed from the website.' : 'Draft saved. It is not visible on the website yet.');
      }, 420);
    },
    toggleStatus(type, id) {
      if (!this.can('publish')) return this.toast('Your role can’t publish or unpublish. Ask an administrator.', 'err');
      const rec = this.state.db[type].find(r => r.id === id); if (!rec) return;
      const to = rec.status === 'published' ? 'draft' : 'published';
      if (this.persist(db => { const r = db[type].find(x => x.id === id); r.status = to; r.updatedAt = window.MGRHStore.now(); r.updatedBy = this.state.user.name; }, { action: to === 'published' ? 'Published' : 'Unpublished', type: SING[type], title: titleOf(rec) }))
        this.toast(to === 'published' ? '“' + titleOf(rec) + '” is now live on the website.' : '“' + titleOf(rec) + '” has been hidden from the website.');
    },
    deleteRecord(type, id) {
      if (!this.can('delete')) return this.toast('Only administrators can delete content.', 'err');
      const rec = this.state.db[type].find(r => r.id === id); if (!rec) return;
      this.setState({ confirm: { title: 'Delete “' + titleOf(rec) + '”?', body: 'This permanently removes the ' + SING[type].toLowerCase() + ' from the CMS and the website. Images stay in the Media Library. This can’t be undone.', confirmLabel: 'Delete permanently', danger: true, onConfirm: () => {
        if (this.persist(db => { db[type] = db[type].filter(r => r.id !== id); }, { action: 'Deleted', type: SING[type], title: titleOf(rec) })) {
          this.toast('“' + titleOf(rec) + '” was deleted.');
          if (this.state.editId === id) this.setState({ view: type, draft: null, draftOrig: '', editId: null });
        }
      } } });
    },
    move(type, id, dir) {
      const list = this.state.db[type].slice().sort((a, b) => a.order - b.order);
      const i = list.findIndex(r => r.id === id), j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      const a = list[i], b = list[j];
      this.persist(db => { const A = db[type].find(r => r.id === a.id), B = db[type].find(r => r.id === b.id); const t = A.order; A.order = B.order; B.order = t; }, { action: 'Reordered', type: SING[type], title: titleOf(a) });
    },
    /* ---- images ---- */
    pickFile(target, multiple) {
      this._target = target;
      const el = this.fileRef.current; if (!el) return;
      el.value = ''; el.multiple = !!multiple; el.click();
    },
    onFile(e) {
      const files = Array.from(e.target.files || []); if (!files.length) return;
      const ok = [];
      files.forEach(f => {
        if (!ACCEPT.includes(f.type)) this.toast('“' + f.name + '” isn’t a supported image. Use a JPG, PNG or WebP file.', 'err');
        else if (f.size > MAX) this.toast('“' + f.name + '” is ' + (f.size / 1048576).toFixed(1) + ' MB. The maximum is 5 MB.', 'err');
        else ok.push(f);
      });
      if (!ok.length) return;
      this._queue = ok.slice(1);
      this.editFile(ok[0], this._target);
    },
    presetFor(target) { return target.kind === 'doctor' ? 'doctor' : (this.state.editType === 'events' || target.kind === 'cover') ? 'event' : target.preset || 'facility'; },
    editFile(file, target) {
      const preset = this.presetFor(target);
      this.setState({ editor: { target, preset, loading: true, error: '', src: { name: file.name, size: file.size, type: file.type, w: 0, h: 0 }, zoom: 1, x: 0, y: 0, rot: 0, img: null, fileUrl: null } });
      const fr = new FileReader();
      fr.onerror = () => this.edFail('The file couldn’t be read. Try choosing it again.');
      fr.onload = () => {
        const img = new Image();
        img.onload = () => this.setState(s => s.editor ? { editor: Object.assign({}, s.editor, { loading: false, img, fileUrl: fr.result, src: Object.assign({}, s.editor.src, { w: img.naturalWidth, h: img.naturalHeight }) }) } : null);
        img.onerror = () => this.edFail('This file couldn’t be opened as an image. Try a different JPG, PNG or WebP file.');
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    },
    editMedia(mediaId, target) {
      const m = this.state.db.media.find(x => x.id === mediaId); if (!m) return;
      const url = m.originalDataUrl || m.originalSrc || m.src || m.dataUrl;
      const preset = this.presetFor(target);
      const keepCrop = m.crop && m.preset === preset;
      this.setState({ editor: { target, preset, loading: true, error: '', src: Object.assign({ name: m.name, size: m.size, type: m.type, w: 0, h: 0 }, m.source || {}), zoom: keepCrop ? m.crop.zoom : 1, x: keepCrop ? m.crop.x : 0, y: keepCrop ? m.crop.y : 0, rot: keepCrop ? m.crop.rot : 0, img: null, fileUrl: null, origUrl: m.originalDataUrl || null, origSrc: m.originalSrc || m.src || null, parentId: m.parentId || m.id } });
      const img = new Image();
      img.onload = () => this.setState(s => s.editor ? { editor: Object.assign({}, s.editor, { loading: false, img, src: Object.assign({}, s.editor.src, { w: img.naturalWidth, h: img.naturalHeight }) }) } : null);
      img.onerror = () => this.edFail('The original image couldn’t be loaded.');
      img.src = url;
    },
    edFail(msg) { this.setState(s => s.editor ? { editor: Object.assign({}, s.editor, { loading: false, error: msg }) } : null); },
    edSet(patch) { this.setState(s => ({ editor: clampEd(Object.assign({}, s.editor, patch)) })); },
    edCancel() { this.setState({ editor: null }); this.nextQueued(); },
    nextQueued() { const f = (this._queue || []).shift(); if (f) setTimeout(() => this.editFile(f, this._target), 120); },
    edSave() {
      const ed = this.state.editor; if (!ed || !ed.img) return;
      const P = PRESETS[ed.preset];
      const c = document.createElement('canvas'); c.width = P.w; c.height = P.h;
      drawTo(c.getContext('2d'), P.w, P.h, ed, false);
      let url; try { url = c.toDataURL('image/jpeg', 0.86); } catch (e) { return this.edFail('This image couldn’t be processed. Try uploading it again.'); }
      const S = window.MGRHStore; const t = ed.target;
      const asset = { id: S.uid('m'), name: (ed.src.name || 'image').replace(/\.[a-z]+$/i, '') + '.jpg', dataUrl: url, width: P.w, height: P.h, size: Math.round(url.length * 0.75), type: 'image/jpeg', uploadedAt: S.now(), preset: ed.preset, crop: { zoom: ed.zoom, x: ed.x, y: ed.y, rot: ed.rot }, source: Object.assign({}, ed.src), originalDataUrl: ed.fileUrl && ed.fileUrl.length < 1600000 ? ed.fileUrl : ed.origUrl || null, originalSrc: ed.origSrc || null, parentId: ed.parentId || null };
      this.setState({ edSaving: true });
      setTimeout(() => {
        let ok;
        if (t.kind === 'media') {
          ok = this.persist(db => { const i = db.media.findIndex(m => m.id === t.mediaId); if (i >= 0) db.media[i] = Object.assign({}, asset, { id: t.mediaId, uploadedAt: db.media[i].uploadedAt, name: db.media[i].name }); }, { action: 'Replaced image', type: 'Media', title: asset.name });
          if (ok) this.toast('Image replaced. Every page using it now shows the new version.');
        } else {
          ok = this.persist(db => { db.media.unshift(asset); }, { action: 'Uploaded image', type: 'Media', title: asset.name });
          if (ok) { if (t.kind !== 'library') this.assign(t, asset.id); this.toast(t.kind === 'library' ? 'Image added to the Media Library.' : 'Image ready. Save the record to keep this change.'); }
        }
        this.setState({ edSaving: false, editor: ok ? null : this.state.editor });
        if (ok) this.nextQueued();
      }, 300);
    },
    assign(t, id) {
      const d = this.state.draft; if (!d) return;
      if (t.kind === 'doctor') { this.setDraft('imageId', id); if (!d.imageAlt) this.setDraft('imageAlt', 'Portrait of ' + (d.name || 'the doctor')); return; }
      if (t.kind === 'cover') { this.setDraft('coverId', id); if (!d.coverAlt) this.setDraft('coverAlt', d.title || ''); return; }
      const key = this.state.editType === 'facilities' ? 'images' : 'gallery';
      const arr = (this.state.draft[key] || []).slice();
      if (t.index != null && arr[t.index]) arr[t.index] = Object.assign({}, arr[t.index], { mediaId: id });
      else arr.push({ mediaId: id, caption: '', alt: '' });
      this.setDraft(key, arr);
    },
    galleryOp(op, i, val) {
      const key = this.state.editType === 'facilities' ? 'images' : 'gallery';
      const arr = (this.state.draft[key] || []).slice();
      let cover = this.state.draft.coverIndex || 0;
      if (op === 'up' && i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; if (cover === i) cover--; else if (cover === i - 1) cover++; }
      if (op === 'down' && i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; if (cover === i) cover++; else if (cover === i + 1) cover--; }
      if (op === 'remove') { arr.splice(i, 1); if (cover >= arr.length) cover = Math.max(0, arr.length - 1); }
      if (op === 'caption' || op === 'alt') arr[i] = Object.assign({}, arr[i], { [op]: val });
      if (op === 'cover') { if (key === 'images') cover = i; else { this.setDraft('coverId', arr[i].mediaId); return; } }
      this.setState(s => ({ draft: Object.assign({}, s.draft, { [key]: arr }, key === 'images' ? { coverIndex: cover } : {}) }));
    },
    deleteMedia(id) {
      const m = this.state.db.media.find(x => x.id === id); if (!m) return;
      const u = usage(this.state.db, id);
      if (u.length) return this.setState({ confirm: { title: 'This image is still in use', body: 'It appears on ' + u.map(x => x.title + ' (' + x.label.toLowerCase() + ')').join(', ') + '. Remove it from those records first, then delete it here.', confirmLabel: 'OK', infoOnly: true, onConfirm: () => {} } });
      if (!this.can('delete')) return this.toast('Only administrators can delete images.', 'err');
      this.setState({ confirm: { title: 'Delete “' + m.name + '”?', body: 'It isn’t used anywhere on the website. This can’t be undone.', confirmLabel: 'Delete image', danger: true, onConfirm: () => { if (this.persist(db => { db.media = db.media.filter(x => x.id !== id); }, { action: 'Deleted image', type: 'Media', title: m.name })) this.toast('Image deleted.'); } } });
    },
    replaceMedia(id) {
      const u = usage(this.state.db, id).filter(x => x.status === 'published');
      const go = () => this.pickFile({ kind: 'media', mediaId: id, preset: (this.state.db.media.find(m => m.id === id) || {}).preset || 'facility' }, false);
      if (!u.length) return go();
      this.setState({ confirm: { title: 'Replace an image that’s live?', body: 'This image is used on ' + u.length + ' published ' + (u.length === 1 ? 'page' : 'pages') + ': ' + u.map(x => x.title).join(', ') + '. Replacing it updates all of them as soon as you save.', confirmLabel: 'Choose new image', onConfirm: go } });
    },
  };

  window.MGRHCMS = { PRESETS, SING, titleOf, blank, validate, usage, drawTo, clampEd, install(cmp) { Object.keys(methods).forEach(k => { cmp[k] = methods[k].bind(cmp); }); } };
})();

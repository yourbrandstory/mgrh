/* MGRH CMS — view model. Turns store data + UI state into template values. */
(function () {
  const ce = (...a) => React.createElement(...a);
  const C = () => window.MGRHCMS;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = iso => { if (!iso) return '—'; const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso); return isNaN(d) ? '—' : d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); };
  const rel = iso => {
    if (!iso) return '—'; const d = new Date(iso); const m = (Date.now() - d) / 60000;
    if (m < 1) return 'Just now'; if (m < 60) return Math.round(m) + ' min ago';
    if (m < 1440) return Math.round(m / 60) + ' h ago'; if (m < 10080) return Math.round(m / 1440) + ' days ago';
    return fmtDate(iso);
  };
  const kb = b => !b ? '—' : b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const pill = st => st === 'published' ? { label: 'Published', bg: '#E1F3EF', color: '#0A5F52' } : { label: 'Draft', bg: '#FDF3E1', color: '#8A5A06' };
  const icon = (paths, color, size) => ce('svg', { width: size || 19, height: size || 19, viewBox: '0 0 24 24', fill: 'none', stroke: color || 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }, paths.map((d, i) => ce('path', { key: i, d })));
  const IC = {
    dash: ['M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z'],
    doc: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 20.5a7.5 7.5 0 0 1 15 0'],
    fac: ['M4 20.5V9.4l8-5 8 5v11.1', 'M2.5 20.5h19', 'M12 10.4v5.2M9.4 13h5.2'],
    evt: ['M4 6.5h16v14H4z', 'M4 11h16', 'M8.5 4v4M15.5 4v4'],
    media: ['M4 5h16v14H4z', 'M4 16l5-5 4 4 3-3 4 4', 'M15.5 9.5h.01'],
    set: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z'],
  };
  const selStyle = { height: 44, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, background: '#fff', fontFamily: 'inherit', fontSize: 15.5, color: '#16413A', minWidth: 170 };
  const sel = (value, opts, onChange, extra) => ce('select', { value, onChange, style: Object.assign({}, selStyle, extra || {}) }, opts.map(o => ce('option', { key: o.value, value: o.value }, o.label)));
  const bg = src => src ? 'url("' + String(src).replace(/"/g, '%22') + '")' : 'none';
  const initials = s => (s || '?').replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  function vals(cmp) {
    const st = cmp.state, db = st.db, S = window.MGRHStore;
    if (!db) return { ready: false, showLogin: false, showApp: false };
    const msrc = id => { const m = id && db.media.find(x => x.id === id); return m ? (m.dataUrl || m.src || '') : ''; };
    const u = st.user;
    const out = { ready: true, showLogin: !u, showApp: !!u, fileRef: cmp.fileRef, importRef: cmp.importRef, onFile: cmp.onFile, onImportFile: cmp.onImportFile };

    /* login */
    const L = st.login;
    Object.assign(out, {
      lgEmail: L.email, lgPass: L.password, lgError: L.error, hasLgError: !!L.error, lgBtn: L.busy ? 'Signing in…' : 'Sign in',
      onLgEmail: e => cmp.setState({ login: Object.assign({}, L, { email: e.target.value, error: '' }) }),
      onLgPass: e => cmp.setState({ login: Object.assign({}, L, { password: e.target.value, error: '' }) }),
      onLogin: e => { e.preventDefault(); cmp.login(); },
    });
    if (!u) return Object.assign(out, modals(cmp, msrc));

    const views = { dashboard: 'Dashboard', doctors: 'Doctors', facilities: 'Facilities', events: 'Events', media: 'Media Library', settings: 'Settings' };
    const navKey = st.view === 'form' ? st.editType : st.view;
    out.nav = [['dashboard', IC.dash], ['doctors', IC.doc], ['facilities', IC.fac], ['events', IC.evt], ['media', IC.media], ['settings', IC.set]].map(([k, ic]) => {
      const on = navKey === k;
      return { label: views[k], icon: icon(ic, on ? '#0A8E7B' : '#5A6A66'), onClick: () => cmp.go(k), bg: on ? '#E6F4F1' : 'transparent', color: on ? '#0B4F45' : '#35514B', bar: on ? '#0A8E7B' : 'transparent', weight: on ? 700 : 500 };
    });
    Object.assign(out, { userName: u.name, userRole: u.role, userInitials: initials(u.name), onLogout: () => cmp.guard(() => cmp.logout()) });

    /* top bar */
    const sing = C().SING;
    const formTitle = st.view === 'form' ? (st.editId ? 'Edit ' : 'Add ') + sing[st.editType].toLowerCase() : '';
    out.crumbs = st.view === 'form' ? [{ label: 'Dashboard', onClick: () => cmp.go('dashboard') }, { label: views[st.editType], onClick: () => cmp.go(st.editType) }] : st.view === 'dashboard' ? [] : [{ label: 'Dashboard', onClick: () => cmp.go('dashboard') }];
    out.pageTitle = st.view === 'form' ? formTitle : views[st.view];
    const tq = st.topQ.trim().toLowerCase();
    out.topQ = st.topQ; out.onTopQ = e => cmp.setState({ topQ: e.target.value });
    out.topResults = tq.length < 2 ? [] : ['doctors', 'facilities', 'events'].flatMap(t => db[t].filter(r => C().titleOf(r).toLowerCase().includes(tq)).map(r => ({ title: C().titleOf(r), typeLabel: sing[t], status: pill(r.status).label, onClick: () => cmp.openForm(t, r.id) }))).slice(0, 8);
    out.hasTopResults = out.topResults.length > 0; out.topNoResults = tq.length >= 2 && !out.topResults.length;
    const pubPage = { doctors: 'Doctors page updated version.dc.html', facilities: 'Facilities (V1) update version.dc.html', events: 'Event page updated version.dc.html' }[navKey] || 'Home page V3.dc.html';
    out.onPreviewSite = () => window.open(encodeURI(pubPage), '_blank');
    out.vDash = st.view === 'dashboard'; out.vList = ['doctors', 'facilities', 'events'].includes(st.view); out.vForm = st.view === 'form'; out.vMedia = st.view === 'media'; out.vSettings = st.view === 'settings';

    if (out.vDash) Object.assign(out, dash(cmp, db, u, msrc));
    if (out.vList) Object.assign(out, list(cmp, db, st, msrc));
    if (out.vForm) Object.assign(out, form(cmp, db, st, msrc));
    if (out.vMedia) Object.assign(out, media(cmp, db, st));
    if (out.vSettings) Object.assign(out, settings(cmp, db, st, u));
    return Object.assign(out, modals(cmp, msrc));
  }

  function dash(cmp, db, u, msrc) {
    const all = ['doctors', 'facilities', 'events'].flatMap(t => db[t].map(r => Object.assign({ _t: t }, r)));
    const week = Date.now() - 7 * 86400000;
    const today = new Date().toISOString().slice(0, 10);
    const h = new Date().getHours();
    return {
      greet: (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ', ' + u.name.split(' ')[0],
      todayText: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      stats: [
        { label: 'Doctors', value: db.doctors.length, note: db.doctors.filter(r => r.status === 'published').length + ' shown on the website', onClick: () => cmp.go('doctors') },
        { label: 'Published facilities', value: db.facilities.filter(r => r.status === 'published').length, note: 'of ' + db.facilities.length + ' facilities', onClick: () => cmp.go('facilities') },
        { label: 'Events', value: db.events.length, note: db.events.filter(r => r.date >= today).length + ' upcoming', onClick: () => cmp.go('events') },
        { label: 'Drafts', value: all.filter(r => r.status !== 'published').length, note: 'not visible on the website', onClick: () => cmp.go(all.find(r => r.status !== 'published') ? all.find(r => r.status !== 'published')._t : 'doctors') },
        { label: 'Updated this week', value: all.filter(r => new Date(r.updatedAt) > week).length, note: 'across all content', onClick: () => {} },
      ],
      recent: all.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 6).map(r => {
        const p = pill(r.status);
        return { title: C().titleOf(r), typeLabel: C().SING[r._t], when: rel(r.updatedAt), by: r.updatedBy || '', pLabel: p.label, pBg: p.bg, pColor: p.color, onClick: () => cmp.openForm(r._t, r.id) };
      }),
      review: db.facilities.filter(r => r.review).map(r => ({ title: r.name, onClick: () => cmp.openForm('facilities', r.id) })),
      activity: db.activity.slice(0, 10).map(a => ({ when: rel(a.at), who: a.who, action: a.action, type: a.type, title: a.title })),
      onAddDoctor: () => cmp.openForm('doctors'), onAddFacility: () => cmp.openForm('facilities'), onAddEvent: () => cmp.openForm('events'),
    };
  }

  function list(cmp, db, st, msrc) {
    const t = st.view; const cats = db.categories[t];
    const q = st.q.trim().toLowerCase(); const today = new Date().toISOString().slice(0, 10);
    let rows = db[t].filter(r => {
      if (q && !C().titleOf(r).toLowerCase().includes(q) && !(r.designation || r.venue || '').toLowerCase().includes(q)) return false;
      const c = t === 'doctors' ? r.speciality : r.category;
      if (st.filter !== 'all' && c !== st.filter) return false;
      if (st.status !== 'all' && r.status !== st.status) return false;
      if (t === 'events' && st.dateF !== 'all') {
        if (st.dateF === 'upcoming' && !(r.date >= today)) return false;
        if (st.dateF === 'past' && !(r.date && r.date < today)) return false;
        if (/^\d{4}$/.test(st.dateF) && !(r.date || '').startsWith(st.dateF)) return false;
      }
      return true;
    });
    const sorters = { order: (a, b) => a.order - b.order, name: (a, b) => C().titleOf(a).localeCompare(C().titleOf(b)), updated: (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''), dateDesc: (a, b) => (b.date || '').localeCompare(a.date || ''), dateAsc: (a, b) => (a.date || '9').localeCompare(b.date || '9') };
    rows.sort(sorters[st.sort] || sorters.order);
    const filtered = q || st.filter !== 'all' || st.status !== 'all' || st.dateF !== 'all';
    const years = Array.from(new Set(db.events.map(e => (e.date || '').slice(0, 4)).filter(Boolean))).sort().reverse();
    const sortOpts = [{ value: 'order', label: 'Display order' }, { value: 'name', label: 'Name A–Z' }, { value: 'updated', label: 'Last updated' }].concat(t === 'events' ? [{ value: 'dateDesc', label: 'Date, newest first' }, { value: 'dateAsc', label: 'Date, oldest first' }] : []);
    const cols = { doctors: ['Qualifications', 'Experience', 'Schedule', 'Location'], facilities: ['Section', 'Description', 'Images', 'Order'], events: ['Date', 'Category', 'Venue', 'Photos'] }[t];
    const canPub = cmp.can('publish'), canDel = cmp.can('delete');
    return {
      listTitle: { doctors: 'Doctors', facilities: 'Facilities', events: 'Events' }[t],
      listSub: { doctors: 'Doctors shown on the public Doctors page.', facilities: 'Departments and services shown on the Facilities page, grouped by section.', events: 'Camps, drives and awareness events shown on the Camps & Events page.' }[t],
      listCount: rows.length === db[t].length ? db[t].length + ' total' : rows.length + ' of ' + db[t].length,
      addLabel: 'Add ' + C().SING[t].toLowerCase(), onAdd: () => cmp.openForm(t),
      q: st.q, onQ: e => cmp.setState({ q: e.target.value }), searchPh: 'Search by ' + (t === 'doctors' ? 'name or designation' : t === 'events' ? 'title or venue' : 'name'),
      filterEl: sel(st.filter, [{ value: 'all', label: t === 'doctors' ? 'All specialities' : t === 'facilities' ? 'All sections' : 'All categories' }].concat(cats.map(c => ({ value: c, label: c }))), e => cmp.setState({ filter: e.target.value })),
      statusEl: sel(st.status, [{ value: 'all', label: 'Any status' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }], e => cmp.setState({ status: e.target.value }), { minWidth: 140 }),
      sortEl: sel(st.sort, sortOpts, e => cmp.setState({ sort: e.target.value }), { minWidth: 180 }),
      isEvents: t === 'events',
      dateEl: sel(st.dateF, [{ value: 'all', label: 'All dates' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }].concat(years.map(y => ({ value: y, label: y }))), e => cmp.setState({ dateF: e.target.value }), { minWidth: 140 }),
      showClear: filtered, onClearFilters: () => cmp.setState({ q: '', filter: 'all', status: 'all', dateF: 'all' }),
      cols, hasRows: rows.length > 0, emptyAll: !db[t].length, emptyFilter: !!db[t].length && !rows.length,
      emptyTitle: 'No ' + t + ' yet', emptyBody: 'Add the first ' + C().SING[t].toLowerCase() + ' and it will appear here.',
      rows: rows.map((r, i) => {
        const p = pill(r.status);
        const img = t === 'doctors' ? msrc(r.imageId) : t === 'facilities' ? msrc(((r.images || [])[r.coverIndex || 0] || {}).mediaId) : msrc(r.coverId || ((r.gallery || [])[0] || {}).mediaId);
        const cells = t === 'doctors' ? [r.qualifications || '—', r.experience || '—', r.schedule || '—', r.location || '—']
          : t === 'facilities' ? [r.category || '—', r.short || 'No description yet', (r.images || []).length + ((r.images || []).length === 1 ? ' image' : ' images'), '#' + r.order]
          : [fmtDate(r.date), r.category || '—', r.venue || '—', (r.gallery || []).length ? (r.gallery || []).length + ' photos' : r.shotLabels ? '0 · ' + r.shotLabels + ' slots waiting' : '0'];
        return {
          title: C().titleOf(r), sub: t === 'doctors' ? [r.designation, r.speciality].filter(Boolean).join(' · ') : t === 'facilities' ? (r.subitems || []).length ? (r.subitems || []).length + ' sub-facilities' : '' : r.organiser || '',
          cells, hasThumb: !!img, noThumb: !img, thumbBg: bg(img), thumbRadius: t === 'doctors' ? '50%' : '8px', thumbText: t === 'doctors' ? initials(r.name) : '—',
          review: !!r.review, pLabel: p.label, pBg: p.bg, pColor: p.color, updated: rel(r.updatedAt),
          onEdit: () => cmp.openForm(t, r.id), onPreview: () => cmp.setState({ preview: { type: t, rec: r } }),
          onToggle: () => cmp.toggleStatus(t, r.id), toggleLabel: r.status === 'published' ? 'Unpublish' : 'Publish', toggleOpacity: canPub ? 1 : 0.4,
          onDelete: () => cmp.deleteRecord(t, r.id), delOpacity: canDel ? 1 : 0.4,
          onUp: () => cmp.move(t, r.id, -1), onDown: () => cmp.move(t, r.id, 1), stripe: i % 2 ? '#FBFDFC' : '#ffffff',
        };
      }),
    };
  }

  function form(cmp, db, st, msrc) {
    const t = st.editType, d = st.draft, errs = st.errors, cats = db.categories[t];
    const fld = (key, label, kind, x) => {
      x = x || {}; const v = d[key];
      return {
        label, req: !!x.req, hint: x.hint || '', hasHint: !!x.hint, ph: x.ph || '', wide: x.wide ? '1 / -1' : 'auto',
        isInput: ['text', 'number', 'date', 'time'].includes(kind), inputType: kind, isArea: kind === 'area', isSelect: kind === 'select', isCheck: kind === 'check', isDays: kind === 'days',
        value: v == null ? '' : v, checked: !!v, checkLabel: x.checkLabel || '', rows: x.rows || 4,
        on: e => cmp.setDraft(key, kind === 'check' ? e.target.checked : kind === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value),
        selectEl: kind === 'select' ? sel(v || '', [{ value: '', label: 'Choose…' }].concat((x.options || []).map(o => ({ value: o, label: o }))), e => cmp.setDraft(key, e.target.value), { width: '100%', borderColor: errs[key] ? '#E1332A' : '#D5E2DE' }) : null,
        days: kind === 'days' ? DAYS.map(dd => { const on = (v || []).includes(dd); return { label: dd, bg: on ? '#0A8E7B' : '#fff', color: on ? '#fff' : '#35514B', border: on ? '#0A8E7B' : '#D5E2DE', onClick: () => cmp.setDraft(key, on ? v.filter(x2 => x2 !== dd) : DAYS.filter(x2 => (v || []).includes(x2) || x2 === dd)) }; }) : [],
        error: errs[key] || '', hasError: !!errs[key], border: errs[key] ? '#E1332A' : '#D5E2DE',
      };
    };
    const sections = t === 'doctors' ? [
      { title: 'Basic information', fields: [fld('name', 'Full name', 'text', { req: true, ph: 'e.g. Dr. Anjali Patil', wide: true }), fld('designation', 'Designation', 'text', { ph: 'e.g. Medical Officer' }), fld('speciality', 'Speciality', 'select', { req: true, options: cats }), fld('qualifications', 'Qualifications', 'text', { ph: 'e.g. M.B.B.S., M.D. (Medicine)' }), fld('experience', 'Years of experience', 'text', { ph: 'e.g. 12 years' }), fld('bio', 'Short introduction', 'area', { wide: true, hint: 'One or two sentences. Kept short on the website.' })] },
      { title: 'Consultation', fields: [fld('schedule', 'Schedule as shown on the website', 'text', { wide: true, ph: 'e.g. OPD, Monday to Saturday, 9:00 – 13:00' }), fld('days', 'Consultation days', 'days', { wide: true }), fld('start', 'Start time', 'time'), fld('end', 'End time', 'time'), fld('location', 'Location in the hospital', 'text', { wide: true, ph: 'e.g. OPD block, first floor' })] },
      { title: 'Contact & display', fields: [fld('contact', 'Contact details', 'text', { ph: 'Only if approved for public display' }), fld('order', 'Display order', 'number', { hint: 'Lower numbers appear first.' }), fld('showContact', '', 'check', { checkLabel: 'Contact details are approved to show on the website', wide: true })] },
    ] : t === 'facilities' ? [
      { title: 'Facility details', fields: [fld('name', 'Facility name', 'text', { req: true, wide: true }), fld('category', 'Section on the Facilities page', 'select', { req: true, options: cats }), fld('subcategory', 'Sub-category (optional)', 'text'), fld('short', 'Short description', 'area', { wide: true, rows: 3, hint: 'Shown next to the photos on the Facilities page.' }), fld('full', 'Full description', 'area', { wide: true, rows: 5 }), fld('order', 'Display order', 'number', { hint: 'Order within the website.' })] },
    ] : [
      { title: 'Event details', fields: [fld('title', 'Event title', 'text', { req: true, wide: true }), fld('category', 'Category', 'select', { req: true, options: cats }), fld('venue', 'Venue or location', 'text'), fld('date', 'Event date', 'date'), fld('endDate', 'End date (optional)', 'date'), fld('start', 'Start time (optional)', 'time'), fld('end', 'End time (optional)', 'time'), fld('organiser', 'Organiser or department (optional)', 'text', { wide: true })] },
      { title: 'Description', fields: [fld('summary', 'Short summary', 'area', { wide: true, rows: 3, hint: 'Shown on the event card.' }), fld('description', 'Full description', 'area', { wide: true, rows: 5 }), fld('highlights', 'Outcome or highlights (optional)', 'area', { wide: true, rows: 3 }), fld('order', 'Display order', 'number')] },
    ];
    const P = C().PRESETS; const p = pill(d.status); const isNew = !st.editId; const canPub = cmp.can('publish');
    const out = {
      onBack: () => cmp.go(t), backLabel: '← All ' + t, fmTitle: C().titleOf(d) === 'Untitled' ? (isNew ? 'New ' + C().SING[t].toLowerCase() : 'Untitled') : C().titleOf(d),
      fmPLabel: isNew ? 'Not saved yet' : p.label, fmPBg: isNew ? '#EEF3F1' : p.bg, fmPColor: isNew ? '#5A6A66' : p.color,
      isDirty: cmp.dirty(), hasReview: !!d.review, sections,
      isDoctorForm: t === 'doctors', isFacilityForm: t === 'facilities', isEventForm: t === 'events', hasSingle: t !== 'facilities', hasGallery: t !== 'doctors',
      savedLine: isNew ? 'This record hasn’t been saved yet.' : 'Last saved ' + rel(d.updatedAt) + (d.updatedBy ? ' by ' + d.updatedBy : ''),
      isPublished: d.status === 'published' && !isNew, isDraftState: d.status !== 'published' || isNew,
      saveDraftLabel: st.saving === 'draft' ? 'Saving…' : 'Save draft', publishLabel: st.saving === 'publish' ? 'Publishing…' : 'Publish', keepLabel: st.saving === 'keep' ? 'Saving…' : 'Save changes', unpublishLabel: st.saving === 'unpublish' ? 'Unpublishing…' : 'Unpublish',
      onSaveDraft: () => cmp.saveRecord('draft'), onPublish: () => cmp.saveRecord('publish'), onKeep: () => cmp.saveRecord('keep'), onUnpublish: () => cmp.saveRecord('unpublish'),
      pubOpacity: canPub ? 1 : 0.45, hasPermNote: !canPub, permNote: 'Your role can save drafts. An administrator needs to publish.',
      onFormPreview: () => cmp.setState({ preview: { type: t, rec: d } }), showDelete: !isNew && cmp.can('delete'), onFormDelete: () => cmp.deleteRecord(t, st.editId),
    };
    if (t !== 'facilities') {
      const isDoc = t === 'doctors'; const id = isDoc ? d.imageId : d.coverId; const src = msrc(id); const pr = P[isDoc ? 'doctor' : 'event'];
      out.sg = { title: isDoc ? 'Profile photo' : 'Cover image', has: !!src, none: !src, bgCss: bg(src), radius: isDoc ? '50%' : '10px', w: isDoc ? '200px' : '100%', ratio: isDoc ? '1 / 1' : '4 / 3', ph: isDoc ? initials(d.name) || 'Photo' : 'No cover image',
        guide: 'Recommended ' + pr.w + ' × ' + pr.h + ' px · ' + pr.ratio + ' · JPG, PNG or WebP · up to 5 MB',
        onUpload: () => cmp.pickFile({ kind: isDoc ? 'doctor' : 'cover' }, false), onLibrary: () => cmp.setState({ picker: { target: { kind: isDoc ? 'doctor' : 'cover' } } }),
        onAdjust: () => cmp.editMedia(id, { kind: isDoc ? 'doctor' : 'cover' }), onRemove: () => cmp.setDraft(isDoc ? 'imageId' : 'coverId', null),
        alt: (isDoc ? d.imageAlt : d.coverAlt) || '', onAlt: e => cmp.setDraft(isDoc ? 'imageAlt' : 'coverAlt', e.target.value), altPh: isDoc ? 'e.g. Portrait of Dr. Anjali Patil' : 'Describe the photo for screen readers' };
    }
    if (t !== 'doctors') {
      const key = t === 'facilities' ? 'images' : 'gallery'; const arr = d[key] || [];
      out.gl = {
        title: t === 'facilities' ? 'Photos' : 'Gallery', count: arr.length + (arr.length === 1 ? ' image' : ' images'), has: arr.length > 0, none: !arr.length,
        guide: 'Recommended 1200 × 900 px · 4:3 · Larger or smaller photos are fine — you’ll crop them to fit.',
        note: t === 'events' && d.shotLabels && !arr.length ? 'The website shows ' + d.shotLabels + ' empty photo slots for this event until images are added.' : '', hasNote: t === 'events' && !!d.shotLabels && !arr.length,
        onUpload: () => cmp.pickFile({ kind: 'gallery' }, true), onLibrary: () => cmp.setState({ picker: { target: { kind: 'gallery' } } }),
        onPreview: () => cmp.setState({ preview: { type: t, rec: d } }),
        items: arr.map((g, i) => {
          const isCover = t === 'facilities' ? (d.coverIndex || 0) === i : d.coverId === g.mediaId;
          return { n: i + 1, bgCss: bg(msrc(g.mediaId)), missing: !msrc(g.mediaId), caption: g.caption || '', alt: g.alt || '', isCover, notCover: !isCover,
            coverLabel: t === 'facilities' ? 'Set as main photo' : 'Use as cover',
            onCaption: e => cmp.galleryOp('caption', i, e.target.value), onAlt: e => cmp.galleryOp('alt', i, e.target.value),
            onUp: () => cmp.galleryOp('up', i), onDown: () => cmp.galleryOp('down', i), onCover: () => cmp.galleryOp('cover', i), onRemove: () => cmp.galleryOp('remove', i),
            onAdjust: () => cmp.editMedia(g.mediaId, { kind: 'gallery', index: i }), onReplace: () => cmp.pickFile({ kind: 'gallery', index: i }, false) };
        }),
      };
    }
    if (t === 'facilities') {
      const subs = d.subitems || [];
      out.subs = subs.map((s, i) => ({ name: s.name, text: s.text, n: i + 1,
        onName: e => cmp.setDraft('subitems', subs.map((x, j) => j === i ? Object.assign({}, x, { name: e.target.value }) : x)),
        onText: e => cmp.setDraft('subitems', subs.map((x, j) => j === i ? Object.assign({}, x, { text: e.target.value }) : x)),
        onRemove: () => cmp.setDraft('subitems', subs.filter((x, j) => j !== i)) }));
      out.hasSubs = subs.length > 0; out.onAddSub = () => cmp.setDraft('subitems', subs.concat([{ name: '', text: '' }]));
    }
    return out;
  }

  function media(cmp, db, st) {
    const q = st.mediaQ.trim().toLowerCase();
    const items = db.media.map(m => Object.assign({ _u: C().usage(db, m.id) }, m)).filter(m => {
      if (q && !m.name.toLowerCase().includes(q)) return false;
      if (st.mediaFilter === 'unused') return !m._u.length;
      if (st.mediaFilter !== 'all') return m._u.some(x => x.type === st.mediaFilter);
      return true;
    });
    const used = (localStorage.getItem(window.MGRHStore.KEY) || '').length;
    return {
      mediaQ: st.mediaQ, onMediaQ: e => cmp.setState({ mediaQ: e.target.value }),
      mediaFilterEl: sel(st.mediaFilter, [{ value: 'all', label: 'All images' }, { value: 'doctors', label: 'Used by doctors' }, { value: 'facilities', label: 'Used by facilities' }, { value: 'events', label: 'Used by events' }, { value: 'unused', label: 'Not used anywhere' }], e => cmp.setState({ mediaFilter: e.target.value })),
      isGrid: st.mediaView === 'grid', isListMode: st.mediaView === 'list',
      gridBtnBg: st.mediaView === 'grid' ? '#0A8E7B' : '#fff', gridBtnColor: st.mediaView === 'grid' ? '#fff' : '#35514B', listBtnBg: st.mediaView === 'list' ? '#0A8E7B' : '#fff', listBtnColor: st.mediaView === 'list' ? '#fff' : '#35514B',
      onGrid: () => cmp.setState({ mediaView: 'grid' }), onListMode: () => cmp.setState({ mediaView: 'list' }),
      onUploadLib: () => cmp.pickFile({ kind: 'library', preset: 'facility' }, true),
      mediaCount: items.length + ' of ' + db.media.length + ' images', hasMedia: items.length > 0, noMedia: !items.length,
      storagePct: Math.min(100, Math.round(used / 50000)) + '%', storageText: kb(used * 2) + ' of about 5 MB browser storage used',
      mediaItems: items.map(m => ({
        name: m.name, bgCss: bg(m.dataUrl || m.src), dims: m.width ? m.width + ' × ' + m.height + ' px' : 'Original size', size: kb(m.size), type: (m.type || '').replace('image/', '').toUpperCase(), date: fmtDate(m.uploadedAt),
        usage: m._u.length ? m._u.map(x => x.label + ': ' + x.title).join(' · ') : 'Not used yet', inUse: m._u.length > 0, usedColor: m._u.length ? '#0A5F52' : '#8A5A06',
        onPreview: () => cmp.setState({ preview: { type: 'media', rec: m } }), onReplace: () => cmp.replaceMedia(m.id), onDelete: () => cmp.deleteMedia(m.id),
      })),
    };
  }

  function settings(cmp, db, st, u) {
    const F = st.sf; const isAdmin = cmp.can('admin');
    return {
      sfName: F.name, onSfName: e => cmp.setState({ sf: Object.assign({}, F, { name: e.target.value }) }), sfEmail: u.email,
      sfPass: F.pass, onSfPass: e => cmp.setState({ sf: Object.assign({}, F, { pass: e.target.value }) }), sfPass2: F.pass2, onSfPass2: e => cmp.setState({ sf: Object.assign({}, F, { pass2: e.target.value }) }),
      onSaveAccount: () => cmp.saveAccount(), isAdmin, notAdmin: !isAdmin,
      editorsCanPublish: !!db.settings.editorsCanPublish, onTogglePublish: e => cmp.persist(d => { d.settings.editorsCanPublish = e.target.checked; }, { action: 'Changed permissions', type: 'Settings', title: e.target.checked ? 'Editors can publish' : 'Only administrators can publish' }),
      users: db.settings.users.map(x => ({ name: x.name, email: x.email, role: x.role, isSelf: x.email === u.email, canRemove: isAdmin && x.email !== u.email, onRemove: () => cmp.removeUser(x.email) })),
      nu: F.nu, onNuName: e => cmp.setState({ sf: Object.assign({}, F, { nu: Object.assign({}, F.nu, { name: e.target.value }) }) }), onNuEmail: e => cmp.setState({ sf: Object.assign({}, F, { nu: Object.assign({}, F.nu, { email: e.target.value }) }) }),
      nuRoleEl: sel(F.nu.role, [{ value: 'Editor', label: 'Editor' }, { value: 'Administrator', label: 'Administrator' }], e => cmp.setState({ sf: Object.assign({}, F, { nu: Object.assign({}, F.nu, { role: e.target.value }) }) }), { minWidth: 150 }),
      onAddUser: () => cmp.addUser(),
      catGroups: [['doctors', 'Doctor specialities'], ['facilities', 'Facility sections'], ['events', 'Event categories']].map(([k, label]) => ({
        label, items: db.categories[k].map((c, i) => ({ name: c, count: db[k].filter(r => (k === 'doctors' ? r.speciality : r.category) === c).length, onRemove: () => cmp.removeCat(k, c), onUp: () => cmp.moveCat(k, i, -1) })),
        val: F.cat[k] || '', onVal: e => cmp.setState({ sf: Object.assign({}, F, { cat: Object.assign({}, F.cat, { [k]: e.target.value }) }) }), onAdd: () => cmp.addCat(k),
      })),
      onExport: () => cmp.exportData(), onImport: () => cmp.importRef.current && cmp.importRef.current.click(), onReset: () => cmp.resetData(),
    };
  }

  function modals(cmp, msrc) {
    const st = cmp.state; const out = {};
    const cf = st.confirm;
    Object.assign(out, { cfOpen: !!cf, cfTitle: cf ? cf.title : '', cfBody: cf ? cf.body : '', cfLabel: cf ? cf.confirmLabel : '', cfBtnBg: cf && cf.danger ? '#C42A21' : '#0A8E7B', cfShowCancel: !(cf && cf.infoOnly),
      onCfOk: () => { const f = cf && cf.onConfirm; cmp.setState({ confirm: null }); if (f) f(); }, onCfCancel: () => cmp.setState({ confirm: null }), stop: e => e.stopPropagation() });
    const ed = st.editor; const P = ed ? C().PRESETS[ed.preset] : null;
    Object.assign(out, { edOpen: !!ed, edRef: cmp.edCanvas });
    if (ed) {
      const small = ed.src.w && (ed.src.w < P.w || ed.src.h < P.h);
      Object.assign(out, {
        edTitle: 'Adjust ' + P.label.toLowerCase(), edLoading: ed.loading, edReady: !ed.loading && !!ed.img && !ed.error, edHasError: !!ed.error, edError: ed.error,
        edW: P.vw * 2, edH: P.vh * 2, edCssW: P.vw + 'px', edCssH: P.vh + 'px',
        edSrcName: ed.src.name || '—', edSrcDims: ed.src.w ? ed.src.w + ' × ' + ed.src.h + ' px' : '—', edSrcSize: kb(ed.src.size), edSrcType: (ed.src.type || '').replace('image/', '').toUpperCase() || '—',
        edOut: P.w + ' × ' + P.h + ' px', edRatio: P.ratio + (P.round ? ' · shown as a circle on the website' : ''),
        edSmall: !!small, edSmallText: 'This photo is smaller than ' + P.w + ' × ' + P.h + ' px, so it may look soft on large screens.',
        edZoom: ed.zoom, edZoomPct: Math.round(ed.zoom * 100) + '%',
        onEdZoom: e => cmp.edSet({ zoom: Number(e.target.value) }), onEdIn: () => cmp.edSet({ zoom: Math.min(4, +(ed.zoom + 0.1).toFixed(2)) }), onEdOut: () => cmp.edSet({ zoom: Math.max(1, +(ed.zoom - 0.1).toFixed(2)) }),
        onEdRotL: () => cmp.edSet({ rot: ed.rot - 90, x: 0, y: 0 }), onEdRotR: () => cmp.edSet({ rot: ed.rot + 90, x: 0, y: 0 }), onEdReset: () => cmp.edSet({ zoom: 1, x: 0, y: 0, rot: 0 }),
        onEdDown: cmp.edDown, onEdMove: cmp.edMove, onEdUp: cmp.edUp, onEdSave: cmp.edSave, onEdCancel: cmp.edCancel, edSaveLabel: st.edSaving ? 'Saving…' : 'Save image',
        onEdRetry: () => { const t = ed.target; cmp.setState({ editor: null }); cmp.pickFile(t, false); },
        edQueue: (cmp._queue || []).length ? (cmp._queue.length + ' more ' + (cmp._queue.length === 1 ? 'image' : 'images') + ' waiting after this one') : '', edHasQueue: (cmp._queue || []).length > 0,
      });
    }
    const pk = st.picker;
    Object.assign(out, { pkOpen: !!pk, onPkClose: () => cmp.setState({ picker: null }) });
    if (pk && st.db) out.pkItems = st.db.media.map(m => ({ name: m.name, bgCss: bg(m.dataUrl || m.src), dims: m.width ? m.width + ' × ' + m.height : '', onPick: () => { cmp.setState({ picker: null }); cmp.editMedia(m.id, pk.target); } }));
    const pv = st.preview;
    Object.assign(out, { pvOpen: !!pv, onPvClose: () => cmp.setState({ preview: null }) });
    if (pv) {
      const r = pv.rec;
      out.pvDraft = pv.type !== 'media' && r.status !== 'published';
      out.pvIsDoc = pv.type === 'doctors'; out.pvIsFac = pv.type === 'facilities'; out.pvIsEvt = pv.type === 'events'; out.pvIsMedia = pv.type === 'media';
      if (out.pvIsDoc) { const s = msrc(r.imageId); Object.assign(out, { pvName: r.name || 'Untitled', pvRole: r.designation, pvQual: [r.qualifications, r.experience && r.experience + ' experience'].filter(Boolean).join(' · '), pvBio: r.bio, pvSched: r.schedule || [(r.days || []).join(', '), r.start && r.end ? r.start + ' – ' + r.end : ''].filter(Boolean).join(', '), pvLoc: r.location, pvHasImg: !!s, pvNoImg: !s, pvImg: bg(s), pvInit: initials(r.name), pvContact: r.showContact && r.contact ? r.contact : '', pvHasContact: !!(r.showContact && r.contact) }); }
      if (out.pvIsFac) Object.assign(out, { pvName: r.name || 'Untitled', pvCat: r.category, pvShort: r.short || 'No description yet.', pvFull: r.full, pvHasFull: !!r.full, pvSubs: (r.subitems || []).filter(x => x.name || x.text), pvShots: (r.images || []).map(g => ({ bgCss: bg(msrc(g.mediaId)), caption: g.caption })), pvNoShots: !(r.images || []).length });
      if (out.pvIsEvt) { const c = msrc(r.coverId || ((r.gallery || [])[0] || {}).mediaId); const dd = r.date ? new Date(r.date + 'T00:00:00') : null; Object.assign(out, { pvName: r.title || 'Untitled', pvCat: r.category, pvSummary: r.summary, pvVenue: r.venue, pvDate: fmtDate(r.date), pvDay: dd ? dd.getDate() : '—', pvMon: dd ? MON[dd.getMonth()] : '', pvCover: bg(c), pvHasCover: !!c, pvNoCover: !c, pvDesc: r.description, pvShots: (r.gallery || []).map(g => ({ bgCss: bg(msrc(g.mediaId)), caption: g.caption })), pvNoShots: !(r.gallery || []).length }); }
      if (out.pvIsMedia) Object.assign(out, { pvName: r.name, pvImg: bg(r.dataUrl || r.src), pvMeta: [r.width ? r.width + ' × ' + r.height + ' px' : '', kb(r.size), (r.type || '').replace('image/', '').toUpperCase(), 'Uploaded ' + fmtDate(r.uploadedAt)].filter(Boolean).join(' · ') });
    }
    const tt = st.toast;
    Object.assign(out, { toastOpen: !!tt, toastMsg: tt ? tt.msg : '', toastBg: tt && tt.kind === 'err' ? '#9E2018' : '#0B4F45', onToastClose: () => cmp.setState({ toast: null }) });
    return out;
  }

  window.MGRHCMSView = { vals };
})();

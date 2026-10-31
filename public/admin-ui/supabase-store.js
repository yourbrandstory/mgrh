(function () {
  'use strict';

  window.__MGRH_EXTERNAL_STORE = true;

  var SUPABASE_URL = 'https://wgdasstcuyuftupfiwqq.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZGFzc3RjdXl1ZnR1cGZpd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzM5NTMsImV4cCI6MjEwODg0OTk1M30.WwsWZfaMk9GOwlAvwezdrqLpsEXNM8OjT3AkvMMDxtc';
  var SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  var BUCKET = 'media';
  var KEY = 'mgrh-cms-v1';

  var db = emptyDb();
  var currentUser = null;
  var currentUserId = '';
  var accessToken = '';
  var client = null;
  var ready = false;
  var subs = new Set();
  var idMap = new Map();
  var profileNames = new Map();

  function emptyDb() {
    return {
      version: 1,
      doctors: [],
      facilities: [],
      events: [],
      categories: { doctors: [], facilities: [], events: [] },
      media: [],
      activity: [],
      settings: { editorsCanPublish: false, users: [] },
    };
  }

  function now() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 9);
  }

  function load() {
    return db;
  }

  function notify() {
    subs.forEach(function (fn) {
      try { fn(db); } catch (e) {}
    });
  }

  function isUuid(value) {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  function hash32(value, seed) {
    var h = seed >>> 0;
    for (var i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  function uuidFor(value) {
    if (isUuid(value)) return value;
    var key = String(value || '');
    if (idMap.has(key)) return idMap.get(key);
    var hex = hash32(key, 2166136261) + hash32(key, 2246822507) + hash32(key, 3266489909) + hash32(key, 668265263);
    var uuid = hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-5' + hex.slice(13, 16) + '-a' + hex.slice(17, 20) + '-' + hex.slice(20, 32);
    idMap.set(key, uuid);
    return uuid;
  }

  function num(value) {
    var n = parseInt(value, 10);
    return isNaN(n) ? 0 : n;
  }

  function timeValue(value) {
    if (!value) return null;
    var text = String(value);
    return /^\d{2}:\d{2}$/.test(text) ? text : text.slice(0, 5);
  }

  function timeText(value) {
    return value ? String(value).slice(0, 5) : '';
  }

  function roleLabel(value) {
    return value === 'administrator' ? 'Administrator' : 'Editor';
  }

  function roleValue(value) {
    return value === 'Administrator' ? 'administrator' : 'editor';
  }

  function encodePath(path) {
    return String(path || '').split('/').map(encodeURIComponent).join('/');
  }

  function publicUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + encodePath(path);
  }

  function pathFromUrl(url) {
    if (!url) return '';
    var marker = '/storage/v1/object/public/' + BUCKET + '/';
    var index = String(url).indexOf(marker);
    if (index < 0) return '';
    return decodeURIComponent(String(url).slice(index + marker.length));
  }

  function dataUrlMime(dataUrl) {
    var match = /^data:([^;,]+)/i.exec(dataUrl || '');
    return match ? match[1] : 'image/jpeg';
  }

  function dataUrlBytes(dataUrl) {
    var comma = String(dataUrl || '').indexOf(',');
    if (comma < 0) throw new Error('The image could not be read.');
    var base64 = String(dataUrl).slice(comma + 1);
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function request(method, path, body, prefer, contentType) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, SUPABASE_URL + path, false);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    if (accessToken) xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    if (body !== undefined && body !== null) xhr.setRequestHeader('Content-Type', contentType || 'application/json');
    if (prefer) xhr.setRequestHeader('Prefer', prefer);
    xhr.send(body === undefined || body === null ? null : (typeof body === 'string' ? body : JSON.stringify(body)));
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error((xhr.responseText || ('Request failed (' + xhr.status + ')')).slice(0, 500));
    }
    return xhr.responseText ? JSON.parse(xhr.responseText) : null;
  }

  function api(path, method, body) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, path, false);
    xhr.setRequestHeader('Accept', 'application/json');
    if (body !== undefined && body !== null) xhr.setRequestHeader('Content-Type', 'application/json');
    if (accessToken) xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(body === undefined || body === null ? null : JSON.stringify(body));
    if (xhr.status < 200 || xhr.status >= 300) {
      var message = xhr.responseText || ('Request failed (' + xhr.status + ')');
      try { message = JSON.parse(message).error || message; } catch (e) {}
      throw new Error(message);
    }
    return xhr.responseText ? JSON.parse(xhr.responseText) : null;
  }

  function uploadObject(path, bytes, mime) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + encodePath(path), false);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.setRequestHeader('Content-Type', mime || 'image/jpeg');
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.send(bytes);
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error((xhr.responseText || ('Image upload failed (' + xhr.status + ')')).slice(0, 500));
    }
  }

  function deleteObject(path) {
    if (!path) return;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('DELETE', SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + encodePath(path), false);
      xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.send(null);
    } catch (e) {}
  }

  function makeStoragePath(media, suffix) {
    var name = String(media.name || 'image').replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'image';
    var ext = dataUrlMime(media.dataUrl || media.src || '').indexOf('png') >= 0 ? 'png' : 'jpg';
    return 'cms/' + name + '-' + uuidFor(media.id).slice(0, 8) + '-' + Date.now() + '-' + suffix + '.' + ext;
  }

  function mapMedia(row) {
    return {
      id: row.id,
      name: row.file_name,
      src: publicUrl(row.storage_path),
      width: row.width,
      height: row.height,
      size: row.size_bytes,
      type: row.mime_type,
      uploadedAt: row.uploaded_at,
      preset: row.preset,
      crop: row.crop,
      storagePath: row.storage_path,
      originalPath: row.original_path,
      originalSrc: row.original_path ? publicUrl(row.original_path) : '',
    };
  }

  function mapDoctor(row) {
    return {
      id: row.id,
      order: row.sort_order,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      updatedBy: profileNames.get(row.updated_by) || '',
      name: row.name,
      designation: row.designation,
      speciality: row.speciality,
      qualifications: row.qualifications,
      experience: row.experience,
      bio: row.bio,
      schedule: row.schedule,
      days: row.days || [],
      start: timeText(row.start_time),
      end: timeText(row.end_time),
      location: row.location,
      contact: row.contact,
      showContact: !!row.show_contact,
      imageId: row.image_id,
      imageAlt: row.image_alt,
    };
  }

  function mapFacility(row, images) {
    return {
      id: row.id,
      order: row.sort_order,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      updatedBy: profileNames.get(row.updated_by) || '',
      name: row.name,
      category: row.category,
      short: row.short_description,
      full: row.full_description,
      subcategory: row.subcategory,
      subitems: row.subitems || [],
      images: (images || []).map(function (image) {
        return { mediaId: image.media_id, caption: image.caption, alt: image.alt };
      }),
      coverIndex: row.cover_index || 0,
      review: !!row.needs_review,
    };
  }

  function mapEvent(row, images) {
    return {
      id: row.id,
      order: row.sort_order,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      updatedBy: profileNames.get(row.updated_by) || '',
      title: row.title,
      category: row.category,
      date: row.event_date || '',
      endDate: row.end_date || '',
      start: timeText(row.start_time),
      end: timeText(row.end_time),
      venue: row.venue,
      summary: row.summary,
      description: row.description,
      organiser: row.organiser,
      highlights: row.highlights,
      coverId: row.cover_id,
      coverAlt: row.cover_alt,
      shotLabels: row.placeholder_slots || 0,
      gallery: (images || []).map(function (image) {
        return { mediaId: image.media_id, caption: image.caption, alt: image.alt };
      }),
    };
  }

  function mapActivity(row) {
    return {
      id: String(row.id),
      at: row.at,
      who: row.actor_name,
      action: row.action,
      type: row.entity_type,
      title: row.entity_title,
    };
  }

  async function optional(query, fallback) {
    try {
      var result = await query;
      if (result.error) return fallback;
      return result.data || fallback;
    } catch (e) {
      return fallback;
    }
  }

  async function fetchAll() {
    var publicOnly = !accessToken;
    var qDoctors = client.from('doctors').select('*').order('sort_order', { ascending: true });
    var qFacilities = client.from('facilities').select('*').order('sort_order', { ascending: true });
    var qEvents = client.from('events').select('*').order('sort_order', { ascending: true });
    if (publicOnly) {
      qDoctors = qDoctors.eq('status', 'published');
      qFacilities = qFacilities.eq('status', 'published');
      qEvents = qEvents.eq('status', 'published');
    }
    var results = await Promise.all([
      qDoctors,
      qFacilities,
      client.from('facility_images').select('*').order('sort_order', { ascending: true }),
      qEvents,
      client.from('event_images').select('*').order('sort_order', { ascending: true }),
      client.from('categories').select('*').order('sort_order', { ascending: true }),
      client.from('media').select('*').order('uploaded_at', { ascending: false }),
      client.from('activity_log').select('*').order('at', { ascending: false }).limit(200),
      client.from('settings').select('*').eq('id', 1).maybeSingle(),
      client.from('profiles').select('id, full_name, role').order('created_at', { ascending: true }),
    ]);

    var doctors = results[0];
    var facilities = results[1];
    var facilityImages = results[2];
    var events = results[3];
    var eventImages = results[4];
    var categories = results[5];
    var media = results[6];
    var activity = results[7];
    var settings = results[8];
    var profiles = results[9];

    if (doctors.error && accessToken) throw doctors.error;
    if (facilities.error && accessToken) throw facilities.error;
    if (events.error && accessToken) throw events.error;

    var facilityImageRows = facilityImages.error ? [] : (facilityImages.data || []);
    var eventImageRows = eventImages.error ? [] : (eventImages.data || []);
    var categoryRows = categories.error ? [] : (categories.data || []);
    var mediaRows = media.error ? [] : (media.data || []);
    var activityRows = activity.error ? [] : (activity.data || []);
    var profileRows = profiles.error ? [] : (profiles.data || []);
    var settingsRow = settings.error ? null : settings.data;

    var facilityImagesBy = new Map();
    facilityImageRows.forEach(function (image) {
      var list = facilityImagesBy.get(image.facility_id) || [];
      list.push(image);
      facilityImagesBy.set(image.facility_id, list);
    });

    var eventImagesBy = new Map();
    eventImageRows.forEach(function (image) {
      var list = eventImagesBy.get(image.event_id) || [];
      list.push(image);
      eventImagesBy.set(image.event_id, list);
    });

    profileNames = new Map();
    profileRows.forEach(function (profile) {
      profileNames.set(profile.id, profile.full_name || '');
    });

    var categoryMap = { doctors: [], facilities: [], events: [] };
    categoryRows.forEach(function (category) {
      if (categoryMap[category.kind]) categoryMap[category.kind].push(category.name);
    });

    var usersByEmail = new Map();
    profileRows.forEach(function (profile) {
      var email = currentUser && currentUserId === profile.id ? currentUser.email : '';
      usersByEmail.set(email ? email.toLowerCase() : 'id:' + profile.id, {
        id: profile.id,
        email: email,
        name: profile.full_name || '',
        role: roleLabel(profile.role),
      });
    });
    if (currentUser && currentUser.email) {
      var selfKey = currentUser.email.toLowerCase();
      if (!usersByEmail.has(selfKey)) {
        usersByEmail.set(selfKey, {
          id: currentUserId,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
        });
      }
    }

    return {
      version: 1,
      doctors: (doctors.data || []).map(mapDoctor),
      facilities: (facilities.data || []).map(function (row) {
        return mapFacility(row, facilityImagesBy.get(row.id) || []);
      }),
      events: (events.data || []).map(function (row) {
        return mapEvent(row, eventImagesBy.get(row.id) || []);
      }),
      categories: categoryMap,
      media: mediaRows.map(mapMedia),
      activity: activityRows.map(mapActivity),
      settings: {
        editorsCanPublish: !!(settingsRow && settingsRow.editors_can_publish),
        users: Array.from(usersByEmail.values()),
      },
    };
  }

  async function refresh() {
    db = await fetchAll();
    notify();
    return db;
  }

  function loadDirectory() {
    var token = accessToken;
    if (!token) return Promise.resolve();
    return fetch('/api/admin-ui/directory', {
      headers: { Authorization: 'Bearer ' + token },
      cache: 'no-store',
    }).then(function (response) {
      return response.ok ? response.json() : null;
    }).then(function (list) {
      if (!Array.isArray(list) || token !== accessToken) return;
      var users = list.map(function (person) {
        return {
          id: person.id,
          email: person.email,
          name: person.full_name || person.email,
          role: roleLabel(person.role),
        };
      });
      if (currentUser && currentUser.email && !users.some(function (person) {
        return person.email.toLowerCase() === currentUser.email.toLowerCase();
      })) {
        users.push({
          id: currentUserId,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
        });
      }
      db.settings.users = users;
      notify();
    }).catch(function () {});
  }

  async function sessionFromUser(user) {
    var profile = await optional(client.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle(), null);
    return {
      email: user.email || '',
      name: (profile && profile.full_name) || user.email || 'Staff',
      role: roleLabel(profile && profile.role),
    };
  }

  function signIn(email, password) {
    if (!client) return Promise.reject(new Error('The content store is still loading.'));
    return client.auth.signInWithPassword({ email: email, password: password }).then(async function (result) {
      if (result.error) throw result.error;
      currentUserId = result.data.user.id;
      accessToken = result.data.session ? result.data.session.access_token : '';
      currentUser = await sessionFromUser(result.data.user);
      await refresh();
      loadDirectory();
      return currentUser;
    });
  }

  function signOut() {
    if (!client) return Promise.resolve();
    return client.auth.signOut().then(function () {
      currentUser = null;
      currentUserId = '';
      accessToken = '';
      return refresh().catch(function () {});
    });
  }

  function setSession(user) {
    currentUser = user || null;
    if (user && user.email) {
      var found = db.settings.users.find(function (person) {
        return person.email.toLowerCase() === user.email.toLowerCase();
      });
      if (found) found.name = user.name;
    }
  }

  function clearSession() {
    currentUser = null;
    currentUserId = '';
    accessToken = '';
  }

  function session() {
    return currentUser;
  }

  function updatePassword(password) {
    if (!client) return Promise.reject(new Error('The content store is still loading.'));
    return client.auth.updateUser({ password: password }).then(function (result) {
      if (result.error) throw result.error;
      return true;
    });
  }

  function mediaSrc(id) {
    var media = db.media.find(function (item) { return item.id === id; });
    return media ? (media.dataUrl || media.src || '') : '';
  }

  function published(type, opts) {
    var preview = (opts && opts.preview) || (/[?&]preview=1/.test(location.search) && !!session());
    return (db[type] || []).filter(function (row) {
      return preview || row.status === 'published';
    }).slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
  }

  function upsert(table, rows, conflict) {
    if (!rows.length) return;
    request('POST', '/rest/v1/' + table + (conflict ? '?on_conflict=' + conflict : ''), rows, 'resolution=merge-duplicates,return=minimal');
  }

  function withoutAudit(row) {
    var copy = Object.assign({}, row);
    delete copy.createdAt;
    delete copy.updatedAt;
    delete copy.updatedBy;
    return copy;
  }

  function sameRecord(left, right) {
    return JSON.stringify(withoutAudit(left)) === JSON.stringify(withoutAudit(right));
  }

  function sameGallery(left, right) {
    var a = left || [];
    var b = right || [];
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if ((a[i].mediaId || '') !== (b[i].mediaId || '')) return false;
      if ((a[i].caption || '') !== (b[i].caption || '')) return false;
      if ((a[i].alt || '') !== (b[i].alt || '')) return false;
    }
    return true;
  }

  function sameMedia(left, right) {
    if (!left) return false;
    if (left.dataUrl || right.dataUrl || right.originalDataUrl) return false;
    if (left.src && left.src.indexOf('data:') === 0) return false;
    if (right.src && right.src.indexOf('data:') === 0) return false;
    var keys = ['name', 'width', 'height', 'size', 'type', 'preset', 'crop', 'storagePath', 'originalPath', 'src'];
    for (var i = 0; i < keys.length; i++) {
      if (JSON.stringify(left[keys[i]] || null) !== JSON.stringify(right[keys[i]] || null)) return false;
    }
    return true;
  }

  function remove(table, filter) {
    request('DELETE', '/rest/v1/' + table + '?' + filter, null, 'return=minimal');
  }

  function mediaRow(media, previous) {
    var dataUrl = media.dataUrl || (media.src && media.src.indexOf('data:') === 0 ? media.src : '');
    var storagePath = media.storagePath || pathFromUrl(media.src);
    var originalPath = media.originalPath || (previous && previous.originalPath) || '';
    var bytes = null;
    var mime = media.type || 'image/jpeg';

    if (dataUrl) {
      bytes = dataUrlBytes(dataUrl);
      mime = dataUrlMime(dataUrl);
      storagePath = makeStoragePath(media, 'web');
      uploadObject(storagePath, bytes, mime);
      media.src = publicUrl(storagePath);
      media.storagePath = storagePath;
      media.dataUrl = null;
      media.type = mime;
      media.size = media.size || bytes.length;
    }

    if (media.originalDataUrl) {
      var originalBytes = dataUrlBytes(media.originalDataUrl);
      var originalMime = dataUrlMime(media.originalDataUrl);
      originalPath = makeStoragePath(media, 'original');
      uploadObject(originalPath, originalBytes, originalMime);
      media.originalSrc = publicUrl(originalPath);
      media.originalPath = originalPath;
      media.originalDataUrl = null;
    }

    if (!storagePath) throw new Error('The image "' + (media.name || 'image') + '" has no stored file.');

    var row = {
      id: uuidFor(media.id),
      file_name: media.name || 'image.jpg',
      storage_path: storagePath,
      original_path: originalPath || null,
      width: media.width || null,
      height: media.height || null,
      size_bytes: media.size || (bytes ? bytes.length : null),
      mime_type: media.type || mime,
      preset: media.preset || 'facility',
      crop: media.crop || null,
      uploaded_by: currentUserId,
    };

    if (previous && previous.storagePath && previous.storagePath !== storagePath) {
      deleteObject(previous.storagePath);
    }
    if (previous && previous.originalPath && previous.originalPath !== originalPath) {
      deleteObject(previous.originalPath);
    }
    return row;
  }

  function doctorRow(doctor) {
    return {
      id: uuidFor(doctor.id),
      name: doctor.name || '',
      designation: doctor.designation || '',
      speciality: doctor.speciality || '',
      qualifications: doctor.qualifications || '',
      experience: doctor.experience || '',
      bio: doctor.bio || '',
      schedule: doctor.schedule || '',
      days: Array.isArray(doctor.days) ? doctor.days : [],
      start_time: timeValue(doctor.start),
      end_time: timeValue(doctor.end),
      location: doctor.location || '',
      contact: doctor.contact || '',
      show_contact: !!doctor.showContact,
      image_id: doctor.imageId ? uuidFor(doctor.imageId) : null,
      image_alt: doctor.imageAlt || '',
      sort_order: num(doctor.order),
      status: doctor.status || 'draft',
      updated_by: currentUserId,
    };
  }

  function facilityRow(facility) {
    return {
      id: uuidFor(facility.id),
      name: facility.name || '',
      category: facility.category || '',
      subcategory: facility.subcategory || '',
      short_description: facility.short || '',
      full_description: facility.full || '',
      subitems: Array.isArray(facility.subitems) ? facility.subitems : [],
      cover_index: num(facility.coverIndex),
      needs_review: !!facility.review,
      sort_order: num(facility.order),
      status: facility.status || 'draft',
      updated_by: currentUserId,
    };
  }

  function eventRow(event) {
    return {
      id: uuidFor(event.id),
      title: event.title || '',
      category: event.category || '',
      event_date: event.date || null,
      end_date: event.endDate || null,
      start_time: timeValue(event.start),
      end_time: timeValue(event.end),
      venue: event.venue || '',
      summary: event.summary || '',
      description: event.description || '',
      organiser: event.organiser || '',
      highlights: event.highlights || '',
      cover_id: event.coverId ? uuidFor(event.coverId) : null,
      cover_alt: event.coverAlt || '',
      placeholder_slots: num(event.shotLabels),
      sort_order: num(event.order),
      status: event.status || 'draft',
      updated_by: currentUserId,
    };
  }

  function galleryRows(parentId, key, items) {
    return (items || []).map(function (item, index) {
      var row = {
        media_id: uuidFor(item.mediaId),
        caption: item.caption || '',
        alt: item.alt || '',
        sort_order: index,
      };
      row[key] = parentId;
      return row;
    });
  }

  function applyMedia(next) {
    var previous = new Map(db.media.map(function (media) { return [media.id, media]; }));
    var nextIds = new Set(next.media.map(function (media) { return media.id; }));
    var rows = [];
    next.media.forEach(function (media) {
      var before = previous.get(media.id);
      if (!sameMedia(before, media)) rows.push(mediaRow(media, before));
    });
    upsert('media', rows, 'id');
    previous.forEach(function (media, id) {
      if (nextIds.has(id)) return;
      if (media.storagePath) deleteObject(media.storagePath);
      if (media.originalPath) deleteObject(media.originalPath);
      remove('media', 'id=eq.' + uuidFor(id));
    });
  }

  function applyDoctors(next) {
    var previous = new Map(db.doctors.map(function (doctor) { return [doctor.id, doctor]; }));
    var nextIds = new Set(next.doctors.map(function (doctor) { return doctor.id; }));
    var rows = [];
    next.doctors.forEach(function (doctor) {
      var before = previous.get(doctor.id);
      if (!before || !sameRecord(before, doctor)) rows.push(doctorRow(doctor));
    });
    upsert('doctors', rows, 'id');
    previous.forEach(function (doctor, id) {
      if (!nextIds.has(id)) remove('doctors', 'id=eq.' + uuidFor(id));
    });
  }

  function applyFacilities(next) {
    var previous = new Map(db.facilities.map(function (facility) { return [facility.id, facility]; }));
    var nextIds = new Set(next.facilities.map(function (facility) { return facility.id; }));
    var rows = [];
    next.facilities.forEach(function (facility) {
      var before = previous.get(facility.id);
      if (!before || !sameRecord(before, facility)) rows.push(facilityRow(facility));
    });
    upsert('facilities', rows, 'id');
    next.facilities.forEach(function (facility) {
      var before = previous.get(facility.id);
      if (before && sameGallery(before.images, facility.images)) return;
      var id = uuidFor(facility.id);
      remove('facility_images', 'facility_id=eq.' + id);
      var imageRows = galleryRows(id, 'facility_id', facility.images);
      if (imageRows.length) request('POST', '/rest/v1/facility_images', imageRows, 'return=minimal');
    });
    previous.forEach(function (facility, id) {
      if (!nextIds.has(id)) remove('facilities', 'id=eq.' + uuidFor(id));
    });
  }

  function applyEvents(next) {
    var previous = new Map(db.events.map(function (event) { return [event.id, event]; }));
    var nextIds = new Set(next.events.map(function (event) { return event.id; }));
    var rows = [];
    next.events.forEach(function (event) {
      var before = previous.get(event.id);
      if (!before || !sameRecord(before, event)) rows.push(eventRow(event));
    });
    upsert('events', rows, 'id');
    next.events.forEach(function (event) {
      var before = previous.get(event.id);
      if (before && sameGallery(before.gallery, event.gallery)) return;
      var id = uuidFor(event.id);
      remove('event_images', 'event_id=eq.' + id);
      var imageRows = galleryRows(id, 'event_id', event.gallery);
      if (imageRows.length) request('POST', '/rest/v1/event_images', imageRows, 'return=minimal');
    });
    previous.forEach(function (event, id) {
      if (!nextIds.has(id)) remove('events', 'id=eq.' + uuidFor(id));
    });
  }

  function applyCategories(next) {
    ['doctors', 'facilities', 'events'].forEach(function (kind) {
      var desired = next.categories[kind] || [];
      var previous = db.categories[kind] || [];
      if (desired.length === previous.length && desired.every(function (name, index) { return name === previous[index]; })) return;
      previous.forEach(function (name) {
        if (desired.indexOf(name) < 0) {
          remove('categories', 'kind=eq.' + kind + '&name=eq.' + encodeURIComponent(name));
        }
      });
      var rows = desired.map(function (name, index) {
        return { kind: kind, name: name, sort_order: index };
      });
      if (rows.length) {
        request('POST', '/rest/v1/categories?on_conflict=kind,name', rows, 'resolution=merge-duplicates,return=minimal');
      }
    });
  }

  function applyActivity(next) {
    var previous = new Map(db.activity.filter(function (item) { return item.id; }).map(function (item) { return [String(item.id), item]; }));
    var nextIds = new Set(next.activity.filter(function (item) { return item.id; }).map(function (item) { return String(item.id); }));
    var additions = next.activity.filter(function (item) { return !item.id; });
    if (additions.length) {
      var rows = additions.map(function (item) {
        return {
          at: item.at || now(),
          actor: currentUserId,
          actor_name: item.who || (currentUser && currentUser.name) || 'Staff',
          action: item.action || 'Updated',
          entity_type: item.type || 'Content',
          entity_title: item.title || '',
        };
      });
      var inserted = request('POST', '/rest/v1/activity_log', rows, 'return=representation');
      if (Array.isArray(inserted)) {
        additions.forEach(function (item, index) {
          if (inserted[index]) item.id = String(inserted[index].id);
        });
      }
    }
    previous.forEach(function (item, id) {
      if (!nextIds.has(id)) remove('activity_log', 'id=eq.' + encodeURIComponent(id));
    });
  }

  function applyUsers(next) {
    var previous = new Map();
    db.settings.users.forEach(function (person) {
      if (person.email) previous.set(person.email.toLowerCase(), person);
    });
    var nextEmails = new Set();
    next.settings.users.forEach(function (person) {
      if (person.email) nextEmails.add(person.email.toLowerCase());
    });

    previous.forEach(function (person, email) {
      if (!nextEmails.has(email) && person.id && person.id !== currentUserId) {
        api('/api/admin-ui/users', 'DELETE', { id: person.id });
      }
    });

    next.settings.users.forEach(function (person) {
      if (!person.email) return;
      var email = person.email.toLowerCase();
      var before = previous.get(email);
      if (!before) {
        var password = person.password || ('mgrh-' + Math.random().toString(36).slice(2, 8));
        var created = api('/api/admin-ui/users', 'POST', {
          email: person.email,
          name: person.name,
          role: person.role,
          password: password,
        });
        if (created && created.id) person.id = created.id;
        delete person.password;
        return;
      }
      if (before.id && (before.name !== person.name || before.role !== person.role)) {
        request('PATCH', '/rest/v1/profiles?id=eq.' + uuidFor(before.id), {
          full_name: person.name || '',
          role: roleValue(person.role),
        }, 'return=minimal');
      }
      delete person.password;
    });
  }

  function applySettings(next) {
    if (!!next.settings.editorsCanPublish !== !!db.settings.editorsCanPublish) {
      request('PATCH', '/rest/v1/settings?id=eq.1', {
        editors_can_publish: !!next.settings.editorsCanPublish,
      }, 'return=minimal');
    }
    applyUsers(next);
  }

  function commit(next) {
    if (!ready || !client) throw new Error('The content store is still loading.');
    if (!currentUserId || !accessToken) throw new Error('Sign in to save changes.');
    if (!next || next.version !== 1 || !Array.isArray(next.doctors) || !Array.isArray(next.media)) {
      throw new Error('The content data is not valid.');
    }
    applyMedia(next);
    applyDoctors(next);
    applyFacilities(next);
    applyEvents(next);
    applyCategories(next);
    applySettings(next);
    applyActivity(next);
    db = next;
    notify();
    return db;
  }

  function reset() {
    return db;
  }

  function seed() {
    return db;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Could not load the Supabase client.')); };
      document.head.appendChild(script);
    });
  }

  async function start() {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });

    client.auth.onAuthStateChange(function (event, authSession) {
      if (authSession) {
        currentUserId = authSession.user.id;
        accessToken = authSession.access_token;
      } else if (event === 'SIGNED_OUT') {
        currentUserId = '';
        accessToken = '';
        currentUser = null;
      }
    });

    try {
      var result = await client.auth.getSession();
      var authSession = result.data ? result.data.session : null;
      if (authSession) {
        currentUserId = authSession.user.id;
        accessToken = authSession.access_token;
        currentUser = await sessionFromUser(authSession.user);
      }
      await refresh();
      loadDirectory();
    } catch (error) {
      console.error('MGRH store could not load content.', error);
      db = emptyDb();
    }

    ready = true;
    window.MGRHStore = {
      KEY: KEY,
      uid: uid,
      now: now,
      load: load,
      commit: commit,
      seed: seed,
      reset: reset,
      session: session,
      mediaSrc: mediaSrc,
      published: published,
      subscribe: function (fn) {
        subs.add(fn);
        return function () { subs.delete(fn); };
      },
      setSession: setSession,
      clearSession: clearSession,
      signIn: signIn,
      signOut: signOut,
      updatePassword: updatePassword,
    };
    notify();
  }

  if (window.supabase && window.supabase.createClient) {
    start();
  } else {
    loadScript(SUPABASE_CDN).then(start).catch(function (error) {
      console.error(error);
      ready = true;
      window.MGRHStore = {
        KEY: KEY,
        uid: uid,
        now: now,
        load: load,
        commit: function () { throw error; },
        seed: seed,
        reset: reset,
        session: session,
        mediaSrc: mediaSrc,
        published: published,
        subscribe: function (fn) { subs.add(fn); return function () { subs.delete(fn); }; },
        setSession: setSession,
        clearSession: clearSession,
        signIn: function () { return Promise.reject(error); },
        signOut: function () { return Promise.resolve(); },
        updatePassword: function () { return Promise.reject(error); },
      };
      notify();
    });
  }
})();


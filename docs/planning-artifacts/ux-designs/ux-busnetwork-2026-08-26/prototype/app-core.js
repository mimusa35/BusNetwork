/* BusNetwork portal prototype — core.
   State, helpers, domain queries and the trip/invoice transitions (PRD §6.3, §7.8).
   Everything hangs off window.BN so the page and event modules can share it. */
window.BN = (function () {
  'use strict';

  const D = window.BN_DATA;
  const TZ = 'Europe/Oslo';
  const MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR;

  /* ---- Canonical values (data-sharing-contract §3) ---- */
  const ACTIVE_SET = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'];
  const CLOSED_SET = ['COMPLETED', 'CANCELLED', 'REJECTED'];
  const STATUS_LABEL = { REQUESTED: 'Requested', ACCEPTED: 'Accepted', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled', REJECTED: 'Rejected' };
  const STATUS_ICON = { REQUESTED: '○', ACCEPTED: '✓', IN_PROGRESS: '▶', COMPLETED: '⚑', CANCELLED: '✕', REJECTED: '−' };
  const INV_LABEL = { DRAFT: 'Draft', PENDING: 'Pending', APPROVED: 'Approved', DECLINED: 'Declined' };
  const ROLE_LABEL = { SALES: 'Sales / Dispatcher', PCOORD: 'Partner Coordinator', FIN: 'Finance User', ADMIN: 'Company Admin', VIEWER: 'Viewer / Management' };
  const AGREEMENT_LABEL = { PERCENTAGE: 'Percentage', FULL_DAY: 'Full day', HALF_DAY: 'Half day', NONE: 'None' };
  const ATTACH_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];

  /* ---- Permissions (PRD §7.10) ---- */
  const PERMS = {
    createRequest: ['SALES', 'ADMIN'],
    respond: ['PCOORD', 'ADMIN'],
    cancel: ['SALES', 'PCOORD', 'ADMIN'],
    comment: ['SALES', 'PCOORD', 'FIN', 'ADMIN'],
    markComplete: ['PCOORD', 'ADMIN'],
    altStart: ['PCOORD', 'ADMIN'],
    proposePrice: ['SALES', 'ADMIN'],
    confirmPrice: ['PCOORD', 'ADMIN'],
    invoiceIssue: ['FIN', 'ADMIN'],
    invoiceDecide: ['FIN', 'ADMIN'],
    exportLists: ['SALES', 'PCOORD', 'FIN', 'ADMIN', 'VIEWER'],
  };

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const BN = {};

  BN.initState = function (keep) {
    BN.S = {
      now: Date.parse(D.NOW),
      userId: keep ? keep.userId : 'U1',
      locale: 'nb-NO', // fixed: the prototype has no language switch
      theme: keep ? keep.theme : null,
      trips: clone(D.trips),
      invoices: clone(D.invoices),
      customers: clone(D.customers),
      notifications: clone(D.notifications),
      drafts: [], seen: {}, scroll: {}, lastList: {}, lastListKind: 'active',
      threadSel: {}, histFilter: {}, openDetails: {},
      form: null, formKey: null, modal: null, modalTrigger: null,
      notifOpen: false, dashUpdated: 0, focus: null, prevHash: '', navigated: true, searchTimer: null,
      seq: { trip: 48400, inv: D.invoiceSeq, n: 1000, draft: 0 },
      demo: { slow: false, forceError: false },
      loaded: {}, loading: null, guideSeen: false, guideFlow: null,
    };
    BN.scheduler(true);
    BN.S.dashUpdated = BN.S.now;
  };

  /* ---- small utils ---- */
  const esc = (v) => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const trunc = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
  function setPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
  }
  function getPath(obj, path) { return path.split('.').reduce((o, k) => (o === undefined || o === null ? o : o[k]), obj); }

  /* ---- time (BR-07, BN-LST-03, BN-LST-07) ---- */
  function zoneParts(ms) {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ms));
    const o = {}; p.forEach((x) => { o[x.type] = x.value; }); return o;
  }
  function fmtDT(v) { if (v === null || v === undefined || v === '') return '—'; const ms = typeof v === 'number' ? v : Date.parse(v); if (isNaN(ms)) return '—'; const o = zoneParts(ms); return o.year + '-' + o.month + '-' + o.day + ' ' + o.hour + ':' + o.minute; }
  function fmtD(v) { const s = fmtDT(v); return s === '—' ? s : s.slice(0, 10); }
  function tzOffset(ms) { const o = zoneParts(ms); return Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute) - Math.floor(ms / MIN) * MIN; }
  function zonedToUtc(y, mo, d, h, mi) {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    let t = guess - tzOffset(guess);
    const off2 = tzOffset(t);
    if (guess - off2 !== t) t = guess - off2;
    return t;
  }
  function dayStartUtc(ymd) { const p = ymd.split('-').map(Number); return zonedToUtc(p[0], p[1], p[2], 0, 0); }
  function dayEndUtc(ymd) { const p = ymd.split('-').map(Number); return zonedToUtc(p[0], p[1], p[2], 23, 59) + 59999; }
  function localToIso(v) { if (!v) return null; const parts = v.split('T'); const d = parts[0].split('-').map(Number); const t = (parts[1] || '00:00').split(':').map(Number); return new Date(zonedToUtc(d[0], d[1], d[2], t[0], t[1])).toISOString(); }
  function isoToLocal(iso) { if (!iso) return ''; return fmtDT(iso).replace(' ', 'T'); }
  function todayYmd() { return fmtD(BN.S.now); }
  function addDaysYmd(ymd, n) { return fmtD(dayStartUtc(ymd) + n * DAY + 12 * HOUR); }
  function isoDow(ymd) { const p = ymd.split('-').map(Number); const w = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); return w === 0 ? 7 : w; }
  function isoWeek(ymd) {
    const p = ymd.split('-').map(Number); const dt = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    const day = dt.getUTCDay() || 7; dt.setUTCDate(dt.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    return Math.ceil((((dt - y0) / DAY) + 1) / 7);
  }
  function fmtLen(startIso, endIso) {
    const m = Math.round((Date.parse(endIso) - Date.parse(startIso)) / MIN);
    if (isNaN(m)) return '—';
    if (m >= 48 * 60) { const d = Math.floor(m / 1440); return d + 'd ' + Math.round((m - d * 1440) / 60) + 'h'; }  // fixed-trip contracts run for months
    return Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm';
  }
  const nowIso = () => new Date(BN.S.now).toISOString();

  /* ---- money (BR-08) ---- */
  const roundHalfAway = (x) => (x < 0 ? -Math.round(-x) : Math.round(x));
  function num(minor) { return new Intl.NumberFormat(BN.S.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minor / 100); }
  function money(minor, cur) { if (minor === null || minor === undefined || isNaN(minor)) return '—'; return num(minor) + ' ' + (cur || 'NOK'); }
  function parseMoney(str) {
    if (str === null || str === undefined) return NaN;
    const s = String(str).replace(/[\s ]/g, '').replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return NaN;
    const parts = s.split('.');
    return (+parts[0]) * 100 + (parts[1] ? +parts[1].padEnd(2, '0') : 0);
  }
  const moneyInput = (minor) => (minor === null || minor === undefined || isNaN(minor) ? '' : (minor / 100).toFixed(2));

  /* ---- domain ---- */
  const me = () => D.users.find((u) => u.id === BN.S.userId);
  const myCid = () => me().companyId;
  const company = (id) => D.companies.find((c) => c.id === id) || { id: id, name: id, vat: 25, currency: 'NOK' };
  const cname = (id) => company(id).name;
  const can = (p) => PERMS[p].indexOf(me().role) !== -1;
  const tripById = (id) => BN.S.trips.find((t) => t.id === String(id));
  const reqOf = (t, cid) => t.requests.find((r) => r.partnerId === cid);
  const customerOf = (t) => BN.S.customers.find((c) => c.id === t.customerId) || { name: '—', contact: '—', phone: '—' };
  const affiliation = (hostId, partnerId) => D.affiliations.find((a) => a.hostId === hostId && a.partnerId === partnerId);
  const vehicleName = (id) => { const v = D.vehicleTypes.find((x) => x.id === id); return v ? v.name : (id || '—'); };

  function sideOf(t, cid) { if (t.hostId === cid) return 'SHARED'; return reqOf(t, cid) ? 'RECEIVED' : null; }
  function viewOf(t, cid) {                      // PRD §6.2 company-view status
    if (t.hostId === cid) return { status: t.status, reason: t.closedReason, closedAt: t.closedAt };
    const r = reqOf(t, cid);
    if (r.state === 'PENDING') return { status: 'REQUESTED', reason: null, closedAt: null };
    if (r.state === 'ACCEPTED') return { status: t.status, reason: t.closedReason, closedAt: t.closedAt };
    if (r.state === 'REJECTED') return { status: 'REJECTED', reason: r.reason, closedAt: r.closedAt };
    if (r.state === 'EXPIRED') return { status: 'REJECTED', reason: 'Expired', closedAt: r.closedAt };
    return { status: 'CANCELLED', reason: r.withdrawReason, closedAt: r.closedAt };
  }
  function counterparts(t, cid) { if (t.hostId !== cid) return [t.hostId]; if (t.acceptedPartnerId) return [t.acceptedPartnerId]; return t.requests.map((r) => r.partnerId); }
  function vm(t) { const cid = myCid(); const v = viewOf(t, cid); return { t: t, side: sideOf(t, cid), status: v.status, reason: v.reason, closedAt: v.closedAt, cps: counterparts(t, cid) }; }
  function visibleTrips() { const cid = myCid(); return BN.S.trips.filter((t) => sideOf(t, cid)); }
  const startAddr = (t) => (t.altStart ? t.altStart.address : t.from.address);
  const routeText = (t) => startAddr(t) + ' → ' + t.to.address;

  function calcOffer(agreement, customerMinor) {
    if (!agreement) return 0;
    if (agreement.type === 'PERCENTAGE') return isNaN(customerMinor) ? null : roundHalfAway(customerMinor * agreement.rate / 100);
    if (agreement.type === 'FULL_DAY' || agreement.type === 'HALF_DAY') return agreement.rate;
    return 0;
  }
  function priceFor(v) {
    const t = v.t;
    if (v.side === 'RECEIVED') { const r = reqOf(t, myCid()); return { minor: r.offer, text: money(r.offer, t.currency) }; }
    const acc = t.requests.find((r) => r.state === 'ACCEPTED');
    if (acc) return { minor: acc.offer, text: money(acc.offer, t.currency) };
    const live = t.requests.filter((r) => r.state === 'PENDING');
    const list = live.length ? live : t.requests;
    if (list.length === 1) return { minor: list[0].offer, text: money(list[0].offer, t.currency) };
    return { minor: Math.min.apply(null, list.map((r) => r.offer)), text: list.length + ' prices', title: list.map((r) => cname(r.partnerId) + ': ' + money(r.offer, t.currency)).join('\n') };
  }

  /* ---- actions available (PRD §7.4) ---- */
  function allowedActions(v) {
    const a = [], st = v.status, t = v.t;
    if (st === 'REQUESTED' && v.side === 'RECEIVED' && can('respond')) { a.push('accept', 'reject'); }
    if (st === 'REQUESTED' && v.side === 'SHARED') { if (can('createRequest')) a.push('edit'); if (can('cancel')) a.push('cancel'); }
    if (st === 'ACCEPTED') { if (can('cancel')) a.push('cancel'); if (can('comment')) a.push('comment'); }
    if (st === 'IN_PROGRESS') { if (v.side === 'RECEIVED' && can('markComplete')) a.push('complete'); if (can('comment')) a.push('comment'); }
    if (CLOSED_SET.indexOf(st) !== -1) {
      const inv = latestInvoiceForTrip(t.id);
      if (st === 'COMPLETED' && v.side === 'RECEIVED' && can('invoiceIssue') && !inv) a.push('invoice');
      if (inv && (can('invoiceIssue') || can('invoiceDecide')) && !(inv.status === 'DRAFT' && inv.issuerId !== myCid())) a.push('viewInvoice');
      if (can('comment')) a.push('comment');
    }
    return a;
  }

  /* ---- invoices ---- */
  function invoiceVersions(no) { return BN.S.invoices.filter((i) => i.no === no).sort((a, b) => a.version - b.version); }
  function latestInvoices() { const m = {}; BN.S.invoices.forEach((i) => { if (!m[i.no] || m[i.no].version < i.version) m[i.no] = i; }); return Object.keys(m).map((k) => m[k]); }
  function latestInvoiceForTrip(tripId) {
    const l = latestInvoices().filter((i) => i.tripId === tripId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return l[0] || null;
  }
  function notInvoiced(t) { const i = latestInvoiceForTrip(t.id); return !i || i.status === 'DECLINED'; }
  function lineCalc(l) { const net = roundHalfAway((+l.qty) * (+l.unit)); const vat = roundHalfAway(net * (+l.vat) / 100); return { net: net, vat: vat }; }
  function invTotals(inv) {
    const ls = inv.snapshot || inv.lines; let net = 0, vat = 0;
    ls.forEach((l) => { const c = lineCalc(l); net += c.net; vat += c.vat; });
    return { net: net, vat: vat, total: net + vat };
  }

  /* ---- history + notifications ---- */
  function hist(t, kind, action, detail, visibleTo, actorName, actorCompany) {
    t.history.unshift({
      at: nowIso(), actor: actorName || me().name, companyId: actorName === 'System' ? null : (actorCompany || myCid()),
      kind: kind, action: action, detail: detail || '', visibleTo: visibleTo || 'BOTH',
    });
  }
  function notify(companyId, roles, event, text, link, channels) {
    BN.S.notifications.unshift({ id: 'n' + (++BN.S.seq.n), at: nowIso(), companyId: companyId, roles: roles, event: event, text: text, link: link, channels: channels, read: [] });
  }
  function myNotifications() {
    const u = me();
    return BN.S.notifications.filter((n) => n.companyId === u.companyId && (!n.roles || n.roles.indexOf(u.role) !== -1 || u.role === 'ADMIN'));
  }

  /* ---- transitions (PRD §6.3) ---- */
  function acceptTrip(t, pid, actor) {                 // T2, AR-03 first accept wins
    const r = reqOf(t, pid);
    if (!r) return 'Your company has no request for this trip.';
    if (t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS' || t.status === 'COMPLETED' || (r.state === 'WITHDRAWN' && r.withdrawReason === 'Another partner accepted')) {
      return 'Already taken — another partner accepted this trip.';
    }
    if (t.status === 'CANCELLED') return cname(t.hostId) + ' cancelled this request: ' + (t.closedReason || 'no reason given') + '.';
    if (r.state === 'EXPIRED' || (t.deadline && BN.S.now >= Date.parse(t.deadline))) return 'This request expired at ' + fmtDT(t.deadline) + '.';
    if (r.state !== 'PENDING') return 'This request is no longer open.';
    const who = actor || me();
    r.state = 'ACCEPTED'; r.respondedBy = who.name; r.respondedAt = nowIso();
    t.status = 'ACCEPTED'; t.statusChangedAt = nowIso(); t.acceptedPartnerId = pid;
    t.requests.forEach((o) => {
      if (o !== r && o.state === 'PENDING') {
        o.state = 'WITHDRAWN'; o.withdrawReason = 'Another partner accepted'; o.closedAt = nowIso();
        notify(o.partnerId, ['PCOORD'], 'N-03', 'Trip ' + t.id + ' is no longer available — another partner accepted it.', '#/trips/' + t.id, ['In-app']);
        hist(t, 'status', 'Request withdrawn', 'Another partner accepted', o.partnerId, 'System');
      }
    });
    hist(t, 'status', 'Request accepted', 'Requested → Accepted', 'BOTH', who.name, who.companyId);
    notify(t.hostId, ['SALES'], 'N-02', cname(pid) + ' accepted trip ' + t.id + '.', '#/trips/' + t.id, ['In-app', 'Email']);
    return null;
  }
  function rejectTrip(t, reason) {                      // T3a / T3b
    const cid = myCid(), r = reqOf(t, cid);
    if (!r || r.state !== 'PENDING') return 'This request is no longer open.';
    r.state = 'REJECTED'; r.reason = reason; r.respondedBy = me().name; r.respondedAt = nowIso(); r.closedAt = nowIso();
    hist(t, 'status', 'Request rejected', reason, 'BOTH');
    if (!t.requests.some((x) => x.state === 'PENDING')) {
      t.status = 'REJECTED'; t.statusChangedAt = nowIso(); t.closedAt = nowIso(); t.closedReason = 'Rejected by all partners';
      notify(t.hostId, ['SALES'], 'N-02', 'Trip ' + t.id + ' was rejected by all partners.', '#/trips/' + t.id, ['In-app', 'Email']);
    } else {
      notify(t.hostId, ['SALES'], 'N-02', cname(cid) + ' rejected trip ' + t.id + ': ' + reason, '#/trips/' + t.id, ['In-app', 'Email']);
    }
    return null;
  }
  function cancelTrip(t, reason) {                      // T4
    const cid = myCid();
    if (ACTIVE_SET.indexOf(t.status) === -1) return 'Closed trips can’t be changed.';
    if (t.status === 'IN_PROGRESS') return 'In progress trips can’t be cancelled.';
    const before = t.status;
    t.status = 'CANCELLED'; t.statusChangedAt = nowIso(); t.closedAt = nowIso(); t.closedReason = reason; t.cancelledBy = cid;
    t.requests.forEach((r) => { if (r.state === 'PENDING') { r.state = 'WITHDRAWN'; r.withdrawReason = reason; r.closedAt = nowIso(); } });
    hist(t, 'status', 'Trip cancelled', STATUS_LABEL[before] + ' → Cancelled — ' + reason);
    const soon = Date.parse(t.plannedStart) - BN.S.now < DAY;
    const channels = soon ? ['In-app', 'Email', 'SMS'] : ['In-app', 'Email'];
    const text = 'Trip ' + t.id + ' (' + fmtDT(t.plannedStart) + ') was cancelled by ' + cname(cid) + ': ' + reason;
    if (cid === t.hostId) t.requests.forEach((r) => notify(r.partnerId, null, 'N-04', text, '#/trips/' + t.id, channels));
    else notify(t.hostId, null, 'N-04', text, '#/trips/' + t.id, channels);
    return null;
  }
  function completeTrip(t) {                            // T7
    if (t.status !== 'IN_PROGRESS') return 'Only trips that are in progress can be marked complete.';
    t.status = 'COMPLETED'; t.statusChangedAt = nowIso(); t.closedAt = nowIso();
    hist(t, 'status', 'Marked complete', 'In progress → Completed');
    notify(t.hostId === myCid() ? t.acceptedPartnerId : t.hostId, null, 'N-02', 'Trip ' + t.id + ' was marked complete.', '#/trips/' + t.id, ['In-app']);
    return null;
  }
  function postComment(t, pid, body) {
    t.thread.push({ partnerId: pid, authorName: me().name, companyId: myCid(), body: body, at: nowIso(), readBy: [BN.S.userId] });
    const to = myCid() === t.hostId ? pid : t.hostId;
    notify(to, null, 'N-06', me().name + ' (' + cname(myCid()) + ') commented on trip ' + t.id + '.', '#/trips/' + t.id, ['In-app']);
    hist(t, 'other', 'Comment posted', '', myCid() === t.hostId ? pid : 'BOTH');
  }
  function proposePrice(t, amount, comment) {           // BR-05
    t.priceProposal = { amount: amount, comment: comment, by: me().name, at: nowIso() };
    postComment(t, t.acceptedPartnerId, 'Price change proposed: ' + money(amount, t.currency) + '. ' + comment);
    hist(t, 'price', 'Price change proposed', money(reqOf(t, t.acceptedPartnerId).offer, t.currency) + ' → ' + money(amount, t.currency));
    notify(t.acceptedPartnerId, ['PCOORD', 'ADMIN'], 'N-06', cname(t.hostId) + ' proposes a new offer price for trip ' + t.id + '.', '#/trips/' + t.id, ['In-app', 'Email']);
  }
  function resolvePrice(t, accepted) {
    const p = t.priceProposal, r = reqOf(t, t.acceptedPartnerId);
    if (!p) return;
    if (accepted) {
      hist(t, 'price', 'Price change confirmed', money(r.offer, t.currency) + ' → ' + money(p.amount, t.currency));
      r.offer = p.amount; r.overridden = true; r.overriddenBy = p.by + ' (agreed with ' + me().name + ')';
      postComment(t, t.acceptedPartnerId, 'Price change to ' + money(p.amount, t.currency) + ' confirmed.');
    } else {
      hist(t, 'price', 'Price change declined', money(p.amount, t.currency) + ' not agreed');
      postComment(t, t.acceptedPartnerId, 'Price change to ' + money(p.amount, t.currency) + ' declined. The agreed price stands.');
    }
    t.priceProposal = null;
  }
  function setAltStart(t, address) {                    // BN-DTL-02
    const before = startAddr(t);
    t.altStart = { address: address };
    hist(t, 'edit', 'Alternative start address set', before + ' → ' + address);
    notify(t.hostId, null, 'N-06', cname(myCid()) + ' set an alternative start address on trip ' + t.id + '.', '#/trips/' + t.id, ['In-app']);
  }

  /* ---- invoice transitions (PRD §7.8) ---- */
  function createInvoice(t) {
    if (t.status !== 'COMPLETED') return { error: 'Only Completed trips can be invoiced.' };
    const existing = latestInvoiceForTrip(t.id);
    if (existing && existing.status !== 'DECLINED') return { error: 'Trip ' + t.id + ' already has invoice ' + existing.no + ' (' + INV_LABEL[existing.status] + ').' };
    const cid = myCid(), c = company(cid), r = reqOf(t, cid);
    const lines = [{ desc: 'Trip ' + t.id + ', ' + fmtD(t.plannedStart) + ', ' + t.from.address.split(',')[0] + ' → ' + t.to.address.split(',')[0], qty: 1, unit: r.offer, vat: c.vat, source: 'OFFER_PRICE' }];
    (r.costs || []).forEach((k) => lines.push({ desc: k.desc, qty: 1, unit: k.amount, vat: c.vat, source: 'ADDITIONAL_COST' }));
    const inv = {
      no: 'BN-INV-2026-' + String(++BN.S.seq.inv).padStart(6, '0'), version: 1, tripId: t.id, issuerId: cid, recipientId: t.hostId,
      status: 'DRAFT', lines: lines, currency: t.currency, createdAt: nowIso(), submittedAt: null, decidedAt: null, decidedBy: null, declineReason: null, snapshot: null,
    };
    BN.S.invoices.push(inv);
    hist(t, 'other', 'Invoice created', inv.no + ' v1');
    return { invoice: inv };
  }
  function submitInvoice(inv) {
    if (!inv.lines.length) return 'Add at least one line before submitting.';
    for (let i = 0; i < inv.lines.length; i++) {
      const l = inv.lines[i];
      if (!String(l.desc).trim()) return 'Add a description for line ' + (i + 1) + '.';
      if (!(+l.qty > 0)) return 'Quantity on line ' + (i + 1) + ' must be more than 0.';
      if (!(+l.unit >= 0)) return 'Unit price on line ' + (i + 1) + ' can’t be negative.';
    }
    inv.status = 'PENDING'; inv.submittedAt = nowIso();
    const t = tripById(inv.tripId);
    if (t) hist(t, 'other', 'Invoice submitted', inv.no + ' v' + inv.version);
    notify(inv.recipientId, ['FIN'], 'N-07', cname(inv.issuerId) + ' submitted invoice ' + inv.no + ' (' + money(invTotals(inv).total, inv.currency) + ') for trip ' + inv.tripId + '.', '#/invoices/' + inv.no, ['In-app', 'Email']);
    return null;
  }
  function decideInvoice(inv, approve, reason) {
    if (inv.status !== 'PENDING') return 'This invoice is not waiting for a decision.';
    inv.snapshot = clone(inv.lines);                    // AR-10 amounts locked
    inv.status = approve ? 'APPROVED' : 'DECLINED';
    inv.decidedAt = nowIso(); inv.decidedBy = me().name; inv.declineReason = approve ? null : reason;
    const t = tripById(inv.tripId);
    if (t) hist(t, 'other', approve ? 'Invoice approved' : 'Invoice declined', inv.no + ' v' + inv.version + (approve ? '' : ' — ' + reason));
    notify(inv.issuerId, ['FIN'], 'N-08', 'Invoice ' + inv.no + ' was ' + (approve ? 'approved' : 'declined: ' + reason) + '.', '#/invoices/' + inv.no, ['In-app', 'Email']);
    return null;
  }
  function resubmitInvoice(inv) {
    const next = clone(inv);
    next.version = inv.version + 1; next.status = 'DRAFT'; next.createdAt = nowIso();
    next.submittedAt = null; next.decidedAt = null; next.decidedBy = null; next.declineReason = null; next.snapshot = null;
    BN.S.invoices.push(next);
    const t = tripById(inv.tripId);
    if (t) hist(t, 'other', 'Invoice version created', next.no + ' v' + next.version);
    return next;
  }

  /* ---- scheduler (PRD §6.4) ---- */
  BN.scheduler = function (silent) {
    BN.S.trips.forEach((t) => {
      if (t.status === 'REQUESTED') {
        const dl = Date.parse(t.deadline || t.plannedStart);
        if (!t.deadlineWarned && BN.S.now >= dl - 2 * HOUR) {
          t.deadlineWarned = true;
          if (!silent && BN.S.now < dl) notify(t.hostId, ['SALES'], 'N-05', 'Trip ' + t.id + ' has no partner response and expires at ' + fmtDT(dl) + '.', '#/trips/' + t.id, ['In-app', 'Email']);
        }
        if (BN.S.now >= dl) {
          t.requests.forEach((r) => { if (r.state === 'PENDING') { r.state = 'EXPIRED'; r.closedAt = new Date(dl).toISOString(); } });
          t.status = 'REJECTED'; t.statusChangedAt = new Date(dl).toISOString(); t.closedAt = new Date(dl).toISOString(); t.closedReason = 'Expired';
          t.history.unshift({ at: new Date(dl).toISOString(), actor: 'System', companyId: null, kind: 'status', action: 'Response deadline passed', detail: 'Requested → Rejected (Expired)', visibleTo: 'BOTH' });
          if (!silent) notify(t.hostId, ['SALES'], 'N-02', 'Trip ' + t.id + ' was rejected: expired with no response.', '#/trips/' + t.id, ['In-app', 'Email']);
        }
      }
      if (t.status === 'ACCEPTED' && BN.S.now >= Date.parse(t.plannedStart)) {
        t.status = 'IN_PROGRESS'; t.statusChangedAt = t.plannedStart;
        t.history.unshift({ at: t.plannedStart, actor: 'System', companyId: null, kind: 'status', action: 'Planned start reached', detail: 'Accepted → In progress', visibleTo: 'BOTH' });
      }
      if (t.status === 'IN_PROGRESS' && BN.S.now >= Date.parse(t.plannedEnd)) {
        t.status = 'COMPLETED'; t.statusChangedAt = t.plannedEnd; t.closedAt = t.plannedEnd;
        t.history.unshift({ at: t.plannedEnd, actor: 'System', companyId: null, kind: 'status', action: 'Planned end reached', detail: 'In progress → Completed', visibleTo: 'BOTH' });
      }
    });
  };

  /* ---- CSV export (BN-LST-09) ---- */
  function downloadCsv(filename, rows) {
    const csv = rows.map((r) => r.map((cell) => {
      const s = cell === null || cell === undefined ? '' : String(cell);
      return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  /* ---- demo persistence: localStorage where the browser allows it, memory otherwise ---- */
  const STORE_KEY = 'bn-demo-state-v1';
  BN.storageOk = (function () {
    try { window.localStorage.setItem('__bn', '1'); window.localStorage.removeItem('__bn'); return true; }
    catch (e) { return false; }
  })();
  BN.saveState = function () {
    if (!BN.storageOk || !BN.S) return;
    try {
      const S = BN.S;
      window.localStorage.setItem(STORE_KEY, JSON.stringify({
        v: 1, now: S.now, userId: S.userId, locale: S.locale, theme: S.theme,
        trips: S.trips, invoices: S.invoices, customers: S.customers, notifications: S.notifications,
        drafts: S.drafts, seen: S.seen, seq: S.seq, guideSeen: S.guideSeen,
      }));
    } catch (e) { /* quota or blocked: the demo carries on in memory */ }
  };
  BN.loadState = function () {
    if (!BN.storageOk) return false;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || d.v !== 1 || !d.trips || !d.trips.length) return false;
      Object.assign(BN.S, {
        now: d.now, userId: d.userId || 'U1', locale: 'nb-NO', theme: d.theme || null,
        trips: d.trips, invoices: d.invoices, customers: d.customers, notifications: d.notifications,
        drafts: d.drafts || [], seen: d.seen || {}, seq: d.seq, guideSeen: !!d.guideSeen,
      });
      return true;
    } catch (e) { return false; }
  };
  BN.clearState = function () { if (BN.storageOk) { try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ } } };

  Object.assign(BN, {
    D: D, TZ: TZ, MIN: MIN, HOUR: HOUR, DAY: DAY,
    ACTIVE_SET: ACTIVE_SET, CLOSED_SET: CLOSED_SET, STATUS_LABEL: STATUS_LABEL, STATUS_ICON: STATUS_ICON,
    INV_LABEL: INV_LABEL, ROLE_LABEL: ROLE_LABEL, AGREEMENT_LABEL: AGREEMENT_LABEL, ATTACH_TYPES: ATTACH_TYPES, PERMS: PERMS,
    clone: clone, esc: esc, trunc: trunc, setPath: setPath, getPath: getPath,
    fmtDT: fmtDT, fmtD: fmtD, dayStartUtc: dayStartUtc, dayEndUtc: dayEndUtc, zonedToUtc: zonedToUtc,
    localToIso: localToIso, isoToLocal: isoToLocal, todayYmd: todayYmd, addDaysYmd: addDaysYmd, isoDow: isoDow, isoWeek: isoWeek,
    fmtLen: fmtLen, nowIso: nowIso, roundHalfAway: roundHalfAway, num: num, money: money, parseMoney: parseMoney, moneyInput: moneyInput,
    me: me, myCid: myCid, company: company, cname: cname, can: can, tripById: tripById, reqOf: reqOf, customerOf: customerOf,
    affiliation: affiliation, vehicleName: vehicleName, sideOf: sideOf, viewOf: viewOf, counterparts: counterparts, vm: vm,
    visibleTrips: visibleTrips, startAddr: startAddr, routeText: routeText, calcOffer: calcOffer, priceFor: priceFor, allowedActions: allowedActions,
    invoiceVersions: invoiceVersions, latestInvoices: latestInvoices, latestInvoiceForTrip: latestInvoiceForTrip, notInvoiced: notInvoiced,
    lineCalc: lineCalc, invTotals: invTotals, hist: hist, notify: notify, myNotifications: myNotifications,
    acceptTrip: acceptTrip, rejectTrip: rejectTrip, cancelTrip: cancelTrip, completeTrip: completeTrip, postComment: postComment,
    proposePrice: proposePrice, resolvePrice: resolvePrice, setAltStart: setAltStart,
    createInvoice: createInvoice, submitInvoice: submitInvoice, decideInvoice: decideInvoice, resubmitInvoice: resubmitInvoice,
    downloadCsv: downloadCsv,
  });
  return BN;
})();

/* BusNetwork portal prototype — Request (S-02): four-step form, drafts, pricing, submit. BN-REQ-01..10. */
(function (BN) {
  'use strict';
  const { esc, fmtDT, fmtD, money, moneyInput, parseMoney, cname, can, me, myCid, AGREEMENT_LABEL } = BN;
  const D = BN.D;

  function newFormData() {
    return {
      source: '', type: 'NORMAL', roundTrip: false, customerId: '', from: '', vias: [], to: '',
      start: '', end: '', ret: '', pax: '', paxOff: false,
      vehicle: { type: '', euro: '', fuel: '', luggage: '', other: '' }, shifts: [],
      flightNo: '', groupRef: '', sign: '',
      comments: { partner: '', driver: '', hq: '', invoiceComment: '', invoiceRef: '' },
      attachments: [], attachErr: '', partners: [], search: '', sortDir: 'asc',
      customerPrice: '', prices: {}, deadline: '',
    };
  }
  BN.newForm = function () { return { mode: 'new', tripId: null, step: 1, maxStep: 1, data: newFormData(), errors: {}, done: null, draftId: null }; };

  BN.prefill = function (teqId) {
    const s = D.teqTrips.find((x) => x.id === teqId);
    if (!s) return;
    const f = BN.newForm(), d = f.data;
    d.source = s.id; d.type = s.type; d.customerId = s.customerId; d.from = s.from; d.to = s.to;
    d.vias = (s.vias || []).slice(); d.start = BN.isoToLocal(s.start); d.end = BN.isoToLocal(s.end);
    d.pax = String(s.pax); d.vehicle.type = s.vehicleType; d.groupRef = s.groupRef; d.flightNo = s.flightNo || '';
    d.customerPrice = moneyInput(s.customerPrice);
    BN.S.form = f;
  };

  BN.formFromTrip = function (t) {
    const f = BN.newForm(), d = f.data;
    f.mode = 'edit'; f.tripId = t.id; f.maxStep = 4;
    d.source = t.teqRef; d.type = t.type; d.roundTrip = !!t.roundTrip; d.customerId = t.customerId;
    d.from = t.from.address; d.to = t.to.address; d.vias = t.vias.map((v) => v.address);
    d.start = BN.isoToLocal(t.plannedStart); d.end = BN.isoToLocal(t.plannedEnd); d.ret = BN.isoToLocal(t.returnAt);
    d.pax = t.pax === null || t.pax === undefined ? '' : String(t.pax); d.paxOff = !!t.paxOff;
    d.vehicle = Object.assign({}, t.vehicle); d.shifts = BN.clone(t.shifts);
    d.flightNo = t.flightNo; d.groupRef = t.groupRef; d.sign = t.sign; d.comments = Object.assign({}, t.comments);
    d.attachments = t.attachments.map((a) => ({ name: a.name, size: a.size }));
    d.customerPrice = moneyInput(t.customerPrice); d.deadline = BN.isoToLocal(t.deadline);
    t.requests.filter((r) => r.state === 'PENDING').forEach((r) => {
      d.partners.push(r.partnerId);
      d.prices[r.partnerId] = { override: r.overridden ? moneyInput(r.offer) : '', costs: (r.costs || []).map((c) => ({ desc: c.desc, amount: moneyInput(c.amount) })) };
    });
    BN.S.form = f;
  };

  const addrOk = (a) => !!a && D.addresses.indexOf(a) !== -1;
  const vt = (id) => D.vehicleTypes.find((x) => x.id === id);

  BN.formOffer = function (pid) {
    const d = BN.S.form.data;
    const ag = (BN.affiliation(myCid(), pid) || {}).agreement;
    const cp = d.customerPrice === '' ? NaN : parseMoney(d.customerPrice);
    const calc = BN.calcOffer(ag, cp);
    const p = d.prices[pid] || { override: '', costs: [] };
    const ov = p.override === '' || p.override === null || p.override === undefined ? null : parseMoney(p.override);
    const invalid = p.override !== '' && isNaN(ov);
    const offer = ov !== null && !isNaN(ov) ? ov : calc;
    return { agreement: ag, calc: calc, offer: offer, overridden: ov !== null && !isNaN(ov) && ov !== calc, invalid: invalid, costs: p.costs || [] };
  };

  BN.validateStep = function (step) {
    const d = BN.S.form.data, e = {};
    if (step === 1) {
      if (!d.customerId) e.customerId = 'Choose a customer, or create one.';
      if (!addrOk(d.from)) e.from = 'Choose an address from the suggestions so we can place it on the map.';
      if (!addrOk(d.to)) e.to = 'Choose an address from the suggestions so we can place it on the map.';
      d.vias.forEach((v, i) => { if (!addrOk(v)) e['vias.' + i] = 'Choose an address from the suggestions, or remove this stop.'; });
      const s = BN.localToIso(d.start), en = BN.localToIso(d.end);
      if (!d.start) e.start = 'Enter a planned start.';
      else if (Date.parse(s) <= BN.S.now) e.start = 'Start must be in the future (now ' + fmtDT(BN.S.now) + ').';
      if (!d.end) e.end = 'Enter a planned end.';
      else if (s && Date.parse(en) <= Date.parse(s)) e.end = 'End time must be after start time (start ' + fmtDT(s) + ').';
      if (d.roundTrip) {
        const rt = BN.localToIso(d.ret);
        if (!d.ret) e.ret = 'Enter the return date and time for a round trip.';
        else if (s && en && (Date.parse(rt) <= Date.parse(s) || Date.parse(rt) > Date.parse(en))) e.ret = 'Return must be between start (' + fmtDT(s) + ') and end (' + fmtDT(en) + ').';
      }
      const paxNeeded = !(d.type === 'FIXED' && d.paxOff);
      if (paxNeeded) {
        if (!/^\d+$/.test(String(d.pax)) || +d.pax < 1) e.pax = 'PAX must be a whole number of 1 or more.';
        else if (d.vehicle.type && vt(d.vehicle.type) && +d.pax > vt(d.vehicle.type).seats) e.pax = 'PAX ' + d.pax + ' is more than the ' + vt(d.vehicle.type).seats + ' seats on ‘' + vt(d.vehicle.type).name + '’.';
      }
      if (d.type === 'FIXED') {
        if (!d.shifts.length || d.shifts.some((sh) => !sh.subTrips.length)) e.shifts = 'Add at least one shift with a sub-trip.';
        else {
          d.shifts.forEach((sh, si) => {
            if (!sh.name.trim()) e['shifts.' + si + '.name'] = 'Name this shift.';
            sh.subTrips.forEach((st, ti) => {
              if (!addrOk(st.from) || !addrOk(st.to)) e['shifts.' + si + '.subTrips.' + ti + '.from'] = 'Choose sub-trip addresses from the suggestions.';
              if (!st.start || !st.end || Date.parse(BN.localToIso(st.end)) <= Date.parse(BN.localToIso(st.start))) e['shifts.' + si + '.subTrips.' + ti + '.start'] = 'Sub-trip end must be after its start.';
            });
          });
        }
      }
      if (d.attachErr) e.attachments = d.attachErr;
    }
    if (step === 2) { if (!d.partners.length) e.partners = 'Choose at least one partner.'; }
    if (step === 3) {
      if (d.customerPrice !== '' && isNaN(parseMoney(d.customerPrice))) e.customerPrice = 'Enter the customer price as a number, for example 20000.00.';
      d.partners.forEach((pid) => {
        const o = BN.formOffer(pid);
        if (o.invalid) e['offer.' + pid] = 'Enter the offer price as a number, for example 17000.00.';
        else if (o.calc === null && !o.overridden) e['offer.' + pid] = 'Enter a customer price to calculate, or type an offer price for ' + cname(pid) + '.';
        else if (!(o.offer > 0)) e['offer.' + pid] = 'Enter an offer price for ' + cname(pid) + ' — there is no price agreement.';
        (d.prices[pid] || { costs: [] }).costs.forEach((c, i) => {
          if (!c.desc.trim() || isNaN(parseMoney(c.amount))) e['cost.' + pid + '.' + i] = 'Give the additional cost a description and an amount.';
        });
      });
      if (d.deadline) {
        const dl = Date.parse(BN.localToIso(d.deadline)), s = Date.parse(BN.localToIso(d.start));
        if (dl <= BN.S.now || (s && dl > s)) e.deadline = 'The response deadline must be in the future and not after the planned start (' + fmtDT(s) + ').';
      }
    }
    return e;
  };

  BN.addAttachments = function (files) {
    const d = BN.S.form.data; d.attachErr = '';
    Array.prototype.forEach.call(files, (f) => {
      const ext = f.name.split('.').pop().toLowerCase();
      if (BN.ATTACH_TYPES.indexOf(ext) === -1) { d.attachErr = '‘' + f.name + '’ can’t be attached. Use PDF, JPG, PNG or DOCX.'; return; }
      if (f.size > 10 * 1024 * 1024) { d.attachErr = '‘' + f.name + '’ is ' + Math.round(f.size / 1048576) + ' MB. The limit is 10 MB.'; return; }
      if (d.attachments.length >= 2) { d.attachErr = 'You can attach up to 2 files.'; return; }
      d.attachments.push({ name: f.name, size: f.size });
    });
  };

  BN.submitForm = function () {
    const f = BN.S.form, d = f.data;
    for (let s = 1; s <= 3; s++) {
      const e = BN.validateStep(s);
      if (Object.keys(e).length) { f.errors = e; f.step = s; return 'Some details still need attention on step ' + s + '.'; }
    }
    const cid = myCid(), c = BN.company(cid);
    const startIso = BN.localToIso(d.start), endIso = BN.localToIso(d.end);
    const deadline = d.deadline ? BN.localToIso(d.deadline) : startIso;   // PRD WA-10
    const buildReq = (pid) => {
      const o = BN.formOffer(pid);
      return {
        partnerId: pid, agreement: o.agreement, calc: o.calc === null ? 0 : o.calc, offer: o.offer,
        overridden: o.overridden, overriddenBy: o.overridden ? me().name : null,
        costs: o.costs.filter((x) => x.desc.trim()).map((x) => ({ desc: x.desc, amount: parseMoney(x.amount) })),
        state: 'PENDING', withdrawReason: null, respondedBy: null, respondedAt: null, reason: null, closedAt: null,
      };
    };
    if (f.mode === 'edit') {
      const t = BN.tripById(f.tripId);
      const changes = [];
      const setIf = (label, obj, key, val) => { if (String(obj[key]) !== String(val)) { changes.push(label); obj[key] = val; } };
      setIf('planned start', t, 'plannedStart', startIso);
      setIf('planned end', t, 'plannedEnd', endIso);
      if (t.from.address !== d.from) { changes.push('from address'); t.from = { address: d.from }; }
      if (t.to.address !== d.to) { changes.push('to address'); t.to = { address: d.to }; }
      if (t.vias.map((v) => v.address).join('|') !== d.vias.join('|')) { changes.push('via stops'); t.vias = d.vias.map((a) => ({ address: a })); }
      setIf('PAX', t, 'pax', d.pax === '' ? null : +d.pax);
      setIf('customer price', t, 'customerPrice', parseMoney(d.customerPrice));
      setIf('response deadline', t, 'deadline', deadline);
      t.comments = Object.assign({}, d.comments); t.flightNo = d.flightNo; t.groupRef = d.groupRef; t.sign = d.sign; t.vehicle = Object.assign({}, d.vehicle);
      const pending = t.requests.filter((r) => r.state === 'PENDING');
      pending.forEach((r) => {
        if (d.partners.indexOf(r.partnerId) === -1) {
          r.state = 'WITHDRAWN'; r.withdrawReason = 'Removed by host'; r.closedAt = BN.nowIso();
          changes.push('removed ' + cname(r.partnerId));
          BN.notify(r.partnerId, ['PCOORD'], 'N-03', 'Trip ' + t.id + ' is no longer offered to you.', '#/trips/' + t.id, ['In-app']);
        } else {
          const o = BN.formOffer(r.partnerId);
          if (r.offer !== o.offer) { BN.hist(t, 'price', 'Offer price changed', cname(r.partnerId) + ': ' + money(r.offer, t.currency) + ' → ' + money(o.offer, t.currency), 'BOTH'); r.offer = o.offer; r.overridden = o.overridden; r.overriddenBy = o.overridden ? me().name : null; }
          r.costs = o.costs.filter((x) => x.desc.trim()).map((x) => ({ desc: x.desc, amount: parseMoney(x.amount) }));
        }
      });
      d.partners.forEach((pid) => {
        if (!t.requests.some((r) => r.partnerId === pid && r.state === 'PENDING')) {
          t.requests.push(buildReq(pid)); changes.push('added ' + cname(pid));
          BN.notify(pid, ['PCOORD'], 'N-01', cname(cid) + ' shared trip ' + t.id + ' (' + fmtDT(t.plannedStart) + '). Respond by ' + fmtDT(deadline) + '.', '#/trips/' + t.id, ['In-app', 'Email', 'Push']);
        }
      });
      BN.hist(t, 'edit', 'Request edited', changes.length ? changes.join(', ') : 'no field changes');
      f.done = { tripId: t.id, partners: d.partners.slice(), edited: true };
      return null;
    }
    const id = String(++BN.S.seq.trip);
    const t = {
      id: id, teqRef: d.source || id, hostId: cid, type: d.type, status: 'REQUESTED', statusChangedAt: BN.nowIso(),
      closedAt: null, closedReason: null, cancelledBy: null, roundTrip: !!d.roundTrip,
      plannedStart: startIso, plannedEnd: endIso, returnAt: d.ret ? BN.localToIso(d.ret) : null,
      from: { address: d.from }, vias: d.vias.map((a) => ({ address: a })), to: { address: d.to }, altStart: null,
      pax: d.pax === '' ? null : +d.pax, paxOff: !!d.paxOff, vehicle: Object.assign({}, d.vehicle),
      flightNo: d.flightNo, groupRef: d.groupRef, sign: d.sign, comments: Object.assign({}, d.comments),
      customerId: d.customerId, customerPrice: d.customerPrice === '' ? 0 : parseMoney(d.customerPrice), currency: c.currency,
      deadline: deadline, deadlineWarned: false, acceptedPartnerId: null,
      requests: d.partners.map(buildReq), shifts: BN.clone(d.shifts),
      attachments: d.attachments.map((a) => ({ name: a.name, size: a.size, by: me().name, at: BN.nowIso() })),
      history: [], thread: [], department: 'Oslo', flag: null, priceProposal: null, createdBy: BN.S.userId, submittedAt: BN.nowIso(),
    };
    BN.S.trips.push(t);
    t.requests.forEach((r) => {
      if (r.overridden) BN.hist(t, 'price', 'Offer price overridden', cname(r.partnerId) + ': calculated ' + money(r.calc, t.currency) + ' → ' + money(r.offer, t.currency), 'HOST');
    });
    BN.hist(t, 'status', 'Request submitted', 'Shared with ' + d.partners.map(cname).join(', '));
    t.requests.forEach((r) => BN.notify(r.partnerId, ['PCOORD'], 'N-01', cname(cid) + ' shared trip ' + t.id + ' (' + fmtDT(startIso) + ', ' + BN.routeText(t).split(' → ').map((x) => x.split(',')[0]).join(' → ') + '). Respond by ' + fmtDT(deadline) + '.', '#/trips/' + t.id, ['In-app', 'Email', 'Push']));
    if (f.draftId) BN.S.drafts = BN.S.drafts.filter((x) => x.id !== f.draftId);
    f.done = { tripId: id, partners: d.partners.slice(), edited: false };
    return null;
  };

  /* ---------- rendering ---------- */
  function fieldWrap(label, id, control, err, o) {
    o = o || {};
    return '<div class="field' + (o.wide ? ' wide' : '') + (err ? ' has-err' : '') + '"><label for="' + id + '">' + esc(label) + (o.req ? ' <span class="req">*</span>' : '') + '</label>' +
      control + (o.hint ? '<p class="hint">' + esc(o.hint) + '</p>' : '') + (err ? '<p class="err" id="' + id + '-err">' + esc(err) + '</p>' : '') + '</div>';
  }
  const fid = (p) => 'f-' + p.replace(/[^\w]/g, '-');
  function fInput(label, path, value, o) {
    o = o || {}; const id = fid(path), err = BN.S.form.errors[path];
    const ctl = '<input id="' + id + '" data-bind="' + path + '" type="' + (o.type || 'text') + '" value="' + esc(value) + '"' +
      (o.list ? ' list="' + o.list + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.rerender ? ' data-rerender="1"' : '') +
      (err ? ' aria-invalid="true" aria-describedby="' + id + '-err"' : '') + '>';
    return fieldWrap(label, id, ctl, err, o);
  }
  function fSelect(label, path, value, options, o) {
    o = o || {}; const id = fid(path), err = BN.S.form.errors[path];
    const ctl = '<select id="' + id + '" data-bind="' + path + '"' + (o.rerender ? ' data-rerender="1"' : '') + '>' +
      options.map((x) => '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(value) ? ' selected' : '') + '>' + esc(x[1]) + '</option>').join('') + '</select>';
    return fieldWrap(label, id, ctl, err, o);
  }
  function fArea(label, path, value, o) {
    o = o || {}; const id = fid(path), err = BN.S.form.errors[path];
    return fieldWrap(label, id, '<textarea id="' + id + '" data-bind="' + path + '" rows="' + (o.rows || 2) + '" maxlength="2000">' + esc(value) + '</textarea>', err, o);
  }
  function errSummary() {
    const e = BN.S.form.errors, keys = Object.keys(e);
    if (!keys.length) return '';
    return '<div class="err-summary" role="alert"><h2>Check these before you continue</h2><ul>' +
      keys.map((k) => '<li><button class="btn-link" data-act="focus-field" data-id="' + fid(k) + '">' + esc(e[k]) + '</button></li>').join('') + '</ul></div>';
  }

  function step1(d) {
    const customers = BN.S.customers.filter((c) => c.companyId === myCid());
    const teq = D.teqTrips.filter((x) => x.companyId === myCid());
    // Route as an itinerary in travel order (SCREENS S-03: From · Via stops · To), drawn with the route-line motif.
    const itRow = (kind, field, actions) => '<li class="it-row it-' + kind + '"><span class="it-mark" aria-hidden="true"></span>' + field +
      '<div class="it-actions">' + (actions || '') + '</div></li>';
    const vias = d.vias.map((v, i) => itRow('via', fInput('Via stop ' + (i + 1), 'vias.' + i, v, { list: 'addr' }),
      '<button class="btn btn-secondary btn-sm" data-act="via-move" data-i="' + i + '" data-dir="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move via stop ' + (i + 1) + ' up">↑</button>' +
      '<button class="btn btn-secondary btn-sm" data-act="via-move" data-i="' + i + '" data-dir="1"' + (i === d.vias.length - 1 ? ' disabled' : '') + ' aria-label="Move via stop ' + (i + 1) + ' down">↓</button>' +
      '<button class="btn btn-secondary btn-sm" data-act="via-remove" data-i="' + i + '" aria-label="Remove via stop ' + (i + 1) + '">×</button>')).join('');
    const shifts = d.shifts.map((sh, si) => '<div class="shift">' + fInput('Shift name', 'shifts.' + si + '.name', sh.name, { req: true }) +
      sh.subTrips.map((st, ti) => '<div class="subtrip">' + fInput('From', 'shifts.' + si + '.subTrips.' + ti + '.from', st.from, { list: 'addr' }) +
        fInput('To', 'shifts.' + si + '.subTrips.' + ti + '.to', st.to, { list: 'addr' }) +
        fInput('Start', 'shifts.' + si + '.subTrips.' + ti + '.start', st.start, { type: 'datetime-local' }) +
        fInput('End', 'shifts.' + si + '.subTrips.' + ti + '.end', st.end, { type: 'datetime-local' }) +
        '<button class="btn btn-secondary btn-sm" data-act="subtrip-remove" data-si="' + si + '" data-ti="' + ti + '">Remove</button></div>').join('') +
      '<button class="btn btn-secondary btn-sm" style="margin-top:8px" data-act="subtrip-add" data-si="' + si + '">Add sub-trip</button> ' +
      '<button class="btn btn-secondary btn-sm" style="margin-top:8px" data-act="shift-remove" data-si="' + si + '">Remove shift</button></div>').join('');
    return (teq.length && BN.S.form.mode === 'new' ? '<section class="card form-card"><h2 class="section">Start from a TEQ trip</h2>' +
      '<label class="tf"><span>Prefill from TEQ trip</span><select data-change="prefill"><option value="">— blank form —</option>' +
      teq.map((x) => '<option value="' + x.id + '"' + (d.source === x.id ? ' selected' : '') + '>' + x.id + ' · ' + esc(x.from.split(',')[0]) + ' → ' + esc(x.to.split(',')[0]) + ' · ' + fmtD(x.start) + '</option>').join('') + '</select></label></section>' : '') +
      '<section class="card form-card"><h2 class="section">Trip</h2><div class="grid-3">' +
      '<fieldset class="field"><legend>Trip type <span class="req">*</span></legend><div class="seg">' +
      [['NORMAL', 'Normal'], ['FIXED', 'Fixed']].map((x) => '<label><input type="radio" name="type" data-bind="type" data-rerender="1" value="' + x[0] + '"' + (d.type === x[0] ? ' checked' : '') + '> ' + x[1] + '</label>').join('') + '</div></fieldset>' +
      '<div class="field"><label class="check"><input type="checkbox" data-bind="roundTrip" data-rerender="1"' + (d.roundTrip ? ' checked' : '') + '> Round trip</label></div>' +
      (d.type === 'FIXED' ? '<div class="field"><label class="check"><input type="checkbox" data-bind="paxOff" data-rerender="1"' + (d.paxOff ? ' checked' : '') + '> Passenger count turned off</label></div>' : '') +
      '</div></section>' +
      '<section class="card form-card"><h2 class="section">Customer</h2><div class="grid-3">' +
      fSelect('Customer', 'customerId', d.customerId, [['', '— choose —']].concat(customers.map((c) => [c.id, c.name])), { req: true, rerender: true }) +
      '<div class="field"><label>Contact person</label><input value="' + esc((customers.find((c) => c.id === d.customerId) || {}).contact || '') + '" readonly></div>' +
      '<div class="field"><label for="new-cust">New customer</label><button class="btn btn-secondary" id="new-cust" data-act="new-customer">+ Create customer</button></div>' +
      '</div></section>' +
      '<section class="card form-card"><h2 class="section">Route</h2>' +
      '<p class="muted small route-intro">Start typing and choose an address from the suggestions (Google Maps). Add up to 8 via stops between start and destination.</p>' +
      '<ol class="itinerary" aria-label="Route stops in travel order">' +
      itRow('from', fInput('Travel from', 'from', d.from, { req: true, list: 'addr', rerender: true })) + vias +
      '<li class="it-add"><span class="it-mark" aria-hidden="true"></span><div class="it-add-body">' +
      '<button class="btn btn-secondary btn-sm" data-act="via-add"' + (d.vias.length >= 8 ? ' disabled' : '') + '>+ Add via stop</button>' +
      '<span class="muted small">' + d.vias.length + ' of 8 via stops used</span></div></li>' +
      itRow('to', fInput('Travel to', 'to', d.to, { req: true, list: 'addr', rerender: true })) +
      '</ol></section>' +
      '<section class="card form-card"><h2 class="section">Schedule</h2><div class="grid-3">' +
      fInput('Planned start', 'start', d.start, { req: true, type: 'datetime-local' }) +
      fInput('Planned end', 'end', d.end, { req: true, type: 'datetime-local' }) +
      (d.roundTrip ? fInput('Return date/time', 'ret', d.ret, { req: true, type: 'datetime-local' }) : '') + '</div></section>' +
      '<section class="card form-card"><h2 class="section">Passengers &amp; vehicle</h2><div class="grid-3">' +
      (d.type === 'FIXED' && d.paxOff ? '' : fInput('PAX', 'pax', d.pax, { req: true, type: 'number' })) +
      fSelect('Vehicle type', 'vehicle.type', d.vehicle.type, [['', '— any —']].concat(D.vehicleTypes.map((v) => [v.id, v.name + ' (' + v.seats + ' seats)'])), { rerender: true }) +
      fInput('Euro class', 'vehicle.euro', d.vehicle.euro) + fInput('Fuel type', 'vehicle.fuel', d.vehicle.fuel) +
      fInput('Luggage', 'vehicle.luggage', d.vehicle.luggage) + fInput('Other requirements', 'vehicle.other', d.vehicle.other) + '</div></section>' +
      (d.type === 'FIXED' ? '<section class="card form-card"><h2 class="section">Shifts</h2>' + (BN.S.form.errors.shifts ? '<p class="err">' + esc(BN.S.form.errors.shifts) + '</p>' : '') + shifts +
        '<button class="btn btn-secondary btn-sm" data-act="shift-add">Add shift</button></section>' : '') +
      '<section class="card form-card"><h2 class="section">References</h2><div class="grid-3">' +
      fInput('Flight no.', 'flightNo', d.flightNo, { max: 100 }) + fInput('Group ref.', 'groupRef', d.groupRef, { max: 100 }) + fInput('Sign', 'sign', d.sign, { max: 100 }) + '</div></section>' +
      '<section class="card form-card"><h2 class="section">Comments</h2><div class="grid-2">' +
      fArea('Comment to partner', 'comments.partner', d.comments.partner) + fArea('Comment to driver', 'comments.driver', d.comments.driver) +
      fArea('HQ comment (internal)', 'comments.hq', d.comments.hq) + fArea('Invoice comment', 'comments.invoiceComment', d.comments.invoiceComment) +
      fInput('Invoice reference', 'comments.invoiceRef', d.comments.invoiceRef, { max: 100 }) + '</div></section>' +
      '<section class="card form-card"><h2 class="section">Attachments</h2>' +
      '<input type="file" id="attach" multiple accept=".pdf,.jpg,.jpeg,.png,.docx"> <span class="muted small">Up to 2 files, 10 MB each (PDF, JPG, PNG, DOCX).</span>' +
      (BN.S.form.errors.attachments ? '<p class="err">' + esc(BN.S.form.errors.attachments) + '</p>' : '') +
      (d.attachments.length ? '<ul class="attach-list">' + d.attachments.map((a, i) => '<li><span>' + esc(a.name) + '</span><span>' + Math.round(a.size / 1024) + ' kB <button class="btn-link" data-act="attach-remove" data-i="' + i + '">Remove</button></span></li>').join('') + '</ul>' : '') +
      '</section>';
  }

  function step2(d) {
    const cid = myCid();
    const list = D.affiliations.filter((a) => a.hostId === cid && a.state === 'ACCEPTED')
      .filter((a) => !d.search || cname(a.partnerId).toLowerCase().indexOf(d.search.toLowerCase()) !== -1)
      .sort((a, b) => (d.sortDir === 'asc' ? 1 : -1) * cname(a.partnerId).localeCompare(cname(b.partnerId)));
    return '<section class="card form-card"><h2 class="section">Select partners</h2>' +
      (BN.S.form.errors.partners ? '<p class="err">' + esc(BN.S.form.errors.partners) + '</p>' : '') +
      '<div class="toolbar" style="border:0;padding-left:0"><label class="tf"><span>Search</span><input type="search" data-bind="search" data-rerender="1" value="' + esc(d.search) + '" placeholder="Partner name"></label>' +
      '<label class="tf"><span>Sort</span><select data-bind="sortDir" data-rerender="1"><option value="asc"' + (d.sortDir === 'asc' ? ' selected' : '') + '>Name A–Z</option><option value="desc"' + (d.sortDir === 'desc' ? ' selected' : '') + '>Name Z–A</option></select></label></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th><span class="sr-only">Select</span></th><th>Partner</th><th>Category</th><th>Price agreement</th><th>Rate</th></tr></thead><tbody>' +
      list.map((a) => '<tr><td><label class="check"><input type="checkbox" data-act="toggle-partner" data-pid="' + a.partnerId + '"' + (d.partners.indexOf(a.partnerId) !== -1 ? ' checked' : '') + '><span class="sr-only">Select ' + esc(cname(a.partnerId)) + '</span></label></td>' +
        '<td>' + esc(cname(a.partnerId)) + '</td><td>' + esc(a.category) + '</td><td>' + AGREEMENT_LABEL[a.agreement.type] + '</td>' +
        '<td class="num">' + (a.agreement.type === 'PERCENTAGE' ? a.agreement.rate + ' %' : a.agreement.rate ? money(a.agreement.rate, 'NOK') : '—') + '</td></tr>').join('') +
      '</tbody></table></div>' +
      (list.length ? '' : '<div class="empty"><p>No accepted partners match. Partnerships are set up in BusNetwork Settings.</p></div>') +
      '<p class="muted small">' + d.partners.length + ' partner' + (d.partners.length === 1 ? '' : 's') + ' selected. Only partners you have an active agreement with are listed.</p></section>';
  }

  function step3(d) {
    const cur = BN.company(myCid()).currency;
    const rows = d.partners.map((pid) => {
      const o = BN.formOffer(pid), p = d.prices[pid] || { override: '', costs: [] };
      const err = BN.S.form.errors['offer.' + pid];
      return '<tr' + (err ? ' class="needs"' : '') + '><td>' + esc(cname(pid)) + '</td>' +
        '<td>' + AGREEMENT_LABEL[o.agreement.type] + (o.agreement.type === 'PERCENTAGE' ? ' ' + o.agreement.rate + '%' : '') + '</td>' +
        '<td class="num">' + (o.calc === null ? '<span class="muted">Enter a customer price</span>' : money(o.calc, cur)) + '</td>' +
        '<td class="num"><input data-bind="prices.' + pid + '.override" data-rerender="1" value="' + esc(p.override) + '" placeholder="' + (o.calc === null ? '' : (o.calc / 100).toFixed(2)) + '" aria-label="Offer price for ' + esc(cname(pid)) + '">' +
        (o.overridden ? '<span class="override">Calculated ' + money(o.calc, cur) + ' · overridden by ' + esc(me().name) + ' · <button class="btn-link" data-act="reset-price" data-pid="' + pid + '">Reset</button></span>' : '') +
        (err ? '<span class="err">' + esc(err) + '</span>' : '') + '</td>' +
        '<td>' + p.costs.map((c, i) => '<div class="cost-row"><input data-bind="prices.' + pid + '.costs.' + i + '.desc" value="' + esc(c.desc) + '" placeholder="Description" aria-label="Additional cost description">' +
          '<input data-bind="prices.' + pid + '.costs.' + i + '.amount" data-rerender="1" value="' + esc(c.amount) + '" placeholder="0.00" aria-label="Additional cost amount">' +
          '<button class="btn-link" data-act="cost-remove" data-pid="' + pid + '" data-i="' + i + '">Remove</button></div>').join('') +
        '<button class="btn btn-secondary btn-sm" data-act="cost-add" data-pid="' + pid + '">Add cost</button></td></tr>';
    }).join('');
    return '<section class="card form-card"><h2 class="section">Set price</h2><div class="grid-3">' +
      fInput('Customer price (' + cur + ')', 'customerPrice', d.customerPrice, { rerender: true, hint: 'What the host charges its own customer. Never shown to partners.' }) +
      fInput('Response deadline', 'deadline', d.deadline, { type: 'datetime-local', hint: 'Defaults to the planned start if left empty.' }) + '</div>' +
      '<div class="tbl-wrap"><table class="price-table"><thead><tr><th>Partner</th><th>Agreement</th><th>Calculated</th><th>Offer price</th><th>Additional costs</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="muted small">Offer prices are rounded to 2 decimals. For a percentage agreement, the offer price is the customer price × the rate.</p></section>';
  }

  function step4(d) {
    const cur = BN.company(myCid()).currency;
    const card = (title, stepNo, body) => '<section class="card form-card review-card"><header><h2 class="section">' + title + '</h2><button class="btn-link" data-act="goto-step" data-step="' + stepNo + '">Edit</button></header>' + body + '</section>';
    const cust = BN.S.customers.find((c) => c.id === d.customerId) || {};
    return card('Trip', 1, '<dl class="dl">' + BN.components.dlRow('Type', d.type) + BN.components.dlRow('Customer', esc(cust.name || '')) +
      BN.components.dlRow('Planned start', fmtDT(BN.localToIso(d.start))) + BN.components.dlRow('Planned end', fmtDT(BN.localToIso(d.end))) +
      BN.components.dlRow('PAX', d.pax || '—') + BN.components.dlRow('Vehicle', esc(BN.vehicleName(d.vehicle.type))) + '</dl>') +
      card('Route', 1, '<ul class="stops">' + [d.from].concat(d.vias, [d.to]).map((a, i, arr) => '<li' + (i === arr.length - 1 ? ' class="end"' : '') + '>' + esc(a) + '</li>').join('') + '</ul>') +
      card('Partners &amp; prices', 3, '<div class="tbl-wrap"><table><thead><tr><th>Partner</th><th>Offer price</th><th>Additional costs</th></tr></thead><tbody>' +
        d.partners.map((pid) => { const o = BN.formOffer(pid); return '<tr><td>' + esc(cname(pid)) + '</td><td class="num">' + money(o.offer, cur) + (o.overridden ? ' <span class="override">overridden</span>' : '') + '</td><td class="num">' + (o.costs.length ? o.costs.map((c) => esc(c.desc) + ' ' + money(parseMoney(c.amount), cur)).join('<br>') : '—') + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="muted small">Customer price ' + money(parseMoney(d.customerPrice), cur) + ' · deadline ' + (d.deadline ? fmtDT(BN.localToIso(d.deadline)) : fmtDT(BN.localToIso(d.start)) + ' (planned start)') + '</p>') +
      card('Comments &amp; attachments', 1, '<dl class="dl">' + BN.components.dlRow('To partner', esc(d.comments.partner)) + BN.components.dlRow('To driver', esc(d.comments.driver)) +
        BN.components.dlRow('Attachments', d.attachments.length ? d.attachments.map((a) => esc(a.name)).join('<br>') : '—') + '</dl>');
  }

  BN.pageRequest = function (r) {
    if (!can('createRequest')) return '<div class="card empty"><p>Your role can’t create requests.</p></div>';
    const f = BN.S.form;
    if (f.done) {
      const d = f.done;
      return '<div class="card success"><h1 class="page-title">' + (d.edited ? 'Request updated' : 'Request sent to ' + d.partners.length + ' partner' + (d.partners.length === 1 ? '' : 's')) + '</h1>' +
        '<span class="big-id">' + d.tripId + '</span>' +
        '<p class="muted">Marked as shared on TEQ trip ' + d.tripId + ' · the trip is linked in both places.</p>' +
        '<p><a class="btn btn-primary" href="#/trips/' + d.tripId + '">Open the trip</a> <a class="btn btn-secondary" href="#/trips/active">Open in Active Trips</a> ' +
        '<button class="btn btn-secondary" data-act="new-request">Create another request</button></p></div>';
    }
    const d = f.data;
    const steps = [[1, 'Trip details'], [2, 'Select partners'], [3, 'Set price'], [4, 'Review & submit']];
    const stepper = '<ol class="stepper">' + steps.map((s) => '<li class="' + (f.step === s[0] ? 'cur' : (s[0] < f.step || s[0] <= f.maxStep ? 'done' : '')) + '">' +
      '<button data-act="goto-step" data-step="' + s[0] + '"' + (s[0] > f.maxStep ? ' disabled' : '') + '><small>Step ' + s[0] + '</small>' + s[1] + '</button></li>').join('') + '</ol>';
    const body = f.step === 1 ? step1(d) : f.step === 2 ? step2(d) : f.step === 3 ? step3(d) : step4(d);
    const drafts = (f.mode === 'new' && BN.S.drafts.length && f.step === 1)
      ? '<section class="card form-card"><h2 class="section">My drafts (' + BN.S.drafts.length + ')</h2><div class="tbl-wrap"><table><thead><tr><th>Last edited</th><th>Type</th><th>Route</th><th>Step</th><th>Actions</th></tr></thead><tbody>' +
      BN.S.drafts.map((x) => '<tr><td class="nowrap">' + fmtDT(x.at) + '</td><td>' + x.data.type + '</td><td>' + esc((x.data.from || '—').split(',')[0] + ' → ' + (x.data.to || '—').split(',')[0]) + '</td><td>' + x.step + '</td>' +
        '<td><button class="btn btn-secondary btn-sm" data-act="draft-open" data-id="' + x.id + '">Open</button> <button class="btn btn-secondary btn-sm" data-act="draft-delete" data-id="' + x.id + '">Delete</button></td></tr>').join('') + '</tbody></table></div></section>'
      : '';
    return '<div class="page-head"><h1 class="page-title">' + (f.mode === 'edit' ? 'Edit request · Trip ' + f.tripId : 'New request') + '</h1></div>' +
      errSummary() +
      '<div class="form-layout">' + stepper + '<div>' + drafts + body +
      '<div class="form-foot"><div><button class="btn btn-secondary" data-act="save-draft">Save draft</button></div>' +
      '<div class="row-actions">' + (f.step > 1 ? '<button class="btn btn-secondary" data-act="step-back">Back</button>' : '') +
      (f.step < 4 ? '<button class="btn btn-primary" data-act="step-next">Next</button>' : '<button class="btn btn-primary" data-act="submit-request">' + (f.mode === 'edit' ? 'Save changes' : 'Submit request') + '</button>') +
      '</div></div></div></div>';
  };
})(window.BN);

/* BusNetwork portal prototype — shell, routing, modals and events (S-00, S-09, S-10). */
(function (BN) {
  'use strict';
  const { esc, fmtDT, fmtD, fmtLen, money, moneyInput, parseMoney, cname, can, me, myCid, vm,
    STATUS_LABEL, INV_LABEL, ROLE_LABEL, ACTIVE_SET } = BN;
  const D = BN.D;
  const $ = (s, r) => (r || document).querySelector(s);

  /* BusNetwork logo mark (master copy: logo.svg). Inlined so the single-file build keeps it. */
  const LOGO = '<svg class="logo" viewBox="0 0 40 32" aria-hidden="true" focusable="false">' +
    '<path d="M5 6h25.5a4 4 0 0 1 3.7 2.5l2.6 6.6a5 5 0 0 1 .4 1.9V22a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#55C4A8"/><path d="M6 9.5h5v5H6zM13 9.5h5v5h-5zM20 9.5h5v5h-5z" fill="#132029"/><path d="M27.5 9.5h2.4a1.5 1.5 0 0 1 1.4 1l1.4 3.5h-5.2z" fill="#132029"/><path d="M2 17.5h35" stroke="#132029" stroke-width="1.4"/><circle cx="10" cy="24" r="4" fill="#132029"/><circle cx="10" cy="24" r="2.2" fill="#E1E8EB"/><circle cx="29" cy="24" r="4" fill="#132029"/><circle cx="29" cy="24" r="2.2" fill="#E1E8EB"/>' +
    '</svg>';

  /* ---------------- routing ---------------- */
  function parseHash() {
    const h = location.hash.replace(/^#/, '') || '/dashboard';
    const bits = h.split('?');
    return { path: bits[0], parts: bits[0].split('/').filter(Boolean), q: new URLSearchParams(bits[1] || '') };
  }
  function go(hash) { location.hash = hash; }
  function setQuery(update) {
    const r = parseHash();
    Object.keys(update).forEach((k) => {
      const v = update[k];
      if (v === null || v === undefined || v === '') r.q.delete(k); else r.q.set(k, v);
    });
    const qs = r.q.toString();
    history.replaceState(null, '', '#' + r.path + (qs ? '?' + qs : ''));
    render();
  }
  function currentTab(r) {
    if (r.parts[0] === 'trips') return ['active', 'closed', 'all'].indexOf(r.parts[1]) !== -1 ? r.parts[1] : BN.S.lastListKind;
    if (r.parts[0] === 'invoices') return 'invoices';
    return r.parts[0] || 'dashboard';
  }

  /* ---------------- chrome ---------------- */
  const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path></svg>';
  function renderTop() {
    const u = me();
    const unread = BN.myNotifications().filter((n) => n.read.indexOf(u.id) === -1).length;
    const personas = D.companies.filter((c) => D.users.some((x) => x.companyId === c.id)).map((c) =>
      '<optgroup label="' + esc(c.name) + '">' + D.users.filter((x) => x.companyId === c.id)
        .map((x) => '<option value="' + x.id + '"' + (x.id === u.id ? ' selected' : '') + '>' + esc(x.name) + ' — ' + ROLE_LABEL[x.role] + '</option>').join('') + '</optgroup>').join('');
    $('#topbar').innerHTML =
      '<div class="tb-left"><a class="logo-link" href="#/dashboard" title="BusNetwork — Dashboard" aria-label="BusNetwork — go to Dashboard">' + LOGO + '</a><span class="tb-company">' + esc(cname(u.companyId)) + '</span></div>' +
      '<div class="tb-right">' +
      '<label class="tb-field"><span>Signed in as</span><select data-change="persona">' + personas + '</select></label>' +
      '<details class="demo" data-keep="demo"' + (BN.S.openDetails.demo ? ' open' : '') + '><summary>Demo clock · ' + fmtDT(BN.S.now) + '</summary><div class="menu">' +
      '<p>Moves time forward and runs the scheduled status changes.</p>' +
      '<button data-act="advance" data-ms="' + BN.HOUR + '">Advance 1 hour</button>' +
      '<button data-act="advance" data-ms="' + (6 * BN.HOUR) + '">Advance 6 hours</button>' +
      '<button data-act="advance" data-ms="' + BN.DAY + '">Advance 1 day</button>' +
      '<button data-act="advance" data-ms="' + (7 * BN.DAY) + '">Advance 1 week</button>' +
      '<button data-act="demo-slow">' + (BN.S.demo.slow ? '\u2713 ' : '') + 'Simulate slow loading</button>' +
      '<button data-act="demo-error">' + (BN.S.demo.forceError ? '\u2713 ' : '') + 'Simulate a load error</button>' +
      '<button data-act="reset">Reset demo data</button>' +
      '<p>' + (BN.storageOk ? 'Your changes are saved in this browser.' : 'This browser blocks local storage, so changes last until you reload.') + '</p>' +
      '</div></details>' +
      '<button class="icon-btn tb-wide" data-act="guide">Demo guide</button>' +
      '<button class="icon-btn" data-act="theme" aria-label="Switch colour theme"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"></path></svg></button>' +
      '<button class="icon-btn" data-act="notif" aria-expanded="' + (BN.S.notifOpen ? 'true' : 'false') + '" aria-label="Notifications, ' + unread + ' unread">' + BELL + (unread ? '<b>' + unread + '</b>' : '') + '</button>' +
      '</div>';
  }
  function renderNav(r) {
    const cur = currentTab(r);
    const activeCount = BN.visibleTrips().map(vm).filter((v) => ACTIVE_SET.indexOf(v.status) !== -1).length;
    const tabs = [
      { k: 'dashboard', label: 'Dashboard', href: '#/dashboard', show: true },
      { k: 'request', label: 'Request', href: '#/request', show: can('createRequest') },
      { k: 'active', label: 'Active Trips', href: '#/trips/active', show: true, badge: activeCount, badgeLabel: 'open trips' },
      { k: 'closed', label: 'Closed Trips', href: '#/trips/closed', show: true },
      { k: 'all', label: 'All Trips', href: '#/trips/all', show: true },
      { k: 'invoices', label: 'Invoice List', href: '#/invoices/incoming', show: can('invoiceDecide') || can('invoiceIssue'), badge: BN.pendingIncoming(), badgeLabel: 'waiting for approval', warn: true },
    ];
    $('#nav').innerHTML = '<div class="brand"><i aria-hidden="true"></i>BusNetwork</div><ul role="list">' +
      tabs.filter((t) => t.show).map((t) => '<li><a class="tab' + (cur === t.k ? ' on' : '') + '" href="' + t.href + '"' + (cur === t.k ? ' aria-current="page"' : '') + '>' + t.label +
        (t.badge !== undefined ? ' <b class="badge' + (t.warn && t.badge > 0 ? ' warn' : '') + '">' + t.badge + '<span class="sr-only"> ' + t.badgeLabel + '</span></b>' : '') + '</a></li>').join('') + '</ul>';
  }
  function renderNotif() {
    const root = $('#notif-root');
    if (!BN.S.notifOpen) { root.innerHTML = ''; return; }
    const items = BN.myNotifications();
    root.innerHTML = '<div class="notif" role="dialog" aria-label="Notifications"><header><strong>Notifications</strong>' +
      '<span><button class="btn-link" data-act="notif-read-all">Mark all read</button> <button class="btn-link" data-act="notif-close">Close</button></span></header>' +
      (items.length ? '<ul>' + items.slice(0, 30).map((n) => '<li><a href="' + n.link + '" class="' + (n.read.indexOf(BN.S.userId) === -1 ? 'unread' : '') + '" data-act="notif-open" data-id="' + n.id + '">' +
        esc(n.text) + '<small>' + fmtDT(n.at) + ' · ' + n.channels.join(', ') + '</small></a></li>').join('') + '</ul>'
        : '<p class="muted" style="padding:14px">No notifications.</p>') + '</div>';
  }
  /* ---------------- guided demo flows ---------------- */
  const FLOWS = [
    { t: 'Share a trip with two partners', who: 'U1', hash: '#/request',
      steps: ['Step 1: prefill from TEQ trip 48302, or fill the form yourself.', 'Step 2: pick Fjord Buss and Nordfjord Reiser.', 'Step 3: prices are calculated from each agreement (85 % and full day) \u2014 override one and watch the attribution appear.', 'Step 4: review and submit. The trip is Requested and both partners are notified.'] },
    { t: 'Answer an incoming request', who: 'U5', hash: '#/trips/active?status=REQUESTED&direction=received',
      steps: ['The dashboard figure "Awaiting response" opens exactly this list.', 'Open a row to read the trip, then use Accept or Reject.', 'Reject asks for a reason, and the host sees it.'] },
    { t: 'Lose the race \u2014 first accept wins', who: 'U7', hash: '#/trips/48213',
      steps: ['Choose Accept on trip 48213.', 'Tick "Demo: another partner accepts a moment before you".', 'You get "Already taken", and the trip now reads Cancelled \u00b7 Another partner accepted in your lists.'] },
    { t: 'Cancel an accepted trip', who: 'U1', hash: '#/trips/48220',
      steps: ['Choose Cancel and pick a reason \u2014 a reason is always required.', 'The trip moves from Active to Closed straight away.', 'Because it starts within 24 hours, the partner is also told by SMS.'] },
    { t: 'Let the clock run the lifecycle', who: 'U5', hash: '#/trips/active',
      steps: ['Open the Demo clock menu in the top bar.', 'Advance 1 day: accepted trips become In progress, then Completed.', 'Requests nobody answered expire into Rejected.'] },
    { t: 'Invoice a completed trip', who: 'U6', hash: '#/trips/closed?direction=received&invoice=not_invoiced',
      steps: ['The quick filter shows Completed trips that still need billing.', 'Create invoice prefills the agreed price, the extra costs and VAT.', 'Add a line, then Submit \u2014 the host\u2019s finance team is notified.'] },
    { t: 'Approve or decline an invoice', who: 'U3', hash: '#/invoices/incoming?status=PENDING',
      steps: ['Open BN-INV-2026-000184 and check the lines against the trip.', 'Approve locks the amounts for good.', 'Decline asks for a reason; the partner then resubmits as version 2.'] },
    { t: 'Search everything and export', who: 'U4', hash: '#/trips/all',
      steps: ['Tick the Closed group in the status filter, or set a date range.', 'The count line proves Active + Closed = All for the same filters.', 'Export CSV downloads every matching row, not just this page.'] },
    { t: 'See the cross-company boundary', who: 'U1', hash: '#/trips/48213',
      steps: ['As Ingrid (host) you see the customer, the customer price and every partner\u2019s price.', 'Switch "Signed in as" to Lars Berg and open the same trip.', 'The partner sees neither the customer price nor the other partner \u2014 only its own offer.'] },
  ];
  function personaLabel(uid) {
    const u = D.users.find((x) => x.id === uid);
    return u.name + ' \u2014 ' + ROLE_LABEL[u.role] + ', ' + cname(u.companyId);
  }
  function renderGuide() {
    const root = $('#guide-root');
    if (!BN.S.guideOpen) { root.innerHTML = ''; return; }
    root.innerHTML = '<div class="scrim" data-act="guide-close"></div>' +
      '<aside class="guide" role="dialog" aria-modal="true" aria-label="Demo guide">' +
      '<header><div><strong>Demo guide</strong><p class="muted small">Nine flows covering the whole product. Each one switches to the right person and opens the right screen.</p></div>' +
      '<button class="btn btn-secondary btn-sm" data-act="guide-close">Close</button></header><ol class="flows">' +
      FLOWS.map((f, i) => '<li><h3>' + esc(f.t) + '</h3><p class="muted small">as ' + esc(personaLabel(f.who)) + '</p>' +
        '<ol class="flow-steps">' + f.steps.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol>' +
        '<button class="btn btn-primary btn-sm" data-act="guide-start" data-i="' + i + '">Start this flow</button></li>').join('') +
      '</ol></aside>';
    const b = root.querySelector('button'); if (b) b.focus();
  }
  function flowBanner() {
    const i = BN.S.guideFlow;
    if (i === null || i === undefined || !FLOWS[i]) return '';
    const f = FLOWS[i];
    return '<div class="banner flow no-print"><div><strong>Demo flow \u00b7 ' + esc(f.t) + '</strong>' +
      '<ol class="flow-steps">' + f.steps.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol></div>' +
      '<span class="banner-actions"><button class="btn btn-secondary btn-sm" data-act="guide">All flows</button>' +
      '<button class="btn btn-secondary btn-sm" data-act="flow-close">Hide</button></span></div>';
  }

  let toastSeq = 0;
  function toast(text, href, linkLabel) {
    const id = 't' + (++toastSeq);
    const el = document.createElement('div');
    el.className = 'toast'; el.id = id;
    el.innerHTML = '<span>' + esc(text) + '</span>' + (href ? '<a href="' + href + '">' + esc(linkLabel || 'View') + '</a>' : '');
    $('#toasts').appendChild(el);
    setTimeout(() => { const n = document.getElementById(id); if (n) n.remove(); }, 6000);
  }
  BN.toast = toast;

  /* ---------------- modals (S-09) ---------------- */
  function reasonBody(kind, label) {
    return '<fieldset class="reasons"><legend>' + (label || 'Reason') + ' <span class="req">*</span></legend>' +
      D.reasons[kind].map((x) => '<label class="radio"><input type="radio" name="reason" value="' + esc(x) + '"> ' + esc(x) + '</label>').join('') +
      '<label class="radio"><input type="radio" name="reason" value="__other"> Other</label></fieldset>' +
      '<div class="field"><label for="reason-other">Details</label><textarea id="reason-other" rows="3" maxlength="500" placeholder="Required when you choose Other"></textarea></div>';
  }
  function readReason() {
    const sel = document.querySelector('input[name=reason]:checked');
    const other = ($('#reason-other') || { value: '' }).value.trim();
    if (!sel) return { error: 'Choose a reason.' };
    if (sel.value === '__other') {
      if (other.length < 5) return { error: 'Describe the reason (at least 5 characters).' };
      return { text: other };
    }
    return { text: other ? sel.value + ' — ' + other : sel.value };
  }
  const MODALS = {
    accept: function (m) {
      const t = BN.tripById(m.id), r = BN.reqOf(t, myCid());
      const others = t.requests.filter((x) => x.partnerId !== myCid() && x.state === 'PENDING');
      return {
        title: 'Accept trip ' + t.id, confirm: 'Accept trip ' + t.id,
        body: '<dl class="dl">' + BN.components.dlRow('Start', fmtDT(t.plannedStart)) + BN.components.dlRow('Route', esc(BN.routeText(t))) +
          BN.components.dlRow('PAX', t.pax === null ? '—' : t.pax) + BN.components.dlRow('Offer price', money(r.offer, t.currency)) +
          BN.components.dlRow('Additional costs', r.costs && r.costs.length ? r.costs.map((c) => esc(c.desc) + ' ' + money(c.amount, t.currency)).join('<br>') : '—') + '</dl>' +
          '<p class="muted">Other partners offered this trip have their requests withdrawn when you accept.</p>' +
          (others.length ? '<label class="check demo-opt"><input type="checkbox" id="race"> Demo: another partner accepts a moment before you</label>' : ''),
        onConfirm: function () {
          if ($('#race') && $('#race').checked) {
            const o = others[0];
            const actor = D.users.find((u) => u.companyId === o.partnerId && u.role === 'PCOORD') || { name: cname(o.partnerId) + ' coordinator', companyId: o.partnerId };
            BN.acceptTrip(t, o.partnerId, actor);
          }
          const err = BN.acceptTrip(t, myCid(), me());
          if (err) return err;
          toast('You accepted trip ' + t.id + '. ' + cname(t.hostId) + ' has been notified.', '#/trips/' + t.id, 'Open');
          return null;
        },
      };
    },
    reject: function (m) {
      const t = BN.tripById(m.id);
      return {
        title: 'Reject trip ' + t.id, confirm: 'Reject trip ' + t.id, danger: true,
        body: '<p class="muted">The reason is shown to ' + esc(cname(t.hostId)) + '.</p>' + reasonBody('REJECT'),
        onConfirm: function () {
          const rr = readReason(); if (rr.error) return rr.error;
          const err = BN.rejectTrip(t, rr.text); if (err) return err;
          toast('Trip ' + t.id + ' rejected. It is now in Closed Trips.', '#/trips/closed', 'Open');
          return null;
        },
      };
    },
    cancel: function (m) {
      const t = BN.tripById(m.id);
      const soon = Date.parse(t.plannedStart) - BN.S.now < BN.DAY;
      return {
        title: 'Cancel trip ' + t.id, confirm: 'Cancel trip ' + t.id, danger: true,
        body: '<p class="muted">The other company is notified with your reason' + (soon ? ', including SMS because the trip starts within 24 hours' : '') + '.</p>' + reasonBody('CANCEL'),
        onConfirm: function () {
          const rr = readReason(); if (rr.error) return rr.error;
          const err = BN.cancelTrip(t, rr.text); if (err) return err;
          toast('Trip ' + t.id + ' cancelled. It moved to Closed Trips.', '#/trips/closed', 'Open');
          return null;
        },
      };
    },
    complete: function (m) {
      const t = BN.tripById(m.id);
      return {
        title: 'Mark trip ' + t.id + ' complete', confirm: 'Mark complete',
        body: '<p>Mark trip ' + t.id + ' as completed now? It moves to Closed Trips and can be invoiced.</p>',
        onConfirm: function () { const err = BN.completeTrip(t); if (err) return err; toast('Trip ' + t.id + ' completed.', '#/trips/closed', 'Open'); return null; },
      };
    },
    price: function (m) {
      const t = BN.tripById(m.id), r = BN.reqOf(t, t.acceptedPartnerId);
      return {
        title: 'Propose a price change', confirm: 'Send proposal',
        body: '<p class="muted">Once a trip is Accepted, both companies must agree to a price change.</p>' +
          '<div class="field"><label for="pc-amount">New offer price (' + t.currency + ')</label><input id="pc-amount" value="' + moneyInput(r.offer) + '"></div>' +
          '<div class="field"><label for="pc-comment">Comment</label><textarea id="pc-comment" rows="3" placeholder="Why the price should change"></textarea></div>',
        onConfirm: function () {
          const amount = parseMoney($('#pc-amount').value), comment = $('#pc-comment').value.trim();
          if (isNaN(amount) || amount <= 0) return 'Enter the new price as a number, for example 18000.00.';
          if (comment.length < 5) return 'Add a short comment explaining the change.';
          BN.proposePrice(t, amount, comment);
          toast('Price change proposed to ' + cname(t.acceptedPartnerId) + '.');
          return null;
        },
      };
    },
    altStart: function (m) {
      const t = BN.tripById(m.id);
      return {
        title: 'Alternative start address', confirm: 'Save address',
        body: '<p class="muted">Shown instead of the original start address everywhere. Original: ' + esc(t.from.address) + '</p>' +
          '<div class="field"><label for="alt-addr">Alternative start</label><input id="alt-addr" list="addr" value="' + esc(t.altStart ? t.altStart.address : '') + '"></div>',
        onConfirm: function () {
          const v = $('#alt-addr').value;
          if (D.addresses.indexOf(v) === -1) return 'Choose an address from the suggestions.';
          BN.setAltStart(t, v); toast('Alternative start address saved.'); return null;
        },
      };
    },
    newCustomer: function () {
      return {
        title: 'New customer', confirm: 'Create customer',
        body: '<div class="field"><label for="nc-name">Customer name</label><input id="nc-name"></div>' +
          '<div class="field"><label for="nc-contact">Contact person</label><input id="nc-contact"></div>' +
          '<div class="field"><label for="nc-phone">Phone</label><input id="nc-phone"></div>',
        onConfirm: function () {
          const name = $('#nc-name').value.trim();
          if (!name) return 'Enter the customer name.';
          const id = 'K' + (BN.S.customers.length + 100);
          BN.S.customers.push({ id: id, companyId: myCid(), name: name, contact: $('#nc-contact').value.trim(), phone: $('#nc-phone').value.trim() });
          if (BN.S.form) BN.S.form.data.customerId = id;
          toast('Customer created.');
          return null;
        },
      };
    },
    welcome: function () {
      return {
        title: 'BusNetwork \u2014 interactive demo', confirm: 'Open the demo guide', cancelLabel: 'Explore on my own',
        body: '<p>A clickable prototype of the BusNetwork portal: six tabs, the whole trip lifecycle from request to invoice, and the rules the requirements describe.</p>' +
          '<ul class="plain"><li><strong>Everything is sample data.</strong> There is no backend; nothing leaves your browser.</li>' +
          '<li><strong>You can be anyone.</strong> Use <em>Signed in as</em> in the top bar to switch between the host company, its partners, finance and management.</li>' +
          '<li><strong>Time moves when you want it to.</strong> The <em>Demo clock</em> menu runs the scheduled status changes.</li>' +
          '<li><strong>Your changes stick.</strong> ' + (BN.storageOk ? 'They are saved in this browser until you reset the demo.' : 'This browser blocks local storage, so they last until you reload.') + '</li></ul>',
        onConfirm: function () { BN.S.guideSeen = true; BN.S.guideOpen = true; return null; },
      };
    },
    invDecline: function (m) {
      const inv = BN.invoiceVersions(m.no).slice(-1)[0];
      return {
        title: 'Decline ' + inv.no, confirm: 'Decline invoice', danger: true,
        body: '<p class="muted">' + cname(inv.issuerId) + ' is notified with your reason and can edit and resubmit as a new version.</p>' + reasonBody('INVOICE_DECLINE'),
        onConfirm: function () {
          const rr = readReason(); if (rr.error) return rr.error;
          const err = BN.decideInvoice(inv, false, rr.text); if (err) return err;
          toast('Invoice ' + inv.no + ' declined.'); return null;
        },
      };
    },
    invApprove: function (m) {
      const inv = BN.invoiceVersions(m.no).slice(-1)[0], t = BN.invTotals(inv);
      return {
        title: 'Approve ' + inv.no, confirm: 'Approve invoice',
        body: '<dl class="dl">' + BN.components.dlRow('From', esc(cname(inv.issuerId))) + BN.components.dlRow('Trip', inv.tripId) +
          BN.components.dlRow('Excl. VAT', money(t.net, inv.currency)) + BN.components.dlRow('VAT', money(t.vat, inv.currency)) + BN.components.dlRow('Total', money(t.total, inv.currency)) + '</dl>' +
          '<p class="muted">Approving locks the amounts.</p>',
        onConfirm: function () { const err = BN.decideInvoice(inv, true, null); if (err) return err; toast('Invoice ' + inv.no + ' approved.'); return null; },
      };
    },
    invSubmit: function (m) {
      const inv = BN.invoiceVersions(m.no).slice(-1)[0], t = BN.invTotals(inv);
      return {
        title: 'Submit ' + inv.no, confirm: 'Submit invoice',
        body: '<dl class="dl">' + BN.components.dlRow('To', esc(cname(inv.recipientId))) + BN.components.dlRow('Lines', inv.lines.length) +
          BN.components.dlRow('Total', money(t.total, inv.currency)) + '</dl>',
        onConfirm: function () { const err = BN.submitInvoice(inv); if (err) return err; toast('Invoice ' + inv.no + ' submitted to ' + cname(inv.recipientId) + '.'); return null; },
      };
    },
  };
  function openModal(kind, props, trigger) {
    BN.S.modal = Object.assign({ kind: kind, error: null, locked: false }, props || {});
    BN.S.modalTrigger = trigger || null;
    renderModal();
  }
  function closeModal() {
    const trig = BN.S.modalTrigger;
    BN.S.modal = null; BN.S.modalTrigger = null;
    renderModal();
    if (trig && document.body.contains(trig)) trig.focus();
  }
  function renderModal() {
    const root = $('#modal-root'), m = BN.S.modal;
    if (!m) { root.innerHTML = ''; return; }
    const def = MODALS[m.kind](m);
    root.innerHTML = '<div class="scrim" data-act="modal-close"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<h2 id="modal-title">' + esc(def.title) + '</h2>' +
      '<div class="modal-body">' + (m.error ? '<div class="banner error" role="alert"><div>' + esc(m.error) + '</div></div>' : '') + def.body + '</div>' +
      '<div class="modal-foot"><button class="btn btn-secondary" data-act="modal-close">' + (m.locked ? 'Close' : 'Cancel') + '</button>' +
      (m.locked ? '' : '<button class="btn btn-' + (def.danger ? 'danger' : 'primary') + '" data-act="modal-confirm">' + esc(def.confirm) + '</button>') + '</div></div>';
    const first = root.querySelector('.modal-body input, .modal-body textarea, .modal-body select') || root.querySelector('.modal-foot button');
    if (first) first.focus();
  }

  /* ---------------- export (BN-LST-09) ---------------- */
  function tripExportRows(kind, q) {
    const rows = BN.queryTrips(kind, q);
    const header = ['Trip ID', 'Trip start (Europe/Oslo)', 'Trip length', 'From', 'Via stops', 'To', 'PAX', 'Shift', 'Company', 'Type', 'Price', 'Currency', 'Status', 'Reason', 'Comments', 'Closed date', 'Invoice'];
    const body = rows.map((v) => {
      const t = v.t, inv = BN.latestInvoiceForTrip(t.id);
      return [t.id, fmtDT(t.plannedStart), fmtLen(t.plannedStart, t.plannedEnd), BN.startAddr(t), t.vias.map((x) => x.address).join(' | '), t.to.address,
        t.pax === null ? '' : t.pax, t.type === 'FIXED' && t.shifts.length ? t.shifts[0].name : 'N/A', v.cps.map(cname).join(' | '), t.type,
        BN.num(BN.priceFor(v).minor), t.currency, STATUS_LABEL[v.status], v.reason || '',
        t.thread.filter((c) => (myCid() === t.hostId ? true : c.partnerId === myCid())).length,
        v.closedAt ? fmtDT(v.closedAt) : '', inv ? INV_LABEL[inv.status] : (v.status === 'COMPLETED' ? 'Not invoiced' : '')];
    });
    return [header].concat(body);
  }
  function historyExportRows(kind, q) {
    const rows = BN.queryTrips(kind, q), cid = myCid();
    const out = [['Trip ID', 'At (Europe/Oslo)', 'Actor', 'Company', 'Action', 'Detail']];
    rows.forEach((v) => v.t.history.filter((h) => v.side === 'SHARED' || h.visibleTo === 'BOTH' || h.visibleTo === cid)
      .forEach((h) => out.push([v.t.id, fmtDT(h.at), h.actor, h.companyId ? cname(h.companyId) : '', h.action, h.detail])));
    return out;
  }

  /* ---------------- render ---------------- */
  const ROUTE_TITLE = { dashboard: 'Dashboard', request: 'New request', 'trips/active': 'Active Trips', 'trips/closed': 'Closed Trips', 'trips/all': 'All Trips', invoices: 'Invoice List' };
  function routeKey(r) {
    if (r.parts[0] === 'trips') return ['active', 'closed', 'all'].indexOf(r.parts[1]) !== -1 ? 'trips/' + r.parts[1] : 'trips/detail';
    if (r.parts[0] === 'invoices') return ['incoming', 'outgoing', 'archive'].indexOf(r.parts[1] || 'incoming') !== -1 ? 'invoices' : 'invoices/detail';
    return r.parts[0] || 'dashboard';
  }
  function titleFor(k) { return ROUTE_TITLE[k] || (k === 'trips/detail' ? 'Trip' : k === 'invoices/detail' ? 'Invoice' : 'BusNetwork'); }
  function skeletonKind(k) { return k === 'dashboard' ? 'dashboard' : (k === 'trips/detail' || k === 'invoices/detail' || k === 'request') ? 'detail' : 'list'; }
  function paint(html, key) {
    $('#page').innerHTML = html;
    renderNotif(); renderGuide();
    BN.S.prevHash = location.hash; BN.S.servedKey = key;
  }

  function render() {
    const r = parseHash();
    renderTop(); renderNav(r);
    const S = BN.S, key = routeKey(r);
    let html = '';
    if (S.loading === key) { paint(BN.skeletonFor(skeletonKind(key), titleFor(key)), key); return; }
    if (S.servedKey !== key && (!S.loaded[key] || S.demo.slow)) {
      S.loading = key;
      setTimeout(function () { S.loaded[key] = true; S.loading = null; render(); }, S.demo.slow ? 1500 : 420);
      paint(BN.skeletonFor(skeletonKind(key), titleFor(key)), key);
      return;
    }
    if (S.demo.forceError && ['dashboard', 'invoices', 'trips/active', 'trips/closed', 'trips/all'].indexOf(key) !== -1) {
      paint(BN.errorFor(titleFor(key)), key);
      return;
    }
    try {
      if (r.parts[0] === 'trips' && r.parts[1] && ['active', 'closed', 'all'].indexOf(r.parts[1]) === -1) {
        html = BN.pageTrip(r.parts[1]);
      } else if (r.parts[0] === 'trips') {
        const kind = r.parts[1] || 'active';
        BN.S.lastListKind = kind; BN.S.lastList[kind] = location.hash;
        html = BN.pageTripList(kind, r);
      } else if (r.parts[0] === 'request') {
        if (!BN.S.form) BN.S.form = BN.newForm();
        html = BN.pageRequest(r);
      } else if (r.parts[0] === 'invoices') {
        const seg = r.parts[1] || 'incoming';
        html = ['incoming', 'outgoing', 'archive'].indexOf(seg) !== -1 ? BN.pageInvoices(seg, r) : BN.pageInvoice(seg, r);
      } else {
        html = BN.pageDashboard(r);
      }
    } catch (e) {
      html = '<div class="banner error"><div><strong>The prototype hit an error rendering this screen.</strong> ' + esc(e.message) + '</div></div>';
      if (window.console) console.error(e);
    }
    paint(flowBanner() + html, key);
    afterRender(r);
    BN.saveState();
  }
  BN.render = render;

  function afterRender(r) {
    const dl = $('#addr');
    if (dl && !dl.childElementCount) dl.innerHTML = D.addresses.map((a) => '<option value="' + esc(a) + '"></option>').join('');
    if (BN.S.focus) {
      const el = document.querySelector(BN.S.focus.sel);
      if (el) { el.focus(); if (BN.S.focus.pos != null && el.setSelectionRange) { try { el.setSelectionRange(BN.S.focus.pos, BN.S.focus.pos); } catch (e) { /* ignore */ } } }
      BN.S.focus = null;
    }
    if (r.parts[0] === 'trips' && r.parts[1] && ['active', 'closed', 'all'].indexOf(r.parts[1]) === -1) {
      const t = BN.tripById(r.parts[1]), cid = myCid();
      if (t && BN.sideOf(t, cid)) {
        BN.S.seen[cid + ':' + t.id] = true;                       // clears the cancellation item
        t.thread.filter((c) => (cid === t.hostId ? true : c.partnerId === cid))
          .forEach((c) => { if (c.readBy.indexOf(BN.S.userId) === -1) c.readBy.push(BN.S.userId); });
      }
    }
    if (BN.S.navigated) {
      const y = BN.S.scroll[location.hash];
      window.scrollTo(0, y || 0);
      BN.S.navigated = false;
    }
  }

  /* ---------------- events ---------------- */
  const ACT = {
    skip: function () { $('#page').focus(); },
    open: function (el) { go(el.dataset.href); },
    theme: function () {
      const root = document.documentElement;
      const cur = root.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : cur === 'light' ? null : 'dark';
      if (next) root.setAttribute('data-theme', next); else root.removeAttribute('data-theme');
      BN.S.theme = next;
      toast('Theme: ' + (next || 'system'));
    },
    notif: function () { BN.S.notifOpen = !BN.S.notifOpen; render(); },
    'notif-close': function () { BN.S.notifOpen = false; render(); },
    'notif-read-all': function () { BN.myNotifications().forEach((n) => { if (n.read.indexOf(BN.S.userId) === -1) n.read.push(BN.S.userId); }); render(); },
    'notif-open': function (el) {
      const n = BN.S.notifications.find((x) => x.id === el.dataset.id);
      if (n && n.read.indexOf(BN.S.userId) === -1) n.read.push(BN.S.userId);
      BN.S.notifOpen = false;
      go(n ? n.link : '#/dashboard');
      render();
    },
    advance: function (el) {
      BN.S.now += +el.dataset.ms;
      BN.scheduler(false);
      BN.S.dashUpdated = BN.S.now;
      toast('Demo clock is now ' + fmtDT(BN.S.now) + '. Scheduler jobs ran.');
      render();
    },
    reset: function () {
      BN.clearState();
      BN.initState({ userId: BN.S.userId, theme: BN.S.theme });
      BN.S.guideSeen = true;
      toast('Demo data reset to the starting scenario.');
      go('#/dashboard'); render();
    },
    refresh: function () { BN.S.dashUpdated = BN.S.now; BN.S.servedKey = null; render(); },
    'retry-load': function () { BN.S.demo.forceError = false; BN.S.servedKey = null; toast('Retrying\u2026'); render(); },
    'demo-slow': function () { BN.S.demo.slow = !BN.S.demo.slow; toast('Slow loading ' + (BN.S.demo.slow ? 'on \u2014 screens now show their loading state' : 'off') + '.'); render(); },
    'demo-error': function () { BN.S.demo.forceError = !BN.S.demo.forceError; toast('Load error ' + (BN.S.demo.forceError ? 'on \u2014 lists show the error state' : 'off') + '.'); render(); },
    guide: function () { BN.S.guideOpen = true; BN.S.guideSeen = true; renderGuide(); },
    'guide-close': function () { BN.S.guideOpen = false; renderGuide(); },
    'flow-close': function () { BN.S.guideFlow = null; render(); },
    'guide-start': function (el) {
      const f = FLOWS[+el.dataset.i];
      BN.S.guideFlow = +el.dataset.i; BN.S.guideOpen = false;
      BN.S.userId = f.who; BN.S.form = null; BN.S.servedKey = null;
      if (location.hash === f.hash) render(); else go(f.hash);
      toast('Signed in as ' + personaLabel(f.who) + '.');
    },
    sort: function (el) {
      const r = parseHash();
      const cur = (r.q.get('sort') || '').split(':');
      const dir = cur[0] === el.dataset.key && cur[1] === 'asc' ? 'desc' : 'asc';
      setQuery({ sort: el.dataset.key + ':' + dir, page: null });
    },
    page: function (el) { BN.S.navigated = true; setQuery({ page: el.dataset.page }); },
    'set-filter': function (el) { setQuery({ [el.dataset.key]: el.dataset.value, page: null }); },
    'clear-filter': function (el) { setQuery({ [el.dataset.key]: null, page: null }); },
    'clear-filters': function () {
      const r = parseHash();
      const keep = {};
      ['sort', 'size'].forEach((k) => { if (r.q.get(k)) keep[k] = r.q.get(k); });
      history.replaceState(null, '', '#' + r.path + (Object.keys(keep).length ? '?' + new URLSearchParams(keep).toString() : ''));
      render();
    },
    'toggle-not-invoiced': function () { const r = parseHash(); setQuery({ invoice: r.q.get('invoice') ? null : 'not_invoiced', page: null }); },
    'status-group': function (el) {
      const r = parseHash();
      const set = new Set((r.q.get('status') || '').split(',').filter(Boolean));
      const group = el.dataset.group === 'active' ? BN.ACTIVE_SET : BN.CLOSED_SET;
      const allOn = group.every((s) => set.has(s));
      group.forEach((s) => { if (allOn) set.delete(s); else set.add(s); });
      setQuery({ status: Array.from(set).join(','), page: null });
    },
    export: function (el) {
      const kind = el.dataset.kind, r = parseHash();
      const menu = el.closest('details'); if (menu) { menu.open = false; BN.S.openDetails.export = false; }
      if (el.dataset.fmt === 'xlsx') { toast('XLSX export is generated server-side in the real product. The prototype exports CSV.'); return; }
      if (kind === 'invoices') { BN.downloadCsv('busnetwork-invoices.csv', BN.invoiceExportRows(r.parts[1] || 'incoming', r.q)); return; }
      BN.downloadCsv('busnetwork-' + kind + '-trips.csv', tripExportRows(kind, r.q));
      if (kind === 'all') BN.downloadCsv('busnetwork-all-trips-status-history.csv', historyExportRows(kind, r.q));
      toast('Export downloaded.');
    },
    'hist-filter': function (el) { BN.S.histFilter[el.dataset.id] = el.dataset.value; render(); },
    'post-comment': function (el) {
      const t = BN.tripById(el.dataset.id), body = ($('#c-body') || { value: '' }).value.trim();
      if (!body) { toast('Write a comment first.'); return; }
      BN.postComment(t, el.dataset.pid, body);
      toast('Comment posted.');
      render();
    },
    'price-confirm': function (el) { BN.resolvePrice(BN.tripById(el.dataset.id), true); toast('Price change confirmed.'); render(); },
    'price-decline': function (el) { BN.resolvePrice(BN.tripById(el.dataset.id), false); toast('Price change declined.'); render(); },
    'price-propose': function (el) { openModal('price', { id: el.dataset.id }, el); },
    'alt-start': function (el) { openModal('altStart', { id: el.dataset.id }, el); },
    'trip-accept': function (el) { openModal('accept', { id: el.dataset.id }, el); },
    'trip-reject': function (el) { openModal('reject', { id: el.dataset.id }, el); },
    'trip-cancel': function (el) { openModal('cancel', { id: el.dataset.id }, el); },
    'trip-complete': function (el) { openModal('complete', { id: el.dataset.id }, el); },
    'trip-comment': function (el) { go('#/trips/' + el.dataset.id); },
    'trip-edit': function (el) { BN.formFromTrip(BN.tripById(el.dataset.id)); go('#/request'); },
    'trip-invoice': function (el) {
      const res = BN.createInvoice(BN.tripById(el.dataset.id));
      if (res.error) { toast(res.error); return; }
      toast('Draft invoice ' + res.invoice.no + ' created from the trip.');
      go('#/invoices/' + res.invoice.no);
    },
    'trip-viewInvoice': function (el) {
      const inv = BN.latestInvoiceForTrip(el.dataset.id);
      if (inv) go('#/invoices/' + inv.no);
    },
    'inv-submit': function (el) { openModal('invSubmit', { no: el.dataset.no }, el); },
    'inv-approve': function (el) { openModal('invApprove', { no: el.dataset.no }, el); },
    'inv-decline': function (el) { openModal('invDecline', { no: el.dataset.no }, el); },
    'inv-resubmit': function (el) {
      const versions = BN.invoiceVersions(el.dataset.no);
      const next = BN.resubmitInvoice(versions[versions.length - 1]);
      toast('Version ' + next.version + ' created as a draft. Edit the lines and submit.');
      go('#/invoices/' + next.no + '?v=' + next.version);
      render();
    },
    'inv-delete': function (el) {
      BN.S.invoices = BN.S.invoices.filter((i) => !(i.no === el.dataset.no && String(i.version) === el.dataset.v));
      toast('Draft deleted.');
      go('#/invoices/outgoing');
    },
    'inv-pdf': function () { toast('The real product renders a PDF in the company language. Using the browser print dialog here.'); setTimeout(() => window.print(), 300); },
    'line-add': function (el) {
      const inv = BN.invoiceVersions(el.dataset.no).find((x) => String(x.version) === el.dataset.v);
      inv.lines.push({ desc: '', qty: 1, unit: 0, vat: BN.company(inv.issuerId).vat, source: 'EXTRA' });
      render();
    },
    'line-remove': function (el) {
      const inv = BN.invoiceVersions(el.dataset.no).find((x) => String(x.version) === el.dataset.v);
      inv.lines.splice(+el.dataset.i, 1);
      render();
    },
    'modal-close': function () {
      if (BN.S.modal && BN.S.modal.kind === 'welcome') { BN.S.guideSeen = true; BN.saveState(); }
      closeModal();
    },
    'modal-confirm': function () {
      const m = BN.S.modal, def = MODALS[m.kind](m);
      const err = def.onConfirm();
      if (err) { m.error = err; m.locked = true; renderModal(); render(); return; }
      closeModal(); render();
    },
    /* request form */
    'new-request': function () { BN.S.form = BN.newForm(); render(); },
    'goto-step': function (el) { const f = BN.S.form; const s = +el.dataset.step; if (s <= f.maxStep) { f.step = s; f.errors = {}; render(); } },
    'step-back': function () { const f = BN.S.form; f.step = Math.max(1, f.step - 1); f.errors = {}; render(); },
    'step-next': function () {
      const f = BN.S.form;
      const e = BN.validateStep(f.step);
      f.errors = e;
      if (Object.keys(e).length) { render(); const s = document.querySelector('.err-summary button'); if (s) s.focus(); return; }
      f.step = Math.min(4, f.step + 1); f.maxStep = Math.max(f.maxStep, f.step);
      render();
    },
    'submit-request': function () {
      const err = BN.submitForm();
      if (err) { toast(err); render(); return; }
      render();
    },
    'save-draft': function () {
      const f = BN.S.form;
      const id = f.draftId || ('d' + (++BN.S.seq.draft));
      f.draftId = id;
      BN.S.drafts = BN.S.drafts.filter((x) => x.id !== id);
      BN.S.drafts.unshift({ id: id, at: BN.nowIso(), step: f.step, data: BN.clone(f.data) });
      toast('Draft saved. You can pick it up from the Request tab.');
      render();
    },
    'draft-open': function (el) {
      const d = BN.S.drafts.find((x) => x.id === el.dataset.id);
      BN.S.form = { mode: 'new', tripId: null, step: d.step, maxStep: 4, data: BN.clone(d.data), errors: {}, done: null, draftId: d.id };
      render();
    },
    'draft-delete': function (el) { BN.S.drafts = BN.S.drafts.filter((x) => x.id !== el.dataset.id); render(); },
    'via-add': function () { BN.S.form.data.vias.push(''); render(); },
    'via-remove': function (el) { BN.S.form.data.vias.splice(+el.dataset.i, 1); render(); },
    'via-move': function (el) {
      const v = BN.S.form.data.vias, i = +el.dataset.i, j = i + (+el.dataset.dir);
      if (j < 0 || j >= v.length) return;
      const tmp = v[i]; v[i] = v[j]; v[j] = tmp; render();
    },
    'attach-remove': function (el) { BN.S.form.data.attachments.splice(+el.dataset.i, 1); BN.S.form.data.attachErr = ''; render(); },
    'shift-add': function () { BN.S.form.data.shifts.push({ name: '', subTrips: [{ from: '', to: '', start: '', end: '' }] }); render(); },
    'shift-remove': function (el) { BN.S.form.data.shifts.splice(+el.dataset.si, 1); render(); },
    'subtrip-add': function (el) { BN.S.form.data.shifts[+el.dataset.si].subTrips.push({ from: '', to: '', start: '', end: '' }); render(); },
    'subtrip-remove': function (el) { BN.S.form.data.shifts[+el.dataset.si].subTrips.splice(+el.dataset.ti, 1); render(); },
    'toggle-partner': function (el) {
      const d = BN.S.form.data, pid = el.dataset.pid, i = d.partners.indexOf(pid);
      if (i === -1) { d.partners.push(pid); if (!d.prices[pid]) d.prices[pid] = { override: '', costs: [] }; } else d.partners.splice(i, 1);
      render();
    },
    'reset-price': function (el) { BN.S.form.data.prices[el.dataset.pid].override = ''; render(); },
    'cost-add': function (el) {
      const p = BN.S.form.data.prices[el.dataset.pid] || (BN.S.form.data.prices[el.dataset.pid] = { override: '', costs: [] });
      p.costs.push({ desc: '', amount: '' }); render();
    },
    'cost-remove': function (el) { BN.S.form.data.prices[el.dataset.pid].costs.splice(+el.dataset.i, 1); render(); },
    'focus-field': function (el) { const f = document.getElementById(el.dataset.id); if (f) { f.focus(); f.scrollIntoView({ block: 'center' }); } },
    'new-customer': function (el) { openModal('newCustomer', {}, el); },
  };

  function onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    if (el.tagName === 'A' && !el.dataset.href && el.dataset.act !== 'notif-open') return;
    e.preventDefault();
    fn(el, e);
  }
  function bindValue(el) {
    let v;
    if (el.type === 'checkbox') v = el.checked;
    else if (el.type === 'radio') { if (!el.checked) return; v = el.value; }
    else v = el.value;
    BN.setPath(BN.S.form.data, el.dataset.bind, v);
  }
  function onInput(e) {
    const el = e.target;
    if (el.dataset.bind && BN.S.form) { bindValue(el); return; }
    if (el.dataset.filter === 'q') {
      clearTimeout(BN.S.searchTimer);
      const value = el.value, pos = el.selectionStart;
      BN.S.searchTimer = setTimeout(() => { BN.S.focus = { sel: '[data-filter="q"]', pos: pos }; setQuery({ q: value, page: null }); }, 300);
    }
  }
  function onChange(e) {
    const el = e.target;
    if (el.dataset.bind && BN.S.form) {
      bindValue(el);
      if (el.dataset.rerender) {
        BN.S.focus = { sel: '[data-bind="' + el.dataset.bind + '"]' + (el.type === 'radio' ? '[value="' + el.value + '"]' : '') };
        render();
      }
      return;
    }
    if (el.dataset.change === 'persona') {
      BN.S.userId = el.value; BN.S.form = null; BN.S.notifOpen = false;
      toast('Signed in as ' + me().name + ' — ' + ROLE_LABEL[me().role] + ', ' + cname(myCid()) + '.');
      const r = parseHash();
      if (r.parts[0] === 'request' && !can('createRequest')) { go('#/dashboard'); return; }
      render(); return;
    }
    if (el.dataset.change === 'prefill') { if (el.value) BN.prefill(el.value); else BN.S.form = BN.newForm(); render(); return; }
    if (el.dataset.change === 'thread') { BN.S.threadSel[el.dataset.id] = el.value; render(); return; }
    if (el.id === 'attach') { BN.addAttachments(el.files); render(); return; }
    if (el.dataset.invline) {
      const r = parseHash();
      const inv = BN.invoiceVersions(r.parts[1]).find((x) => String(x.version) === (r.q.get('v') || String(BN.invoiceVersions(r.parts[1]).slice(-1)[0].version)));
      const bits = el.dataset.invline.split('.'), line = inv.lines[+bits[0]], key = bits[1];
      if (key === 'desc') line.desc = el.value;
      if (key === 'qty') line.qty = +el.value || 0;
      if (key === 'unit') { const m = parseMoney(el.value); line.unit = isNaN(m) ? line.unit : m; }
      if (key === 'vat') line.vat = +el.value || 0;
      BN.S.focus = { sel: '[data-invline="' + el.dataset.invline + '"]' };
      render(); return;
    }
    if (el.dataset.filter === 'status') {
      const r = parseHash();
      const set = new Set((r.q.get('status') || '').split(',').filter(Boolean));
      if (el.checked) set.add(el.dataset.value); else set.delete(el.dataset.value);
      BN.S.focus = { sel: '[data-filter="status"][data-value="' + el.dataset.value + '"]' };
      setQuery({ status: Array.from(set).join(','), page: null }); return;
    }
    if (el.dataset.filter === 'size') { setQuery({ size: el.value, page: null }); return; }
    if (el.dataset.filter && el.dataset.filter !== 'q') {
      BN.S.focus = { sel: '[data-filter="' + el.dataset.filter + '"]' };
      setQuery({ [el.dataset.filter]: el.value, page: null });
    }
  }
  /* <details> menus stay open until their own summary is clicked; close them
     on any click outside, like a native <select>. Runs in the capture phase so
     it sees the target before an action re-renders the page. */
  function closeMenus(except) {
    document.querySelectorAll('details[data-keep][open]').forEach((d) => {
      if (d === except) return;
      d.open = false; BN.S.openDetails[d.dataset.keep] = false;
    });
  }
  function onOutsideClick(e) {
    const own = e.target.closest && e.target.closest('details[data-keep]');
    closeMenus(own);
  }
  function onKey(e) {
    if (e.key === 'Escape') {
      if (BN.S.modal) { closeModal(); return; }
      const menu = document.querySelector('details[data-keep][open]');
      if (menu) { closeMenus(null); menu.querySelector('summary').focus(); return; }
      if (BN.S.notifOpen) { BN.S.notifOpen = false; render(); return; }
    }
    if (e.key === 'Enter' && e.target.matches('tr.row')) { e.preventDefault(); go(e.target.dataset.href); }
    if (e.key === 'Tab' && BN.S.modal) {
      const nodes = $('#modal-root').querySelectorAll('button, input, textarea, select, a[href]');
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ---------------- boot ---------------- */
  function boot() {
    BN.initState(null);
    const restored = BN.loadState();
    if (restored) BN.scheduler(true);
    if (BN.S.theme) document.documentElement.setAttribute('data-theme', BN.S.theme);
    document.addEventListener('click', onOutsideClick, true);
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    document.addEventListener('toggle', (e) => {
      if (e.target.dataset && e.target.dataset.keep) BN.S.openDetails[e.target.dataset.keep] = e.target.open;
    }, true);
    window.addEventListener('hashchange', () => {
      BN.S.scroll[BN.S.prevHash] = window.scrollY;
      BN.S.navigated = true;
      BN.S.notifOpen = false;
      render();
    });
    if (!location.hash) location.hash = '#/dashboard';
    render();
    if (!BN.S.guideSeen) openModal('welcome', {}, null);
    else if (restored) toast('Picked up where you left off. Reset from the Demo clock menu.');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.BN);

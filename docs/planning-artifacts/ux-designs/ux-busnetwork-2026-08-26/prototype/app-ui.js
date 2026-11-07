/* BusNetwork portal prototype — shared components, Dashboard (S-01), trip lists (S-03..S-05), trip detail (S-06). */
(function (BN) {
  'use strict';
  const { esc, trunc, fmtDT, fmtD, fmtLen, money, num, cname, can, me, myCid, vm, visibleTrips, priceFor,
    STATUS_LABEL, STATUS_ICON, ACTIVE_SET, CLOSED_SET, INV_LABEL, AGREEMENT_LABEL } = BN;

  /* ---------- components ---------- */
  function pill(st, reason) {
    return '<span class="pill st-' + st.toLowerCase() + '"><span aria-hidden="true">' + STATUS_ICON[st] + '</span> ' + STATUS_LABEL[st] + '</span>' +
      (reason ? '<span class="reason" title="' + esc(reason) + '" tabindex="0">' + esc(trunc(reason, 40)) + '</span>' : '');
  }
  function invPill(st) { return '<span class="pill inv-' + st.toLowerCase() + '">' + INV_LABEL[st] + '</span>'; }
  function dlRow(dt, dd) { return '<div><dt>' + dt + '</dt><dd>' + (dd === '' || dd === null || dd === undefined ? '—' : dd) + '</dd></div>'; }
  function th(label, key, sort) {
    if (!key) return '<th scope="col">' + label + '</th>';
    const p = sort.split(':'), on = p[0] === key;
    return '<th scope="col" aria-sort="' + (on ? (p[1] === 'asc' ? 'ascending' : 'descending') : 'none') + '">' +
      '<button class="sort' + (on ? ' on' : '') + '" data-act="sort" data-key="' + key + '">' + label + '<span aria-hidden="true">' + (on ? (p[1] === 'asc' ? ' ▲' : ' ▼') : '') + '</span></button></th>';
  }
  function pager(total, page, size) {
    const pages = Math.max(1, Math.ceil(total / size));
    const from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size);
    return '<div class="pager"><span>' + from + '–' + to + ' of ' + total + '</span>' +
      '<label>Rows per page <select data-filter="size">' + [10, 25, 50, 100].map((n) => '<option' + (n === size ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
      '<div class="pages"><button class="btn btn-secondary btn-sm" data-act="page" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>‹ Prev</button>' +
      '<span>Page ' + page + ' of ' + pages + '</span>' +
      '<button class="btn btn-secondary btn-sm" data-act="page" data-page="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>Next ›</button></div></div>';
  }
  const FILTER_KEYS = ['q', 'from', 'to', 'company', 'direction', 'status', 'closedFrom', 'closedTo', 'invoice', 'invFrom', 'invTo'];
  const FILTER_LABEL = { q: 'Search', from: 'Start from', to: 'Start to', company: 'Company', direction: 'Direction', status: 'Status', closedFrom: 'Closed from', closedTo: 'Closed to', invoice: 'Invoice', invFrom: 'Invoice from', invTo: 'Invoice to' };
  function hasFilters(q) { return FILTER_KEYS.some((k) => q.get(k)); }
  function chips(q) {
    const items = [];
    FILTER_KEYS.forEach((k) => {
      const v = q.get(k); if (!v) return;
      let text = v;
      if (k === 'status') text = v.split(',').map((s) => STATUS_LABEL[s] || INV_LABEL[s] || s).join(', ');
      if (k === 'company') text = cname(v);
      if (k === 'direction') text = v === 'shared' ? 'Shared by us' : 'Received by us';
      if (k === 'invoice') text = 'Completed, not invoiced';
      items.push('<span class="chip">' + FILTER_LABEL[k] + ': ' + esc(text) + '<button data-act="clear-filter" data-key="' + k + '" aria-label="Remove filter ' + FILTER_LABEL[k] + '">×</button></span>');
    });
    if (!items.length) return '';
    return '<div class="chips">' + items.join('') + '<button class="btn-link" data-act="clear-filters">Clear filters</button></div>';
  }
  function emptyState(kind, q) {
    if (hasFilters(q)) {
      const what = kind === 'active' ? 'active trips' : kind === 'closed' ? 'closed trips' : kind === 'all' ? 'trips' : 'invoices';
      return '<div class="empty"><p>No ' + what + ' match these filters.</p><button class="btn btn-secondary" data-act="clear-filters">Clear filters</button></div>';
    }
    if (kind === 'active') return '<div class="empty"><p>No active trips right now.</p>' + (can('createRequest') ? '<a class="btn btn-primary" href="#/request">Create a request</a>' : '') + '</div>';
    if (kind === 'closed') return '<div class="empty"><p>No closed trips yet.</p></div>';
    if (kind === 'all') return '<div class="empty"><p>No trips yet.</p></div>';
    return '<div class="empty"><p>No invoices yet. Invoices are created from Completed trips.</p></div>';
  }
  const ACTION_DEF = {
    accept: ['Accept', 'primary'], reject: ['Reject', 'danger'], edit: ['Edit', 'secondary'], cancel: ['Cancel', 'danger'],
    comment: ['Comment', 'secondary'], complete: ['Mark complete', 'primary'], invoice: ['Create invoice', 'primary'], viewInvoice: ['View invoice', 'secondary'],
  };
  function actionButtons(v) {
    return BN.allowedActions(v).map((a) => '<button class="btn btn-' + ACTION_DEF[a][1] + ' btn-sm" data-act="trip-' + a + '" data-id="' + v.t.id + '">' + ACTION_DEF[a][0] + '<span class="sr-only"> trip ' + v.t.id + '</span></button>').join(' ');
  }
  function companyCell(v) {
    if (!v.cps.length) return '—';
    const first = cname(v.cps[0]);
    return esc(first) + (v.cps.length > 1 ? '<span class="chip-plus" title="' + esc(v.cps.map(cname).join(', ')) + '">+' + (v.cps.length - 1) + '</span>' : '');
  }
  function routeCell(t) {
    const vias = t.vias && t.vias.length ? '<span class="chip-plus" title="' + esc(t.vias.map((x) => x.address).join('\n')) + '">+' + t.vias.length + '</span>' : '';
    return esc(BN.startAddr(t).split(',')[0]) + ' → ' + esc(t.to.address.split(',')[0]) + vias;
  }
  function commentsCell(t) {
    const cid = myCid();
    const items = t.thread.filter((c) => (cid === t.hostId ? true : c.partnerId === cid));
    const unread = items.filter((c) => c.companyId !== cid && c.readBy.indexOf(BN.S.userId) === -1).length;
    if (!items.length) return '<span class="muted">0</span>';
    return (unread ? '<span class="unread-dot" aria-hidden="true"></span><strong>' + items.length + '</strong> <span class="sr-only">(' + unread + ' unread)</span>' : items.length);
  }
  function invoiceCell(v) {
    if (v.status !== 'COMPLETED') return '—';
    const inv = BN.latestInvoiceForTrip(v.t.id);
    if (!inv || (inv.status === 'DRAFT' && inv.issuerId !== myCid())) return '<span class="muted">Not invoiced</span>';
    return '<a href="#/invoices/' + inv.no + '">' + invPill(inv.status) + '</a>';
  }

  /* ---------- trip list query (AR-02: one builder, status set differs) ---------- */
  const LISTS = {
    active: { title: 'Active Trips', set: ACTIVE_SET, defSort: 'start:asc' },
    closed: { title: 'Closed Trips', set: CLOSED_SET, defSort: 'start:desc' },
    all: { title: 'All Trips', set: ACTIVE_SET.concat(CLOSED_SET), defSort: 'start:desc' },
  };
  function queryTrips(kind, q) {
    const cfg = LISTS[kind];
    let rows = visibleTrips().map(vm).filter((v) => cfg.set.indexOf(v.status) !== -1);
    const s = (q.get('q') || '').trim().toLowerCase();
    if (s) {
      rows = rows.filter((v) => [v.t.id, v.t.from.address, v.t.to.address, v.t.groupRef, (v.t.altStart || {}).address]
        .concat(v.cps.map(cname)).some((x) => x && String(x).toLowerCase().indexOf(s) !== -1));
    }
    const from = q.get('from'), to = q.get('to');
    if (from) rows = rows.filter((v) => Date.parse(v.t.plannedStart) >= BN.dayStartUtc(from));
    if (to) rows = rows.filter((v) => Date.parse(v.t.plannedStart) <= BN.dayEndUtc(to));
    const co = q.get('company'); if (co) rows = rows.filter((v) => v.cps.indexOf(co) !== -1);
    const dir = q.get('direction');
    if (dir === 'shared') rows = rows.filter((v) => v.side === 'SHARED');
    if (dir === 'received') rows = rows.filter((v) => v.side === 'RECEIVED');
    const st = (q.get('status') || '').split(',').filter(Boolean);
    if (st.length) rows = rows.filter((v) => st.indexOf(v.status) !== -1);
    const cf = q.get('closedFrom'), ct = q.get('closedTo');
    if (cf) rows = rows.filter((v) => v.closedAt && Date.parse(v.closedAt) >= BN.dayStartUtc(cf));
    if (ct) rows = rows.filter((v) => v.closedAt && Date.parse(v.closedAt) <= BN.dayEndUtc(ct));
    if (q.get('invoice') === 'not_invoiced') rows = rows.filter((v) => v.status === 'COMPLETED' && v.side === 'RECEIVED' && BN.notInvoiced(v.t));
    return sortRows(rows, q.get('sort') || cfg.defSort);
  }
  function sortRows(rows, sort) {
    const p = sort.split(':'), dir = p[1] === 'desc' ? -1 : 1;
    const keys = {
      id: (v) => +v.t.id, start: (v) => Date.parse(v.t.plannedStart),
      length: (v) => Date.parse(v.t.plannedEnd) - Date.parse(v.t.plannedStart),
      pax: (v) => (v.t.pax === null || v.t.pax === undefined ? -1 : v.t.pax),
      price: (v) => { const x = priceFor(v).minor; return x === null || x === undefined ? -1 : x; },
    };
    const k = keys[p[0]] || keys.start;
    return rows.slice().sort((a, b) => (k(a) - k(b)) * dir || (+a.t.id - +b.t.id));
  }
  BN.queryTrips = queryTrips;
  BN.LISTS = LISTS;

  /* ---------- toolbar ---------- */
  function companyOptions(rowsAll, selected) {
    const ids = {};
    rowsAll.forEach((v) => v.cps.forEach((c) => { ids[c] = (v.side === 'SHARED' ? 'Partners' : 'Hosts'); }));
    const groups = { Partners: [], Hosts: [] };
    Object.keys(ids).forEach((id) => groups[ids[id]].push(id));
    const opt = (id) => '<option value="' + id + '"' + (id === selected ? ' selected' : '') + '>' + esc(cname(id)) + '</option>';
    let html = '<option value="">All companies</option>';
    ['Partners', 'Hosts'].forEach((g) => {
      if (groups[g].length) html += '<optgroup label="' + g + '">' + groups[g].sort((a, b) => cname(a).localeCompare(cname(b))).map(opt).join('') + '</optgroup>';
    });
    return html;
  }
  function statusDropdown(kind, q) {
    const sel = (q.get('status') || '').split(',').filter(Boolean);
    const box = (s) => '<label class="check"><input type="checkbox" data-filter="status" data-value="' + s + '"' + (sel.indexOf(s) !== -1 ? ' checked' : '') + '> ' + STATUS_LABEL[s] + '</label>';
    let panel = '';
    if (kind === 'all') {
      panel = '<div class="grp"><label class="check"><input type="checkbox" data-act="status-group" data-group="active"' + (ACTIVE_SET.every((s) => sel.indexOf(s) !== -1) ? ' checked' : '') + '> Active</label></div>' +
        '<div class="ind">' + ACTIVE_SET.map(box).join('') + '</div>' +
        '<div class="grp"><label class="check"><input type="checkbox" data-act="status-group" data-group="closed"' + (CLOSED_SET.every((s) => sel.indexOf(s) !== -1) ? ' checked' : '') + '> Closed</label></div>' +
        '<div class="ind">' + CLOSED_SET.map(box).join('') + '</div>';
    } else {
      panel = LISTS[kind].set.map(box).join('');
    }
    const open = BN.S.openDetails.status ? ' open' : '';
    return '<details class="dropdown" data-keep="status"' + open + '><summary>Status' + (sel.length ? ' (' + sel.length + ')' : '') + ' ▾</summary><div class="panel">' + panel + '</div></details>';
  }
  /* Shared toolbar parts: a labelled from–to date range and an Export menu. */
  function dateRange(label, fromKey, toKey, q) {
    return '<fieldset class="tf range"><legend>' + label + '</legend><div class="range-box">' +
      '<input type="date" data-filter="' + fromKey + '" value="' + esc(q.get(fromKey) || '') + '" aria-label="' + label + ' from">' +
      '<span class="range-sep" aria-hidden="true">–</span>' +
      '<input type="date" data-filter="' + toKey + '" value="' + esc(q.get(toKey) || '') + '" aria-label="' + label + ' to"></div></fieldset>';
  }
  function exportMenu(kind) {
    if (!can('exportLists')) return '';
    const open = BN.S.openDetails.export ? ' open' : '';
    return '<details class="dropdown dropdown-end tb-export" data-keep="export"' + open + '><summary>Export ▾</summary><div class="panel menu-list">' +
      '<button data-act="export" data-kind="' + kind + '" data-fmt="csv">CSV <small>.csv</small></button>' +
      '<button data-act="export" data-kind="' + kind + '" data-fmt="xlsx">Excel <small>.xlsx</small></button></div></details>';
  }
  function toolbar(kind, q, rowsAll) {
    const dir = q.get('direction') || '';
    const dirSelect = '<select data-filter="direction">' +
      [['', 'All directions'], ['shared', 'Shared by us'], ['received', 'Received by us']]
        .map((o) => '<option value="' + o[0] + '"' + (dir === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>';
    return '<div class="toolbar">' +
      '<div class="tb-row">' +
      '<label class="tf tf-grow"><span>Search</span><input type="search" data-filter="q" value="' + esc(q.get('q') || '') + '" placeholder="Trip ID, address, company, group ref."></label>' +
      '<label class="tf"><span>Company</span><select data-filter="company">' + companyOptions(rowsAll, q.get('company') || '') + '</select></label>' +
      '<label class="tf"><span>Direction</span>' + dirSelect + '</label>' +
      '<div class="tf"><span>Status</span>' + statusDropdown(kind, q) + '</div>' +
      exportMenu(kind) + '</div>' +
      '<div class="tb-row tb-row-2">' +
      dateRange('Trip start', 'from', 'to', q) +
      (kind !== 'active' ? dateRange('Closed', 'closedFrom', 'closedTo', q) : '') +
      (kind === 'closed' ? '<button class="chip quick' + (q.get('invoice') === 'not_invoiced' ? ' on' : '') + '" data-act="toggle-not-invoiced">Completed, not invoiced</button>' : '') +
      '</div></div>' + chips(q);
  }

  /* ---------- S-03/S-04/S-05 trip list ---------- */
  BN.pageTripList = function (kind, r) {
    const q = r.q, cfg = LISTS[kind];
    const rowsAll = visibleTrips().map(vm);
    const rows = queryTrips(kind, q);
    const size = +(q.get('size') || 25), page = Math.max(1, +(q.get('page') || 1));
    const start = (page - 1) * size;
    const slice = rows.slice(start, start + size);
    const sort = q.get('sort') || cfg.defSort;
    const showClosed = kind !== 'active';
    let countLine = '';
    if (kind === 'all') {
      const a = queryTrips('active', q).length, c = queryTrips('closed', q).length;
      countLine = '<div class="count-line">' + rows.length + ' trips — Active ' + a + ' + Closed ' + c + ' = ' + (a + c) + '</div>';
    }
    const head = '<tr>' + th('Trip ID', 'id', sort) + th('Trip start', 'start', sort) + th('Length', 'length', sort) +
      th('From – To') + th('PAX', 'pax', sort) + th('Shift') + th('Company') + th('Type') + th('Price', 'price', sort) + th('Status') + th('Comments') +
      (showClosed ? th('Closed date') + th('Invoice') : '') + th('Actions') + '</tr>';
    const body = slice.map((v) => {
      const t = v.t, price = priceFor(v);
      const soon = v.status === 'REQUESTED' && Date.parse(t.plannedStart) - BN.S.now < BN.DAY && Date.parse(t.plannedStart) > BN.S.now;
      return '<tr class="row" tabindex="0" data-act="open" data-href="#/trips/' + t.id + '">' +
        '<td class="id">' + t.id + '</td>' +
        '<td class="nowrap">' + fmtDT(t.plannedStart) + '</td>' +
        '<td class="nowrap">' + fmtLen(t.plannedStart, t.plannedEnd) + '</td>' +
        '<td>' + routeCell(t) + '</td>' +
        '<td class="num">' + (t.pax === null || t.pax === undefined ? '—' : t.pax) + '</td>' +
        '<td>' + (t.type === 'FIXED' && t.shifts.length ? esc(t.shifts[0].name) : 'N/A') + '</td>' +
        '<td>' + companyCell(v) + '</td>' +
        '<td>' + t.type + '</td>' +
        '<td class="num"' + (price.title ? ' title="' + esc(price.title) + '"' : '') + '>' + price.text + '</td>' +
        '<td>' + pill(v.status, v.reason) + (soon ? '<span class="flag24">⏱ Starts &lt; 24 h</span>' : '') + '</td>' +
        '<td class="num">' + commentsCell(t) + '</td>' +
        (showClosed ? '<td class="nowrap">' + (v.closedAt ? fmtDT(v.closedAt) : '—') + '</td><td>' + invoiceCell(v) + '</td>' : '') +
        '<td><div class="row-actions">' + actionButtons(v) + '</div></td></tr>';
    }).join('');
    return '<div class="page-head"><h1 class="page-title">' + cfg.title + '<span class="count">' + rows.length + ' trips</span></h1></div>' +
      '<div class="card" style="padding:0">' + toolbar(kind, q, rowsAll) + countLine +
      (rows.length ? '<div class="tbl-wrap"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' + pager(rows.length, page, size) : emptyState(kind, q)) +
      '</div>';
  };

  /* ---------- S-01 dashboard ---------- */
  function periodRange(q) {
    const p = q.get('period') || 'month', today = BN.todayYmd();
    if (p === 'week') { const from = BN.addDaysYmd(today, -(BN.isoDow(today) - 1)); return { p: p, from: from, to: BN.addDaysYmd(from, 6), label: 'Closed this week' }; }
    if (p === '30d') return { p: p, from: BN.addDaysYmd(today, -29), to: today, label: 'Closed last 30 days' };
    if (p === 'custom') return { p: p, from: q.get('from') || today.slice(0, 8) + '01', to: q.get('to') || today, label: 'Closed in period' };
    return { p: 'month', from: today.slice(0, 8) + '01', to: today, label: 'Closed this month' };
  }
  function kpi(href, label, value, desc, cls) {
    return '<a class="kpi" href="' + href + '"><span class="label">' + label + '</span><span class="v ' + (cls || '') + '">' + value + '</span><span class="d">' + desc + '</span></a>';
  }
  function needsAction(vms) {
    const cid = myCid(), u = me(), groups = [];
    if (can('respond')) {
      const items = vms.filter((v) => v.side === 'RECEIVED' && v.status === 'REQUESTED');
      groups.push({ title: 'Incoming requests', href: '#/trips/active?status=REQUESTED&direction=received', items: items.map((v) => ({ href: '#/trips/' + v.t.id, text: 'Trip ' + v.t.id + ' · ' + BN.routeText(v.t).split(' → ').map((x) => x.split(',')[0]).join(' → '), sub: 'Respond by ' + fmtDT(v.t.deadline || v.t.plannedStart) })) });
    }
    const cancels = vms.filter((v) => v.status === 'CANCELLED' && v.t.cancelledBy && v.t.cancelledBy !== cid && v.closedAt && BN.S.now - Date.parse(v.closedAt) < 7 * BN.DAY && !BN.S.seen[cid + ':' + v.t.id]);
    if (cancels.length) groups.push({ title: 'Cancellations', href: '#/trips/closed?status=CANCELLED', items: cancels.map((v) => ({ href: '#/trips/' + v.t.id, text: 'Trip ' + v.t.id + ' cancelled by ' + cname(v.t.cancelledBy), sub: esc(v.reason || '') })) });
    if (can('invoiceDecide')) {
      const inv = BN.latestInvoices().filter((i) => i.recipientId === cid && i.status === 'PENDING');
      groups.push({ title: 'Invoices to approve', href: '#/invoices/incoming?status=PENDING', items: inv.map((i) => ({ href: '#/invoices/' + i.no, text: i.no + ' · ' + cname(i.issuerId), sub: money(BN.invTotals(i).total, i.currency) + ' · trip ' + i.tripId })) });
    }
    if (can('comment')) {
      const unread = [];
      vms.forEach((v) => {
        const items = v.t.thread.filter((c) => (cid === v.t.hostId ? true : c.partnerId === cid)).filter((c) => c.companyId !== cid && c.readBy.indexOf(u.id) === -1);
        if (items.length) unread.push({ href: '#/trips/' + v.t.id, text: 'Trip ' + v.t.id + ' · ' + items.length + ' unread comment' + (items.length > 1 ? 's' : ''), sub: esc(trunc(items[items.length - 1].body, 60)) });
      });
      groups.push({ title: 'Unread comments', href: '#/trips/all', items: unread });
    }
    return groups.filter((g) => g.items.length);
  }
  function volumeChart(vms) {
    const today = BN.todayYmd(), weeks = [];
    const monday = BN.addDaysYmd(today, -(BN.isoDow(today) - 1));
    for (let i = 11; i >= 0; i--) {
      const ws = BN.addDaysYmd(monday, -7 * i);
      weeks.push({ label: 'W' + BN.isoWeek(ws), from: BN.dayStartUtc(ws), to: BN.dayStartUtc(BN.addDaysYmd(ws, 7)), shared: 0, received: 0 });
    }
    vms.forEach((v) => {
      const at = Date.parse(v.t.submittedAt);
      const w = weeks.find((x) => at >= x.from && at < x.to);
      if (w) { if (v.side === 'SHARED') w.shared++; else w.received++; }
    });
    const max = Math.max(1, ...weeks.map((w) => Math.max(w.shared, w.received)));
    const W = 720, H = 200, BASE = 162, TOP = 140, bw = W / weeks.length;
    const bars = weeks.map((w, i) => {
      const x = i * bw, h1 = (w.shared / max) * TOP, h2 = (w.received / max) * TOP;
      return '<rect x="' + (x + bw * 0.14).toFixed(1) + '" y="' + (BASE - h1).toFixed(1) + '" width="' + (bw * 0.33).toFixed(1) + '" height="' + h1.toFixed(1) + '" rx="2" fill="var(--accent)"></rect>' +
        '<rect x="' + (x + bw * 0.53).toFixed(1) + '" y="' + (BASE - h2).toFixed(1) + '" width="' + (bw * 0.33).toFixed(1) + '" height="' + h2.toFixed(1) + '" rx="2" fill="var(--blue)"></rect>' +
        '<text x="' + (x + bw / 2).toFixed(1) + '" y="182" font-size="12" text-anchor="middle" fill="var(--ink-3)">' + w.label + '</text>';
    }).join('');
    const grid = [0, 0.5, 1].map((f) => '<line x1="0" x2="' + W + '" y1="' + (BASE - f * TOP) + '" y2="' + (BASE - f * TOP) + '" stroke="var(--rule-soft)" stroke-width="1"></line>' +
      '<text x="0" y="' + (BASE - f * TOP - 4) + '" font-size="11" fill="var(--ink-3)">' + Math.round(f * max) + '</text>').join('');
    return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Trips shared and received per week, last 12 weeks">' + grid + bars + '</svg>' +
      '<div class="legend"><span><i style="background:var(--accent)"></i>Shared by us</span><span><i style="background:var(--blue)"></i>Received by us</span></div>' +
      '<table class="sr-only"><caption>Trips per week</caption><thead><tr><th>Week</th><th>Shared</th><th>Received</th></tr></thead><tbody>' +
      weeks.map((w) => '<tr><td>' + w.label + '</td><td>' + w.shared + '</td><td>' + w.received + '</td></tr>').join('') + '</tbody></table></div>';
  }
  BN.pageDashboard = function (r) {
    const q = r.q, cid = myCid(), per = periodRange(q);
    const vms = visibleTrips().map(vm);
    const awaiting = vms.filter((v) => v.side === 'RECEIVED' && v.status === 'REQUESTED');
    const active = vms.filter((v) => v.status === 'ACCEPTED' || v.status === 'IN_PROGRESS');
    const today = BN.todayYmd(), end7 = BN.dayEndUtc(BN.addDaysYmd(today, 6));
    const next7 = active.filter((v) => { const s = Date.parse(v.t.plannedStart); return s >= BN.dayStartUtc(today) && s <= end7; });
    const closedP = vms.filter((v) => v.status === 'COMPLETED' && v.closedAt && Date.parse(v.closedAt) >= BN.dayStartUtc(per.from) && Date.parse(v.closedAt) <= BN.dayEndUtc(per.to));
    const inv = BN.latestInvoices();
    const inPend = inv.filter((i) => i.recipientId === cid && i.status === 'PENDING');
    const outPend = inv.filter((i) => i.issuerId === cid && i.status === 'PENDING');
    const sum = (list) => list.reduce((a, i) => a + BN.invTotals(i).total, 0);
    const upcoming = active.slice().sort((a, b) => Date.parse(a.t.plannedStart) - Date.parse(b.t.plannedStart)).slice(0, 10);
    const groups = needsAction(vms);
    const periods = [['week', 'This week'], ['month', 'This month'], ['30d', 'Last 30 days']];
    const canInv = can('invoiceDecide') || can('invoiceIssue');

    const tiles = kpi('#/trips/active?status=REQUESTED&direction=received', 'Awaiting response', awaiting.length, 'Requests waiting on us') +
      kpi('#/trips/active?status=ACCEPTED,IN_PROGRESS', 'Active trips', active.length, 'Accepted + in progress') +
      kpi('#/trips/active?status=ACCEPTED,IN_PROGRESS&from=' + today + '&to=' + BN.addDaysYmd(today, 6), 'Starting next 7 days', next7.length, 'Trip count') +
      kpi('#/trips/closed?status=COMPLETED&closedFrom=' + per.from + '&closedTo=' + per.to, per.label, closedP.length, 'Completed trips') +
      (canInv ? kpi('#/invoices/incoming?status=PENDING', 'Open invoices', num(sum(inPend)), inPend.length + ' to approve · ' + num(sum(outPend)) + ' awaiting partner', 'money') : '');

    const actionHtml = me().role === 'VIEWER'
      ? '<h2 class="section">Recent activity</h2><ul class="resp">' + vms.slice().sort((a, b) => Date.parse(b.t.statusChangedAt || b.t.submittedAt) - Date.parse(a.t.statusChangedAt || a.t.submittedAt)).slice(0, 8)
        .map((v) => '<li><a href="#/trips/' + v.t.id + '">Trip ' + v.t.id + '</a> · ' + pill(v.status) + '<small class="muted">' + fmtDT(v.t.statusChangedAt || v.t.submittedAt) + '</small></li>').join('') + '</ul>'
      : '<h2 class="section">Needs your action</h2>' + (groups.length ? groups.map((g) => '<div class="action-group"><h3><a href="' + g.href + '">' + g.title + '</a><span class="badge">' + g.items.length + '</span></h3><ul>' +
        g.items.slice(0, 6).map((i) => '<li><a href="' + i.href + '">' + esc(i.text) + '<small>' + i.sub + '</small></a></li>').join('') + '</ul></div>').join('') : '<p class="muted">Nothing waiting on you.</p>');

    const topPartners = (function () {
      const counts = {};
      closedP.forEach((v) => v.cps.forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));
      const list = Object.keys(counts).map((k) => ({ id: k, n: counts[k] })).sort((a, b) => b.n - a.n).slice(0, 5);
      if (!list.length) return '<p class="muted">No completed trips in this period.</p>';
      const max = list[0].n;
      return '<ul class="bars" style="list-style:none;padding:0;margin:0">' + list.map((x) => '<li><span>' + esc(cname(x.id)) + '</span><span class="num">' + x.n + '</span><span class="bar"><span style="width:' + (x.n / max * 100) + '%"></span></span></li>').join('') + '</ul>';
    })();

    return '<div class="page-head"><h1 class="page-title">Dashboard</h1>' +
      '<div class="dash-head"><div class="seg">' + periods.map((p) => '<button class="' + (per.p === p[0] ? 'on' : '') + '" data-act="set-filter" data-key="period" data-value="' + p[0] + '">' + p[1] + '</button>').join('') + '</div>' +
      '<span class="muted small">Updated ' + fmtDT(BN.S.dashUpdated).slice(11) + '</span><button class="btn btn-secondary btn-sm" data-act="refresh">Refresh</button></div></div>' +
      '<div class="kpis">' + tiles + '</div>' +
      '<div class="grid-2"><section class="card"><h2 class="section">Upcoming trips</h2>' +
      (upcoming.length ? '<div class="tbl-wrap"><table><thead><tr><th>Trip ID</th><th>Start</th><th>Route</th><th>PAX</th><th>Company</th><th>Status</th></tr></thead><tbody>' +
        upcoming.map((v) => '<tr class="row" tabindex="0" data-act="open" data-href="#/trips/' + v.t.id + '"><td class="id">' + v.t.id + '</td><td class="nowrap">' + fmtDT(v.t.plannedStart) + '</td><td>' + routeCell(v.t) + '</td><td class="num">' + (v.t.pax || '—') + '</td><td>' + companyCell(v) + '</td><td>' + pill(v.status) + '</td></tr>').join('') +
        '</tbody></table></div>' : '<p class="muted">No upcoming trips.</p>') + '</section>' +
      '<section class="card">' + actionHtml + '</section></div>' +
      '<div class="grid-2" style="margin-top:16px"><section class="card"><h2 class="section">Trip volume · last 12 weeks</h2>' + volumeChart(vms) + '</section>' +
      '<section class="card"><h2 class="section">Top partners</h2>' + topPartners + '</section></div>';
  };

  /* ---------- S-06 trip detail ---------- */
  function threadHtml(t, v) {
    const cid = myCid(), host = v.side === 'SHARED';
    const pid = host ? (BN.S.threadSel[t.id] || t.acceptedPartnerId || (t.requests[0] || {}).partnerId) : cid;
    const items = t.thread.filter((c) => c.partnerId === pid);
    const sel = host && t.requests.length > 1
      ? '<label class="thread-sel">Thread with <select data-change="thread" data-id="' + t.id + '">' + t.requests.map((x) => '<option value="' + x.partnerId + '"' + (x.partnerId === pid ? ' selected' : '') + '>' + esc(cname(x.partnerId)) + ' (' + t.thread.filter((c) => c.partnerId === x.partnerId).length + ')</option>').join('') + '</select></label>' : '';
    const list = items.length ? items.map((c) => '<li class="comment' + (c.companyId === cid ? ' own' : '') + (c.companyId !== cid && c.readBy.indexOf(BN.S.userId) === -1 ? ' unread' : '') + '">' +
      '<div class="c-meta"><strong>' + esc(c.authorName) + '</strong><span>' + esc(cname(c.companyId)) + '</span><time>' + fmtDT(c.at) + '</time></div><p>' + esc(c.body) + '</p></li>').join('')
      : '<li class="muted">No comments yet.</li>';
    const composer = can('comment') ? '<div class="composer"><label class="sr-only" for="c-body">Write a comment</label>' +
      '<textarea id="c-body" rows="3" maxlength="2000" placeholder="Write a comment to ' + esc(cname(host ? pid : t.hostId)) + '"></textarea>' +
      '<button class="btn btn-primary btn-sm" data-act="post-comment" data-id="' + t.id + '" data-pid="' + pid + '">Post comment</button></div>' : '';
    return '<section class="card" id="comments"><h2 class="section">Comments</h2>' + sel + '<ul class="thread" role="list">' + list + '</ul>' + composer + '</section>';
  }
  function historyHtml(t, v) {
    const cid = myCid(), host = v.side === 'SHARED';
    const f = BN.S.histFilter[t.id] || 'all';
    const items = t.history
      .filter((h) => host || h.visibleTo === 'BOTH' || h.visibleTo === cid)
      .filter((h) => f === 'all' || h.kind === f);
    const chipsHtml = [['all', 'All'], ['status', 'Status'], ['price', 'Price'], ['edit', 'Edits']]
      .map((x) => '<button class="chip quick' + (f === x[0] ? ' on' : '') + '" data-act="hist-filter" data-id="' + t.id + '" data-value="' + x[0] + '">' + x[1] + '</button>').join('');
    return '<section class="card"><h2 class="section">History</h2><div class="filters-inline">' + chipsHtml + '</div>' +
      (items.length ? '<ul class="timeline">' + items.map((h) => '<li><time>' + fmtDT(h.at) + '</time><div><span class="who">' + esc(h.actor) + (h.companyId ? ' · ' + esc(cname(h.companyId)) : '') + '</span><br><span class="what">' + esc(h.action) + (h.detail ? ': ' + esc(h.detail) : '') + '</span></div></li>').join('') + '</ul>' : '<p class="muted">Nothing recorded yet.</p>') + '</section>';
  }
  BN.pageTrip = function (id) {
    const t = BN.tripById(id), cid = myCid();
    if (!t || !BN.sideOf(t, cid)) {
      return '<div class="page-head"><h1 class="page-title">Trip not found</h1></div><div class="card empty"><p>Trip ' + esc(id) + ' doesn’t exist, or it isn’t shared with your company or departments.</p><a class="btn btn-secondary" href="#/trips/active">Go to Active Trips</a></div>';
    }
    const v = vm(t), host = v.side === 'SHARED', r = host ? null : BN.reqOf(t, cid), cust = BN.customerOf(t);
    const kind = ACTIVE_SET.indexOf(v.status) !== -1 ? 'active' : 'closed';
    const back = BN.S.lastList[BN.S.lastListKind] || ('#/trips/' + kind);
    const banners = [];
    if (t.flag) banners.push('<div class="banner warn" role="status"><div><strong>Differs from the TEQ trip.</strong> ' + esc(t.flag.field) + ': ' + fmtDT(t.flag.network) + ' here vs ' + fmtDT(t.flag.teq) + ' in TEQ (checked ' + fmtDT(t.flag.checkedAt) + '). Nothing has been changed automatically.</div></div>');
    if (CLOSED_SET.indexOf(v.status) !== -1) banners.push('<div class="banner"><div>Closed trips can’t be changed.' + (can('comment') ? ' You can still read the details and comment.' : '') + '</div></div>');
    if (t.priceProposal) {
      if (host) banners.push('<div class="banner"><div>Price change proposed: ' + money(t.priceProposal.amount, t.currency) + ' — waiting for ' + esc(cname(t.acceptedPartnerId)) + ' to confirm.</div></div>');
      else if (r && r.state === 'ACCEPTED') banners.push('<div class="banner warn"><div>' + esc(cname(t.hostId)) + ' proposes changing the offer price from ' + money(r.offer, t.currency) + ' to ' + money(t.priceProposal.amount, t.currency) + '. “' + esc(t.priceProposal.comment) + '”</div>' +
        (can('confirmPrice') ? '<span class="banner-actions"><button class="btn btn-primary btn-sm" data-act="price-confirm" data-id="' + t.id + '">Confirm</button> <button class="btn btn-secondary btn-sm" data-act="price-decline" data-id="' + t.id + '">Decline</button></span>' : '') + '</div>');
    }
    const stops = [{ a: BN.startAddr(t), l: t.altStart ? 'Alternative start (original: ' + t.from.address + ')' : 'From' }]
      .concat((t.vias || []).map((x) => ({ a: x.address, l: 'Via' })))
      .concat([{ a: t.to.address, l: 'To' }]);
    // Real directions in Google Maps for the stops in travel order (no API key needed; opens in a new tab).
    const mapsUrl = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=' + encodeURIComponent(stops[0].a) +
      '&destination=' + encodeURIComponent(stops[stops.length - 1].a) +
      (stops.length > 2 ? '&waypoints=' + encodeURIComponent(stops.slice(1, -1).map((s) => s.a).join('|')) : '');
    const viaCount = stops.length - 2;
    const pricing = host
      ? '<dl class="dl">' + dlRow('Customer price', money(t.customerPrice, t.currency)) + '</dl><div class="tbl-wrap"><table><thead><tr><th>Partner</th><th>Agreement</th><th>Calculated</th><th>Offer price</th><th>Additional costs</th><th>Response</th></tr></thead><tbody>' +
        t.requests.map((x) => '<tr><td>' + esc(cname(x.partnerId)) + '</td><td>' + AGREEMENT_LABEL[x.agreement.type] + (x.agreement.type === 'PERCENTAGE' ? ' ' + x.agreement.rate + '%' : '') + '</td><td class="num">' + money(x.calc, t.currency) + '</td><td class="num">' + money(x.offer, t.currency) +
          (x.overridden ? '<span class="override">Overridden by ' + esc(x.overriddenBy || '—') + '</span>' : '') + '</td><td class="num">' + (x.costs && x.costs.length ? x.costs.map((c) => esc(c.desc) + ' ' + money(c.amount, t.currency)).join('<br>') : '—') + '</td><td>' + x.state.charAt(0) + x.state.slice(1).toLowerCase() + (x.reason ? '<span class="override">' + esc(x.reason) + '</span>' : '') + '</td></tr>').join('') +
        '</tbody></table></div>'
      : '<dl class="dl">' + dlRow('Offer price', money(r.offer, t.currency)) + dlRow('Agreement', AGREEMENT_LABEL[r.agreement.type] + (r.agreement.type === 'PERCENTAGE' ? ' ' + r.agreement.rate + '%' : '')) +
        dlRow('Additional costs', r.costs && r.costs.length ? r.costs.map((c) => esc(c.desc) + ' ' + money(c.amount, t.currency)).join('<br>') : '—') + '</dl>';
    const customerBlock = host
      ? '<dl class="dl">' + dlRow('Customer', esc(cust.name)) + dlRow('Contact person', esc(cust.contact)) + dlRow('Phone', esc(cust.phone)) + dlRow('Flight no.', esc(t.flightNo)) + dlRow('Group ref.', esc(t.groupRef)) + dlRow('Sign', esc(t.sign)) + '</dl>'
      : '<dl class="dl">' + dlRow('Contact person', esc(cust.contact)) + dlRow('Phone', esc(cust.phone)) + dlRow('Flight no.', esc(t.flightNo)) + dlRow('Group ref.', esc(t.groupRef)) + dlRow('Sign', esc(t.sign)) + '</dl><p class="muted small">The host’s customer name, customer price and billing details stay with the host.</p>';
    const commentFields = '<dl class="dl">' + dlRow('To partner', esc(t.comments.partner)) + dlRow('To driver', esc(t.comments.driver)) +
      (host ? dlRow('HQ (internal)', esc(t.comments.hq)) + dlRow('Invoice comment', esc(t.comments.invoiceComment)) : '') + dlRow('Invoice reference', esc(t.comments.invoiceRef)) + '</dl>';
    const nextChange = v.status === 'REQUESTED' ? 'Closes as Rejected (Expired) at ' + fmtDT(t.deadline || t.plannedStart)
      : v.status === 'ACCEPTED' ? 'Moves to In progress at ' + fmtDT(t.plannedStart)
        : v.status === 'IN_PROGRESS' ? 'Moves to Completed at ' + fmtDT(t.plannedEnd) : '';
    const inv = BN.latestInvoiceForTrip(t.id);
    const sideInvoice = v.status === 'COMPLETED'
      ? '<section class="card"><h2 class="section">Invoice</h2>' + (inv && !(inv.status === 'DRAFT' && inv.issuerId !== cid)
        ? '<p>' + invPill(inv.status) + ' <a href="#/invoices/' + inv.no + '">' + inv.no + ' v' + inv.version + '</a><br><span class="num">' + money(BN.invTotals(inv).total, inv.currency) + '</span></p>'
        : '<p class="muted">Not invoiced.</p>' + (v.side === 'RECEIVED' && can('invoiceIssue') ? '<button class="btn btn-primary btn-sm" data-act="trip-invoice" data-id="' + t.id + '">Create invoice</button>' : '')) + '</section>'
      : '';
    const altStartCtl = (!host && r && r.state === 'ACCEPTED' && v.status === 'ACCEPTED' && can('altStart'))
      ? '<button class="btn btn-secondary btn-sm" data-act="alt-start" data-id="' + t.id + '">Set alternative start address</button>' : '';
    const pricePropose = (host && v.status === 'ACCEPTED' && can('proposePrice') && !t.priceProposal)
      ? '<button class="btn btn-secondary btn-sm" data-act="price-propose" data-id="' + t.id + '">Propose price change</button>' : '';

    return '<a class="back" href="' + back + '">← Back to ' + (BN.LISTS[BN.S.lastListKind] ? BN.LISTS[BN.S.lastListKind].title : 'list') + '</a>' +
      '<div class="page-head"><div><div class="dh-row"><h1 class="page-title">Trip <span class="mono">' + t.id + '</span></h1>' + pill(v.status, v.reason) + '<span class="tag">' + t.type + '</span></div>' +
      '<p class="muted">' + (host ? 'Host: ' + esc(cname(t.hostId)) + ' → Partner: ' + esc(t.requests.map((x) => cname(x.partnerId)).join(', ')) : 'Host: ' + esc(cname(t.hostId)) + ' → Partner: ' + esc(cname(cid))) + '</p></div>' +
      '<div class="row-actions">' + actionButtons(v) + ' ' + pricePropose + ' ' + altStartCtl + '</div></div>' +
      banners.join('') +
      '<div class="detail-grid"><div class="stack">' +
      '<section class="card"><div class="card-head"><h2 class="section">Route</h2>' +
      '<a class="btn btn-secondary btn-sm map-link" href="' + esc(mapsUrl) + '" target="_blank" rel="noopener noreferrer">Open in Google Maps<span class="ext" aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a></div>' +
      '<div class="route-preview"><ul class="stops">' +
      stops.map((s, i) => '<li' + (i === stops.length - 1 ? ' class="end"' : '') + '>' + esc(s.a) + '<small>' + s.l + '</small></li>').join('') + '</ul></div>' +
      '<dl class="dl" style="margin-top:10px">' + dlRow('Trip length', fmtLen(t.plannedStart, t.plannedEnd)) + dlRow('Stops', stops.length + ' (' + (viaCount ? viaCount + ' via stop' + (viaCount === 1 ? '' : 's') : 'direct') + ')') + '</dl></section>' +
      '<section class="card"><h2 class="section">Schedule</h2><dl class="dl">' + dlRow('Planned start', fmtDT(t.plannedStart)) + dlRow('Planned end', fmtDT(t.plannedEnd)) +
      dlRow('Return', t.returnAt ? fmtDT(t.returnAt) : '—') + dlRow('Response deadline', fmtDT(t.deadline)) + '</dl></section>' +
      '<section class="card"><h2 class="section">Passengers &amp; vehicle</h2><dl class="dl">' + dlRow('PAX', t.pax === null || t.pax === undefined ? 'Not used on this fixed trip' : t.pax) +
      dlRow('Vehicle type', esc(BN.vehicleName(t.vehicle.type))) + dlRow('Euro class', esc(t.vehicle.euro)) + dlRow('Fuel', esc(t.vehicle.fuel)) + dlRow('Luggage', esc(t.vehicle.luggage)) + dlRow('Other', esc(t.vehicle.other)) + '</dl></section>' +
      (t.type === 'FIXED' && t.shifts.length ? '<section class="card"><h2 class="section">Shifts</h2>' + t.shifts.map((s) => '<div class="shift"><strong>' + esc(s.name) + '</strong><ul>' +
        s.subTrips.map((x) => '<li>' + esc(x.from.split(',')[0]) + ' → ' + esc(x.to.split(',')[0]) + ' · ' + fmtDT(x.start) + ' – ' + fmtDT(x.end).slice(11) + '</li>').join('') + '</ul></div>').join('') + '</section>' : '') +
      '<section class="card"><h2 class="section">Pricing</h2>' + pricing + '</section>' +
      '<section class="card"><h2 class="section">Customer &amp; references</h2>' + customerBlock + '</section>' +
      '<section class="card"><h2 class="section">Comment fields</h2>' + commentFields + '</section>' +
      '<section class="card"><h2 class="section">Attachments</h2>' + (t.attachments.length ? '<ul class="attach-list">' + t.attachments.map((a) => '<li><span>' + esc(a.name) + '</span><span class="muted small">' + Math.round(a.size / 1024) + ' kB · ' + esc(a.by) + ' · ' + fmtD(a.at) + '</span></li>').join('') + '</ul>' : '<p class="muted">No attachments.</p>') + '</section>' +
      historyHtml(t, v) +
      '</div><aside class="stack">' +
      '<section class="card"><h2 class="section">Status</h2><p>' + pill(v.status, v.reason) + '</p><p class="muted small">Since ' + fmtDT(t.statusChangedAt || t.submittedAt) + (nextChange ? '<br>' + nextChange : '') + '</p></section>' +
      (host ? '<section class="card"><h2 class="section">Partner responses</h2><ul class="resp">' + t.requests.map((x) => '<li><strong>' + esc(cname(x.partnerId)) + '</strong><span class="muted small">' + x.state.charAt(0) + x.state.slice(1).toLowerCase() +
        (x.respondedAt ? ' · ' + esc(x.respondedBy || '') + ' · ' + fmtDT(x.respondedAt) : '') + '</span>' + (x.reason || x.withdrawReason ? '<span class="muted small">' + esc(x.reason || x.withdrawReason) + '</span>' : '') + '</li>').join('') + '</ul></section>' : '') +
      sideInvoice + threadHtml(t, v) + '</aside></div>';
  };

  /* ---------- loading and error states (SCREENS S-13) ---------- */
  const sk = (w, h) => '<span class="sk" style="width:' + w + ';height:' + (h || 14) + 'px"></span>';
  function skRows(n, cells) {
    let out = '';
    for (let i = 0; i < n; i++) {
      out += '<tr>';
      for (let c = 0; c < cells; c++) out += '<td>' + sk((40 + ((i * 7 + c * 13) % 50)) + '%') + '</td>';
      out += '</tr>';
    }
    return out;
  }
  BN.skeletonFor = function (kind, title) {
    const head = '<div class="page-head"><h1 class="page-title">' + esc(title) + '</h1></div>';
    if (kind === 'dashboard') {
      return head + '<div class="kpis">' + [0, 1, 2, 3, 4].map(() => '<div class="kpi">' + sk('60%', 10) + sk('45%', 30) + sk('80%', 10) + '</div>').join('') + '</div>' +
        '<div class="grid-2"><section class="card">' + sk('30%', 18) + '<div class="tbl-wrap"><table><tbody>' + skRows(6, 5) + '</tbody></table></div></section>' +
        '<section class="card">' + sk('40%', 18) + [0, 1, 2, 3].map(() => '<p>' + sk('90%') + '</p>').join('') + '</section></div>' +
        '<p class="sr-only" role="status">Loading dashboard</p>';
    }
    if (kind === 'detail') {
      return head + '<div class="detail-grid"><div class="stack">' +
        [0, 1, 2].map(() => '<section class="card">' + sk('30%', 18) + '<p>' + sk('95%') + '</p><p>' + sk('70%') + '</p></section>').join('') +
        '</div><aside class="stack"><section class="card">' + sk('40%', 18) + '<p>' + sk('60%') + '</p></section>' +
        '<section class="card">' + sk('50%', 18) + '<p>' + sk('85%') + '</p></section></aside></div>' +
        '<p class="sr-only" role="status">Loading trip</p>';
    }
    return head + '<div class="card" style="padding:0"><div class="toolbar">' +
      [0, 1, 2, 3].map(() => '<div class="tf">' + sk('70px', 10) + sk('150px', 32) + '</div>').join('') + '</div>' +
      '<div class="tbl-wrap"><table><tbody>' + skRows(8, 8) + '</tbody></table></div></div>' +
      '<p class="sr-only" role="status">Loading list</p>';
  };
  BN.errorFor = function (title) {
    return '<div class="page-head"><h1 class="page-title">' + esc(title) + '</h1></div>' +
      '<div class="card"><div class="banner error" role="alert"><div><strong>Couldn\u2019t load this list.</strong> The Bus Network service didn\u2019t answer. Your filters are kept.</div>' +
      '<span class="banner-actions"><button class="btn btn-primary btn-sm" data-act="retry-load">Try again</button></span></div>' +
      '<p class="muted small">Demo note: this error state was switched on from the Demo menu.</p></div>';
  };

  BN.components = { dateRange: dateRange, exportMenu: exportMenu, pill: pill, invPill: invPill, dlRow: dlRow, th: th, pager: pager, chips: chips, hasFilters: hasFilters, emptyState: emptyState, actionButtons: actionButtons, routeCell: routeCell, companyCell: companyCell };
})(window.BN);

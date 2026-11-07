/* BusNetwork portal prototype — Invoice List (S-07) and Invoice (S-08). BN-INV-01..10, BN-CLS-04/05. */
(function (BN) {
  'use strict';
  const { esc, fmtDT, fmtD, money, moneyInput, cname, can, myCid, INV_LABEL } = BN;
  const ARCHIVE_DAYS = 90;

  function dirOf(i) { return i.recipientId === myCid() ? 'Incoming' : 'Outgoing'; }
  function isArchived(i) {
    return (i.status === 'APPROVED' || i.status === 'DECLINED') && i.decidedAt && BN.S.now - Date.parse(i.decidedAt) > ARCHIVE_DAYS * BN.DAY;
  }
  function visibleInvoices() {
    const cid = myCid();
    return BN.latestInvoices().filter((i) => (i.issuerId === cid || i.recipientId === cid) && !(i.status === 'DRAFT' && i.issuerId !== cid));
  }
  function queryInvoices(tab, q) {
    const cid = myCid();
    let rows = visibleInvoices().filter((i) => {
      if (tab === 'archive') return isArchived(i);
      if (isArchived(i)) return false;
      return tab === 'incoming' ? i.recipientId === cid : i.issuerId === cid;
    });
    const s = (q.get('q') || '').trim().toLowerCase();
    if (s) rows = rows.filter((i) => [i.no, i.tripId, cname(i.issuerId), cname(i.recipientId)].some((x) => String(x).toLowerCase().indexOf(s) !== -1));
    const st = (q.get('status') || '').split(',').filter(Boolean);
    if (st.length) rows = rows.filter((i) => st.indexOf(i.status) !== -1);
    const co = q.get('company');
    if (co) rows = rows.filter((i) => (i.recipientId === cid ? i.issuerId : i.recipientId) === co);
    const tf = q.get('from'), tt = q.get('to');
    if (tf || tt) {
      rows = rows.filter((i) => {
        const t = BN.tripById(i.tripId); if (!t) return false;
        const ms = Date.parse(t.plannedStart);
        return (!tf || ms >= BN.dayStartUtc(tf)) && (!tt || ms <= BN.dayEndUtc(tt));
      });
    }
    const inf = q.get('invFrom'), int_ = q.get('invTo');
    if (inf || int_) {
      rows = rows.filter((i) => { const ms = Date.parse(i.submittedAt || i.createdAt); return (!inf || ms >= BN.dayStartUtc(inf)) && (!int_ || ms <= BN.dayEndUtc(int_)); });
    }
    const sort = (q.get('sort') || 'tripdate:desc').split(':'), dir = sort[1] === 'asc' ? 1 : -1;
    const keys = {
      no: (i) => i.no, total: (i) => BN.invTotals(i).total,
      tripdate: (i) => { const t = BN.tripById(i.tripId); return t ? Date.parse(t.plannedStart) : 0; },
      submitted: (i) => Date.parse(i.submittedAt || i.createdAt),
    };
    const k = keys[sort[0]] || keys.tripdate;
    return rows.slice().sort((a, b) => (k(a) > k(b) ? 1 : k(a) < k(b) ? -1 : 0) * dir);
  }

  function invActions(i) {
    const cid = myCid(), out = [];
    if (i.recipientId === cid && i.status === 'PENDING' && can('invoiceDecide')) {
      out.push('<button class="btn btn-primary btn-sm" data-act="inv-approve" data-no="' + i.no + '">Approve</button>');
      out.push('<button class="btn btn-danger btn-sm" data-act="inv-decline" data-no="' + i.no + '">Decline</button>');
    }
    if (i.issuerId === cid && can('invoiceIssue')) {
      if (i.status === 'DRAFT') out.push('<button class="btn btn-primary btn-sm" data-act="inv-submit" data-no="' + i.no + '">Submit</button>');
      if (i.status === 'DECLINED') out.push('<button class="btn btn-primary btn-sm" data-act="inv-resubmit" data-no="' + i.no + '">Edit &amp; resubmit</button>');
    }
    out.push('<a class="btn btn-secondary btn-sm" href="#/invoices/' + i.no + '">View</a>');
    return out.join(' ');
  }

  BN.pageInvoices = function (tab, r) {
    if (!can('invoiceDecide') && !can('invoiceIssue')) return '<div class="card empty"><p>Your role can’t open the Invoice List.</p></div>';
    const q = r.q, cid = myCid();
    const rows = queryInvoices(tab, q);
    const size = +(q.get('size') || 25), page = Math.max(1, +(q.get('page') || 1));
    const slice = rows.slice((page - 1) * size, (page - 1) * size + size);
    const sort = q.get('sort') || 'tripdate:desc';
    const sel = (q.get('status') || '').split(',').filter(Boolean);
    const counterIds = {};
    visibleInvoices().forEach((i) => { counterIds[i.recipientId === cid ? i.issuerId : i.recipientId] = 1; });
    const pendingIncoming = visibleInvoices().filter((i) => i.recipientId === cid && i.status === 'PENDING' && !isArchived(i)).length;
    const totals = rows.reduce((a, i) => { const t = BN.invTotals(i); a.net += t.net; a.vat += t.vat; a.total += t.total; return a; }, { net: 0, vat: 0, total: 0 });
    const open = BN.S.openDetails.status ? ' open' : '';
    const toolbar = '<div class="toolbar"><div class="tb-row">' +
      '<label class="tf tf-grow"><span>Search</span><input type="search" data-filter="q" value="' + esc(q.get('q') || '') + '" placeholder="Invoice no., trip ID, company"></label>' +
      '<div class="tf"><span>Status</span><details class="dropdown" data-keep="status"' + open + '><summary>Status' + (sel.length ? ' (' + sel.length + ')' : '') + ' ▾</summary><div class="panel">' +
      ['DRAFT', 'PENDING', 'APPROVED', 'DECLINED'].map((s) => '<label class="check"><input type="checkbox" data-filter="status" data-value="' + s + '"' + (sel.indexOf(s) !== -1 ? ' checked' : '') + '> ' + INV_LABEL[s] + '</label>').join('') + '</div></details></div>' +
      '<label class="tf"><span>Company</span><select data-filter="company"><option value="">All companies</option>' +
      Object.keys(counterIds).map((id) => '<option value="' + id + '"' + (q.get('company') === id ? ' selected' : '') + '>' + esc(cname(id)) + '</option>').join('') + '</select></label>' +
      BN.components.exportMenu('invoices') + '</div>' +
      '<div class="tb-row tb-row-2">' + BN.components.dateRange('Trip date', 'from', 'to', q) + BN.components.dateRange('Invoice date', 'invFrom', 'invTo', q) + '</div>' +
      '</div>' + BN.components.chips(q);
    const head = '<tr>' + BN.components.th('Invoice no.', 'no', sort) + BN.components.th('Direction') + BN.components.th('Trip ID') + BN.components.th('Company') +
      (tab === 'incoming' ? BN.components.th('Customer') : '') + BN.components.th('Trip date', 'tripdate', sort) +
      BN.components.th('Excl. VAT') + BN.components.th('VAT') + BN.components.th('Total', 'total', sort) + BN.components.th('Status') +
      BN.components.th('Submitted', 'submitted', sort) + BN.components.th('Decided') + BN.components.th('Actions') + '</tr>';
    const body = slice.map((i) => {
      const t = BN.tripById(i.tripId), tt = BN.invTotals(i), cust = t ? BN.customerOf(t) : { name: '—' };
      const other = i.recipientId === cid ? i.issuerId : i.recipientId;
      return '<tr class="row" tabindex="0" data-act="open" data-href="#/invoices/' + i.no + '">' +
        '<td class="id">' + i.no + (i.version > 1 ? ' <span class="tag">v' + i.version + '</span>' : '') + '</td>' +
        '<td>' + dirOf(i) + '</td><td class="id">' + i.tripId + '</td><td>' + esc(cname(other)) + '</td>' +
        (tab === 'incoming' ? '<td>' + esc(cust.name) + '</td>' : '') +
        '<td class="nowrap">' + (t ? fmtD(t.plannedStart) : '—') + '</td>' +
        '<td class="num">' + BN.num(tt.net) + '</td><td class="num">' + BN.num(tt.vat) + '</td><td class="num">' + BN.num(tt.total) + '</td>' +
        '<td>' + BN.components.invPill(i.status) + '</td>' +
        '<td class="nowrap">' + (i.submittedAt ? fmtD(i.submittedAt) : '—') + '</td>' +
        '<td class="nowrap">' + (i.decidedAt ? fmtD(i.decidedAt) : '—') + '</td>' +
        '<td><div class="row-actions">' + invActions(i) + '</div></td></tr>';
    }).join('');
    const cols = tab === 'incoming' ? 13 : 12;
    const foot = rows.length ? '<tfoot><tr><td colspan="' + (tab === 'incoming' ? 6 : 5) + '">Totals for ' + rows.length + ' invoices</td>' +
      '<td class="num">' + BN.num(totals.net) + '</td><td class="num">' + BN.num(totals.vat) + '</td><td class="num">' + BN.num(totals.total) + '</td><td colspan="4"></td></tr></tfoot>' : '';
    const subtabs = ['incoming', 'outgoing', 'archive'].map((x) => '<a href="#/invoices/' + x + '" class="' + (tab === x ? 'on' : '') + '">' + x.charAt(0).toUpperCase() + x.slice(1) +
      (x === 'incoming' && pendingIncoming ? ' <span class="badge warn">' + pendingIncoming + '</span>' : '') + '</a>').join('');
    return '<div class="page-head"><h1 class="page-title">Invoice List<span class="count">' + rows.length + ' invoices</span></h1></div>' +
      '<div class="card" style="padding:0"><div class="subtabs">' + subtabs + '</div>' + toolbar +
      (rows.length ? '<div class="tbl-wrap"><table><thead>' + head + '</thead><tbody>' + body + '</tbody>' + foot + '</table></div>' + BN.components.pager(rows.length, page, size)
        : BN.components.emptyState('invoices', q)) + '</div>' +
      (tab === 'archive' ? '<p class="muted small">Archive holds Approved and Declined invoices decided more than ' + ARCHIVE_DAYS + ' days ago.</p>' : '');
  };

  BN.pageInvoice = function (no, r) {
    const versions = BN.invoiceVersions(no);
    if (!versions.length) return '<div class="page-head"><h1 class="page-title">Invoice not found</h1></div><div class="card empty"><p>Invoice ' + esc(no) + ' doesn’t exist or isn’t yours.</p><a class="btn btn-secondary" href="#/invoices/incoming">Go to Invoice List</a></div>';
    const vParam = r.q.get('v');
    const inv = (vParam && versions.find((x) => String(x.version) === vParam)) || versions[versions.length - 1];
    const cid = myCid();
    if (inv.issuerId !== cid && inv.recipientId !== cid) return '<div class="card empty"><p>Invoice not found.</p></div>';
    if (inv.status === 'DRAFT' && inv.issuerId !== cid) return '<div class="card empty"><p>Invoice not found.</p></div>';
    const t = BN.tripById(inv.tripId);
    const issuer = BN.company(inv.issuerId), recipient = BN.company(inv.recipientId);
    const editable = inv.status === 'DRAFT' && inv.issuerId === cid && can('invoiceIssue');
    const lines = inv.snapshot || inv.lines;
    const totals = BN.invTotals(inv);
    const lineRows = lines.map((l, i) => {
      const c = BN.lineCalc(l);
      return '<tr>' + (editable
        ? '<td><input data-invline="' + i + '.desc" value="' + esc(l.desc) + '" aria-label="Description line ' + (i + 1) + '"></td>' +
          '<td class="num"><input data-invline="' + i + '.qty" value="' + esc(l.qty) + '" aria-label="Quantity line ' + (i + 1) + '"></td>' +
          '<td class="num"><input data-invline="' + i + '.unit" value="' + moneyInput(l.unit) + '" aria-label="Unit price line ' + (i + 1) + '"></td>' +
          '<td class="num"><input data-invline="' + i + '.vat" value="' + esc(l.vat) + '" aria-label="VAT percent line ' + (i + 1) + '"></td>'
        : '<td>' + esc(l.desc) + '</td><td class="num">' + esc(l.qty) + '</td><td class="num">' + BN.num(l.unit) + '</td><td class="num">' + esc(l.vat) + ' %</td>') +
        '<td class="num">' + BN.num(c.net) + '</td><td class="num">' + BN.num(c.vat) + '</td>' +
        (editable ? '<td><button class="btn-link" data-act="line-remove" data-no="' + inv.no + '" data-v="' + inv.version + '" data-i="' + i + '">Remove</button></td>' : '<td></td>') + '</tr>';
    }).join('');
    const actions = [];
    if (editable) actions.push('<button class="btn btn-primary" data-act="inv-submit" data-no="' + inv.no + '">Submit invoice</button>',
      '<button class="btn btn-secondary" data-act="line-add" data-no="' + inv.no + '" data-v="' + inv.version + '">Add line</button>',
      '<button class="btn btn-danger" data-act="inv-delete" data-no="' + inv.no + '" data-v="' + inv.version + '">Delete draft</button>');
    if (inv.status === 'PENDING' && inv.recipientId === cid && can('invoiceDecide')) actions.push('<button class="btn btn-primary" data-act="inv-approve" data-no="' + inv.no + '">Approve</button>', '<button class="btn btn-danger" data-act="inv-decline" data-no="' + inv.no + '">Decline</button>');
    if (inv.status === 'DECLINED' && inv.issuerId === cid && can('invoiceIssue') && inv.version === versions[versions.length - 1].version) actions.push('<button class="btn btn-primary" data-act="inv-resubmit" data-no="' + inv.no + '">Edit &amp; resubmit</button>');
    actions.push('<button class="btn btn-secondary" data-act="inv-pdf">Download PDF</button>');
    return '<a class="back" href="#/invoices/' + (inv.recipientId === cid ? 'incoming' : 'outgoing') + '">← Back to Invoice List</a>' +
      '<div class="page-head"><div><div class="dh-row"><h1 class="page-title"><span class="mono">' + inv.no + '</span></h1>' + BN.components.invPill(inv.status) +
      '<span class="tag">v' + inv.version + '</span><span class="tag">' + dirOf(inv) + '</span></div>' +
      '<p class="muted">Trip <a href="#/trips/' + inv.tripId + '">' + inv.tripId + '</a> · ' + esc(cname(inv.issuerId)) + ' → ' + esc(cname(inv.recipientId)) + '</p></div>' +
      '<div class="row-actions no-print">' + actions.join(' ') + '</div></div>' +
      (versions.length > 1 ? '<div class="versions no-print">' + versions.map((x) => '<a class="chip quick' + (x.version === inv.version ? ' on' : '') + '" href="#/invoices/' + inv.no + '?v=' + x.version + '">v' + x.version + ' · ' + INV_LABEL[x.status] + '</a>').join('') + '</div>' : '') +
      (inv.status === 'DECLINED' ? '<div class="banner error"><div><strong>Declined</strong> by ' + esc(inv.decidedBy || '') + ' on ' + fmtD(inv.decidedAt) + ': ' + esc(inv.declineReason || '') + '</div></div>' : '') +
      (inv.status === 'APPROVED' ? '<div class="banner ok"><div><strong>Approved</strong> by ' + esc(inv.decidedBy || '') + ' on ' + fmtD(inv.decidedAt) + '. Amounts were locked at approval.</div></div>' : '') +
      '<div class="stack"><div class="parties">' +
      '<section class="card"><h2 class="section">From (partner)</h2><p>' + esc(issuer.name) + '<br>' + esc(issuer.address) + '<br>Org. no. ' + esc(issuer.orgNo) + '<br>VAT ' + esc(issuer.vatNo) + '</p></section>' +
      '<section class="card"><h2 class="section">To (host)</h2><p>' + esc(recipient.name) + '<br>' + esc(recipient.address) + '<br>Org. no. ' + esc(recipient.orgNo) + '<br>VAT ' + esc(recipient.vatNo) + '</p></section></div>' +
      '<section class="card"><h2 class="section">Lines</h2><div class="tbl-wrap"><table class="lines"><thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>VAT %</th><th>Net</th><th>VAT</th><th></th></tr></thead><tbody>' + lineRows + '</tbody></table></div>' +
      '<div class="totals"><div><span>Amount excl. VAT</span><span class="num">' + money(totals.net, inv.currency) + '</span></div>' +
      '<div><span>VAT</span><span class="num">' + money(totals.vat, inv.currency) + '</span></div>' +
      '<div class="grand"><span>Total</span><span class="num">' + money(totals.total, inv.currency) + '</span></div></div></section>' +
      '<section class="card"><h2 class="section">Trip and references</h2><dl class="dl">' +
      BN.components.dlRow('Trip', t ? '<a href="#/trips/' + t.id + '">' + t.id + '</a> · ' + esc(BN.routeText(t)) : inv.tripId) +
      BN.components.dlRow('Trip date', t ? fmtDT(t.plannedStart) : '—') +
      BN.components.dlRow('Invoice reference', t ? esc(t.comments.invoiceRef) : '—') +
      (inv.recipientId === cid && t ? BN.components.dlRow('Customer', esc(BN.customerOf(t).name)) : '') +
      BN.components.dlRow('Created', fmtDT(inv.createdAt)) + BN.components.dlRow('Submitted', inv.submittedAt ? fmtDT(inv.submittedAt) : '—') +
      BN.components.dlRow('Decided', inv.decidedAt ? fmtDT(inv.decidedAt) + ' · ' + esc(inv.decidedBy || '') : '—') + '</dl></section></div>';
  };

  BN.invoiceExportRows = function (tab, q) {
    const cid = myCid();
    const rows = queryInvoices(tab, q);
    const header = ['Invoice no.', 'Version', 'Direction', 'Trip ID', 'Company', 'Customer', 'Trip date (Europe/Oslo)', 'Excl. VAT', 'VAT', 'Total', 'Currency', 'Status', 'Submitted', 'Decided'];
    const body = rows.map((i) => {
      const t = BN.tripById(i.tripId), tt = BN.invTotals(i);
      return [i.no, i.version, dirOf(i), i.tripId, cname(i.recipientId === cid ? i.issuerId : i.recipientId),
        i.recipientId === cid && t ? BN.customerOf(t).name : '', t ? fmtD(t.plannedStart) : '',
        BN.num(tt.net), BN.num(tt.vat), BN.num(tt.total), i.currency, INV_LABEL[i.status],
        i.submittedAt ? fmtD(i.submittedAt) : '', i.decidedAt ? fmtD(i.decidedAt) : ''];
    });
    return [header].concat(body);
  };
  BN.queryInvoices = queryInvoices;
  BN.isArchived = isArchived;
  BN.pendingIncoming = function () {
    const cid = myCid();
    return visibleInvoices().filter((i) => i.recipientId === cid && i.status === 'PENDING' && !isArchived(i)).length;
  };
})(window.BN);

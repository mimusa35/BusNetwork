import { formatDemoTime, toInputValue } from '../domain/clock.js';
import type { ActionItem, KeyFigures } from '../domain/dashboard.js';
import type { InvoiceAction } from '../domain/invoices.js';
import { formatNok, lineTotals } from '../domain/money.js';
import type { TabCheckResult } from '../domain/tabCheck.js';
import type { Company, Invoice, Totals, Trip } from '../domain/types.js';
import type { TripList, TripView } from '../domain/views.js';
import { html, raw, type SafeHtml } from './html.js';

/**
 * Server-rendered pages. Every interactive element carries a stable
 * `data-testid` ({page}-{element}); row-level ids use the record id.
 */

export interface PageContext {
  company: Company;
  companies: Company[];
  now: number;
  /** Path to come back to after a header action (time control). */
  currentPath: string;
}

const STYLE = raw(`
  :root { --fg:#1d2433; --muted:#5b6475; --line:#d8dde6; --bg:#f6f7f9; --card:#fff; --accent:#1f5fbf; --bad:#b42318; --ok:#067647; }
  * { box-sizing: border-box; }
  body { margin:0; font:15px/1.45 system-ui, sans-serif; color:var(--fg); background:var(--bg); }
  header { background:var(--card); border-bottom:1px solid var(--line); padding:10px 16px; display:flex; flex-wrap:wrap; gap:12px 24px; align-items:center; }
  header h1 { font-size:17px; margin:0; }
  nav { display:flex; flex-wrap:wrap; gap:6px 14px; padding:8px 16px; background:#eef1f6; border-bottom:1px solid var(--line); }
  nav a { color:var(--accent); text-decoration:none; } nav a[aria-current] { font-weight:600; text-decoration:underline; }
  main { max-width:1100px; margin:0 auto; padding:16px; }
  form.inline { display:inline-flex; gap:6px; align-items:center; flex-wrap:wrap; margin:0; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:14px 16px; margin-bottom:16px; }
  .figures { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; }
  .figure strong { display:block; font-size:28px; }
  table { width:100%; border-collapse:collapse; background:var(--card); }
  th, td { text-align:left; padding:6px 8px; border-bottom:1px solid var(--line); vertical-align:top; }
  .table-wrap { overflow-x:auto; }
  .error { border:1px solid var(--bad); color:var(--bad); background:#fef3f2; padding:10px 12px; border-radius:6px; margin-bottom:12px; }
  .ok { color:var(--ok); } .bad { color:var(--bad); } .muted { color:var(--muted); }
  .status { display:inline-block; padding:1px 8px; border-radius:10px; background:#eef1f6; font-size:13px; }
  label { display:block; margin:8px 0 2px; font-weight:500; }
  input, select, textarea, button { font:inherit; padding:5px 8px; }
  button { cursor:pointer; }
  .actions { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-start; }
`);

function layout(ctx: PageContext, title: string, body: SafeHtml, active?: string): SafeHtml {
  const isHost = ctx.company.role === 'host';
  const navLink = (href: string, label: string, testid: string, key: string) =>
    html`<a href="${href}" data-testid="${testid}" ${active === key ? raw('aria-current="page"') : ''}>${label}</a>`;
  return html`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} - BusNetwork POC</title><style>${STYLE}</style></head>
<body>
<header>
  <h1>BusNetwork portal POC</h1>
  <form class="inline" method="post" action="/switch" data-testid="company-switcher-form">
    <label for="companyId" style="margin:0">Company</label>
    <select id="companyId" name="companyId" data-testid="company-switcher-select">
      ${ctx.companies.map(
        (c) => html`<option value="${c.id}" ${c.id === ctx.company.id ? raw('selected') : ''}>${c.name}${c.role === 'host' ? ' (host)' : ' (partner)'}</option>`,
      )}
    </select>
    <button type="submit" data-testid="company-switcher-submit">Switch</button>
  </form>
  <span data-testid="current-company">Viewing as <strong>${ctx.company.name}</strong> (${ctx.company.role})</span>
  <form class="inline" method="post" action="/time" data-testid="time-control-form">
    <input type="hidden" name="returnTo" value="${ctx.currentPath}">
    <span>Demo time: <strong data-testid="time-control-now">${formatDemoTime(ctx.now)} UTC</strong></span>
    <button type="submit" name="action" value="hour" data-testid="time-control-plus-hour">+1 hour</button>
    <button type="submit" name="action" value="day" data-testid="time-control-plus-day">+1 day</button>
    <input type="datetime-local" name="to" value="${toInputValue(ctx.now)}" data-testid="time-control-jump-input" aria-label="Jump to date and time">
    <button type="submit" name="action" value="jump" data-testid="time-control-jump-submit">Jump</button>
  </form>
  <form class="inline" method="post" action="/reset" data-testid="reset-form">
    <button type="submit" data-testid="reset-submit">Reset demo data</button>
  </form>
</header>
<nav>
  ${navLink('/', 'Dashboard', 'nav-dashboard', 'dashboard')}
  ${navLink('/trips/active', 'Active', 'nav-trips-active', 'active')}
  ${navLink('/trips/closed', 'Closed', 'nav-trips-closed', 'closed')}
  ${navLink('/trips/all', 'All', 'nav-trips-all', 'all')}
  ${navLink('/invoices', 'Invoices', 'nav-invoices', 'invoices')}
  ${isHost ? navLink('/trips/new', 'New trip', 'nav-new-trip', 'new') : ''}
  ${navLink('/tab-check', 'Tab check', 'nav-tab-check', 'tab-check')}
</nav>
<main>${body}</main>
</body></html>`;
}

function errorBox(message?: string, field?: string): SafeHtml {
  if (!message) return html``;
  return html`<div class="error" role="alert" data-testid="form-error" data-field="${field ?? ''}">${message}</div>`;
}

const statusBadge = (status: string) => html`<span class="status" data-status="${status}">${status}</span>`;

export function dashboardPage(ctx: PageContext, figures: KeyFigures, items: ActionItem[]): SafeHtml {
  const awaitingLabel = ctx.company.role === 'host' ? 'Requested trips awaiting a partner' : 'Offers awaiting your answer';
  const invoicesLabel = ctx.company.role === 'host' ? 'Pending invoices to approve' : 'Pending invoices you sent';
  const body = html`
  <h2>Dashboard</h2>
  <section class="figures">
    <div class="card figure" data-testid="dashboard-awaiting-response"><span class="muted">${awaitingLabel}</span><strong>${figures.awaitingResponse}</strong></div>
    <div class="card figure" data-testid="dashboard-active-trips"><span class="muted">Active trips</span><strong>${figures.activeTrips}</strong></div>
    <div class="card figure" data-testid="dashboard-open-invoices"><span class="muted">${invoicesLabel}</span><strong>${figures.openInvoices.count}</strong><span>${formatNok(figures.openInvoices.totalInclVat)} incl. VAT</span></div>
  </section>
  <section class="card">
    <h3>Needs your action</h3>
    ${
      items.length === 0
        ? html`<p class="muted" data-testid="needs-action-empty">Nothing needs your action right now.</p>`
        : html`<ul data-testid="needs-action-list">${items.map(
            (item) => html`<li data-kind="${item.kind}"><a href="/${item.target.type === 'trip' ? 'trips' : 'invoices'}/${item.target.id}" data-testid="needs-action-item-${item.target.id}">${item.label}</a></li>`,
          )}</ul>`
    }
  </section>`;
  return layout(ctx, 'Dashboard', body, 'dashboard');
}

const LIST_TITLES: Record<TripList, string> = { active: 'Active trips', closed: 'Closed trips', all: 'All trips' };

export function tripListPage(ctx: PageContext, list: TripList, trips: Trip[], priceOf: (t: Trip) => number | undefined): SafeHtml {
  const priceLabel = ctx.company.role === 'host' ? 'Customer price' : 'Your offer price';
  const body = html`
  <h2>${LIST_TITLES[list]}</h2>
  ${
    trips.length === 0
      ? html`<p class="muted" data-testid="trip-list-empty">No trips in this list.</p>`
      : html`<div class="table-wrap"><table data-testid="trip-list-table" data-list="${list}">
      <thead><tr><th>Trip</th><th>Customer</th><th>Route</th><th>Planned start</th><th>Status</th><th>${priceLabel} (excl. VAT)</th></tr></thead>
      <tbody>${trips.map((t) => {
        const price = priceOf(t);
        return html`<tr data-testid="trip-list-row-${t.id}">
          <td><a href="/trips/${t.id}" data-testid="trip-list-link-${t.id}">${t.id}</a></td>
          <td>${t.customerName}</td><td>${t.from} - ${t.to}</td><td>${formatDemoTime(t.plannedStart)}</td>
          <td>${statusBadge(t.status)}</td><td>${price === undefined ? '' : formatNok(price)}</td></tr>`;
      })}</tbody></table></div>`
  }`;
  return layout(ctx, LIST_TITLES[list], body, list);
}

export function tripDetailPage(ctx: PageContext, view: TripView): SafeHtml {
  const actions = view.actions;
  const body = html`
  <h2>Trip ${view.id} ${statusBadge(view.status)}</h2>
  <section class="card" data-testid="trip-detail">
    <p><strong>${view.customerName}</strong>: ${view.from} - ${view.to}</p>
    <p>Planned ${formatDemoTime(view.plannedStart)} to ${formatDemoTime(view.plannedEnd)} (UTC). Host: ${view.hostName}</p>
    ${view.customerPrice !== undefined ? html`<p data-testid="trip-detail-customer-price">Customer price: ${formatNok(view.customerPrice)} excl. VAT</p>` : ''}
    ${view.myOffer ? html`<p data-testid="trip-detail-my-offer">Your offer price: ${formatNok(view.myOffer.price)} excl. VAT (offer ${view.myOffer.status})</p>` : ''}
    ${view.acceptedPartnerName ? html`<p>Accepted by: ${view.acceptedPartnerName}</p>` : ''}
    ${view.cancelReason ? html`<p class="bad" data-testid="trip-detail-cancel-reason">Cancelled by ${view.cancelledByName ?? 'unknown'}: ${view.cancelReason}</p>` : ''}
    ${view.invoiceId ? html`<p><a href="/invoices/${view.invoiceId}" data-testid="trip-detail-invoice-link">Invoice ${view.invoiceId}</a></p>` : ''}
  </section>
  ${
    view.offers
      ? html`<section class="card"><h3>Offers</h3><div class="table-wrap"><table data-testid="trip-offers-table">
        <thead><tr><th>Partner</th><th>Offer price (excl. VAT)</th><th>Offer status</th></tr></thead>
        <tbody>${view.offers.map((o) => html`<tr data-testid="trip-offers-row-${o.partnerId}"><td>${o.partnerName}</td><td>${formatNok(o.price)}</td><td>${o.status}</td></tr>`)}</tbody>
      </table></div></section>`
      : ''
  }
  <section class="card"><h3>Actions</h3>
  ${actions.length === 0 ? html`<p class="muted" data-testid="trip-actions-none">No actions available.</p>` : ''}
  <div class="actions">
    ${actions.includes('accept') ? html`<form method="post" action="/trips/${view.id}/accept"><button type="submit" data-testid="trip-accept-button">Accept offer</button></form>` : ''}
    ${actions.includes('reject') ? html`<form method="post" action="/trips/${view.id}/reject"><button type="submit" data-testid="trip-reject-button">Reject offer</button></form>` : ''}
    ${actions.includes('complete') ? html`<form method="post" action="/trips/${view.id}/complete"><button type="submit" data-testid="trip-complete-button">Mark complete</button></form>` : ''}
    ${actions.includes('createInvoice') ? html`<form method="post" action="/trips/${view.id}/invoice"><button type="submit" data-testid="trip-create-invoice-button">Create invoice</button></form>` : ''}
    ${
      actions.includes('cancel')
        ? html`<form method="post" action="/trips/${view.id}/cancel" class="inline">
            <input name="reason" maxlength="500" placeholder="Reason for cancelling" data-testid="trip-cancel-reason" aria-label="Reason for cancelling">
            <button type="submit" data-testid="trip-cancel-button">Cancel trip</button></form>`
        : ''
    }
  </div></section>
  <section class="card"><h3>History</h3><div class="table-wrap"><table data-testid="trip-history-table">
    <thead><tr><th>When</th><th>Change</th><th>By</th><th>Note</th></tr></thead>
    <tbody>${view.history.map((h) => html`<tr><td>${formatDemoTime(h.at)}</td><td>${h.from ?? 'new'} &rarr; ${h.to}</td><td>${h.by}</td><td>${h.note ?? ''}</td></tr>`)}</tbody>
  </table></div></section>`;
  return layout(ctx, `Trip ${view.id}`, body);
}

export interface NewTripFormValues {
  customerName: string;
  from: string;
  to: string;
  plannedStart: string;
  plannedEnd: string;
  customerPrice: string;
  partners: string[];
  prices: Record<string, string>;
}

export function newTripPage(ctx: PageContext, partners: Company[], values: NewTripFormValues, error?: { message: string; field?: string }): SafeHtml {
  const input = (name: keyof NewTripFormValues, label: string, type = 'text') => html`
    <label for="${name}">${label}</label>
    <input id="${name}" name="${name}" type="${type}" value="${String(values[name] ?? '')}" data-testid="new-trip-${name}" ${type === 'text' ? raw('maxlength="200"') : ''}>`;
  const body = html`
  <h2>Create and share a trip</h2>
  ${errorBox(error?.message, error?.field)}
  <form method="post" action="/trips" class="card" data-testid="new-trip-form">
    ${input('customerName', 'Customer name')}
    ${input('from', 'From')}
    ${input('to', 'To')}
    ${input('plannedStart', 'Planned start (UTC)', 'datetime-local')}
    ${input('plannedEnd', 'Planned end (UTC)', 'datetime-local')}
    ${input('customerPrice', 'Customer price (NOK, excl. VAT)')}
    <fieldset style="margin-top:12px"><legend>Share with partners (offer price excl. VAT; leave blank for the agreement default)</legend>
      ${partners.map(
        (p) => html`<div style="margin:6px 0">
          <label style="display:inline"><input type="checkbox" name="partner" value="${p.id}" ${values.partners.includes(p.id) ? raw('checked') : ''} data-testid="new-trip-partner-${p.id}"> ${p.name} (${Math.round((p.rate ?? 1) * 100)} %)</label>
          <input name="price_${p.id}" value="${values.prices[p.id] ?? ''}" data-rate="${p.rate ?? 1}" class="offer-price" placeholder="default" aria-label="Offer price for ${p.name}" data-testid="new-trip-price-${p.id}">
        </div>`,
      )}
    </fieldset>
    <p><button type="submit" data-testid="new-trip-submit">Share trip</button></p>
  </form>
  <script>
    // Show each partner's default offer price (customer price x rate) as a hint while typing.
    (function () {
      var customer = document.getElementById('customerPrice');
      function update() {
        var value = parseFloat(String(customer.value).replace(',', '.'));
        document.querySelectorAll('.offer-price').forEach(function (el) {
          el.placeholder = isFinite(value) ? (Math.round(value * Number(el.dataset.rate) * 100) / 100).toFixed(2) : 'default';
        });
      }
      customer.addEventListener('input', update); update();
    })();
  </script>`;
  return layout(ctx, 'New trip', body, 'new');
}

export interface InvoiceRow {
  invoice: Invoice;
  tripLabel: string;
  counterpartName: string;
  totals: Totals;
}

export function invoiceListPage(ctx: PageContext, rows: InvoiceRow[]): SafeHtml {
  const counterpart = ctx.company.role === 'host' ? 'Partner' : 'Host';
  const body = html`
  <h2>Invoices</h2>
  ${
    rows.length === 0
      ? html`<p class="muted" data-testid="invoice-list-empty">No invoices.</p>`
      : html`<div class="table-wrap"><table data-testid="invoice-list-table">
      <thead><tr><th>Invoice</th><th>Trip</th><th>${counterpart}</th><th>Status</th><th>Total incl. VAT</th></tr></thead>
      <tbody>${rows.map(
        (r) => html`<tr data-testid="invoice-list-row-${r.invoice.id}"><td><a href="/invoices/${r.invoice.id}" data-testid="invoice-list-link-${r.invoice.id}">${r.invoice.id}</a></td>
        <td>${r.tripLabel}</td><td>${r.counterpartName}</td><td>${statusBadge(r.invoice.status)}</td><td>${formatNok(r.totals.total)}</td></tr>`,
      )}</tbody></table></div>`
  }`;
  return layout(ctx, 'Invoices', body, 'invoices');
}

export function invoiceDetailPage(
  ctx: PageContext,
  invoice: Invoice,
  details: { tripLabel: string; partnerName: string; hostName: string; totals: Totals; actions: InvoiceAction[] },
): SafeHtml {
  const canEdit = details.actions.includes('edit');
  const pct = (rate: number) => String(Math.round(rate * 10_000) / 100);
  const lineRow = (line: Invoice['lines'][number]) => {
    const t = lineTotals(line);
    if (!canEdit) {
      return html`<tr data-testid="invoice-line-row-${line.id}"><td>${line.description}</td><td>${line.quantity}</td><td>${formatNok(line.unitPrice)}</td>
        <td>${formatNok(t.net)}</td><td>${pct(line.vatRate)} %</td><td>${formatNok(t.vat)}</td><td>${formatNok(t.total)}</td><td></td></tr>`;
    }
    const formId = `line-form-${line.id}`;
    return html`<tr data-testid="invoice-line-row-${line.id}">
      <td><input form="${formId}" name="description" value="${line.description}" maxlength="200" aria-label="Description" data-testid="invoice-line-description-${line.id}"></td>
      <td><input form="${formId}" name="quantity" value="${line.quantity}" size="4" aria-label="Quantity" data-testid="invoice-line-quantity-${line.id}"></td>
      <td><input form="${formId}" name="unitPrice" value="${line.unitPrice}" size="8" aria-label="Unit price" data-testid="invoice-line-unit-price-${line.id}"></td>
      <td>${formatNok(t.net)}</td>
      <td><input form="${formId}" name="vatRate" value="${pct(line.vatRate)}" size="4" aria-label="VAT %" data-testid="invoice-line-vat-rate-${line.id}"> %</td>
      <td>${formatNok(t.vat)}</td><td>${formatNok(t.total)}</td>
      <td><form id="${formId}" method="post" action="/invoices/${invoice.id}/lines/${line.id}" class="inline"><button type="submit" data-testid="invoice-line-save-${line.id}">Save</button></form>
        ${invoice.lines.length > 1 ? html`<form method="post" action="/invoices/${invoice.id}/lines/${line.id}/delete" class="inline"><button type="submit" data-testid="invoice-line-delete-${line.id}">Remove</button></form>` : ''}</td>
    </tr>`;
  };
  const body = html`
  <h2>Invoice ${invoice.id} ${statusBadge(invoice.status)}</h2>
  <section class="card" data-testid="invoice-detail">
    <p>Trip: ${details.tripLabel}. From ${details.partnerName} to ${details.hostName}.</p>
    ${invoice.declineReason ? html`<p class="bad" data-testid="invoice-decline-reason">Declined: ${invoice.declineReason}</p>` : ''}
    ${invoice.status === 'Approved' ? html`<p class="ok" data-testid="invoice-locked">Approved. The amounts are locked.</p>` : ''}
  </section>
  <section class="card"><h3>Lines</h3><div class="table-wrap"><table data-testid="invoice-lines-table">
    <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Excl. VAT</th><th>VAT rate</th><th>VAT</th><th>Total</th><th></th></tr></thead>
    <tbody>${invoice.lines.map(lineRow)}</tbody>
    <tfoot data-testid="invoice-totals">
      <tr><th colspan="6">Total excl. VAT</th><td data-testid="invoice-total-net">${formatNok(details.totals.net)}</td><td></td></tr>
      <tr><th colspan="6">VAT</th><td data-testid="invoice-total-vat">${formatNok(details.totals.vat)}</td><td></td></tr>
      <tr><th colspan="6">Total incl. VAT</th><td data-testid="invoice-total">${formatNok(details.totals.total)}</td><td></td></tr>
    </tfoot>
  </table></div>
  ${
    canEdit
      ? html`<form method="post" action="/invoices/${invoice.id}/lines" class="inline" style="margin-top:12px" data-testid="invoice-add-line-form">
        <input name="description" placeholder="Description" maxlength="200" aria-label="Description" data-testid="invoice-add-line-description">
        <input name="quantity" value="1" size="4" aria-label="Quantity" data-testid="invoice-add-line-quantity">
        <input name="unitPrice" placeholder="Unit price" size="8" aria-label="Unit price" data-testid="invoice-add-line-unit-price">
        <input name="vatRate" value="25" size="4" aria-label="VAT %" data-testid="invoice-add-line-vat-rate"> %
        <button type="submit" data-testid="invoice-add-line-submit">Add line</button></form>`
      : ''
  }
  </section>
  <section class="card"><h3>Actions</h3>
  ${details.actions.length === 0 ? html`<p class="muted" data-testid="invoice-actions-none">No actions available.</p>` : ''}
  <div class="actions">
    ${details.actions.includes('submit') ? html`<form method="post" action="/invoices/${invoice.id}/submit"><button type="submit" data-testid="invoice-submit-button">${invoice.status === 'Declined' ? 'Resubmit' : 'Submit'} invoice</button></form>` : ''}
    ${details.actions.includes('approve') ? html`<form method="post" action="/invoices/${invoice.id}/approve"><button type="submit" data-testid="invoice-approve-button">Approve</button></form>` : ''}
    ${
      details.actions.includes('decline')
        ? html`<form method="post" action="/invoices/${invoice.id}/decline" class="inline">
          <input name="reason" maxlength="500" placeholder="Reason for declining" aria-label="Reason for declining" data-testid="invoice-decline-reason-input">
          <button type="submit" data-testid="invoice-decline-button">Decline</button></form>`
        : ''
    }
  </div></section>`;
  return layout(ctx, `Invoice ${invoice.id}`, body, 'invoices');
}

export function tabCheckPage(ctx: PageContext, result: TabCheckResult, companyName: (id: string) => string): SafeHtml {
  const body = html`
  <h2>Tab-placement check</h2>
  <section class="card" data-testid="tab-check-result" data-passed="${String(result.passed)}">
    <p class="${result.passed ? 'ok' : 'bad'}"><strong>${result.passed ? 'PASS' : 'FAIL'}</strong>:
      every trip each company can see is in exactly one of Active or Closed, and always in All.</p>
    <p>Company/trip pairs checked: ${result.checkedPairs}. Statuses covered: ${result.statusesCovered.join(', ') || 'none'}.</p>
    ${result.statusesMissing.length ? html`<p class="bad">No trip currently in: ${result.statusesMissing.join(', ')}.</p>` : ''}
  </section>
  ${
    result.violations.length
      ? html`<div class="table-wrap"><table data-testid="tab-check-violations">
        <thead><tr><th>Company</th><th>Trip</th><th>Status</th><th>Active</th><th>Closed</th><th>All</th></tr></thead>
        <tbody>${result.violations.map((v) => html`<tr><td>${companyName(v.companyId)}</td><td>${v.tripId}</td><td>${v.status}</td><td>${String(v.inActive)}</td><td>${String(v.inClosed)}</td><td>${String(v.inAll)}</td></tr>`)}</tbody>
      </table></div>`
      : ''
  }`;
  return layout(ctx, 'Tab check', body, 'tab-check');
}

export function errorPage(ctx: PageContext, message: string, field?: string, backHref = '/'): SafeHtml {
  const body = html`
  <h2>Something needs fixing</h2>
  ${errorBox(message, field)}
  <p><a href="${backHref}" data-testid="error-back-link">Go back</a></p>`;
  return layout(ctx, 'Error', body);
}

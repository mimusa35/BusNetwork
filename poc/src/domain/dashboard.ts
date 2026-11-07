import { totalsOf } from './invoices.js';
import { round2 } from './money.js';
import type { Store } from './store.js';
import { tripsInList, visibleInvoices, visibleTrips } from './views.js';

/** Dashboard key figures and the Needs-your-action list (FR7; decisions D3, D5). */

export interface KeyFigures {
  /** Host: its Requested trips. Partner: open offers waiting for its answer. */
  awaitingResponse: number;
  /** Count of the company's Active list. */
  activeTrips: number;
  /** Pending invoices the partner sent / the host must approve: count and sum incl. VAT (D5). */
  openInvoices: { count: number; totalInclVat: number };
}

export function keyFigures(store: Store, companyId: string): KeyFigures {
  const company = store.getCompany(companyId);
  const trips = visibleTrips(store, companyId);
  const awaitingResponse =
    company.role === 'host'
      ? trips.filter((t) => t.hostId === companyId && t.status === 'Requested').length
      : trips.filter((t) => t.status === 'Requested' && t.offers.some((o) => o.partnerId === companyId && o.status === 'Open')).length;
  const pending = visibleInvoices(store, companyId).filter((i) => i.status === 'Pending');
  return {
    awaitingResponse,
    activeTrips: tripsInList(store, companyId, 'active').length,
    openInvoices: {
      count: pending.length,
      totalInclVat: round2(pending.reduce((sum, i) => sum + totalsOf(i).total, 0)),
    },
  };
}

export type ActionKind = 'respond-offer' | 'fix-invoice' | 'create-invoice' | 'approve-invoice' | 'cancelled';

export interface ActionItem {
  kind: ActionKind;
  label: string;
  target: { type: 'trip' | 'invoice'; id: string };
}

function tripLabel(store: Store, tripId: string): string {
  const trip = store.getTrip(tripId);
  return `${trip.from} - ${trip.to} (${trip.id})`;
}

/**
 * Needs-your-action (FR7.2, D3). Each item clears when its condition stops
 * holding: after accept/reject, approve/decline, resubmit, creating the
 * invoice, or opening a trip cancelled by the other side.
 */
export function needsAction(store: Store, companyId: string): ActionItem[] {
  const company = store.getCompany(companyId);
  const items: ActionItem[] = [];
  const trips = visibleTrips(store, companyId);
  const invoices = visibleInvoices(store, companyId);

  if (company.role === 'partner') {
    for (const trip of trips) {
      if (trip.status === 'Requested' && trip.offers.some((o) => o.partnerId === companyId && o.status === 'Open')) {
        items.push({ kind: 'respond-offer', label: `Respond to offer: ${tripLabel(store, trip.id)}`, target: { type: 'trip', id: trip.id } });
      }
      if (trip.status === 'Completed' && trip.acceptedPartnerId === companyId && !store.findInvoiceForTrip(trip.id)) {
        items.push({ kind: 'create-invoice', label: `Completed - create invoice: ${tripLabel(store, trip.id)}`, target: { type: 'trip', id: trip.id } });
      }
    }
    for (const invoice of invoices) {
      if (invoice.partnerId === companyId && invoice.status === 'Declined') {
        items.push({ kind: 'fix-invoice', label: `Fix declined invoice ${invoice.id}`, target: { type: 'invoice', id: invoice.id } });
      }
    }
  } else {
    for (const invoice of invoices) {
      if (invoice.hostId === companyId && invoice.status === 'Pending') {
        items.push({ kind: 'approve-invoice', label: `Approve or decline invoice ${invoice.id}`, target: { type: 'invoice', id: invoice.id } });
      }
    }
  }

  for (const trip of trips) {
    const cancelledByOtherSide = trip.status === 'Cancelled' && trip.cancelledBy !== undefined && trip.cancelledBy !== companyId;
    if (cancelledByOtherSide && !store.state.viewedCancellations.includes(`${companyId}:${trip.id}`)) {
      items.push({ kind: 'cancelled', label: `Cancelled by the other side: ${tripLabel(store, trip.id)}`, target: { type: 'trip', id: trip.id } });
    }
  }
  return items;
}

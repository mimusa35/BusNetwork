import type { Store } from './store.js';
import { canCancel } from './trips.js';
import {
  ACTIVE_STATUSES,
  CLOSED_STATUSES,
  DomainError,
  type HistoryEntry,
  type Invoice,
  type OfferStatus,
  type Trip,
  type TripStatus,
} from './types.js';

/**
 * What each company may see (FR1.3, FR4.2, NFR1, decision D1) and the
 * Active / Closed / All lists (FR6.1).
 */

export type TripList = 'active' | 'closed' | 'all';
export const TRIP_LISTS: readonly TripList[] = ['active', 'closed', 'all'];

/**
 * D1: the host always sees its trips. A partner sees a trip only while its own
 * offer is open, or once it is the accepting partner.
 */
export function canSeeTrip(trip: Trip, companyId: string): boolean {
  if (trip.hostId === companyId) return true;
  if (trip.acceptedPartnerId === companyId) return true;
  return trip.offers.some((o) => o.partnerId === companyId && o.status === 'Open');
}

export function visibleTrips(store: Store, companyId: string): Trip[] {
  return store.state.trips.filter((t) => canSeeTrip(t, companyId));
}

/** List membership is decided from the trip's status alone (FR6.1). */
export function isInList(status: TripStatus, list: TripList): boolean {
  if (list === 'all') return true;
  if (list === 'active') return ACTIVE_STATUSES.includes(status);
  return CLOSED_STATUSES.includes(status);
}

export function tripsInList(store: Store, companyId: string, list: TripList): Trip[] {
  return visibleTrips(store, companyId)
    .filter((t) => isInList(t.status, list))
    .sort((a, b) => a.plannedStart - b.plannedStart || a.id.localeCompare(b.id));
}

export function canSeeInvoice(invoice: Invoice, companyId: string): boolean {
  return invoice.partnerId === companyId || invoice.hostId === companyId;
}

export function visibleInvoices(store: Store, companyId: string): Invoice[] {
  return store.state.invoices.filter((i) => canSeeInvoice(i, companyId));
}

export type TripAction = 'accept' | 'reject' | 'cancel' | 'complete' | 'createInvoice';

/** Actions the company is offered on a trip (FR3.8, FR4.1, FR5.1, D4, D6, A3). */
export function tripActions(store: Store, companyId: string, trip: Trip): TripAction[] {
  const actions: TripAction[] = [];
  const myOffer = trip.offers.find((o) => o.partnerId === companyId);
  if (trip.status === 'Requested' && myOffer?.status === 'Open') actions.push('accept', 'reject');
  if (canCancel(trip, companyId)) actions.push('cancel');
  if (trip.status === 'In progress' && trip.acceptedPartnerId === companyId) actions.push('complete');
  if (trip.status === 'Completed' && trip.acceptedPartnerId === companyId && !store.findInvoiceForTrip(trip.id)) {
    actions.push('createInvoice');
  }
  return actions;
}

/** History as a viewer may see it: other partners are never named (FR4.2). */
export interface HistoryView {
  at: number;
  from: TripStatus | null;
  to: TripStatus;
  by: string;
  note?: string;
}

/** A trip as one company may see it. Partners get no customer price and no other offers (FR4.2). */
export interface TripView {
  id: string;
  customerName: string;
  from: string;
  to: string;
  plannedStart: number;
  plannedEnd: number;
  status: TripStatus;
  hostName: string;
  isHost: boolean;
  /** Host only. */
  customerPrice?: number;
  /** Host only: every offer with partner name. */
  offers?: { partnerId: string; partnerName: string; price: number; status: OfferStatus }[];
  /** Partner only: its own offer. */
  myOffer?: { price: number; status: OfferStatus };
  acceptedPartnerName?: string;
  cancelReason?: string;
  cancelledByName?: string;
  invoiceId?: string;
  history: HistoryView[];
  actions: TripAction[];
}

function describeActor(store: Store, by: string, viewerId: string, trip: Trip): string {
  if (by === 'system') return 'System (demo time)';
  if (by === viewerId) return 'You';
  if (by === trip.hostId || viewerId === trip.hostId) return store.findCompany(by)?.name ?? by;
  return 'Another partner';
}

function historyFor(store: Store, trip: Trip, viewerId: string): HistoryView[] {
  return trip.history.map((h: HistoryEntry) => ({
    at: h.at,
    from: h.from,
    to: h.to,
    by: describeActor(store, h.by, viewerId, trip),
    ...(h.note ? { note: h.note } : {}),
  }));
}

/** Build the company-safe view of a trip. Throws not_found if the company may not see it (NFR1). */
export function tripViewFor(store: Store, companyId: string, tripId: string): TripView {
  const trip = store.getTrip(tripId);
  if (!canSeeTrip(trip, companyId)) {
    throw new DomainError('not_found', `Trip ${tripId} was not found`, 'tripId');
  }
  const isHost = trip.hostId === companyId;
  const invoice = store.findInvoiceForTrip(trip.id);
  const nameOf = (id?: string) => (id ? store.findCompany(id)?.name ?? id : undefined);
  const view: TripView = {
    id: trip.id,
    customerName: trip.customerName,
    from: trip.from,
    to: trip.to,
    plannedStart: trip.plannedStart,
    plannedEnd: trip.plannedEnd,
    status: trip.status,
    hostName: nameOf(trip.hostId) ?? trip.hostId,
    isHost,
    history: historyFor(store, trip, companyId),
    actions: tripActions(store, companyId, trip),
  };
  if (isHost) {
    view.customerPrice = trip.customerPrice;
    view.offers = trip.offers.map((o) => ({ ...o, partnerName: nameOf(o.partnerId) ?? o.partnerId }));
    view.acceptedPartnerName = nameOf(trip.acceptedPartnerId);
  } else {
    const mine = trip.offers.find((o) => o.partnerId === companyId);
    if (mine) view.myOffer = { price: mine.price, status: mine.status };
    if (trip.acceptedPartnerId === companyId) view.acceptedPartnerName = nameOf(companyId);
  }
  if (trip.cancelReason) {
    view.cancelReason = trip.cancelReason;
    view.cancelledByName = trip.cancelledBy ? describeActor(store, trip.cancelledBy, companyId, trip) : undefined;
  }
  if (invoice && canSeeInvoice(invoice, companyId)) view.invoiceId = invoice.id;
  return view;
}

/**
 * Open a trip as a company: returns its view and clears any "cancelled by the
 * other side" action item for that company (D3).
 */
export function openTrip(store: Store, companyId: string, tripId: string): TripView {
  const view = tripViewFor(store, companyId, tripId);
  if (view.status === 'Cancelled') {
    const key = `${companyId}:${tripId}`;
    if (!store.state.viewedCancellations.includes(key)) store.state.viewedCancellations.push(key);
  }
  return view;
}

/** The offer price a viewer sees in lists: own offer for partners, customer price for hosts. */
export function listPriceFor(trip: Trip, companyId: string): number | undefined {
  if (trip.hostId === companyId) return trip.customerPrice;
  return trip.offers.find((o) => o.partnerId === companyId)?.price;
}

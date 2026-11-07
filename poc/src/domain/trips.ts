import { getNow, setNow } from './clock.js';
import { round2 } from './money.js';
import type { Store } from './store.js';
import { CLOSED_STATUSES, DomainError, type Actor, type Trip, type TripStatus } from './types.js';

/**
 * Trip lifecycle (FR2, FR3, FR4, FR8.1; decisions D2, D6).
 *
 * Allowed status changes (any other is refused):
 *   Requested   --partner accepts-------------> Accepted     (FR3.1)
 *   Requested   --last open offer rejected----> Rejected     (FR3.2)
 *   Requested   --host cancels (reason)-------> Cancelled    (FR3.3, D6)
 *   Accepted    --host/accepting partner------> Cancelled    (FR3.3, D6)
 *   Accepted    --demo time >= planned start--> In progress  (FR3.4)
 *   In progress --demo time >= planned end----> Completed    (FR3.5)
 *   In progress --accepting partner completes-> Completed    (FR3.5, A3)
 */
const ALLOWED_TRANSITIONS: Record<TripStatus, readonly TripStatus[]> = {
  Requested: ['Accepted', 'Rejected', 'Cancelled'],
  Accepted: ['In progress', 'Cancelled'],
  'In progress': ['Completed'],
  Completed: [],
  Cancelled: [],
  Rejected: [],
};

export interface OfferInput {
  partnerId: string;
  price: number;
}

export interface NewTripInput {
  customerName: string;
  from: string;
  to: string;
  plannedStart: number;
  plannedEnd: number;
  customerPrice: number;
  offers: OfferInput[];
}

export function isFinal(status: TripStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}

/** The single place a trip's status changes; refuses anything not in the table. */
function transition(trip: Trip, to: TripStatus, at: number, by: Actor, note?: string): void {
  if (!ALLOWED_TRANSITIONS[trip.status].includes(to)) {
    throw new DomainError('invalid_state', `A ${trip.status} trip cannot become ${to}`, 'status');
  }
  trip.history.push({ at, from: trip.status, to, by, ...(note ? { note } : {}) });
  trip.status = to;
}

function requireText(value: string, field: string, label: string): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) throw new DomainError('validation', `${label} is required`, field);
  if (trimmed.length > 200) throw new DomainError('validation', `${label} must be at most 200 characters`, field);
  return trimmed;
}

function requireAmount(value: number, field: string, label: string): number {
  if (!Number.isFinite(value)) throw new DomainError('validation', `${label} is required`, field);
  if (value < 0) throw new DomainError('validation', `${label} cannot be negative`, field);
  return round2(value);
}

function requireHost(store: Store, companyId: string): void {
  if (store.getCompany(companyId).role !== 'host') {
    throw new DomainError('forbidden', 'Only a host company can create trips', 'companyId');
  }
}

function validateOffers(store: Store, offers: OfferInput[]): OfferInput[] {
  if (!Array.isArray(offers) || offers.length === 0) {
    throw new DomainError('validation', 'Select at least one partner', 'partners');
  }
  const seen = new Set<string>();
  return offers.map((offer) => {
    const partner = store.findCompany(offer.partnerId);
    if (!partner || partner.role !== 'partner') {
      throw new DomainError('validation', `Unknown partner: ${offer.partnerId}`, 'partners');
    }
    if (seen.has(offer.partnerId)) {
      throw new DomainError('validation', `${partner.name} is selected twice`, 'partners');
    }
    seen.add(offer.partnerId);
    return { partnerId: offer.partnerId, price: requireAmount(offer.price, `price_${offer.partnerId}`, `Offer price for ${partner.name}`) };
  });
}

/** Create and share a trip: status Requested, one open offer per partner (FR2, D2). */
export function createTrip(store: Store, hostId: string, input: NewTripInput): Trip {
  requireHost(store, hostId);
  const customerName = requireText(input.customerName, 'customerName', 'Customer name');
  const from = requireText(input.from, 'from', 'From');
  const to = requireText(input.to, 'to', 'To');
  if (!Number.isFinite(input.plannedStart)) throw new DomainError('validation', 'Planned start is required', 'plannedStart');
  if (!Number.isFinite(input.plannedEnd)) throw new DomainError('validation', 'Planned end is required', 'plannedEnd');
  if (input.plannedEnd <= input.plannedStart) {
    throw new DomainError('validation', 'Planned end must be after planned start', 'plannedEnd');
  }
  const now = getNow(store);
  if (input.plannedStart < now) {
    throw new DomainError('validation', 'Planned start cannot be before the current demo time', 'plannedStart');
  }
  const customerPrice = requireAmount(input.customerPrice, 'customerPrice', 'Customer price');
  const offers = validateOffers(store, input.offers);

  const trip: Trip = {
    id: store.nextId('trip'),
    hostId,
    customerName,
    from,
    to,
    plannedStart: input.plannedStart,
    plannedEnd: input.plannedEnd,
    customerPrice,
    status: 'Requested',
    offers: offers.map((o) => ({ partnerId: o.partnerId, price: o.price, status: 'Open' })),
    history: [{ at: now, from: null, to: 'Requested', by: hostId }],
  };
  store.state.trips.push(trip);
  return trip;
}

function requireOpenOffer(store: Store, partnerId: string, tripId: string) {
  const trip = store.getTrip(tripId);
  const offer = trip.offers.find((o) => o.partnerId === partnerId);
  if (!offer) throw new DomainError('not_found', `Trip ${tripId} was not found`, 'tripId');
  if (trip.status !== 'Requested' || offer.status !== 'Open') {
    throw new DomainError('invalid_state', 'This offer is no longer open', 'offer');
  }
  return { trip, offer };
}

/** Accept: first to accept wins, all other open offers are withdrawn (FR3.1, FR3.6, D2). */
export function acceptOffer(store: Store, partnerId: string, tripId: string): Trip {
  const { trip, offer } = requireOpenOffer(store, partnerId, tripId);
  const now = getNow(store);
  if (now >= trip.plannedStart) {
    throw new DomainError('invalid_state', 'The planned start has passed; this offer can no longer be accepted', 'offer');
  }
  offer.status = 'Accepted';
  for (const other of trip.offers) {
    if (other !== offer && other.status === 'Open') other.status = 'Withdrawn';
  }
  trip.acceptedPartnerId = partnerId;
  transition(trip, 'Accepted', now, partnerId);
  return trip;
}

/** Reject: when no open offer remains, the trip becomes Rejected (FR3.2). */
export function rejectOffer(store: Store, partnerId: string, tripId: string): Trip {
  const { trip, offer } = requireOpenOffer(store, partnerId, tripId);
  offer.status = 'Rejected';
  const allRejected = trip.offers.every((o) => o.status === 'Rejected');
  if (allRejected) transition(trip, 'Rejected', getNow(store), partnerId, 'All partners rejected');
  return trip;
}

/** Who may cancel (D6): host while Requested; host or accepting partner while Accepted. */
export function canCancel(trip: Trip, companyId: string): boolean {
  if (trip.status === 'Requested') return companyId === trip.hostId;
  if (trip.status === 'Accepted') return companyId === trip.hostId || companyId === trip.acceptedPartnerId;
  return false;
}

/** Cancel with a required reason (FR3.3, FR3.7, D6). Withdraws open offers. */
export function cancelTrip(store: Store, companyId: string, tripId: string, reason: string): Trip {
  const trip = store.getTrip(tripId);
  const trimmed = typeof reason === 'string' ? reason.trim() : '';
  if (!trimmed) throw new DomainError('validation', 'A reason is required to cancel', 'reason');
  if (trimmed.length > 500) throw new DomainError('validation', 'Reason must be at most 500 characters', 'reason');
  if (!canCancel(trip, companyId)) {
    throw new DomainError('forbidden', `This trip cannot be cancelled by you while ${trip.status}`, 'status');
  }
  transition(trip, 'Cancelled', getNow(store), companyId, trimmed);
  for (const offer of trip.offers) {
    if (offer.status === 'Open') offer.status = 'Withdrawn';
  }
  trip.cancelReason = trimmed;
  trip.cancelledBy = companyId;
  return trip;
}

/** The accepting partner marks an In progress trip complete (FR3.5, A3). */
export function markComplete(store: Store, partnerId: string, tripId: string): Trip {
  const trip = store.getTrip(tripId);
  if (trip.acceptedPartnerId !== partnerId) {
    throw new DomainError('forbidden', 'Only the accepting partner can mark a trip complete', 'companyId');
  }
  if (trip.status !== 'In progress') {
    throw new DomainError('invalid_state', `A ${trip.status} trip cannot be marked complete`, 'status');
  }
  transition(trip, 'Completed', getNow(store), partnerId, 'Marked complete by partner');
  return trip;
}

interface DueChange {
  at: number;
  order: number;
  trip: Trip;
  to: TripStatus;
}

/**
 * Move demo time forward to `target` and apply every due change in time order
 * (FR3.4, FR3.5, FR8.1, D2). An Accepted trip whose start and end both passed
 * goes Accepted -> In progress -> Completed with both entries in its history.
 */
export function advanceTime(store: Store, target: number): void {
  const now = getNow(store);
  if (!Number.isFinite(target)) throw new DomainError('validation', 'Demo time must be a valid date and time', 'time');
  if (target < now) setNow(store, target); // throws the "cannot move backward" error

  const due: DueChange[] = [];
  for (const trip of store.state.trips) {
    if (trip.status === 'Accepted' && trip.plannedStart <= target) {
      due.push({ at: trip.plannedStart, order: 0, trip, to: 'In progress' });
    }
    const willBeInProgress = trip.status === 'In progress' || (trip.status === 'Accepted' && trip.plannedStart <= target);
    if (willBeInProgress && trip.plannedEnd <= target) {
      due.push({ at: Math.max(trip.plannedEnd, trip.plannedStart), order: 1, trip, to: 'Completed' });
    }
  }
  due.sort((a, b) => a.at - b.at || a.order - b.order || a.trip.id.localeCompare(b.trip.id));
  for (const change of due) {
    // Changes are applied at their own instant, but never before the old "now".
    transition(change.trip, change.to, Math.max(change.at, now), 'system');
  }
  setNow(store, target);
}

import { describe, expect, it } from 'vitest';
import { getNow } from '../../src/domain/clock.js';
import { acceptOffer, advanceTime, cancelTrip, createTrip, markComplete, rejectOffer } from '../../src/domain/trips.js';
import { DomainError } from '../../src/domain/types.js';
import { tripActions } from '../../src/domain/views.js';
import { DAY, HOST, HOUR, P1, P2, P3, T0, fixtureStore, shareTrip, tripInput } from '../helpers.js';

function expectDomainError(fn: () => unknown, field: string): void {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).field).toBe(field);
    return;
  }
  throw new Error(`Expected a DomainError on field ${field}`);
}

describe('trip lifecycle', () => {
  it('creates and shares a trip: Requested, each partner keeps its own offer price (FR2.2, FR2.3)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store, { offers: [{ partnerId: P1, price: 7_777 }, { partnerId: P2, price: 8_800 }] });

    expect(trip.status).toBe('Requested');
    expect(trip.offers).toEqual([
      { partnerId: P1, price: 7_777, status: 'Open' },
      { partnerId: P2, price: 8_800, status: 'Open' },
    ]);
    expect(trip.history).toEqual([{ at: T0, from: null, to: 'Requested', by: HOST }]);
  });

  it('refuses create for a missing field, end not after start, or start before demo time (FR2.1, D2)', () => {
    const store = fixtureStore();
    expectDomainError(() => shareTrip(store, { customerName: '  ' }), 'customerName');
    expectDomainError(() => shareTrip(store, { to: '' }), 'to');
    expectDomainError(() => shareTrip(store, { plannedStart: Number.NaN }), 'plannedStart');
    expectDomainError(() => shareTrip(store, { customerPrice: Number.NaN }), 'customerPrice');
    expectDomainError(() => shareTrip(store, { plannedEnd: T0 + DAY }), 'plannedEnd'); // end == start
    expectDomainError(() => shareTrip(store, { plannedStart: T0 - HOUR, plannedEnd: T0 + HOUR }), 'plannedStart');
    expectDomainError(() => shareTrip(store, { offers: [] }), 'partners');
    expectDomainError(() => shareTrip(store, { offers: [{ partnerId: HOST, price: 1 }] }), 'partners');
    expectDomainError(() => createTrip(store, P1, tripInput()), 'companyId'); // a partner cannot create
    expect(store.state.trips).toHaveLength(0);
  });

  it('first to accept wins; the other offers are withdrawn and cannot respond (FR3.1, FR3.6)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);

    acceptOffer(store, P2, trip.id);

    expect(trip.status).toBe('Accepted');
    expect(trip.acceptedPartnerId).toBe(P2);
    expect(trip.offers.map((o) => o.status)).toEqual(['Withdrawn', 'Accepted', 'Withdrawn']);
    expect(() => acceptOffer(store, P1, trip.id)).toThrow(DomainError);
    expect(() => rejectOffer(store, P3, trip.id)).toThrow(DomainError);
    expect(trip.acceptedPartnerId).toBe(P2);
  });

  it('becomes Rejected only when every offered partner has rejected (FR3.2)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);

    rejectOffer(store, P1, trip.id);
    rejectOffer(store, P2, trip.id);
    expect(trip.status).toBe('Requested');
    rejectOffer(store, P3, trip.id);

    expect(trip.status).toBe('Rejected');
    expect(() => rejectOffer(store, P3, trip.id)).toThrow(DomainError);
  });

  it('cancel needs a reason; only the host may cancel while Requested; accepting partner may cancel while Accepted (FR3.3, FR3.7, D6)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);

    expectDomainError(() => cancelTrip(store, HOST, trip.id, '   '), 'reason');
    expect(trip.status).toBe('Requested');
    expect(() => cancelTrip(store, P1, trip.id, 'Not my trip yet')).toThrow(/cannot be cancelled/);

    const accepted = shareTrip(store);
    acceptOffer(store, P1, accepted.id);
    expect(() => cancelTrip(store, P2, accepted.id, 'Withdrawn partner')).toThrow(DomainError);
    cancelTrip(store, P1, accepted.id, 'Driver ill');
    expect(accepted.status).toBe('Cancelled');
    expect(accepted.cancelledBy).toBe(P1);

    cancelTrip(store, HOST, trip.id, 'Customer postponed');
    expect(trip.status).toBe('Cancelled');
    expect(trip.offers.every((o) => o.status === 'Withdrawn')).toBe(true);
    expect(trip.cancelReason).toBe('Customer postponed');
  });

  it('a time jump past start and end goes Accepted -> In progress -> Completed in order (FR3.4, FR3.5, FR8.1, D2)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    acceptOffer(store, P1, trip.id);

    advanceTime(store, trip.plannedStart + HOUR);
    expect(trip.status).toBe('In progress');

    const other = shareTrip(store, { plannedStart: T0 + 2 * DAY, plannedEnd: T0 + 2 * DAY + 4 * HOUR });
    acceptOffer(store, P3, other.id);
    advanceTime(store, T0 + 5 * DAY);

    expect(trip.status).toBe('Completed');
    expect(other.status).toBe('Completed');
    expect(other.history.map((h) => [h.from, h.to, h.by])).toEqual([
      [null, 'Requested', HOST],
      ['Requested', 'Accepted', P3],
      ['Accepted', 'In progress', 'system'],
      ['In progress', 'Completed', 'system'],
    ]);
    expect(other.history[2]?.at).toBe(other.plannedStart);
    expect(other.history[3]?.at).toBe(other.plannedEnd);
    expect(getNow(store)).toBe(T0 + 5 * DAY);
    expect(() => advanceTime(store, T0)).toThrow(/backward/);
  });

  it('lets the accepting partner mark an In progress trip complete, and nobody else (FR3.5, A3)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    acceptOffer(store, P1, trip.id);
    expect(() => markComplete(store, P1, trip.id)).toThrow(/cannot be marked complete/);

    advanceTime(store, trip.plannedStart);
    expect(() => markComplete(store, P2, trip.id)).toThrow(DomainError);
    markComplete(store, P1, trip.id);
    expect(trip.status).toBe('Completed');
  });

  it('refuses accept after planned start, and offers no status-changing action on a final status (D2, FR3.8)', () => {
    const store = fixtureStore();
    const late = shareTrip(store);
    advanceTime(store, late.plannedStart);
    expect(() => acceptOffer(store, P1, late.id)).toThrow(/planned start has passed/);
    expect(late.status).toBe('Requested');

    const rejected = shareTrip(store, { plannedStart: T0 + 3 * DAY, plannedEnd: T0 + 3 * DAY + HOUR, offers: [{ partnerId: P1, price: 1 }] });
    rejectOffer(store, P1, rejected.id);
    cancelTrip(store, HOST, late.id, 'Too late');

    for (const trip of [rejected, late]) {
      for (const company of [HOST, P1, P2, P3]) {
        expect(tripActions(store, company, trip).filter((a) => a !== 'createInvoice')).toEqual([]);
      }
      expect(() => cancelTrip(store, HOST, trip.id, 'again')).toThrow(DomainError);
      expect(() => acceptOffer(store, P1, trip.id)).toThrow(DomainError);
    }
  });
});

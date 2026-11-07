import { describe, expect, it } from 'vitest';
import { acceptOffer, advanceTime, cancelTrip, rejectOffer } from '../../src/domain/trips.js';
import { TRIP_STATUSES } from '../../src/domain/types.js';
import { canSeeTrip, isInList, openTrip, tripViewFor, tripsInList } from '../../src/domain/views.js';
import { DAY, HOST, P1, P2, P3, fixtureStore, shareTrip } from '../helpers.js';

describe('company visibility and lists', () => {
  it('P3 does not see a trip offered to P1 and P2; a withdrawn or rejecting partner loses it (FR1.3, D1, NFR1)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store, { offers: [{ partnerId: P1, price: 1 }, { partnerId: P2, price: 2 }] });

    expect(tripsInList(store, HOST, 'all').map((t) => t.id)).toEqual([trip.id]);
    expect(tripsInList(store, P1, 'all').map((t) => t.id)).toEqual([trip.id]);
    expect(tripsInList(store, P2, 'all').map((t) => t.id)).toEqual([trip.id]);
    expect(tripsInList(store, P3, 'all')).toEqual([]);
    expect(() => tripViewFor(store, P3, trip.id)).toThrow(/not found/);

    acceptOffer(store, P1, trip.id);
    expect(canSeeTrip(trip, P1)).toBe(true);
    expect(canSeeTrip(trip, P2)).toBe(false); // withdrawn
    expect(canSeeTrip(trip, HOST)).toBe(true);

    const second = shareTrip(store, { offers: [{ partnerId: P2, price: 1 }, { partnerId: P3, price: 1 }] });
    rejectOffer(store, P2, second.id);
    expect(canSeeTrip(second, P2)).toBe(false);
    expect(canSeeTrip(second, P3)).toBe(true);
  });

  it('partner view hides the customer price and other offers (FR4.2)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);

    const partnerView = tripViewFor(store, P2, trip.id);
    expect(partnerView.customerPrice).toBeUndefined();
    expect(partnerView.offers).toBeUndefined();
    expect(partnerView.myOffer).toEqual({ price: 8_800, status: 'Open' });
    expect(JSON.stringify(partnerView)).not.toContain('10000');
    expect(JSON.stringify(partnerView)).not.toContain(P1);
    expect(partnerView.actions).toEqual(['accept', 'reject']);

    const hostView = tripViewFor(store, HOST, trip.id);
    expect(hostView.customerPrice).toBe(10_000);
    expect(hostView.offers).toHaveLength(3);
    expect(hostView.actions).toEqual(['cancel']);
  });

  it('chooses Active / Closed / All from status alone (FR6.1)', () => {
    const expected: Record<string, [boolean, boolean]> = {
      Requested: [true, false],
      Accepted: [true, false],
      'In progress': [true, false],
      Completed: [false, true],
      Cancelled: [false, true],
      Rejected: [false, true],
    };
    for (const status of TRIP_STATUSES) {
      expect([isInList(status, 'active'), isInList(status, 'closed')]).toEqual(expected[status]);
      expect(isInList(status, 'all')).toBe(true);
    }

    const store = fixtureStore();
    const open = shareTrip(store);
    const closed = shareTrip(store);
    cancelTrip(store, HOST, closed.id, 'No longer needed');
    expect(tripsInList(store, HOST, 'active').map((t) => t.id)).toEqual([open.id]);
    expect(tripsInList(store, HOST, 'closed').map((t) => t.id)).toEqual([closed.id]);
  });

  it('opening a trip cancelled by the other side records that it was seen (D3)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    acceptOffer(store, P1, trip.id);
    cancelTrip(store, P1, trip.id, 'Coach unavailable');

    const view = openTrip(store, HOST, trip.id);
    expect(view.cancelReason).toBe('Coach unavailable');
    expect(view.cancelledByName).toBe('Partner One AS');
    expect(store.state.viewedCancellations).toEqual([`${HOST}:${trip.id}`]);

    openTrip(store, HOST, trip.id);
    expect(store.state.viewedCancellations).toHaveLength(1);
  });

  it('never names another partner in history shown to a partner', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    acceptOffer(store, P2, trip.id);
    advanceTime(store, trip.plannedStart + DAY);
    const view = tripViewFor(store, P2, trip.id);
    expect(view.history.map((h) => h.by)).toEqual(['Host AS', 'You', 'System (demo time)', 'System (demo time)']);
    expect(tripViewFor(store, HOST, trip.id).history[1]?.by).toBe('Partner Two AS');
  });
});

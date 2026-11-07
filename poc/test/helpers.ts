import { Store } from '../src/domain/store.js';
import { createTrip, type NewTripInput } from '../src/domain/trips.js';
import type { Trip } from '../src/domain/types.js';

/** Shared test fixture: one host and three partners on a fresh in-memory store. */

export const T0 = Date.UTC(2026, 9, 5, 8, 0); // 2026-10-05 08:00 UTC
export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
export const HOST = 'host';
export const P1 = 'p1';
export const P2 = 'p2';
export const P3 = 'p3';

export function fixtureStore(): Store {
  return new Store({
    initialTime: T0,
    seeder: (store) => {
      store.addCompany({ id: HOST, name: 'Host AS', role: 'host' });
      store.addCompany({ id: P1, name: 'Partner One AS', role: 'partner', rate: 0.85 });
      store.addCompany({ id: P2, name: 'Partner Two AS', role: 'partner', rate: 0.88 });
      store.addCompany({ id: P3, name: 'Partner Three AS', role: 'partner', rate: 0.82 });
    },
  });
}

export function tripInput(overrides: Partial<NewTripInput> = {}): NewTripInput {
  return {
    customerName: 'Test Customer',
    from: 'Oslo',
    to: 'Bergen',
    plannedStart: T0 + DAY,
    plannedEnd: T0 + DAY + 8 * HOUR,
    customerPrice: 10_000,
    offers: [
      { partnerId: P1, price: 8_500 },
      { partnerId: P2, price: 8_800 },
      { partnerId: P3, price: 8_200 },
    ],
    ...overrides,
  };
}

export function shareTrip(store: Store, overrides: Partial<NewTripInput> = {}): Trip {
  return createTrip(store, HOST, tripInput(overrides));
}

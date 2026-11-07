import { describe, expect, it } from 'vitest';
import { runTabCheck } from '../../src/domain/tabCheck.js';
import { INVOICE_STATUSES, TRIP_STATUSES, type TripStatus } from '../../src/domain/types.js';
import { createSeededStore, DEMO_START, HOST_ID, P1, P2, P3 } from '../../src/seed.js';
import { getNow } from '../../src/domain/clock.js';
import { tripsInList } from '../../src/domain/views.js';

describe('seed data and tab-placement check', () => {
  it('seeds 1 host and 3 partners, trips in all six statuses and invoices in all four (FR1.1, FR6.3, A4)', () => {
    const store = createSeededStore();
    const companies = store.state.companies;
    expect(companies).toHaveLength(4);
    expect(companies.filter((c) => c.role === 'host').map((c) => c.id)).toEqual([HOST_ID]);
    expect(companies.filter((c) => c.role === 'partner').map((c) => c.id)).toEqual([P1, P2, P3]);

    const statuses = new Set(store.state.trips.map((t) => t.status));
    for (const status of TRIP_STATUSES) expect(statuses.has(status)).toBe(true);
    const invoiceStatuses = new Set(store.state.invoices.map((i) => i.status));
    for (const status of INVOICE_STATUSES) expect(invoiceStatuses.has(status)).toBe(true);

    // A4: every seeded trip started as Requested and reached its status by the rules.
    for (const trip of store.state.trips) expect(trip.history[0]).toMatchObject({ from: null, to: 'Requested' });
    expect(getNow(store)).toBe(DEMO_START);
  });

  it('passes for every company on seeded data and covers all six statuses (FR6.2, NFR3)', () => {
    const store = createSeededStore();
    const result = runTabCheck(store);
    expect(result.violations).toEqual([]);
    expect(result.passed).toBe(true);
    expect(result.statusesMissing).toEqual([]);
    expect(result.checkedPairs).toBeGreaterThanOrEqual(store.state.trips.length);
    // Every company sees at least one trip, so the check is not vacuous for anyone.
    for (const company of store.state.companies) expect(tripsInList(store, company.id, 'all').length).toBeGreaterThan(0);
  });

  it('reports a violation for a deliberately broken trip status', () => {
    const store = createSeededStore();
    const broken = store.state.trips[0]!;
    broken.status = 'Archived' as TripStatus; // not a valid status: in neither Active nor Closed
    const result = runTabCheck(store);
    expect(result.passed).toBe(false);
    expect(result.violations).toContainEqual({
      companyId: HOST_ID,
      tripId: broken.id,
      status: 'Archived',
      inActive: false,
      inClosed: false,
      inAll: true,
    });
  });

  it('reset restores exactly the initial seed after changes (FR8.2)', () => {
    const store = createSeededStore();
    const initial = store.snapshot();
    store.state.trips.pop();
    store.state.now += 1;
    store.reset();
    expect(store.snapshot()).toEqual(initial);
  });
});

import { describe, expect, it } from 'vitest';
import { keyFigures, needsAction } from '../../src/domain/dashboard.js';
import { approveInvoice, createInvoice, declineInvoice, submitInvoice, totalsOf } from '../../src/domain/invoices.js';
import { acceptOffer, advanceTime, cancelTrip, rejectOffer } from '../../src/domain/trips.js';
import { openTrip, tripsInList, visibleInvoices } from '../../src/domain/views.js';
import { getNow } from '../../src/domain/clock.js';
import { DAY, HOST, P1, P2, P3, fixtureStore, shareTrip } from '../helpers.js';
import { createSeededStore, HOST_ID, SEED_COMPANIES } from '../../src/seed.js';

describe('dashboard', () => {
  it('key figures equal list-derived counts and sums for host and every partner (FR7.1, D5)', () => {
    const store = createSeededStore();
    for (const company of SEED_COMPANIES) {
      const figures = keyFigures(store, company.id);
      const active = tripsInList(store, company.id, 'active');
      const pending = visibleInvoices(store, company.id).filter((i) => i.status === 'Pending');
      const expectedAwaiting =
        company.id === HOST_ID
          ? active.filter((t) => t.status === 'Requested').length
          : active.filter((t) => t.offers.some((o) => o.partnerId === company.id && o.status === 'Open')).length;

      expect(figures.activeTrips).toBe(active.length);
      expect(figures.awaitingResponse).toBe(expectedAwaiting);
      expect(figures.openInvoices.count).toBe(pending.length);
      expect(figures.openInvoices.totalInclVat).toBeCloseTo(pending.reduce((s, i) => s + totalsOf(i).total, 0), 2);
    }
    // Spot-check the seed: the host has two Requested trips and one Pending invoice.
    expect(keyFigures(store, HOST_ID).awaitingResponse).toBe(2);
    expect(keyFigures(store, HOST_ID).openInvoices.count).toBe(1);
  });

  it('updates awaiting-response right after a partner accepts (FR7.3)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    expect(keyFigures(store, HOST).awaitingResponse).toBe(1);
    expect(keyFigures(store, P1).awaitingResponse).toBe(1);

    acceptOffer(store, P1, trip.id);

    expect(keyFigures(store, HOST).awaitingResponse).toBe(0);
    expect(keyFigures(store, P2).awaitingResponse).toBe(0);
    expect(keyFigures(store, HOST).activeTrips).toBe(1);
    expect(keyFigures(store, P2).activeTrips).toBe(0);
  });

  it('needs-your-action items appear and clear after acting or opening (FR7.2, D3)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    const kinds = (company: string) => needsAction(store, company).map((i) => i.kind);

    expect(needsAction(store, P1)).toEqual([expect.objectContaining({ kind: 'respond-offer', target: { type: 'trip', id: trip.id } })]);
    rejectOffer(store, P3, trip.id);
    expect(kinds(P3)).toEqual([]);
    acceptOffer(store, P1, trip.id);
    expect(kinds(P1)).toEqual([]);
    expect(kinds(P2)).toEqual([]);

    advanceTime(store, trip.plannedEnd + DAY);
    expect(kinds(P1)).toEqual(['create-invoice']);
    const invoice = createInvoice(store, P1, trip.id);
    expect(kinds(P1)).toEqual([]);

    submitInvoice(store, P1, invoice.id);
    expect(needsAction(store, HOST)).toEqual([expect.objectContaining({ kind: 'approve-invoice', target: { type: 'invoice', id: invoice.id } })]);
    declineInvoice(store, HOST, invoice.id, 'Missing toll receipts');
    expect(kinds(HOST)).toEqual([]);
    expect(kinds(P1)).toEqual(['fix-invoice']);
    submitInvoice(store, P1, invoice.id);
    expect(kinds(P1)).toEqual([]);
    approveInvoice(store, HOST, invoice.id);
    expect(kinds(HOST)).toEqual([]);

    // Cancelled by the other side: shows for the host until it opens the trip.
    const later = getNow(store) + DAY;
    const second = shareTrip(store, { plannedStart: later, plannedEnd: later + DAY });
    acceptOffer(store, P2, second.id);
    cancelTrip(store, P2, second.id, 'Coach unavailable');
    expect(kinds(HOST)).toEqual(['cancelled']);
    expect(kinds(P2)).toEqual([]); // P2 cancelled it itself
    openTrip(store, HOST, second.id);
    expect(kinds(HOST)).toEqual([]);
  });

  it('shows the partner a host cancellation of an Accepted trip, until opened', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    acceptOffer(store, P3, trip.id);
    cancelTrip(store, HOST, trip.id, 'Customer cancelled');
    expect(needsAction(store, P3).map((i) => i.kind)).toEqual(['cancelled']);
    expect(needsAction(store, HOST)).toEqual([]);
    openTrip(store, P3, trip.id);
    expect(needsAction(store, P3)).toEqual([]);
  });

  it('refuses figures for an unknown company', () => {
    const store = fixtureStore();
    expect(() => keyFigures(store, 'nobody')).toThrow(/Unknown company/);
    expect(() => needsAction(store, 'nobody')).toThrow(/Unknown company/);
  });
});

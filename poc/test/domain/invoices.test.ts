import { describe, expect, it } from 'vitest';
import {
  addLine,
  approveInvoice,
  createInvoice,
  declineInvoice,
  getVisibleInvoice,
  invoiceActions,
  removeLine,
  submitInvoice,
  totalsOf,
  updateLine,
} from '../../src/domain/invoices.js';
import { acceptOffer, advanceTime } from '../../src/domain/trips.js';
import { DomainError, type Trip } from '../../src/domain/types.js';
import { tripActions, visibleInvoices } from '../../src/domain/views.js';
import { DAY, HOST, P1, P2, P3, fixtureStore, shareTrip } from '../helpers.js';
import type { Store } from '../../src/domain/store.js';

function completedTrip(store: Store, partnerId = P1): Trip {
  const trip = shareTrip(store);
  acceptOffer(store, partnerId, trip.id);
  advanceTime(store, trip.plannedEnd + DAY);
  return trip;
}

describe('invoices', () => {
  it('only the accepting partner invoices a Completed trip, once per trip (FR5.1, D4, A2)', () => {
    const store = fixtureStore();
    const trip = shareTrip(store);
    acceptOffer(store, P1, trip.id);
    expect(tripActions(store, P1, trip)).not.toContain('createInvoice');
    expect(() => createInvoice(store, P1, trip.id)).toThrow(/Completed/);

    advanceTime(store, trip.plannedEnd);
    expect(tripActions(store, P1, trip)).toContain('createInvoice');
    expect(tripActions(store, HOST, trip)).not.toContain('createInvoice');
    expect(() => createInvoice(store, P2, trip.id)).toThrow(/accepting partner/);

    const invoice = createInvoice(store, P1, trip.id);
    expect(invoice.status).toBe('Draft');
    expect(invoice.lines).toHaveLength(1);
    expect(invoice.lines[0]).toMatchObject({ quantity: 1, unitPrice: 8_500, vatRate: 0.25 });
    expect(totalsOf(invoice)).toEqual({ net: 8_500, vat: 2_125, total: 10_625 });

    expect(tripActions(store, P1, trip)).not.toContain('createInvoice');
    expect(() => createInvoice(store, P1, trip.id)).toThrow(/already has an invoice/);
  });

  it('Draft -> Pending -> Approved locks the amounts; no edit afterwards (FR5.2, FR5.3, FR5.5, D7)', () => {
    const store = fixtureStore();
    const trip = completedTrip(store);
    const invoice = createInvoice(store, P1, trip.id);

    expect(invoiceActions(invoice, P1)).toEqual(['edit', 'submit']);
    expect(invoiceActions(invoice, HOST)).toEqual([]);
    expect(() => approveInvoice(store, HOST, invoice.id)).toThrow(DomainError);

    addLine(store, P1, invoice.id, { description: 'Ferry', quantity: 2, unitPrice: 412.4, vatRate: 0.12 });
    expect(() => addLine(store, P1, invoice.id, { description: '', quantity: 1, unitPrice: 1, vatRate: 0.25 })).toThrow(/Description/);
    expect(() => addLine(store, P1, invoice.id, { description: 'X', quantity: 0, unitPrice: 1, vatRate: 0.25 })).toThrow(/Quantity/);
    expect(() => addLine(store, P2, invoice.id, { description: 'X', quantity: 1, unitPrice: 1, vatRate: 0.25 })).toThrow(/not found/);

    submitInvoice(store, P1, invoice.id);
    expect(invoice.status).toBe('Pending');
    expect(invoiceActions(invoice, P1)).toEqual([]);
    expect(invoiceActions(invoice, HOST)).toEqual(['approve', 'decline']);

    approveInvoice(store, HOST, invoice.id);
    const locked = { net: 9_324.8, vat: 2_223.98, total: 11_548.78 };
    expect(invoice.status).toBe('Approved');
    expect(totalsOf(invoice)).toEqual(locked);
    expect(invoiceActions(invoice, P1)).toEqual([]);
    expect(invoiceActions(invoice, HOST)).toEqual([]);
    expect(() => addLine(store, P1, invoice.id, { description: 'Late', quantity: 1, unitPrice: 1, vatRate: 0 })).toThrow(DomainError);
    expect(() => submitInvoice(store, P1, invoice.id)).toThrow(DomainError);

    // A later offer price change does not move the approved totals.
    trip.offers[0]!.price = 99_999;
    expect(totalsOf(invoice)).toEqual(locked);
  });

  it('decline needs a reason; the partner edits and resubmits in place, back to Pending (FR5.4, D4)', () => {
    const store = fixtureStore();
    const trip = completedTrip(store, P3);
    const invoice = createInvoice(store, P3, trip.id);
    submitInvoice(store, P3, invoice.id);

    expect(() => declineInvoice(store, HOST, invoice.id, '  ')).toThrow(/reason/);
    expect(invoice.status).toBe('Pending');
    expect(() => declineInvoice(store, P3, invoice.id, 'self-decline')).toThrow(DomainError);

    declineInvoice(store, HOST, invoice.id, 'Wrong VAT on the first line');
    expect(invoice.status).toBe('Declined');
    expect(invoice.declineReason).toBe('Wrong VAT on the first line');
    expect(invoiceActions(invoice, P3)).toEqual(['edit', 'submit']);
    expect(() => createInvoice(store, P3, trip.id)).toThrow(/already has an invoice/);

    const firstLine = invoice.lines[0]!;
    updateLine(store, P3, invoice.id, firstLine.id, { description: firstLine.description, quantity: 1, unitPrice: 8_000, vatRate: 0.12 });
    const extra = addLine(store, P3, invoice.id, { description: 'Parking', quantity: 1, unitPrice: 100, vatRate: 0.25 });
    removeLine(store, P3, invoice.id, extra.id);
    expect(() => removeLine(store, P3, invoice.id, firstLine.id)).toThrow(/at least one line/);

    submitInvoice(store, P3, invoice.id);
    expect(invoice.status).toBe('Pending');
    expect(invoice.declineReason).toBeUndefined();
    expect(store.state.invoices).toHaveLength(1);
    expect(totalsOf(invoice)).toEqual({ net: 8_000, vat: 960, total: 8_960 });
  });

  it('hides an invoice between the host and P1 from P2 and P3 (FR1.3, NFR1)', () => {
    const store = fixtureStore();
    const trip = completedTrip(store, P1);
    const invoice = createInvoice(store, P1, trip.id);
    expect(visibleInvoices(store, HOST)).toHaveLength(1);
    expect(visibleInvoices(store, P1)).toHaveLength(1);
    expect(visibleInvoices(store, P2)).toEqual([]);
    expect(visibleInvoices(store, P3)).toEqual([]);
    expect(() => getVisibleInvoice(store, P2, invoice.id)).toThrow(/not found/);
  });
});

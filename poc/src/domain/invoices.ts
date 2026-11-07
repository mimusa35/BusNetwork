import { getNow } from './clock.js';
import { DEFAULT_VAT_RATE, invoiceTotals, round2 } from './money.js';
import type { Store } from './store.js';
import { canSeeInvoice } from './views.js';
import { DomainError, type Invoice, type InvoiceLine, type Totals } from './types.js';

/**
 * Invoicing a completed trip (FR5; decisions D4, D5, D7).
 *
 *   Draft    --partner submits--> Pending
 *   Pending  --host approves----> Approved (amounts locked)
 *   Pending  --host declines----> Declined (reason required)
 *   Declined --partner edits and resubmits in place--> Pending
 */

export interface LineInput {
  description: string;
  quantity: number;
  unitPrice: number;
  /** VAT rate as a fraction, e.g. 0.25. */
  vatRate: number;
}

export type InvoiceAction = 'edit' | 'submit' | 'approve' | 'decline';

const MAX_VAT_RATE = 1;

function validateLine(input: LineInput): Omit<InvoiceLine, 'id'> {
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  if (!description) throw new DomainError('validation', 'Description is required', 'description');
  if (description.length > 200) throw new DomainError('validation', 'Description must be at most 200 characters', 'description');
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new DomainError('validation', 'Quantity must be a number greater than 0', 'quantity');
  }
  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0) {
    throw new DomainError('validation', 'Unit price must be a number of 0 or more', 'unitPrice');
  }
  if (!Number.isFinite(input.vatRate) || input.vatRate < 0 || input.vatRate > MAX_VAT_RATE) {
    throw new DomainError('validation', 'VAT rate must be between 0 % and 100 %', 'vatRate');
  }
  return {
    description,
    quantity: input.quantity,
    unitPrice: round2(input.unitPrice),
    vatRate: input.vatRate,
  };
}

/** Totals of an invoice; an Approved invoice always returns its frozen totals (FR5.5, D7). */
export function totalsOf(invoice: Invoice): Totals {
  return invoice.approvedTotals ? { ...invoice.approvedTotals } : invoiceTotals(invoice.lines);
}

/** Actions the company is offered on an invoice (FR5.3, D7). */
export function invoiceActions(invoice: Invoice, companyId: string): InvoiceAction[] {
  if (companyId === invoice.partnerId && (invoice.status === 'Draft' || invoice.status === 'Declined')) {
    return ['edit', 'submit'];
  }
  if (companyId === invoice.hostId && invoice.status === 'Pending') return ['approve', 'decline'];
  return [];
}

/** Get an invoice the company may see; otherwise not_found (FR1.3, NFR1). */
export function getVisibleInvoice(store: Store, companyId: string, invoiceId: string): Invoice {
  const invoice = store.getInvoice(invoiceId);
  if (!canSeeInvoice(invoice, companyId)) {
    throw new DomainError('not_found', `Invoice ${invoiceId} was not found`, 'invoiceId');
  }
  return invoice;
}

function requireAction(store: Store, companyId: string, invoiceId: string, action: InvoiceAction): Invoice {
  const invoice = getVisibleInvoice(store, companyId, invoiceId);
  if (!invoiceActions(invoice, companyId).includes(action)) {
    throw new DomainError('invalid_state', `You cannot ${action} a ${invoice.status} invoice`, 'status');
  }
  return invoice;
}

/**
 * Create an invoice for a Completed trip, by its accepting partner, with one
 * line for the agreed offer price at 25 % VAT (FR5.1, FR5.2, A2). At most one
 * invoice per trip; a Declined one is fixed in place (D4).
 */
export function createInvoice(store: Store, partnerId: string, tripId: string): Invoice {
  const trip = store.getTrip(tripId);
  if (trip.acceptedPartnerId !== partnerId) {
    throw new DomainError('forbidden', 'Only the accepting partner can invoice this trip', 'companyId');
  }
  if (trip.status !== 'Completed') {
    throw new DomainError('invalid_state', 'An invoice can only be created for a Completed trip', 'status');
  }
  if (store.findInvoiceForTrip(trip.id)) {
    throw new DomainError('invalid_state', 'This trip already has an invoice', 'tripId');
  }
  const offer = trip.offers.find((o) => o.partnerId === partnerId);
  if (!offer) throw new DomainError('invalid_state', 'The accepted offer is missing', 'offer');

  const invoice: Invoice = {
    id: store.nextId('inv'),
    tripId: trip.id,
    partnerId,
    hostId: trip.hostId,
    status: 'Draft',
    createdAt: getNow(store),
    lines: [
      {
        id: store.nextId('line'),
        description: `Trip ${trip.from} - ${trip.to} (${trip.customerName})`,
        quantity: 1,
        unitPrice: offer.price,
        vatRate: DEFAULT_VAT_RATE,
      },
    ],
  };
  store.state.invoices.push(invoice);
  return invoice;
}

export function addLine(store: Store, partnerId: string, invoiceId: string, input: LineInput): InvoiceLine {
  const invoice = requireAction(store, partnerId, invoiceId, 'edit');
  const line: InvoiceLine = { id: store.nextId('line'), ...validateLine(input) };
  invoice.lines.push(line);
  return line;
}

export function updateLine(store: Store, partnerId: string, invoiceId: string, lineId: string, input: LineInput): InvoiceLine {
  const invoice = requireAction(store, partnerId, invoiceId, 'edit');
  const line = invoice.lines.find((l) => l.id === lineId);
  if (!line) throw new DomainError('not_found', `Line ${lineId} was not found`, 'lineId');
  Object.assign(line, validateLine(input));
  return line;
}

export function removeLine(store: Store, partnerId: string, invoiceId: string, lineId: string): void {
  const invoice = requireAction(store, partnerId, invoiceId, 'edit');
  const index = invoice.lines.findIndex((l) => l.id === lineId);
  if (index < 0) throw new DomainError('not_found', `Line ${lineId} was not found`, 'lineId');
  if (invoice.lines.length === 1) throw new DomainError('validation', 'An invoice needs at least one line', 'lineId');
  invoice.lines.splice(index, 1);
}

/** Submit a Draft, or resubmit a Declined invoice in place (FR5.3, FR5.4, D4). */
export function submitInvoice(store: Store, partnerId: string, invoiceId: string): Invoice {
  const invoice = requireAction(store, partnerId, invoiceId, 'submit');
  if (invoice.lines.length === 0) throw new DomainError('validation', 'An invoice needs at least one line', 'lines');
  invoice.status = 'Pending';
  delete invoice.declineReason;
  return invoice;
}

/** Approve and lock the amounts (FR5.3, FR5.5, D7). */
export function approveInvoice(store: Store, hostId: string, invoiceId: string): Invoice {
  const invoice = requireAction(store, hostId, invoiceId, 'approve');
  invoice.approvedTotals = invoiceTotals(invoice.lines);
  invoice.status = 'Approved';
  return invoice;
}

/** Decline with a required reason (FR5.4). */
export function declineInvoice(store: Store, hostId: string, invoiceId: string, reason: string): Invoice {
  const trimmed = typeof reason === 'string' ? reason.trim() : '';
  if (!trimmed) throw new DomainError('validation', 'A reason is required to decline', 'reason');
  if (trimmed.length > 500) throw new DomainError('validation', 'Reason must be at most 500 characters', 'reason');
  const invoice = requireAction(store, hostId, invoiceId, 'decline');
  invoice.status = 'Declined';
  invoice.declineReason = trimmed;
  return invoice;
}

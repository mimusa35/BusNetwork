/**
 * Domain types for the BusNetwork portal POC.
 *
 * All times are demo-time instants in milliseconds since the Unix epoch and
 * are displayed in UTC. All amounts are NOK with 2 decimals (assumption A2).
 * Offer prices are excluding VAT (decision D5).
 */

export type CompanyRole = 'host' | 'partner';

export interface Company {
  id: string;
  name: string;
  role: CompanyRole;
  /** Partner agreement percentage as a fraction, e.g. 0.85 = 85 % of the customer price (A1). */
  rate?: number;
}

/** The six trip statuses (BRD §7). */
export const TRIP_STATUSES = [
  'Requested',
  'Accepted',
  'In progress',
  'Completed',
  'Cancelled',
  'Rejected',
] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export const ACTIVE_STATUSES: readonly TripStatus[] = ['Requested', 'Accepted', 'In progress'];
export const CLOSED_STATUSES: readonly TripStatus[] = ['Completed', 'Cancelled', 'Rejected'];

export type OfferStatus = 'Open' | 'Accepted' | 'Rejected' | 'Withdrawn';

export interface Offer {
  partnerId: string;
  /** Offer price excl. VAT. */
  price: number;
  status: OfferStatus;
}

/** Who caused a history entry: a company id, or the system (time-driven change). */
export type Actor = string | 'system';

export interface HistoryEntry {
  at: number;
  from: TripStatus | null;
  to: TripStatus;
  by: Actor;
  note?: string;
}

export interface Trip {
  id: string;
  hostId: string;
  customerName: string;
  from: string;
  to: string;
  plannedStart: number;
  plannedEnd: number;
  /** Customer price excl. VAT; never shown to partners (FR4.2). */
  customerPrice: number;
  status: TripStatus;
  offers: Offer[];
  acceptedPartnerId?: string;
  cancelReason?: string;
  cancelledBy?: string;
  history: HistoryEntry[];
}

export const INVOICE_STATUSES = ['Draft', 'Pending', 'Approved', 'Declined'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  /** Unit price excl. VAT. */
  unitPrice: number;
  /** VAT rate as a fraction, e.g. 0.25. */
  vatRate: number;
}

export interface Totals {
  net: number;
  vat: number;
  total: number;
}

export interface Invoice {
  id: string;
  tripId: string;
  partnerId: string;
  hostId: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  createdAt: number;
  declineReason?: string;
  /** Totals frozen at approval (FR5.5, D7). */
  approvedTotals?: Totals;
}

export type DomainErrorCode = 'validation' | 'not_found' | 'forbidden' | 'invalid_state';

/**
 * An expected, user-facing failure: bad input, a refused action, or a record
 * the current company may not see. The web layer shows the message to the user.
 */
export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly field?: string;

  constructor(code: DomainErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.field = field;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

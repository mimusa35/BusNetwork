import { HOUR_MS, getNow } from './domain/clock.js';
import { addLine, approveInvoice, createInvoice, declineInvoice, submitInvoice } from './domain/invoices.js';
import { defaultOfferPrice } from './domain/money.js';
import { Store } from './domain/store.js';
import { acceptOffer, advanceTime, cancelTrip, createTrip, markComplete, rejectOffer } from './domain/trips.js';
import type { Company, Trip } from './domain/types.js';

/**
 * Demo seed (FR1.1, FR6.3, assumption A4).
 *
 * One host and three partners, then a scripted history that drives the real
 * domain actions, so every status is produced by the rules rather than set by
 * hand. Afterwards there is at least one trip in each of the six statuses and
 * invoices in Draft, Pending, Approved and Declined.
 */

/** Demo time when the scripted history starts. */
export const SEED_START = Date.UTC(2026, 9, 1, 8, 0); // 2026-10-01 08:00 UTC
/** Demo time when the seeded demo begins (after the scripted history). */
export const DEMO_START = Date.UTC(2026, 9, 5, 8, 0); // 2026-10-05 08:00 UTC

export const HOST_ID = 'nordic-coaches';
export const P1 = 'fjord-bus';
export const P2 = 'vestland-turbuss';
export const P3 = 'trondelag-charter';

export const SEED_COMPANIES: readonly Company[] = [
  { id: HOST_ID, name: 'Nordic Coaches AS', role: 'host' },
  { id: P1, name: 'Fjord Bus AS', role: 'partner', rate: 0.85 },
  { id: P2, name: 'Vestland Turbuss AS', role: 'partner', rate: 0.88 },
  { id: P3, name: 'Trondelag Charter AS', role: 'partner', rate: 0.82 },
];

const at = (day: number, hour: number) => Date.UTC(2026, 9, day, hour, 0);

interface TripSpec {
  customerName: string;
  from: string;
  to: string;
  start: number;
  end: number;
  customerPrice: number;
  partners: string[];
  /** Optional price overrides per partner (the host edited the default, FR2.2). */
  priceOverrides?: Record<string, number>;
}

function share(store: Store, spec: TripSpec): Trip {
  return createTrip(store, HOST_ID, {
    customerName: spec.customerName,
    from: spec.from,
    to: spec.to,
    plannedStart: spec.start,
    plannedEnd: spec.end,
    customerPrice: spec.customerPrice,
    offers: spec.partners.map((partnerId) => ({
      partnerId,
      price: spec.priceOverrides?.[partnerId] ?? defaultOfferPrice(spec.customerPrice, store.getCompany(partnerId).rate ?? 1),
    })),
  });
}

export function seedDemo(store: Store): void {
  for (const company of SEED_COMPANIES) store.addCompany({ ...company });
  if (getNow(store) !== SEED_START) throw new Error('The demo seed must start at SEED_START');

  // --- Day 1 (2026-10-01 08:00): share trips and respond -------------------
  const approvedTrip = share(store, { customerName: 'Oslo Choir Society', from: 'Oslo', to: 'Lillehammer', start: at(2, 8), end: at(2, 16), customerPrice: 18_000, partners: [P1, P2] });
  acceptOffer(store, P1, approvedTrip.id);

  const pendingTrip = share(store, { customerName: 'Voss Ski Club', from: 'Bergen', to: 'Voss', start: at(3, 9), end: at(3, 15), customerPrice: 9_500, partners: [P2, P3], priceOverrides: { [P3]: 7_900 } });
  acceptOffer(store, P2, pendingTrip.id);

  const declinedTrip = share(store, { customerName: 'Roros Heritage Tours', from: 'Trondheim', to: 'Roros', start: at(3, 10), end: at(3, 18), customerPrice: 14_200, partners: [P3] });
  acceptOffer(store, P3, declinedTrip.id);

  const draftTrip = share(store, { customerName: 'Airport Shuttle Group', from: 'Oslo', to: 'Gardermoen', start: at(4, 7), end: at(4, 12), customerPrice: 6_800, partners: [P1, P3] });
  acceptOffer(store, P1, draftTrip.id);

  const manualCompleteTrip = share(store, { customerName: 'Stavanger School', from: 'Stavanger', to: 'Preikestolen', start: at(4, 13), end: at(4, 20), customerPrice: 7_400, partners: [P2] });
  acceptOffer(store, P2, manualCompleteTrip.id);

  const inProgressTrip = share(store, { customerName: 'Drammen Conference', from: 'Oslo', to: 'Drammen', start: at(5, 6), end: at(5, 18), customerPrice: 5_600, partners: [P1, P2, P3] });
  acceptOffer(store, P1, inProgressTrip.id);

  const hostCancelledTrip = share(store, { customerName: 'Flam Railway Tour', from: 'Bergen', to: 'Flam', start: at(9, 8), end: at(9, 19), customerPrice: 11_000, partners: [P1, P2] });
  cancelTrip(store, HOST_ID, hostCancelledTrip.id, 'Customer postponed the event');

  const partnerCancelledTrip = share(store, { customerName: 'Arctic Expeditions', from: 'Tromso', to: 'Alta', start: at(10, 7), end: at(10, 17), customerPrice: 16_500, partners: [P3] });
  acceptOffer(store, P3, partnerCancelledTrip.id);
  cancelTrip(store, P3, partnerCancelledTrip.id, 'Vehicle breakdown, no replacement coach available');

  const rejectedTrip = share(store, { customerName: 'Sorlandet Festival', from: 'Kristiansand', to: 'Arendal', start: at(8, 10), end: at(8, 22), customerPrice: 8_200, partners: [P2, P3] });
  rejectOffer(store, P2, rejectedTrip.id);
  rejectOffer(store, P3, rejectedTrip.id);

  // --- 2026-10-04 15:00: trips started and ended; partner marks one complete
  advanceTime(store, at(4, 15));
  markComplete(store, P2, manualCompleteTrip.id);

  // Invoices in all four statuses.
  const approved = createInvoice(store, P1, approvedTrip.id);
  addLine(store, P1, approved.id, { description: 'Road tolls', quantity: 4, unitPrice: 187.5, vatRate: 0.25 });
  submitInvoice(store, P1, approved.id);
  approveInvoice(store, HOST_ID, approved.id);

  const pending = createInvoice(store, P2, pendingTrip.id);
  submitInvoice(store, P2, pending.id);

  const declined = createInvoice(store, P3, declinedTrip.id);
  submitInvoice(store, P3, declined.id);
  declineInvoice(store, HOST_ID, declined.id, 'Please add the ferry ticket as a separate line');

  createInvoice(store, P1, draftTrip.id); // left in Draft

  // --- 2026-10-05 08:00: demo starts; new open trips ------------------------
  advanceTime(store, DEMO_START);

  share(store, { customerName: 'Hamar Business Forum', from: 'Oslo', to: 'Hamar', start: at(7, 9), end: at(7, 17), customerPrice: 10_400, partners: [P1, P2, P3] });

  const partlyRejected = share(store, { customerName: 'Geilo Corporate Retreat', from: 'Bergen', to: 'Geilo', start: at(12, 8), end: at(12, 18), customerPrice: 13_900, partners: [P1, P3] });
  rejectOffer(store, P3, partlyRejected.id);

  const accepted = share(store, { customerName: 'Geiranger Cruise Transfer', from: 'Alesund', to: 'Geiranger', start: at(8, 7), end: at(8, 7) + 9 * HOUR_MS, customerPrice: 12_600, partners: [P1, P2] });
  acceptOffer(store, P2, accepted.id);
}

/** A store holding the demo seed; `reset()` restores exactly this state (FR8.2). */
export function createSeededStore(): Store {
  return new Store({ initialTime: SEED_START, seeder: seedDemo });
}

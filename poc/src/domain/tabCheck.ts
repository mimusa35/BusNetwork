import type { Store } from './store.js';
import { TRIP_STATUSES, type TripStatus } from './types.js';
import { tripsInList, visibleTrips } from './views.js';

/**
 * Automated tab-placement check (FR6.2, NFR3, decision D1).
 *
 * For every company and every trip that company can see: the trip must be in
 * exactly one of Active / Closed, and always in All.
 */

export interface TabViolation {
  companyId: string;
  tripId: string;
  status: string;
  inActive: boolean;
  inClosed: boolean;
  inAll: boolean;
}

export interface TabCheckResult {
  passed: boolean;
  /** Number of (company, trip) pairs checked. */
  checkedPairs: number;
  /** Distinct trip statuses seen across all checked pairs. */
  statusesCovered: TripStatus[];
  /** Statuses with no trip at all, so the check could not cover them. */
  statusesMissing: TripStatus[];
  violations: TabViolation[];
}

export function runTabCheck(store: Store): TabCheckResult {
  const violations: TabViolation[] = [];
  const covered = new Set<string>();
  let checkedPairs = 0;

  for (const company of store.state.companies) {
    const ids = (list: 'active' | 'closed' | 'all') => new Set(tripsInList(store, company.id, list).map((t) => t.id));
    const active = ids('active');
    const closed = ids('closed');
    const all = ids('all');
    for (const trip of visibleTrips(store, company.id)) {
      checkedPairs += 1;
      covered.add(trip.status);
      const inActive = active.has(trip.id);
      const inClosed = closed.has(trip.id);
      const inAll = all.has(trip.id);
      if (inActive === inClosed || !inAll) {
        violations.push({ companyId: company.id, tripId: trip.id, status: trip.status, inActive, inClosed, inAll });
      }
    }
  }

  return {
    passed: violations.length === 0,
    checkedPairs,
    statusesCovered: TRIP_STATUSES.filter((s) => covered.has(s)),
    statusesMissing: TRIP_STATUSES.filter((s) => !covered.has(s)),
    violations,
  };
}

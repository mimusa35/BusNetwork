import type { Store } from './store.js';
import { DomainError } from './types.js';

/**
 * Demo clock (FR8). Demo time lives in the store, so reset restores it, and it
 * only ever moves forward (FR8.2). Moving time *and* applying the due trip
 * changes is done by `advanceTime` in trips.ts; this module only guards the
 * value itself.
 */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export function getNow(store: Store): number {
  return store.state.now;
}

/** Set demo time. Refuses to move backward or to an invalid instant. */
export function setNow(store: Store, time: number): void {
  if (!Number.isFinite(time)) {
    throw new DomainError('validation', 'Demo time must be a valid date and time', 'time');
  }
  if (time < store.state.now) {
    throw new DomainError(
      'validation',
      `Demo time cannot move backward (current ${formatDemoTime(store.state.now)})`,
      'time',
    );
  }
  store.state.now = time;
}

const DEMO_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/;

/**
 * Parse "YYYY-MM-DDTHH:mm" (the HTML datetime-local format) as UTC.
 * Returns NaN for anything else, including impossible dates like 2026-02-31.
 */
export function parseDemoTime(text: string): number {
  const match = DEMO_TIME_PATTERN.exec(text.trim());
  if (!match) return Number.NaN;
  const [, y, mo, d, h, mi] = match.map(Number) as [number, number, number, number, number, number];
  const ms = Date.UTC(y, mo - 1, d, h, mi);
  const check = new Date(ms);
  const isRealDate =
    check.getUTCFullYear() === y &&
    check.getUTCMonth() === mo - 1 &&
    check.getUTCDate() === d &&
    check.getUTCHours() === h &&
    check.getUTCMinutes() === mi;
  return isRealDate ? ms : Number.NaN;
}

/** Format as "YYYY-MM-DD HH:mm" (UTC). */
export function formatDemoTime(time: number): string {
  return new Date(time).toISOString().slice(0, 16).replace('T', ' ');
}

/** Format for an HTML datetime-local input value: "YYYY-MM-DDTHH:mm". */
export function toInputValue(time: number): string {
  return new Date(time).toISOString().slice(0, 16);
}

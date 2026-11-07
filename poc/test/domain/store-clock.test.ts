import { describe, expect, it } from 'vitest';
import { DAY_MS, HOUR_MS, formatDemoTime, getNow, parseDemoTime, setNow } from '../../src/domain/clock.js';
import { Store } from '../../src/domain/store.js';
import { DomainError } from '../../src/domain/types.js';

const T0 = Date.UTC(2026, 9, 5, 8, 0);

function fixtureStore(): Store {
  return new Store({
    initialTime: T0,
    seeder: (store) => {
      store.addCompany({ id: 'host', name: 'Host AS', role: 'host' });
      store.addCompany({ id: 'p1', name: 'Partner One AS', role: 'partner', rate: 0.85 });
    },
  });
}

describe('store and demo clock', () => {
  it('moves demo time forward; refuses moving backward; reset restores initial time and data (FR8.2, D2)', () => {
    const store = fixtureStore();
    const initial = store.snapshot();

    setNow(store, T0 + HOUR_MS);
    expect(getNow(store)).toBe(T0 + HOUR_MS);

    expect(() => setNow(store, T0)).toThrow(DomainError);
    expect(getNow(store)).toBe(T0 + HOUR_MS);

    store.addCompany({ id: 'p2', name: 'Partner Two AS', role: 'partner', rate: 0.9 });
    store.nextId('trip');
    setNow(store, T0 + DAY_MS);

    store.reset();
    expect(getNow(store)).toBe(T0);
    expect(store.snapshot()).toEqual(initial);
  });

  it('generates deterministic ids per prefix, restarting after reset', () => {
    const store = fixtureStore();
    expect(store.nextId('trip')).toBe('trip-1');
    expect(store.nextId('trip')).toBe('trip-2');
    expect(store.nextId('inv')).toBe('inv-1');
    store.reset();
    expect(store.nextId('trip')).toBe('trip-1');
  });

  it('reports unknown records as not_found domain errors', () => {
    const store = fixtureStore();
    expect(() => store.getTrip('trip-99')).toThrow(/not found/);
    expect(() => store.getInvoice('inv-99')).toThrow(DomainError);
    expect(() => store.getCompany('nobody')).toThrow(DomainError);
    expect(() => store.addCompany({ id: 'host', name: 'Duplicate', role: 'host' })).toThrow(DomainError);
  });

  it('refuses a non-finite demo time', () => {
    const store = fixtureStore();
    expect(() => setNow(store, Number.NaN)).toThrow(DomainError);
  });

  it('wraps a failing seeder in a fatal error', () => {
    expect(
      () =>
        new Store({
          initialTime: T0,
          seeder: () => {
            throw new Error('boom');
          },
        }),
    ).toThrow(/Seeding the store failed: boom/);
  });

  it('parses and formats demo time as UTC, rejecting invalid input', () => {
    expect(parseDemoTime('2026-10-05T08:00')).toBe(T0);
    expect(parseDemoTime('2026-10-05 08:00')).toBe(T0);
    expect(formatDemoTime(T0)).toBe('2026-10-05 08:00');
    expect(parseDemoTime('2026-02-31T08:00')).toBeNaN();
    expect(parseDemoTime('tomorrow')).toBeNaN();
    expect(parseDemoTime('')).toBeNaN();
  });
});

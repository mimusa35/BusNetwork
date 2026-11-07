import { describe, expect, it } from 'vitest';
import { defaultOfferPrice, formatNok, invoiceTotals, lineTotals, round2 } from '../../src/domain/money.js';

describe('money', () => {
  it('computes line and invoice totals rounded to 2 decimals (FR5.2, A2)', () => {
    const offerLine = { quantity: 1, unitPrice: 10_000, vatRate: 0.25 };
    const tollLine = { quantity: 3, unitPrice: 33.335, vatRate: 0.25 };
    const allowanceLine = { quantity: 2, unitPrice: 450.5, vatRate: 0 };

    expect(lineTotals(offerLine)).toEqual({ net: 10_000, vat: 2_500, total: 12_500 });
    // 3 × 33.335 = 100.005 -> 100.01; VAT 25.0025 -> 25.00
    expect(lineTotals(tollLine)).toEqual({ net: 100.01, vat: 25, total: 125.01 });
    expect(lineTotals(allowanceLine)).toEqual({ net: 901, vat: 0, total: 901 });

    expect(invoiceTotals([offerLine, tollLine, allowanceLine])).toEqual({
      net: 11_001.01,
      vat: 2_525,
      total: 13_526.01,
    });
  });

  it('derives the default offer price as customer price × rate, rounded (A1)', () => {
    expect(defaultOfferPrice(12_345, 0.85)).toBe(10_493.25);
    expect(defaultOfferPrice(999.99, 0.88)).toBe(879.99);
  });

  it('rounds half away from zero without binary noise', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(-1.005)).toBe(-1.01);
  });

  it('returns zero totals for an invoice with no lines', () => {
    expect(invoiceTotals([])).toEqual({ net: 0, vat: 0, total: 0 });
  });

  it('refuses to round a non-finite amount', () => {
    expect(() => round2(Number.NaN)).toThrow(RangeError);
    expect(() => round2(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it('formats NOK amounts with thousand separators', () => {
    expect(formatNok(12_345.6)).toBe('12 345.60 NOK');
    expect(formatNok(0)).toBe('0.00 NOK');
  });
});

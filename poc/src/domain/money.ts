import type { InvoiceLine, Totals } from './types.js';

/** Default VAT rate for the offer-price invoice line (assumption A2). */
export const DEFAULT_VAT_RATE = 0.25;

/**
 * Round to 2 decimals with standard (half away from zero) rounding.
 * `toPrecision(15)` removes binary noise such as 1.005 * 100 = 100.49999...
 */
export function round2(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Cannot round a non-finite amount: ${value}`);
  }
  const sign = value < 0 ? -1 : 1;
  const cents = Math.round(Number((Math.abs(value) * 100).toPrecision(15)));
  return (sign * cents) / 100;
}

/** Default offer price for a partner: customer price × partner rate, rounded (A1). */
export function defaultOfferPrice(customerPrice: number, rate: number): number {
  return round2(customerPrice * rate);
}

/** Totals for one invoice line: quantity × unit price, and its VAT (FR5.2). */
export function lineTotals(line: Pick<InvoiceLine, 'quantity' | 'unitPrice' | 'vatRate'>): Totals {
  const net = round2(line.quantity * line.unitPrice);
  const vat = round2(net * line.vatRate);
  return { net, vat, total: round2(net + vat) };
}

/** Invoice totals: the sum of the rounded line totals (FR5.2). */
export function invoiceTotals(lines: readonly Pick<InvoiceLine, 'quantity' | 'unitPrice' | 'vatRate'>[]): Totals {
  let net = 0;
  let vat = 0;
  for (const line of lines) {
    const t = lineTotals(line);
    net += t.net;
    vat += t.vat;
  }
  const roundedNet = round2(net);
  const roundedVat = round2(vat);
  return { net: roundedNet, vat: roundedVat, total: round2(roundedNet + roundedVat) };
}

/** Format an amount as NOK for display, e.g. "12 345.60 NOK". */
export function formatNok(amount: number): string {
  const [whole = '0', fraction = '00'] = Math.abs(amount).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}${grouped}.${fraction} NOK`;
}

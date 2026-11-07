import express, { type NextFunction, type Request, type Response } from 'express';
import { DAY_MS, HOUR_MS, getNow, parseDemoTime } from '../domain/clock.js';
import { keyFigures, needsAction } from '../domain/dashboard.js';
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
  type LineInput,
} from '../domain/invoices.js';
import { defaultOfferPrice } from '../domain/money.js';
import type { Store } from '../domain/store.js';
import { runTabCheck } from '../domain/tabCheck.js';
import { acceptOffer, advanceTime, cancelTrip, createTrip, markComplete, rejectOffer } from '../domain/trips.js';
import { DomainError, isDomainError, type Company } from '../domain/types.js';
import { TRIP_LISTS, listPriceFor, openTrip, tripsInList, visibleInvoices, type TripList } from '../domain/views.js';
import type { SafeHtml } from './html.js';
import * as pages from './views.js';

/**
 * Express app factory. There is deliberately NO sign-in in this POC: the
 * company switcher (a cookie) stands in for users (requirements Q7). Every
 * request still goes through the domain's per-company visibility rules, but
 * anyone who can reach the app can act as any company.
 */

const COMPANY_COOKIE = 'company';
const MAX_BODY = '20kb';

export interface AppOptions {
  store: Store;
  /** Error logger; defaults to console.error with a JSON line. */
  logError?: (entry: Record<string, unknown>) => void;
}

type Body = Record<string, unknown>;

/** Read one form field as a trimmed string ('' when absent or not a string). */
function field(body: Body, name: string): string {
  const value = body[name];
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' ? first.trim() : '';
}

function fieldList(body: Body, name: string): string[] {
  const value = body[name];
  const list = Array.isArray(value) ? value : value === undefined ? [] : [value];
  return list.filter((v): v is string => typeof v === 'string').map((v) => v.trim());
}

const AMOUNT_PATTERN = /^\d{1,9}(?:[.,]\d{1,2})?$/;
const DECIMAL_PATTERN = /^\d{1,9}(?:[.,]\d{1,4})?$/;

/** Parse a NOK amount from a form ("1234", "1234.5", "1234,50"). */
function parseAmount(text: string, name: string, label: string): number {
  if (!text) throw new DomainError('validation', `${label} is required`, name);
  if (!AMOUNT_PATTERN.test(text)) throw new DomainError('validation', `${label} must be an amount like 1234.50`, name);
  return Number(text.replace(',', '.'));
}

function parseDecimal(text: string, name: string, label: string): number {
  if (!text) throw new DomainError('validation', `${label} is required`, name);
  if (!DECIMAL_PATTERN.test(text)) throw new DomainError('validation', `${label} must be a number`, name);
  return Number(text.replace(',', '.'));
}

function parseTime(text: string, name: string, label: string): number {
  if (!text) throw new DomainError('validation', `${label} is required`, name);
  const time = parseDemoTime(text);
  if (Number.isNaN(time)) throw new DomainError('validation', `${label} must be a valid date and time`, name);
  return time;
}

function parseLine(body: Body): LineInput {
  return {
    description: field(body, 'description'),
    quantity: parseDecimal(field(body, 'quantity'), 'quantity', 'Quantity'),
    unitPrice: parseAmount(field(body, 'unitPrice'), 'unitPrice', 'Unit price'),
    vatRate: parseDecimal(field(body, 'vatRate'), 'vatRate', 'VAT rate') / 100,
  };
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(rest.join('='));
      } catch {
        return undefined; // malformed cookie: fall back to the default company
      }
    }
  }
  return undefined;
}

/** Only allow local paths as redirect targets (no open redirect). */
function safeReturnPath(text: string): string {
  return /^\/(?!\/)[\w\-/?=&.]*$/.test(text) ? text : '/';
}

const ID_PATTERN = /^[a-z0-9-]{1,40}$/;

function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    throw new DomainError('not_found', 'The requested record was not found', name);
  }
  return value;
}

function emptyTripForm(partners: Company[]): pages.NewTripFormValues {
  return {
    customerName: '',
    from: '',
    to: '',
    plannedStart: '',
    plannedEnd: '',
    customerPrice: '',
    partners: partners.map((p) => p.id),
    prices: {},
  };
}

export function createApp(options: AppOptions): express.Express {
  const { store } = options;
  const logError =
    options.logError ?? ((entry: Record<string, unknown>) => console.error(JSON.stringify({ level: 'ERROR', ...entry })));
  const app = express();
  app.disable('x-powered-by');
  app.use(express.urlencoded({ extended: false, limit: MAX_BODY }));

  const currentCompany = (req: Request): Company => {
    const id = readCookie(req, COMPANY_COOKIE);
    const found = id ? store.findCompany(id) : undefined;
    const fallback = store.state.companies.find((c) => c.role === 'host') ?? store.state.companies[0];
    const company = found ?? fallback;
    if (!company) throw new Error('No companies are loaded; the seed did not run');
    return company;
  };

  const context = (req: Request): pages.PageContext => ({
    company: currentCompany(req),
    companies: store.state.companies,
    now: getNow(store),
    currentPath: safeReturnPath(req.originalUrl),
  });

  const send = (res: Response, page: SafeHtml, status = 200) => res.status(status).type('html').send(page.value);
  const partners = () => store.state.companies.filter((c) => c.role === 'partner');

  /** Wrap a handler: domain errors are shown to the user; anything else goes to the 500 handler. */
  const handle =
    (fn: (req: Request, res: Response, company: Company) => void, backHref?: (req: Request) => string) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        fn(req, res, currentCompany(req));
      } catch (error) {
        if (!isDomainError(error)) return next(error);
        const status = error.code === 'not_found' ? 404 : 400;
        send(res, pages.errorPage(context(req), error.message, error.field, backHref?.(req) ?? '/'), status);
      }
    };

  // --- Company switcher and demo controls --------------------------------
  app.post(
    '/switch',
    handle((req, res) => {
      const id = field(req.body as Body, 'companyId');
      if (!store.findCompany(id)) throw new DomainError('validation', 'Choose one of the listed companies', 'companyId');
      res.cookie(COMPANY_COOKIE, id, { httpOnly: true, sameSite: 'lax', path: '/' });
      res.redirect(303, '/');
    }),
  );

  app.post(
    '/time',
    handle((req, res) => {
      const body = req.body as Body;
      const now = getNow(store);
      const action = field(body, 'action');
      let target: number;
      if (action === 'hour') target = now + HOUR_MS;
      else if (action === 'day') target = now + DAY_MS;
      else if (action === 'jump') target = parseTime(field(body, 'to'), 'time', 'Jump target');
      else throw new DomainError('validation', 'Unknown time action', 'action');
      advanceTime(store, target);
      res.redirect(303, safeReturnPath(field(body, 'returnTo')));
    }),
  );

  app.post(
    '/reset',
    handle((_req, res) => {
      store.reset();
      res.redirect(303, '/');
    }),
  );

  // --- Dashboard, lists, tab check ----------------------------------------
  app.get(
    '/',
    handle((req, res, company) => {
      send(res, pages.dashboardPage(context(req), keyFigures(store, company.id), needsAction(store, company.id)));
    }),
  );

  app.get(
    '/trips/new',
    handle((req, res, company) => {
      if (company.role !== 'host') throw new DomainError('forbidden', 'Only the host company can create trips', 'companyId');
      send(res, pages.newTripPage(context(req), partners(), emptyTripForm(partners())));
    }),
  );

  app.get(
    '/trips/:list(active|closed|all)',
    handle((req, res, company) => {
      const list = req.params.list as TripList;
      if (!TRIP_LISTS.includes(list)) throw new DomainError('not_found', 'Unknown list', 'list');
      const trips = tripsInList(store, company.id, list);
      send(res, pages.tripListPage(context(req), list, trips, (t) => listPriceFor(t, company.id)));
    }),
  );

  app.get(
    '/tab-check',
    handle((req, res) => {
      const result = runTabCheck(store);
      send(res, pages.tabCheckPage(context(req), result, (id) => store.findCompany(id)?.name ?? id));
    }),
  );

  // --- Create and share a trip --------------------------------------------
  app.post('/trips', (req, res, next) => {
    const body = req.body as Body;
    const selected = fieldList(body, 'partner');
    const values: pages.NewTripFormValues = {
      customerName: field(body, 'customerName'),
      from: field(body, 'from'),
      to: field(body, 'to'),
      plannedStart: field(body, 'plannedStart'),
      plannedEnd: field(body, 'plannedEnd'),
      customerPrice: field(body, 'customerPrice'),
      partners: selected,
      prices: Object.fromEntries(partners().map((p) => [p.id, field(body, `price_${p.id}`)])),
    };
    try {
      const company = currentCompany(req);
      if (!values.customerName) throw new DomainError('validation', 'Customer name is required', 'customerName');
      if (!values.from) throw new DomainError('validation', 'From is required', 'from');
      if (!values.to) throw new DomainError('validation', 'To is required', 'to');
      const plannedStart = parseTime(values.plannedStart, 'plannedStart', 'Planned start');
      const plannedEnd = parseTime(values.plannedEnd, 'plannedEnd', 'Planned end');
      const customerPrice = parseAmount(values.customerPrice, 'customerPrice', 'Customer price');
      const offers = selected.map((partnerId) => {
        const partner = store.findCompany(partnerId);
        if (!partner || partner.role !== 'partner') throw new DomainError('validation', 'Choose partners from the list', 'partners');
        const priceText = values.prices[partnerId] ?? '';
        const price = priceText
          ? parseAmount(priceText, `price_${partnerId}`, `Offer price for ${partner.name}`)
          : defaultOfferPrice(customerPrice, partner.rate ?? 1);
        return { partnerId, price };
      });
      const trip = createTrip(store, company.id, { customerName: values.customerName, from: values.from, to: values.to, plannedStart, plannedEnd, customerPrice, offers });
      res.redirect(303, `/trips/${trip.id}`);
    } catch (error) {
      if (!isDomainError(error)) return next(error);
      send(res, pages.newTripPage(context(req), partners(), values, { message: error.message, field: error.field }), 400);
    }
  });

  // --- Trip detail and actions --------------------------------------------
  const backToTrip = (req: Request) => `/trips/${encodeURIComponent(String(req.params.id ?? ''))}`;

  app.get(
    '/trips/:id',
    handle((req, res, company) => {
      send(res, pages.tripDetailPage(context(req), openTrip(store, company.id, param(req, 'id'))));
    }),
  );

  const tripAction = (path: string, act: (tripId: string, companyId: string, body: Body) => string | void) =>
    app.post(
      `/trips/:id/${path}`,
      handle((req, res, company) => {
        const tripId = param(req, 'id');
        const redirectTo = act(tripId, company.id, req.body as Body);
        res.redirect(303, redirectTo ?? `/trips/${tripId}`);
      }, backToTrip),
    );

  tripAction('accept', (tripId, companyId) => void acceptOffer(store, companyId, tripId));
  tripAction('reject', (tripId, companyId) => {
    rejectOffer(store, companyId, tripId);
    return '/trips/active'; // the trip is no longer visible to this partner (D1)
  });
  tripAction('cancel', (tripId, companyId, body) => void cancelTrip(store, companyId, tripId, field(body, 'reason')));
  tripAction('complete', (tripId, companyId) => void markComplete(store, companyId, tripId));
  tripAction('invoice', (tripId, companyId) => `/invoices/${createInvoice(store, companyId, tripId).id}`);

  // --- Invoices -------------------------------------------------------------
  app.get(
    '/invoices',
    handle((req, res, company) => {
      const rows = visibleInvoices(store, company.id).map((invoice) => {
        const trip = store.getTrip(invoice.tripId);
        const counterpartId = company.id === invoice.hostId ? invoice.partnerId : invoice.hostId;
        return {
          invoice,
          tripLabel: `${trip.id}: ${trip.from} - ${trip.to}`,
          counterpartName: store.findCompany(counterpartId)?.name ?? counterpartId,
          totals: totalsOf(invoice),
        };
      });
      send(res, pages.invoiceListPage(context(req), rows));
    }),
  );

  const backToInvoice = (req: Request) => `/invoices/${encodeURIComponent(String(req.params.id ?? ''))}`;

  app.get(
    '/invoices/:id',
    handle((req, res, company) => {
      const invoice = getVisibleInvoice(store, company.id, param(req, 'id'));
      const trip = store.getTrip(invoice.tripId);
      send(
        res,
        pages.invoiceDetailPage(context(req), invoice, {
          tripLabel: `${trip.id}: ${trip.from} - ${trip.to} (${trip.customerName})`,
          partnerName: store.findCompany(invoice.partnerId)?.name ?? invoice.partnerId,
          hostName: store.findCompany(invoice.hostId)?.name ?? invoice.hostId,
          totals: totalsOf(invoice),
          actions: invoiceActions(invoice, company.id),
        }),
      );
    }),
  );

  const invoiceAction = (path: string, act: (req: Request, invoiceId: string, companyId: string, body: Body) => void) =>
    app.post(
      `/invoices/:id/${path}`,
      handle((req, res, company) => {
        const invoiceId = param(req, 'id');
        act(req, invoiceId, company.id, req.body as Body);
        res.redirect(303, `/invoices/${invoiceId}`);
      }, backToInvoice),
    );

  invoiceAction('lines', (_req, id, companyId, body) => void addLine(store, companyId, id, parseLine(body)));
  invoiceAction('lines/:lineId', (req, id, companyId, body) => void updateLine(store, companyId, id, param(req, 'lineId'), parseLine(body)));
  invoiceAction('lines/:lineId/delete', (req, id, companyId) => removeLine(store, companyId, id, param(req, 'lineId')));
  invoiceAction('submit', (_req, id, companyId) => void submitInvoice(store, companyId, id));
  invoiceAction('approve', (_req, id, companyId) => void approveInvoice(store, companyId, id));
  invoiceAction('decline', (_req, id, companyId, body) => void declineInvoice(store, companyId, id, field(body, 'reason')));

  // --- Fallbacks ------------------------------------------------------------
  app.use((req, res) => {
    send(res, pages.errorPage(context(req), 'Page not found'), 404);
  });

  // Unexpected (fatal-for-the-request) errors: log with context, answer 500.
  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    const err = error instanceof Error ? error : new Error(String(error));
    const status = (error as { status?: number; type?: string }).type === 'entity.too.large' ? 413 : 500;
    logError({ message: err.message, method: req.method, path: req.path, status, stack: err.stack });
    if (res.headersSent) return;
    res.status(status).type('text').send(status === 413 ? 'Request too large' : 'Internal error. The details were logged on the server.');
  });

  return app;
}

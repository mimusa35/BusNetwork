import { DomainError, type Company, type Invoice, type Trip } from './types.js';

/** Everything the POC knows. Lives in memory only (NFR2); rebuilt by reset. */
export interface StoreState {
  companies: Company[];
  trips: Trip[];
  invoices: Invoice[];
  /** Current demo time in ms (FR8). */
  now: number;
  /** Keys `${companyId}:${tripId}` of cancelled trips a company has opened (D3). */
  viewedCancellations: string[];
  /** Per-prefix counters so IDs are deterministic and reset with the state. */
  idCounters: Record<string, number>;
}

/** Populates a freshly reset store, typically by driving real domain actions. */
export type Seeder = (store: Store) => void;

export interface StoreOptions {
  /** Demo time the store starts at before the seeder runs. */
  initialTime: number;
  seeder?: Seeder;
}

function emptyState(initialTime: number): StoreState {
  return {
    companies: [],
    trips: [],
    invoices: [],
    now: initialTime,
    viewedCancellations: [],
    idCounters: {},
  };
}

/**
 * In-memory store. Domain services read and change `state` directly; the
 * store owns ID generation, lookups and reset (FR8.2).
 */
export class Store {
  state: StoreState;
  private readonly options: StoreOptions;

  constructor(options: StoreOptions) {
    if (!Number.isFinite(options.initialTime)) {
      throw new RangeError('Store initialTime must be a finite timestamp');
    }
    this.options = options;
    this.state = emptyState(options.initialTime);
    this.runSeeder();
  }

  /** Throw away all state and rebuild it from the initial time and seeder. */
  reset(): void {
    this.state = emptyState(this.options.initialTime);
    this.runSeeder();
  }

  /** Next deterministic id for a prefix, e.g. `trip-1`, `trip-2`. */
  nextId(prefix: string): string {
    const next = (this.state.idCounters[prefix] ?? 0) + 1;
    this.state.idCounters[prefix] = next;
    return `${prefix}-${next}`;
  }

  addCompany(company: Company): Company {
    if (this.state.companies.some((c) => c.id === company.id)) {
      throw new DomainError('validation', `Company ${company.id} already exists`, 'companyId');
    }
    this.state.companies.push(company);
    return company;
  }

  findCompany(companyId: string): Company | undefined {
    return this.state.companies.find((c) => c.id === companyId);
  }

  getCompany(companyId: string): Company {
    const company = this.findCompany(companyId);
    if (!company) {
      throw new DomainError('not_found', `Unknown company: ${companyId}`, 'companyId');
    }
    return company;
  }

  getTrip(tripId: string): Trip {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip) {
      throw new DomainError('not_found', `Trip ${tripId} was not found`, 'tripId');
    }
    return trip;
  }

  getInvoice(invoiceId: string): Invoice {
    const invoice = this.state.invoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      throw new DomainError('not_found', `Invoice ${invoiceId} was not found`, 'invoiceId');
    }
    return invoice;
  }

  findInvoiceForTrip(tripId: string): Invoice | undefined {
    return this.state.invoices.find((i) => i.tripId === tripId);
  }

  /** A deep copy of the state, used to compare snapshots (e.g. after reset). */
  snapshot(): StoreState {
    return structuredClone(this.state);
  }

  private runSeeder(): void {
    if (!this.options.seeder) return;
    try {
      this.options.seeder(this);
    } catch (error) {
      // A broken seed is fatal: the demo would start in a misleading state.
      throw new Error(`Seeding the store failed: ${(error as Error).message}`, { cause: error });
    }
  }
}

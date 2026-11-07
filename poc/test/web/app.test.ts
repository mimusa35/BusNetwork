import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createSeededStore, HOST_ID, P1, P2, P3 } from '../../src/seed.js';
import { createApp } from '../../src/web/app.js';

function setup() {
  const store = createSeededStore();
  const logError = vi.fn();
  const app = createApp({ store, logError });
  return { store, app, logError, agent: request.agent(app) };
}

type Agent = ReturnType<typeof request.agent>;

async function switchTo(agent: Agent, companyId: string): Promise<void> {
  await agent.post('/switch').type('form').send({ companyId }).expect(303);
}

const row = (id: string) => `data-testid="trip-list-row-${id}"`;

describe('web app', () => {
  it('switching company changes the lists, dashboard and invoices (FR1.2, FR1.3, NFR1)', async () => {
    const { agent } = setup();

    const hostAll = await agent.get('/trips/all').expect(200);
    expect(hostAll.text).toContain('Viewing as <strong>Nordic Coaches AS</strong>');
    expect(hostAll.text).toContain(row('trip-1'));
    expect(hostAll.text).toContain(row('trip-9')); // Rejected trip: only the host still sees it

    await switchTo(agent, P3);
    const p3All = await agent.get('/trips/all').expect(200);
    expect(p3All.text).toContain('Viewing as <strong>Trondelag Charter AS</strong>');
    expect(p3All.text).toContain(row('trip-3'));
    expect(p3All.text).not.toContain(row('trip-1'));
    expect(p3All.text).not.toContain(row('trip-9'));
    await agent.get('/trips/trip-1').expect(404);

    const p3Invoices = await agent.get('/invoices').expect(200);
    expect(p3Invoices.text).toContain('data-testid="invoice-list-row-inv-3"');
    expect(p3Invoices.text).not.toContain('data-testid="invoice-list-row-inv-1"');
    await agent.get('/invoices/inv-1').expect(404);

    await agent.post('/switch').type('form').send({ companyId: 'not-a-company' }).expect(400);
  });

  it('a form error returns 400 and names the field (FR2.1)', async () => {
    const { agent, store } = setup();
    const before = store.state.trips.length;
    const base = { customerName: 'Choir', from: 'Oslo', to: 'Bergen', plannedStart: '2026-10-06T08:00', plannedEnd: '2026-10-06T16:00', customerPrice: '9000', partner: P1 };

    const missing = await agent.post('/trips').type('form').send({ ...base, customerName: '' }).expect(400);
    expect(missing.text).toContain('data-field="customerName"');
    expect(missing.text).toContain('Customer name is required');
    expect(missing.text).toContain('value="Oslo"'); // the other values are kept

    const backwards = await agent.post('/trips').type('form').send({ ...base, plannedEnd: '2026-10-06T07:00' }).expect(400);
    expect(backwards.text).toContain('data-field="plannedEnd"');

    const badPrice = await agent.post('/trips').type('form').send({ ...base, customerPrice: 'lots' }).expect(400);
    expect(badPrice.text).toContain('data-field="customerPrice"');

    const noPartner = await agent.post('/trips').type('form').send({ ...base, partner: undefined }).expect(400);
    expect(noPartner.text).toContain('data-field="partners"');

    expect(store.state.trips.length).toBe(before);

    await switchTo(agent, P1);
    await agent.get('/trips/new').expect(400);
    await agent.post('/trips').type('form').send(base).expect(400);
  });

  it('runs the HTTP path share -> accept -> advance time -> invoice -> submit -> approve (G1-G3)', async () => {
    const { agent, store } = setup();

    const created = await agent
      .post('/trips')
      .type('form')
      .send(`customerName=Bergen+Choir&from=Oslo&to=Bergen&plannedStart=2026-10-06T08:00&plannedEnd=2026-10-06T12:00&customerPrice=10000&partner=${P1}&partner=${P2}&price_${P1}=&price_${P2}=8950`)
      .expect(303);
    const tripPath = created.headers.location as string;
    expect(tripPath).toMatch(/^\/trips\/trip-\d+$/);
    const tripId = tripPath.split('/').pop()!;
    const trip = store.getTrip(tripId);
    expect(trip.offers).toEqual([
      { partnerId: P1, price: 8_500, status: 'Open' }, // default 10 000 x 85 %
      { partnerId: P2, price: 8_950, status: 'Open' },
    ]);
    expect((await agent.get('/trips/active')).text).toContain(row(tripId));

    await switchTo(agent, P2);
    const partnerView = await agent.get(tripPath).expect(200);
    expect(partnerView.text).toContain('data-testid="trip-detail-my-offer"');
    expect(partnerView.text).toContain('8 950.00 NOK');
    expect(partnerView.text).not.toContain('trip-detail-customer-price');
    expect(partnerView.text).not.toContain('10 000.00 NOK');
    await agent.post(`${tripPath}/accept`).expect(303);

    await switchTo(agent, P1);
    await agent.get(tripPath).expect(404); // withdrawn offer: trip no longer visible (D1)
    await agent.post(`${tripPath}/accept`).expect(400);

    await agent.post('/time').type('form').send({ action: 'jump', to: '2026-10-06T13:00', returnTo: '/' }).expect(303);
    expect(trip.status).toBe('Completed');

    await switchTo(agent, P2);
    const invoiceRes = await agent.post(`${tripPath}/invoice`).expect(303);
    const invoicePath = invoiceRes.headers.location as string;
    expect(invoicePath).toMatch(/^\/invoices\/inv-\d+$/);
    await agent.post(`${invoicePath}/lines`).type('form').send({ description: 'Bridge toll', quantity: '2', unitPrice: '125,50', vatRate: '25' }).expect(303);
    const badLine = await agent.post(`${invoicePath}/lines`).type('form').send({ description: 'X', quantity: 'two', unitPrice: '1', vatRate: '25' }).expect(400);
    expect(badLine.text).toContain('data-field="quantity"');
    await agent.post(`${invoicePath}/submit`).expect(303);

    await switchTo(agent, HOST_ID);
    const dashboard = await agent.get('/').expect(200);
    expect(dashboard.text).toContain(`data-testid="needs-action-item-${invoicePath.split('/').pop()}"`);
    await agent.post(`${invoicePath}/decline`).type('form').send({ reason: '' }).expect(400);
    await agent.post(`${invoicePath}/approve`).expect(303);

    const approved = await agent.get(invoicePath).expect(200);
    expect(approved.text).toContain('data-testid="invoice-locked"');
    expect(approved.text).not.toContain('invoice-submit-button');
    expect(approved.text).not.toContain('invoice-approve-button');
    // 8 950 + 2 x 125.50 = 9 201 excl. VAT; 25 % VAT = 2 300.25; total 11 501.25
    expect(approved.text).toContain('data-testid="invoice-total">11 501.25 NOK');
  });

  it('refuses moving demo time backward, and reset restores the seed (FR8.2)', async () => {
    const { agent, store } = setup();
    const initial = store.snapshot();
    await agent.post('/time').type('form').send({ action: 'day', returnTo: '/trips/all' }).expect(303).expect('Location', '/trips/all');
    const back = await agent.post('/time').type('form').send({ action: 'jump', to: '2026-10-01T08:00' }).expect(400);
    expect(back.text).toContain('cannot move backward');
    await agent.post('/time').type('form').send({ action: 'hour', returnTo: '//evil.example' }).expect('Location', '/');

    await agent.post('/reset').expect(303);
    expect(store.snapshot()).toEqual(initial);
  });

  it('escapes user input in pages and shows the tab check as passing', async () => {
    const { agent } = setup();
    const created = await agent
      .post('/trips')
      .type('form')
      .send({ customerName: '<script>alert(1)</script>', from: 'A', to: 'B', plannedStart: '2026-10-06T08:00', plannedEnd: '2026-10-06T09:00', customerPrice: '100', partner: P1 })
      .expect(303);
    const page = await agent.get(created.headers.location as string).expect(200);
    expect(page.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(page.text).not.toContain('<script>alert(1)</script>');

    const check = await agent.get('/tab-check').expect(200);
    expect(check.text).toContain('data-passed="true"');
  });

  it('logs unexpected errors and answers 500 without leaking details', async () => {
    const { store, agent, logError } = setup();
    store.getTrip = () => {
      throw new Error('disk on fire');
    };
    const res = await agent.get('/trips/trip-1').expect(500);
    expect(res.text).not.toContain('disk on fire');
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({ message: 'disk on fire', path: '/trips/trip-1', status: 500 }));
    await agent.get('/no-such-page').expect(404);
    await agent.get('/trips/BAD%20ID').expect(404);
  });
});

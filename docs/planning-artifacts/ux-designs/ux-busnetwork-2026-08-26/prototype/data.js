/* BusNetwork portal prototype — sample data.
   Fictional companies and people. Times are UTC ISO strings; money is integer minor units (øre).
   Statuses, share-request states and invoice statuses use the codes in data-sharing-contract.md §3. */
window.BN_DATA = (function () {
  'use strict';

  const NOW = '2026-09-15T10:00:00.000Z';
  const now = Date.parse(NOW);
  const H = 3600e3;
  const DAY = 24 * H;
  const iso = (ms) => new Date(ms).toISOString();

  const companies = [
    { id: 'C1', name: 'Nordic Coaches AS', orgNo: '912 345 678', vatNo: 'NO912345678MVA', address: 'Grønlandsleiret 25, 0190 Oslo', currency: 'NOK', vat: 25, locale: 'nb-NO' },
    { id: 'C2', name: 'Fjord Buss AS', orgNo: '923 456 789', vatNo: 'NO923456789MVA', address: 'Strandkaien 4, 5013 Bergen', currency: 'NOK', vat: 25, locale: 'nb-NO' },
    { id: 'C3', name: 'Nordfjord Reiser AS', orgNo: '934 567 890', vatNo: 'NO934567890MVA', address: 'Sjøgata 12, 6770 Nordfjordeid', currency: 'NOK', vat: 25, locale: 'nb-NO' },
    { id: 'C4', name: 'Vest Minibuss AS', orgNo: '945 678 901', vatNo: 'NO945678901MVA', address: 'Kanalveien 88, 5068 Bergen', currency: 'NOK', vat: 25, locale: 'nb-NO' },
    { id: 'C5', name: 'Tind Transport AS', orgNo: '956 789 012', vatNo: 'NO956789012MVA', address: 'Industrivegen 3, 2670 Otta', currency: 'NOK', vat: 25, locale: 'nb-NO' },
    { id: 'C6', name: 'Göta Buss AB', orgNo: '556677-8899', vatNo: 'SE556677889901', address: 'Kungsgatan 10, 411 19 Göteborg', currency: 'SEK', vat: 25, locale: 'sv-SE' },
  ];

  // Affiliations are managed in BusNetwork Settings (out of scope); the portal only reads them.
  const affiliations = [
    { hostId: 'C1', partnerId: 'C2', state: 'ACCEPTED', category: 'Coach operator', agreement: { type: 'PERCENTAGE', rate: 85 } },
    { hostId: 'C1', partnerId: 'C3', state: 'ACCEPTED', category: 'Coach operator', agreement: { type: 'FULL_DAY', rate: 1650000 } },
    { hostId: 'C1', partnerId: 'C4', state: 'ACCEPTED', category: 'Minibus operator', agreement: { type: 'HALF_DAY', rate: 790000 } },
    { hostId: 'C1', partnerId: 'C5', state: 'ACCEPTED', category: 'Coach operator', agreement: { type: 'NONE', rate: null } },
    { hostId: 'C1', partnerId: 'C6', state: 'PENDING', category: 'Coach operator', agreement: { type: 'PERCENTAGE', rate: 80 } },
    { hostId: 'C2', partnerId: 'C1', state: 'ACCEPTED', category: 'Coach operator', agreement: { type: 'PERCENTAGE', rate: 80 } },
    { hostId: 'C2', partnerId: 'C4', state: 'ACCEPTED', category: 'Minibus operator', agreement: { type: 'HALF_DAY', rate: 750000 } },
    { hostId: 'C3', partnerId: 'C1', state: 'ACCEPTED', category: 'Coach operator', agreement: { type: 'FULL_DAY', rate: 1500000 } },
  ];

  const users = [
    { id: 'U1', name: 'Ingrid Hansen', role: 'SALES', companyId: 'C1' },
    { id: 'U2', name: 'Kari Nes', role: 'ADMIN', companyId: 'C1' },
    { id: 'U3', name: 'Sofie Moen', role: 'FIN', companyId: 'C1' },
    { id: 'U4', name: 'Erik Vik', role: 'VIEWER', companyId: 'C1' },
    { id: 'U5', name: 'Lars Berg', role: 'PCOORD', companyId: 'C2' },
    { id: 'U6', name: 'Olav Dahl', role: 'FIN', companyId: 'C2' },
    { id: 'U9', name: 'Nina Holm', role: 'SALES', companyId: 'C2' },
    { id: 'U7', name: 'Magnus Lie', role: 'PCOORD', companyId: 'C3' },
    { id: 'U8', name: 'Hilde Aas', role: 'FIN', companyId: 'C3' },
    { id: 'U10', name: 'Siri Voll', role: 'PCOORD', companyId: 'C4' },
  ];

  const customers = [
    { id: 'K1', companyId: 'C1', name: 'Norsk Kulturreiser AS', contact: 'Anne Berg', phone: '+47 922 11 334' },
    { id: 'K2', companyId: 'C1', name: 'Oslo Skiklubb', contact: 'Per Olsen', phone: '+47 912 34 567' },
    { id: 'K3', companyId: 'C1', name: 'Fjellskolen Lillehammer', contact: 'Jon Moe', phone: '+47 934 56 781' },
    { id: 'K4', companyId: 'C1', name: 'Bergen Kongress AS', contact: 'Maria Lund', phone: '+47 955 20 101' },
    { id: 'K5', companyId: 'C1', name: 'Bærum kommune — skoleskyss', contact: 'Tor Hauge', phone: '+47 67 50 40 00' },
    { id: 'K6', companyId: 'C2', name: 'Hordaland Turlag', contact: 'Tove Rud', phone: '+47 976 44 120' },
    { id: 'K7', companyId: 'C2', name: 'Voss Adventure AS', contact: 'Sindre Dahl', phone: '+47 988 71 002' },
    { id: 'K8', companyId: 'C3', name: 'Nordfjord vidaregåande skule', contact: 'Eva Nes', phone: '+47 957 12 900' },
  ];

  const vehicleTypes = [
    { id: 'MINI16', name: 'Minibus 16', seats: 16 },
    { id: 'COACH49', name: 'Coach 49', seats: 49 },
    { id: 'COACH57', name: 'Coach 57', seats: 57 },
    { id: 'DD79', name: 'Double-decker 79', seats: 79 },
  ];

  // Stand-in for Google Maps suggestions: an address is valid only if chosen from this list.
  const addresses = [
    'Oslo S, Jernbanetorget 1, Oslo', 'Oslo lufthavn Gardermoen', 'Oslo Operahuset, Kirsten Flagstads plass 1', 'Holmenkollen nasjonalanlegg, Oslo',
    'Sandvika stasjon, Bærum', 'Asker stasjon, Asker', 'Lysaker stasjon, Bærum', 'Drammen stasjon, Drammen', 'Hamar stasjon, Hamar',
    'Lillehammer skysstasjon, Lillehammer', 'Gol skysstasjon, Gol', 'Geilo sentrum, Geilo', 'Fagernes skysstasjon, Fagernes',
    'Hemsedal Skisenter, Hemsedal', 'Trysil turistsenter, Trysil', 'Bergen busstasjon, Strømgaten 8, Bergen', 'Bergen lufthavn Flesland',
    'Voss stasjon, Voss', 'Flåm kai, Flåm', 'Vøringsfossen, Eidfjord', 'Ålesund sentrum, Ålesund', 'Nordfjordeid sentrum, Nordfjordeid',
    'Stavanger lufthavn Sola', 'Stavanger sentrum, Stavanger', 'Kristiansand kai, Kristiansand', 'Trondheim sentralstasjon, Trondheim',
  ];

  const reasons = {
    REJECT: ['No vehicle available', 'No driver available', 'Price too low', 'Outside our operating area', 'Timing not possible'],
    CANCEL: ['Customer cancelled', 'Trip details changed', 'Vehicle not available', 'Driver not available', 'Duplicate request'],
    INVOICE_DECLINE: ["Amount doesn't match agreement", 'Extra lines not agreed', 'Missing documentation', 'Wrong VAT'],
  };

  // Unshared TEQ trips that "Share" in Sales › Network Trips would prefill (§9.2 intro).
  const teqTrips = [
    { id: '48302', companyId: 'C1', type: 'NORMAL', customerId: 'K4', from: 'Bergen lufthavn Flesland', vias: [], to: 'Bergen busstasjon, Strømgaten 8, Bergen', start: '2026-09-24T07:30:00.000Z', end: '2026-09-24T10:00:00.000Z', pax: 52, vehicleType: 'COACH57', groupRef: 'BK-Medtech-26', flightNo: 'DY 612', customerPrice: 980000 },
    { id: '48305', companyId: 'C1', type: 'NORMAL', customerId: 'K2', from: 'Oslo S, Jernbanetorget 1, Oslo', vias: ['Hamar stasjon, Hamar'], to: 'Trysil turistsenter, Trysil', start: '2026-10-02T15:00:00.000Z', end: '2026-10-02T20:30:00.000Z', pax: 44, vehicleType: 'COACH49', groupRef: 'OSK-Trysil', flightNo: '', customerPrice: 2150000 },
  ];

  // ---------------------------------------------------------------------------
  // Trip builders
  // ---------------------------------------------------------------------------
  function aff(hostId, partnerId) { return affiliations.find((a) => a.hostId === hostId && a.partnerId === partnerId); }
  function calc(agreement, customerPrice) {
    if (agreement.type === 'PERCENTAGE') return Math.round(customerPrice * agreement.rate / 100);
    if (agreement.type === 'FULL_DAY' || agreement.type === 'HALF_DAY') return agreement.rate;
    return 0;
  }
  function req(hostId, partnerId, customerPrice, extra) {
    const ag = aff(hostId, partnerId).agreement;
    const c = calc(ag, customerPrice);
    return Object.assign({ partnerId, agreement: ag, calc: c, offer: c || 1200000, overridden: ag.type === 'NONE', overriddenBy: ag.type === 'NONE' ? 'Ingrid Hansen' : null, costs: [], state: 'PENDING', withdrawReason: null, respondedBy: null, respondedAt: null, reason: null, closedAt: null }, extra || {});
  }
  function trip(o) {
    return Object.assign({
      teqRef: o.id, type: 'NORMAL', status: 'REQUESTED', statusChangedAt: o.submittedAt, closedAt: null, closedReason: null, cancelledBy: null,
      roundTrip: false, returnAt: null, vias: [], altStart: null, pax: 45, paxOff: false,
      vehicle: { type: 'COACH49', euro: 'Euro VI', fuel: 'Diesel', luggage: 'Standard', other: '' },
      flightNo: '', groupRef: '', sign: '',
      comments: { partner: '', driver: '', hq: '', invoiceComment: '', invoiceRef: '' },
      currency: 'NOK', deadline: null, deadlineWarned: false, acceptedPartnerId: null,
      shifts: [], attachments: [], history: [], thread: [], department: 'Oslo', flag: null, priceProposal: null, createdBy: 'U1',
    }, o);
  }
  const H_ = (at, actor, companyId, kind, action, detail, visibleTo) => ({ at, actor, companyId, kind, action, detail: detail || '', visibleTo: visibleTo || 'BOTH' });

  const trips = [];

  // UJ-01 / UJ-02 — shared with two partners, one price overridden, deadline Thursday 12:00.
  trips.push(trip({
    id: '48213', hostId: 'C1', customerId: 'K1', customerPrice: 2000000, submittedAt: '2026-09-14T08:12:00.000Z',
    plannedStart: '2026-09-20T06:00:00.000Z', plannedEnd: '2026-09-20T15:30:00.000Z', deadline: '2026-09-18T10:00:00.000Z',
    from: { address: 'Oslo S, Jernbanetorget 1, Oslo' }, vias: [{ address: 'Gol skysstasjon, Gol' }, { address: 'Geilo sentrum, Geilo' }], to: { address: 'Bergen busstasjon, Strømgaten 8, Bergen' },
    pax: 48, groupRef: 'NK-Hardanger-26', sign: 'Norsk Kulturreiser',
    comments: { partner: 'Luggage for 48 guests. One wheelchair user.', driver: 'Photo stop at Vøringsfossen, 20 minutes.', hq: 'Customer is price sensitive — keep margin at 15%.', invoiceComment: 'Invoice after the trip, 30 days net.', invoiceRef: 'PO 55120' },
    requests: [req('C1', 'C2', 2000000), req('C1', 'C3', 2000000, { offer: 1680000, overridden: true, overriddenBy: 'Ingrid Hansen', costs: [{ desc: 'Ferry Hardanger', amount: 120000 }] })],
    attachments: [{ name: 'Programme-Hardanger.pdf', size: 482113, by: 'Ingrid Hansen', at: '2026-09-14T08:10:00.000Z' }],
    thread: [{ partnerId: 'C2', authorName: 'Lars Berg', companyId: 'C2', body: 'Is the wheelchair user bringing their own chair, or do you need a lift-equipped coach?', at: '2026-09-14T13:40:00.000Z', readBy: [] }],
    history: [
      H_('2026-09-14T08:12:00.000Z', 'Ingrid Hansen', 'C1', 'price', 'Offer price overridden', 'Nordfjord Reiser AS: calculated 16 500,00 → 16 800,00', 'HOST'),
      H_('2026-09-14T08:12:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested'),
    ],
  }));

  // BN-ACT-08 — Requested, starts within 24 h.
  trips.push(trip({
    id: '48219', hostId: 'C1', customerId: 'K3', customerPrice: 1100000, submittedAt: '2026-09-15T07:05:00.000Z',
    plannedStart: '2026-09-16T04:00:00.000Z', plannedEnd: '2026-09-16T09:00:00.000Z', deadline: '2026-09-15T20:00:00.000Z',
    from: { address: 'Oslo lufthavn Gardermoen' }, to: { address: 'Lillehammer skysstasjon, Lillehammer' },
    pax: 14, vehicle: { type: 'MINI16', euro: 'Euro VI', fuel: 'Electric', luggage: 'Ski bags', other: '' }, flightNo: 'SK 4031', groupRef: 'FL-Staff',
    requests: [req('C1', 'C4', 1100000)],
    history: [H_('2026-09-15T07:05:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested')],
  }));

  // Accepted, starts within 24 h, TEQ trip differs (consistency flag).
  trips.push(trip({
    id: '48220', hostId: 'C1', customerId: 'K2', customerPrice: 1650000, submittedAt: '2026-09-09T11:00:00.000Z', status: 'ACCEPTED', statusChangedAt: '2026-09-09T14:22:00.000Z',
    plannedStart: '2026-09-16T08:00:00.000Z', plannedEnd: '2026-09-16T14:00:00.000Z', deadline: '2026-09-12T12:00:00.000Z',
    from: { address: 'Oslo Operahuset, Kirsten Flagstads plass 1' }, vias: [{ address: 'Holmenkollen nasjonalanlegg, Oslo' }], to: { address: 'Oslo S, Jernbanetorget 1, Oslo' },
    pax: 52, vehicle: { type: 'COACH57', euro: 'Euro VI', fuel: 'HVO', luggage: 'Standard', other: '' }, acceptedPartnerId: 'C2',
    requests: [req('C1', 'C2', 1650000, { state: 'ACCEPTED', respondedBy: 'Lars Berg', respondedAt: '2026-09-09T14:22:00.000Z' })],
    flag: { field: 'Planned start', network: '2026-09-16T08:00:00.000Z', teq: '2026-09-16T08:30:00.000Z', checkedAt: '2026-09-15T00:00:00.000Z' },
    history: [
      H_('2026-09-09T14:22:00.000Z', 'Lars Berg', 'C2', 'status', 'Request accepted', 'Requested → Accepted'),
      H_('2026-09-09T11:00:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested'),
    ],
  }));

  // Received by Nordic Coaches from Fjord Buss (Nordic is partner).
  trips.push(trip({
    id: '48198', hostId: 'C2', customerId: 'K6', customerPrice: 1450000, submittedAt: '2026-09-13T09:30:00.000Z', createdBy: 'U9', department: 'West',
    plannedStart: '2026-09-19T07:00:00.000Z', plannedEnd: '2026-09-19T16:00:00.000Z', deadline: '2026-09-17T12:00:00.000Z',
    from: { address: 'Bergen busstasjon, Strømgaten 8, Bergen' }, vias: [{ address: 'Voss stasjon, Voss' }], to: { address: 'Flåm kai, Flåm' },
    pax: 40, groupRef: 'HT-Flåm', sign: 'Hordaland Turlag', comments: { partner: 'Guide joins at Voss.', driver: '', hq: 'Repeat customer.', invoiceComment: '', invoiceRef: 'HT-2026-19' },
    requests: [req('C2', 'C1', 1450000)],
    history: [H_('2026-09-13T09:30:00.000Z', 'Nina Holm', 'C2', 'status', 'Request submitted', '— → Requested')],
  }));

  // In progress, with an unread reply for the host.
  trips.push(trip({
    id: '48177', hostId: 'C1', customerId: 'K1', customerPrice: 1800000, submittedAt: '2026-09-02T10:00:00.000Z', status: 'IN_PROGRESS', statusChangedAt: '2026-09-15T07:00:00.000Z',
    plannedStart: '2026-09-15T07:00:00.000Z', plannedEnd: '2026-09-15T14:00:00.000Z', deadline: '2026-09-05T12:00:00.000Z',
    from: { address: 'Oslo S, Jernbanetorget 1, Oslo' }, vias: [{ address: 'Hamar stasjon, Hamar' }], to: { address: 'Lillehammer skysstasjon, Lillehammer' },
    pax: 46, acceptedPartnerId: 'C2', groupRef: 'NK-Olympic',
    requests: [req('C1', 'C2', 1800000, { state: 'ACCEPTED', respondedBy: 'Lars Berg', respondedAt: '2026-09-02T15:10:00.000Z' })],
    thread: [
      { partnerId: 'C2', authorName: 'Ingrid Hansen', companyId: 'C1', body: 'The customer asks for the ETA at Hamar.', at: '2026-09-15T08:05:00.000Z', readBy: ['U5'] },
      { partnerId: 'C2', authorName: 'Lars Berg', companyId: 'C2', body: 'About 10 minutes behind schedule. ETA Hamar 10:40.', at: '2026-09-15T08:12:00.000Z', readBy: [] },
    ],
    history: [
      H_('2026-09-15T07:00:00.000Z', 'System', null, 'status', 'Planned start reached', 'Accepted → In progress'),
      H_('2026-09-02T15:10:00.000Z', 'Lars Berg', 'C2', 'status', 'Request accepted', 'Requested → Accepted'),
      H_('2026-09-02T10:00:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested'),
    ],
  }));

  // Completed, not invoiced (UJ-06 for Olav at Fjord Buss).
  trips.push(trip({
    id: '48150', hostId: 'C1', customerId: 'K4', customerPrice: 2400000, submittedAt: '2026-09-01T09:00:00.000Z', status: 'COMPLETED', statusChangedAt: '2026-09-12T15:00:00.000Z', closedAt: '2026-09-12T15:00:00.000Z',
    plannedStart: '2026-09-12T06:30:00.000Z', plannedEnd: '2026-09-12T15:00:00.000Z', deadline: '2026-09-04T12:00:00.000Z',
    from: { address: 'Bergen lufthavn Flesland' }, vias: [{ address: 'Vøringsfossen, Eidfjord' }], to: { address: 'Bergen busstasjon, Strømgaten 8, Bergen' },
    pax: 49, acceptedPartnerId: 'C2', comments: { partner: '', driver: '', hq: '', invoiceComment: 'Conference excursion', invoiceRef: 'BK-4471' },
    requests: [req('C1', 'C2', 2400000, { state: 'ACCEPTED', respondedBy: 'Lars Berg', respondedAt: '2026-09-01T12:00:00.000Z', costs: [{ desc: 'Road toll', amount: 38000 }] })],
    history: [
      H_('2026-09-12T15:00:00.000Z', 'System', null, 'status', 'Planned end reached', 'In progress → Completed'),
      H_('2026-09-12T06:30:00.000Z', 'System', null, 'status', 'Planned start reached', 'Accepted → In progress'),
      H_('2026-09-01T12:00:00.000Z', 'Lars Berg', 'C2', 'status', 'Request accepted', 'Requested → Accepted'),
      H_('2026-09-01T09:00:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested'),
    ],
  }));

  // Completed, invoice Pending (UJ-07 for Sofie).
  trips.push(trip({
    id: '48141', hostId: 'C1', customerId: 'K1', customerPrice: 2000000, submittedAt: '2026-08-25T09:00:00.000Z', status: 'COMPLETED', statusChangedAt: '2026-09-05T18:00:00.000Z', closedAt: '2026-09-05T18:00:00.000Z',
    plannedStart: '2026-09-05T06:00:00.000Z', plannedEnd: '2026-09-05T18:00:00.000Z', deadline: '2026-08-28T12:00:00.000Z',
    from: { address: 'Oslo S, Jernbanetorget 1, Oslo' }, vias: [{ address: 'Fagernes skysstasjon, Fagernes' }], to: { address: 'Flåm kai, Flåm' },
    pax: 44, acceptedPartnerId: 'C2',
    requests: [req('C1', 'C2', 2000000, { state: 'ACCEPTED', respondedBy: 'Lars Berg', respondedAt: '2026-08-25T13:00:00.000Z', costs: [{ desc: 'Ferry Hardanger', amount: 120000 }] })],
    history: [
      H_('2026-09-08T09:00:00.000Z', 'Olav Dahl', 'C2', 'other', 'Invoice submitted', 'BN-INV-2026-000184 v1'),
      H_('2026-09-05T18:00:00.000Z', 'System', null, 'status', 'Planned end reached', 'In progress → Completed'),
      H_('2026-08-25T13:00:00.000Z', 'Lars Berg', 'C2', 'status', 'Request accepted', 'Requested → Accepted'),
      H_('2026-08-25T09:00:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested'),
    ],
  }));

  // Completed, invoice v1 Declined — partner to edit and resubmit.
  trips.push(trip({
    id: '48133', hostId: 'C1', customerId: 'K3', customerPrice: 1900000, submittedAt: '2026-08-18T09:00:00.000Z', status: 'COMPLETED', statusChangedAt: '2026-08-28T17:00:00.000Z', closedAt: '2026-08-28T17:00:00.000Z',
    plannedStart: '2026-08-28T05:00:00.000Z', plannedEnd: '2026-08-28T17:00:00.000Z', deadline: '2026-08-21T12:00:00.000Z',
    from: { address: 'Lillehammer skysstasjon, Lillehammer' }, to: { address: 'Ålesund sentrum, Ålesund' },
    pax: 38, acceptedPartnerId: 'C3',
    requests: [req('C1', 'C3', 1900000, { state: 'ACCEPTED', respondedBy: 'Magnus Lie', respondedAt: '2026-08-18T16:00:00.000Z' })],
    history: [
      H_('2026-09-03T08:30:00.000Z', 'Sofie Moen', 'C1', 'other', 'Invoice declined', 'BN-INV-2026-000171 v1 — Extra lines not agreed'),
      H_('2026-08-28T17:00:00.000Z', 'System', null, 'status', 'Planned end reached', 'In progress → Completed'),
      H_('2026-08-18T16:00:00.000Z', 'Magnus Lie', 'C3', 'status', 'Request accepted', 'Requested → Accepted'),
    ],
  }));

  // Two partners; Fjord Buss accepted, Nordfjord withdrawn (PRD §6.2 mapping). Invoice approved.
  trips.push(trip({
    id: '48120', hostId: 'C1', customerId: 'K2', customerPrice: 1500000, submittedAt: '2026-08-20T09:00:00.000Z', status: 'COMPLETED', statusChangedAt: '2026-09-01T13:00:00.000Z', closedAt: '2026-09-01T13:00:00.000Z',
    plannedStart: '2026-09-01T06:00:00.000Z', plannedEnd: '2026-09-01T13:00:00.000Z', deadline: '2026-08-25T12:00:00.000Z',
    from: { address: 'Drammen stasjon, Drammen' }, to: { address: 'Hemsedal Skisenter, Hemsedal' },
    pax: 50, vehicle: { type: 'COACH57', euro: 'Euro VI', fuel: 'Diesel', luggage: 'Ski bags', other: '' }, acceptedPartnerId: 'C2',
    requests: [
      req('C1', 'C2', 1500000, { state: 'ACCEPTED', respondedBy: 'Lars Berg', respondedAt: '2026-08-21T08:40:00.000Z' }),
      req('C1', 'C3', 1500000, { state: 'WITHDRAWN', withdrawReason: 'Another partner accepted', closedAt: '2026-08-21T08:40:00.000Z' }),
    ],
    history: [
      H_('2026-09-01T13:00:00.000Z', 'System', null, 'status', 'Planned end reached', 'In progress → Completed'),
      H_('2026-08-21T08:40:00.000Z', 'Lars Berg', 'C2', 'status', 'Request accepted', 'Requested → Accepted; Nordfjord Reiser AS withdrawn', 'HOST'),
      H_('2026-08-21T08:40:00.000Z', 'System', null, 'status', 'Request withdrawn', 'Another partner accepted', 'C3'),
      H_('2026-08-20T09:00:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested'),
    ],
  }));

  // Fixed trip with shifts, in progress (BN-DTL-03). Passenger count turned off.
  trips.push(trip({
    id: '48101', hostId: 'C1', type: 'FIXED', customerId: 'K5', customerPrice: 48000000, submittedAt: '2026-07-01T09:00:00.000Z', status: 'IN_PROGRESS', statusChangedAt: '2026-08-17T06:15:00.000Z',
    plannedStart: '2026-08-17T06:15:00.000Z', plannedEnd: '2026-12-18T14:15:00.000Z', deadline: '2026-07-10T12:00:00.000Z',
    from: { address: 'Sandvika stasjon, Bærum' }, to: { address: 'Asker stasjon, Asker' }, pax: null, paxOff: true, acceptedPartnerId: 'C2', groupRef: 'BK-Skoleskyss-H26',
    shifts: [
      { name: 'Morning school run', subTrips: [{ from: 'Sandvika stasjon, Bærum', to: 'Asker stasjon, Asker', start: '2026-08-17T06:15:00.000Z', end: '2026-08-17T07:00:00.000Z' }] },
      { name: 'Afternoon school run', subTrips: [{ from: 'Asker stasjon, Asker', to: 'Lysaker stasjon, Bærum', start: '2026-08-17T13:15:00.000Z', end: '2026-08-17T14:00:00.000Z' }, { from: 'Lysaker stasjon, Bærum', to: 'Sandvika stasjon, Bærum', start: '2026-08-17T14:00:00.000Z', end: '2026-08-17T14:15:00.000Z' }] },
    ],
    requests: [req('C1', 'C2', 48000000, { state: 'ACCEPTED', respondedBy: 'Lars Berg', respondedAt: '2026-07-03T10:00:00.000Z' })],
    history: [
      H_('2026-08-17T06:15:00.000Z', 'System', null, 'status', 'Planned start reached', 'Accepted → In progress'),
      H_('2026-07-03T10:00:00.000Z', 'Lars Berg', 'C2', 'status', 'Request accepted', 'Requested → Accepted'),
    ],
  }));

  // Rejected — expired with no response.
  trips.push(trip({
    id: '48090', hostId: 'C1', customerId: 'K3', customerPrice: 850000, submittedAt: '2026-09-06T09:00:00.000Z', status: 'REJECTED', statusChangedAt: '2026-09-08T12:00:00.000Z', closedAt: '2026-09-08T12:00:00.000Z', closedReason: 'Expired',
    plannedStart: '2026-09-10T06:00:00.000Z', plannedEnd: '2026-09-10T12:00:00.000Z', deadline: '2026-09-08T12:00:00.000Z', deadlineWarned: true,
    from: { address: 'Hamar stasjon, Hamar' }, to: { address: 'Trysil turistsenter, Trysil' }, pax: 15, vehicle: { type: 'MINI16', euro: 'Euro VI', fuel: 'Diesel', luggage: '', other: '' },
    requests: [req('C1', 'C4', 850000, { state: 'EXPIRED', closedAt: '2026-09-08T12:00:00.000Z' })],
    history: [
      H_('2026-09-08T12:00:00.000Z', 'System', null, 'status', 'Response deadline passed', 'Requested → Rejected (Expired)'),
      H_('2026-09-06T09:00:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Request submitted', '— → Requested'),
    ],
  }));

  // Cancelled after acceptance by the host yesterday — shows in Fjord Buss "Needs your action".
  trips.push(trip({
    id: '48088', hostId: 'C1', customerId: 'K4', customerPrice: 1300000, submittedAt: '2026-09-08T09:00:00.000Z', status: 'CANCELLED', statusChangedAt: '2026-09-14T15:20:00.000Z', closedAt: '2026-09-14T15:20:00.000Z', closedReason: 'Customer cancelled', cancelledBy: 'C1',
    plannedStart: '2026-09-17T06:00:00.000Z', plannedEnd: '2026-09-17T11:00:00.000Z', deadline: '2026-09-11T12:00:00.000Z',
    from: { address: 'Bergen lufthavn Flesland' }, to: { address: 'Voss stasjon, Voss' }, pax: 30, acceptedPartnerId: 'C2',
    requests: [req('C1', 'C2', 1300000, { state: 'ACCEPTED', respondedBy: 'Lars Berg', respondedAt: '2026-09-08T12:30:00.000Z' })],
    history: [
      H_('2026-09-14T15:20:00.000Z', 'Ingrid Hansen', 'C1', 'status', 'Trip cancelled', 'Accepted → Cancelled — Customer cancelled'),
      H_('2026-09-08T12:30:00.000Z', 'Lars Berg', 'C2', 'status', 'Request accepted', 'Requested → Accepted'),
    ],
  }));

  // ---------------------------------------------------------------------------
  // Generated background trips (deterministic)
  // ---------------------------------------------------------------------------
  let seed = 20260915;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const pairs = [['C1', ['C2']], ['C1', ['C3']], ['C1', ['C4']], ['C1', ['C2', 'C3']], ['C2', ['C1']], ['C3', ['C1']], ['C1', ['C5']], ['C1', ['C2']]];
  const custBy = { C1: ['K1', 'K2', 'K3', 'K4'], C2: ['K6', 'K7'], C3: ['K8'] };
  const creator = { C1: ['Ingrid Hansen', 'U1'], C2: ['Nina Holm', 'U9'], C3: ['Magnus Lie', 'U7'] };
  const coord = { C1: 'Kari Nes', C2: 'Lars Berg', C3: 'Magnus Lie', C4: 'Siri Voll', C5: 'Tind dispatcher' };
  const invoices = [];
  let invSeq = 100;

  for (let i = 0; i < 46; i++) {
    const [hostId, partners] = pick(pairs);
    const id = String(47850 + i * 3);
    const startMs = Math.round((now + (-150 + rnd() * 178) * DAY) / (15 * 60e3)) * 15 * 60e3;
    const endMs = startMs + (3 + Math.floor(rnd() * 8)) * H;
    const submittedMs = startMs - (2 + Math.floor(rnd() * 18)) * DAY;
    const deadlineMs = startMs - DAY;
    const cp = (8 + Math.floor(rnd() * 33)) * 100000;
    const from = pick(addresses);
    let to = pick(addresses); if (to === from) to = addresses[(addresses.indexOf(from) + 3) % addresses.length];
    const [crName, crId] = creator[hostId];
    const reqs = partners.map((p) => req(hostId, p, cp));
    const t = trip({
      id, hostId, customerId: pick(custBy[hostId]), customerPrice: cp, submittedAt: iso(submittedMs), createdBy: crId, department: hostId === 'C1' ? pick(['Oslo', 'West']) : 'West',
      plannedStart: iso(startMs), plannedEnd: iso(endMs), deadline: iso(deadlineMs), deadlineWarned: deadlineMs <= now,
      from: { address: from }, to: { address: to }, pax: 12 + Math.floor(rnd() * 45), groupRef: `GR-${id}`,
      requests: reqs,
    });
    if (t.pax > 49) t.vehicle.type = 'COACH57';
    if (t.pax <= 16) t.vehicle.type = 'MINI16';
    const hist = [H_(t.submittedAt, crName, hostId, 'status', 'Request submitted', '— → Requested')];
    const acceptAt = iso(submittedMs + (2 + Math.floor(rnd() * 30)) * H);
    const accept = () => {
      reqs[0].state = 'ACCEPTED'; reqs[0].respondedBy = coord[reqs[0].partnerId]; reqs[0].respondedAt = acceptAt; t.acceptedPartnerId = reqs[0].partnerId;
      reqs.slice(1).forEach((r) => { r.state = 'WITHDRAWN'; r.withdrawReason = 'Another partner accepted'; r.closedAt = acceptAt; });
      hist.unshift(H_(acceptAt, coord[reqs[0].partnerId], reqs[0].partnerId, 'status', 'Request accepted', 'Requested → Accepted'));
    };
    const roll = rnd();
    if (endMs <= now) {
      if (roll < 0.7) {
        accept(); t.status = 'COMPLETED'; t.closedAt = iso(endMs); t.statusChangedAt = t.closedAt;
        hist.unshift(H_(t.closedAt, 'System', null, 'status', 'Planned end reached', 'In progress → Completed'));
      } else if (roll < 0.85) {
        accept(); t.status = 'CANCELLED'; t.closedAt = iso(startMs - 2 * DAY); t.closedReason = pick(reasons.CANCEL); t.cancelledBy = rnd() < 0.5 ? hostId : reqs[0].partnerId; t.statusChangedAt = t.closedAt;
        hist.unshift(H_(t.closedAt, t.cancelledBy === hostId ? crName : coord[reqs[0].partnerId], t.cancelledBy, 'status', 'Trip cancelled', `Accepted → Cancelled — ${t.closedReason}`));
      } else if (roll < 0.93) {
        reqs.forEach((r) => { r.state = 'EXPIRED'; r.closedAt = t.deadline; });
        t.status = 'REJECTED'; t.closedAt = t.deadline; t.closedReason = 'Expired'; t.statusChangedAt = t.closedAt;
        hist.unshift(H_(t.closedAt, 'System', null, 'status', 'Response deadline passed', 'Requested → Rejected (Expired)'));
      } else {
        reqs.forEach((r) => { r.state = 'REJECTED'; r.reason = pick(reasons.REJECT); r.respondedBy = coord[r.partnerId]; r.respondedAt = acceptAt; r.closedAt = acceptAt; });
        t.status = 'REJECTED'; t.closedAt = acceptAt; t.closedReason = 'Rejected by all partners'; t.statusChangedAt = t.closedAt;
        hist.unshift(H_(t.closedAt, coord[reqs[0].partnerId], reqs[0].partnerId, 'status', 'Request rejected', `Requested → Rejected — ${reqs[0].reason}`));
      }
    } else if (startMs <= now) {
      accept(); t.status = 'IN_PROGRESS'; t.statusChangedAt = t.plannedStart;
      hist.unshift(H_(t.plannedStart, 'System', null, 'status', 'Planned start reached', 'Accepted → In progress'));
    } else if (roll < 0.5 && deadlineMs > now) {
      // stays Requested
    } else if (roll < 0.9 || deadlineMs <= now) {
      accept(); t.status = 'ACCEPTED'; t.statusChangedAt = acceptAt;
    } else {
      reqs.forEach((r) => { r.state = 'WITHDRAWN'; r.withdrawReason = 'Trip details changed'; r.closedAt = iso(now - 3 * DAY); });
      t.status = 'CANCELLED'; t.closedAt = iso(now - 3 * DAY); t.closedReason = 'Trip details changed'; t.cancelledBy = hostId; t.statusChangedAt = t.closedAt;
      hist.unshift(H_(t.closedAt, crName, hostId, 'status', 'Trip cancelled', 'Requested → Cancelled — Trip details changed'));
    }
    t.history = hist;
    trips.push(t);

    // Invoices for most completed trips older than two days.
    if (t.status === 'COMPLETED' && endMs < now - 2 * DAY && rnd() < 0.8) {
      const r = reqs[0];
      const issuer = companies.find((c) => c.id === r.partnerId);
      const ageDays = (now - endMs) / DAY;
      const createdMs = endMs + (1 + Math.floor(rnd() * 3)) * DAY;
      let status = 'APPROVED';
      if (ageDays < 12) status = pick(['DRAFT', 'PENDING', 'PENDING', 'APPROVED']);
      else if (rnd() < 0.12) status = 'DECLINED';
      const lines = [{ desc: `Trip ${t.id}, ${t.plannedStart.slice(0, 10)}, ${from.split(',')[0]} → ${to.split(',')[0]}`, qty: 1, unit: r.offer, vat: issuer.vat, source: 'OFFER_PRICE' }];
      if (rnd() < 0.4) lines.push({ desc: 'Waiting time (hours)', qty: 1 + Math.floor(rnd() * 3), unit: 45000, vat: issuer.vat, source: 'EXTRA' });
      const inv = {
        no: `BN-INV-2026-${String(++invSeq).padStart(6, '0')}`, version: 1, tripId: t.id, issuerId: r.partnerId, recipientId: hostId, status, lines, currency: 'NOK',
        createdAt: iso(createdMs), submittedAt: status === 'DRAFT' ? null : iso(createdMs + 2 * H), decidedAt: null, decidedBy: null, declineReason: null, snapshot: null,
      };
      if (status === 'APPROVED' || status === 'DECLINED') {
        inv.decidedAt = iso(createdMs + (2 + Math.floor(rnd() * 8)) * DAY);
        inv.decidedBy = hostId === 'C1' ? 'Sofie Moen' : 'Finance user';
        if (status === 'DECLINED') inv.declineReason = pick(reasons.INVOICE_DECLINE);
        inv.snapshot = JSON.parse(JSON.stringify(lines));
      }
      invoices.push(inv);
    }
  }

  // Hand-crafted invoices
  invoices.push({
    no: 'BN-INV-2026-000184', version: 1, tripId: '48141', issuerId: 'C2', recipientId: 'C1', status: 'PENDING', currency: 'NOK',
    lines: [
      { desc: 'Trip 48141, 2026-09-05, Oslo S → Flåm kai', qty: 1, unit: 1700000, vat: 25, source: 'OFFER_PRICE' },
      { desc: 'Ferry Hardanger', qty: 1, unit: 120000, vat: 25, source: 'ADDITIONAL_COST' },
      { desc: 'Waiting time (hours)', qty: 2, unit: 45000, vat: 25, source: 'EXTRA' },
    ],
    createdAt: '2026-09-07T12:00:00.000Z', submittedAt: '2026-09-08T09:00:00.000Z', decidedAt: null, decidedBy: null, declineReason: null, snapshot: null,
  });
  const declinedLines = [
    { desc: 'Trip 48133, 2026-08-28, Lillehammer → Ålesund', qty: 1, unit: 1650000, vat: 25, source: 'OFFER_PRICE' },
    { desc: 'Extra driver hours', qty: 4, unit: 65000, vat: 25, source: 'EXTRA' },
  ];
  invoices.push({
    no: 'BN-INV-2026-000171', version: 1, tripId: '48133', issuerId: 'C3', recipientId: 'C1', status: 'DECLINED', currency: 'NOK', lines: declinedLines,
    createdAt: '2026-08-30T10:00:00.000Z', submittedAt: '2026-08-30T10:30:00.000Z', decidedAt: '2026-09-03T08:30:00.000Z', decidedBy: 'Sofie Moen', declineReason: 'Extra lines not agreed', snapshot: JSON.parse(JSON.stringify(declinedLines)),
  });
  const approvedLines = [{ desc: 'Trip 48120, 2026-09-01, Drammen → Hemsedal', qty: 1, unit: 1275000, vat: 25, source: 'OFFER_PRICE' }];
  invoices.push({
    no: 'BN-INV-2026-000176', version: 1, tripId: '48120', issuerId: 'C2', recipientId: 'C1', status: 'APPROVED', currency: 'NOK', lines: approvedLines,
    createdAt: '2026-09-02T09:00:00.000Z', submittedAt: '2026-09-02T09:30:00.000Z', decidedAt: '2026-09-06T10:00:00.000Z', decidedBy: 'Sofie Moen', declineReason: null, snapshot: JSON.parse(JSON.stringify(approvedLines)),
  });

  const notifications = [
    { id: 'n1', at: '2026-09-14T08:12:00.000Z', companyId: 'C2', roles: ['PCOORD'], event: 'N-01', text: 'Nordic Coaches AS shared trip 48213 (2026-09-20 08:00, Oslo S → Bergen busstasjon). Respond by 2026-09-18 12:00.', link: '#/trips/48213', channels: ['In-app', 'Email', 'Push'], read: [] },
    { id: 'n2', at: '2026-09-14T08:12:00.000Z', companyId: 'C3', roles: ['PCOORD'], event: 'N-01', text: 'Nordic Coaches AS shared trip 48213 (2026-09-20 08:00, Oslo S → Bergen busstasjon). Respond by 2026-09-18 12:00.', link: '#/trips/48213', channels: ['In-app', 'Email', 'Push'], read: [] },
    { id: 'n3', at: '2026-09-15T07:05:00.000Z', companyId: 'C4', roles: ['PCOORD'], event: 'N-01', text: 'Nordic Coaches AS shared trip 48219 (2026-09-16 06:00, Gardermoen → Lillehammer). Respond by 2026-09-15 22:00.', link: '#/trips/48219', channels: ['In-app', 'Email', 'Push'], read: [] },
    { id: 'n4', at: '2026-09-13T09:30:00.000Z', companyId: 'C1', roles: ['PCOORD'], event: 'N-01', text: 'Fjord Buss AS shared trip 48198 (2026-09-19 09:00, Bergen → Flåm). Respond by 2026-09-17 14:00.', link: '#/trips/48198', channels: ['In-app', 'Email', 'Push'], read: [] },
    { id: 'n5', at: '2026-09-08T09:00:00.000Z', companyId: 'C1', roles: ['FIN'], event: 'N-07', text: 'Fjord Buss AS submitted invoice BN-INV-2026-000184 (22 750,00 NOK) for trip 48141.', link: '#/invoices/BN-INV-2026-000184', channels: ['In-app', 'Email'], read: [] },
    { id: 'n6', at: '2026-09-03T08:30:00.000Z', companyId: 'C3', roles: ['FIN'], event: 'N-08', text: 'Invoice BN-INV-2026-000171 was declined: Extra lines not agreed.', link: '#/invoices/BN-INV-2026-000171', channels: ['In-app', 'Email'], read: [] },
    { id: 'n7', at: '2026-09-14T15:20:00.000Z', companyId: 'C2', roles: null, event: 'N-04', text: 'Trip 48088 (2026-09-17 08:00) was cancelled by Nordic Coaches AS: Customer cancelled.', link: '#/trips/48088', channels: ['In-app', 'Email'], read: [] },
    { id: 'n8', at: '2026-09-15T08:12:00.000Z', companyId: 'C1', roles: null, event: 'N-06', text: 'Lars Berg (Fjord Buss AS) commented on trip 48177.', link: '#/trips/48177', channels: ['In-app'], read: [] },
  ];

  return { NOW, companies, affiliations, users, customers, vehicleTypes, addresses, reasons, teqTrips, trips, invoices, notifications, invoiceSeq: 200 };
})();

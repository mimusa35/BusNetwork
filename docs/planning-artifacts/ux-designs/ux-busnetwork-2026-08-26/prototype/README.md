# BusNetwork — interactive demo

A clickable prototype of the BusNetwork portal, built from BN-BRD-001 v1.0 and BN-PRD-001 v1.0 and styled from `../DESIGN.md`. It shows the whole product: six tabs, the trip lifecycle from request to invoice, both sides of every trip, and the rules the requirements describe.

## Open it

**`BusNetwork-Demo.html` — one self-contained file. Double-click it.**

No server, no install, no internet needed. HTML, CSS, JavaScript and all sample data are inside that one file, so you can email it, drop it in Teams or Slack, or put it on a USB stick and it still works. Fonts load from Google when you are online and fall back to system fonts when you are not.

Works in current Chrome, Edge, Firefox and Safari, on desktop and tablet; the layout narrows sensibly on a phone.

> The other files in this folder are the editable source. `logo.svg` is the master copy of the logo, and `app-main.js` inlines the same shapes, so update both if the logo changes. `python3 build-single-file.py` regenerates `BusNetwork-Demo.html` from them after a change.

## Running the demo in front of people

1. **Open the file.** A short welcome panel explains the demo and offers the guide.
2. **Use the Demo guide** (top right). It lists nine flows; each one switches to the right person, opens the right screen and pins the steps to the top of the page.
3. **Switch persona** any time with *Signed in as* in the top bar. The screens, permissions and visible data change with the person — this is the fastest way to show the two sides of a trip.
4. **Move time** with the *Demo clock* menu to show status changes that normally happen overnight.
5. **Reset** from the same menu when you want the starting scenario back.

Your changes are saved in the browser, so you can prepare a scenario before a meeting and it will still be there.

## The nine flows in the guide

| # | Flow | As | Shows |
|---|---|---|---|
| 1 | Share a trip with two partners | Ingrid, Sales (host) | The four-step request form, prices calculated from each partner's agreement, an override recorded with the user's name |
| 2 | Answer an incoming request | Lars, Partner Coordinator | Dashboard → filtered list → accept or reject with a mandatory reason |
| 3 | Lose the race — first accept wins | Magnus, Partner Coordinator | Two partners accepting at once: one wins, the other is told immediately |
| 4 | Cancel an accepted trip | Ingrid, Sales | Reason capture, the trip moving from Active to Closed, SMS when the trip starts within 24 hours |
| 5 | Let the clock run the lifecycle | Lars | Accepted → In progress → Completed, and unanswered requests expiring |
| 6 | Invoice a completed trip | Olav, Finance (partner) | "Completed, not invoiced" filter, prefilled invoice, extra lines, submit |
| 7 | Approve or decline an invoice | Sofie, Finance (host) | Approval locking the amounts; a decline coming back as version 2 |
| 8 | Search everything and export | Erik, Management | Filters, the Active + Closed = All count, CSV export |
| 9 | See the cross-company boundary | Ingrid, then Lars | The same trip from both sides: the partner never sees the customer price, the customer's name or the other partner |

## What is in the sample data

Six operators, ten people across five roles, 59 trips covering all six statuses (including a multi-month fixed contract and a trip with a data mismatch flagged by the nightly check), 24 invoices in every status including a declined one awaiting resubmission, comment threads, notifications and a full history log per trip.

Nothing is a static mock-up: lists filter, sort, page and export for real; the request form validates field by field; prices are calculated; accepting a trip really withdraws the other partners' requests.

## States you can demonstrate

- **Loading** — every screen shows its skeleton on first visit. *Demo clock → Simulate slow loading* keeps it on screen long enough to talk about.
- **Empty** — filter a list down to nothing: it says why and offers to clear the filters.
- **Error** — *Demo clock → Simulate a load error* shows the failure state with Try again.
- **Success** — toasts confirm each action and link to where the item went.
- **Refusal** — accepting a taken trip, declining without a reason or invoicing a cancelled trip each explain what happened instead of failing silently.

## Deliberately simplified

Address suggestions come from a fixed list instead of Google Maps; the trip page shows a schematic stop list instead of an embedded map, with an *Open in Google Maps* button that opens real directions for the trip's stops in a new tab (needs internet); attachments are recorded but not stored; "Download PDF" opens the browser print dialog; XLSX export explains that the real one is generated server-side; notifications appear in the bell panel rather than being emailed; department scoping (BR-09) is not simulated, so each person sees their whole company; there is no language switch, so the interface is in English with Norwegian (nb-NO) number and date formatting. The four locales of NFR-06 still apply to the product.

## Not built, and why

Managing affiliations and rates, vehicle and driver assignment, accounting export and payments are out of scope in the BRD. Bulk accept/reject, the column chooser and quick share are *Could* items scheduled after the first release.

## Source files

| File | Purpose |
|---|---|
| `BusNetwork-Demo.html` | **The deliverable** — everything inlined, opens from the file system |
| `build-single-file.py` | Rebuilds the file above from the sources |
| `index.html`, `styles.css` | Shell and all styling (DESIGN.md tokens, light and dark) |
| `data.js` | Sample companies, users, trips, invoices, addresses |
| `app-core.js` | State, time and money helpers, domain rules, lifecycle transitions, persistence |
| `app-ui.js` | Shared components, dashboard, trip lists, trip detail, loading and error states |
| `app-request.js` | The four-step request form |
| `app-invoices.js` | Invoice list and invoice editor |
| `app-main.js` | Routing, rendering, dialogs, notifications, demo guide, events |

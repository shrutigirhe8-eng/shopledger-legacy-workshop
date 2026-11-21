# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a CommonJS Node.js app using Express 4 and body-parser. `server.js` serves `public/`, mounts the API routers, and renders invoice pages; `config.js` holds shop, tax, and coupon settings. `public/` contains `index.html`, `js/app.js`, and `css/style.css`. `data/db.json` is the JSON data store.

### Routes

- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, creation, and cancellation endpoints.
- `routes/products.js` — product and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.

### Library Modules

- `lib/coupons.js` — coupon normalization, validation, discount calculation, and listing.
- `lib/dates.js` — current date, date keys, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, stock checks, stock changes, and inventory summary.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — cart subtotal, discount, and checkout totals.
- `lib/reports.js` — dashboard summary and invoice/order GST reconciliation.
- `lib/store.js` — JSON database reads/writes and audit log updates.
- `lib/tax.js` — item GST rate/slab resolution and CGST/SGST split.

## Build, Test, and Development Commands

- `npm start` — starts the app with `node server.js` (default port 3000, configurable with `PORT`).
- `node --test` — runs tests using Node's built-in test runner.
- `npm test` — currently a placeholder that prints “no test specified” and exits with failure. No build or lint script is defined in `package.json`.

## Coding Style & Testing Guidelines

Existing JavaScript uses CommonJS, `var`, single quotes, semicolons, and two-space indentation. Match the surrounding file style. No test files or test framework are currently present. Write characterization tests before changing behavior; tests must use in-memory data and must never read or write `data/db.json`.

## Change Scope & Dependencies

Change only the module or modules the ticket concerns, and make the smallest fix that works. Add no dependencies. The current ticket is: “Invoice total and GST breakdown do not match what the customer was billed.” Allowed files: `lib/invoice.js`; `lib/tax.js` only if truly needed.

## Commit & Pull Request Notes

Recent Git subjects are short descriptive phrases (for example, “invoice page for accountant”); no consistent prefix convention is apparent in the five most recent subjects.

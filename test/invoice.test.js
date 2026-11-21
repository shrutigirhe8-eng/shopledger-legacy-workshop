'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

// Existing saved orders have HSN but no per-line gstRate; null preserves that
// legacy shape while making the optional field explicit in these fixtures.
function item(name, price, qty, hsn) {
  return { name, price, qty, hsn, gstRate: null };
}

function order(id, items, coupon) {
  return { id, items, coupon: coupon || '' };
}

test('invoice matches checkout HSN slabs for #1001', function () {
  const items = [
    item('Assam CTC Masala Chai 250g', 140, 2, '0902'),
    item('Unpolished Toor Dal 1kg', 165, 2, '0713')
  ];
  const figures = invoice.computeInvoiceFigures(order(1001, items, ''));
  const checkout = pricing.computeTotals(items, '');

  assert.deepEqual(
    { subtotal: figures.subtotal, discount: figures.discount, tax: figures.tax, cgst: figures.cgst, sgst: figures.sgst, total: figures.total },
    { subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9 }
  );
  assert.deepEqual(figures.rows.map(function (row) { return [row.gstPercent, row.lineTax]; }), [[18, 50.4], [5, 16.5]]);
  assert.deepEqual(
    { subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 610, discount: 0, tax: 66.9, total: 676.9 }
  );
});

test('invoice matches checkout coupon and HSN amounts for #1002', function () {
  const items = [
    item('Indrayani Basmati Rice 5kg', 640, 1, '1006'),
    item('Cold-Pressed Sunflower Oil 1L', 190, 2, '1512')
  ];
  const figures = invoice.computeInvoiceFigures(order(1002, items, 'SAVE10'));
  const checkout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(
    { subtotal: figures.subtotal, discount: figures.discount, tax: figures.tax, cgst: figures.cgst, sgst: figures.sgst, total: figures.total },
    { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 }
  );
  assert.deepEqual(figures.rows.map(function (row) { return [row.gstPercent, row.lineTax]; }), [[5, 28.8], [5, 17.1]]);
  assert.deepEqual(
    { subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('invoice matches checkout SAVE10 cap on #1004', function () {
  const items = [item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508')];
  const figures = invoice.computeInvoiceFigures(order(1004, items, 'SAVE10'));
  const checkout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(
    { subtotal: figures.subtotal, discount: figures.discount, tax: figures.tax, cgst: figures.cgst, sgst: figures.sgst, total: figures.total },
    { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 }
  );
  assert.deepEqual(figures.rows.map(function (row) { return [row.gstPercent, row.lineTax]; }), [[5, 104.5]]);
  assert.deepEqual(
    { subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: #1008 all-18% no-coupon invoice matches checkout', function () {
  const items = [
    item('Assam CTC Masala Chai 250g', 140, 1, '0902'),
    item('Kokum Sherbet Concentrate 750ml', 180, 2, '2106')
  ];
  const figures = invoice.computeInvoiceFigures(order(1008, items, ''));
  const checkout = pricing.computeTotals(items, '');

  assert.deepEqual(
    { subtotal: figures.subtotal, discount: figures.discount, tax: figures.tax, cgst: figures.cgst, sgst: figures.sgst, total: figures.total },
    { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 }
  );
  assert.deepEqual(figures.rows.map(function (row) { return [row.gstPercent, row.lineTax]; }), [[18, 25.2], [18, 64.8]]);
  assert.deepEqual(
    { subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 500, discount: 0, tax: 90, total: 590 }
  );
});

test('invoice matches checkout HSN tax and capped pre-tax coupon calculations', function () {
  const items = [item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508')];
  const figures = invoice.computeInvoiceFigures(order(1004, items, 'SAVE10'));
  const checkout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(
    { subtotal: figures.subtotal, discount: figures.discount, tax: figures.tax, cgst: figures.cgst, sgst: figures.sgst, total: figures.total },
    { subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, cgst: checkout.cgst, sgst: checkout.sgst, total: checkout.total }
  );
  assert.deepEqual(figures.rows.map(function (row) { return [row.gstPercent, row.lineTax]; }), [[5, 104.5]]);
});

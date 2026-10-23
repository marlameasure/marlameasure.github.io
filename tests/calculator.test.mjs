import test from 'node:test';
import assert from 'node:assert/strict';
import { convertArea, formatArea, fromSquareFeet, rectangularArea, toSquareFeet } from '../calculator.js';

for (const size of [225, 250, 272.25]) {
  test(`square feet ↔ marla at ${size} sq ft per marla`, () => {
    assert.equal(convertArea(size * 5, 'sqft', 'marla', size), 5);
    assert.equal(convertArea(5, 'marla', 'sqft', size), size * 5);
  });
}
test('kanal and marla use 20 marla per kanal', () => {
  assert.equal(convertArea(1, 'kanal', 'marla', 250), 20);
  assert.equal(convertArea(20, 'marla', 'kanal', 272.25), 1);
});
test('square feet convert to square yards, square metres and acres', () => {
  assert.equal(convertArea(900, 'sqft', 'sqyd', 250), 100);
  assert.ok(Math.abs(convertArea(100, 'sqft', 'sqm', 250) - 9.290304) < 1e-8);
  assert.equal(convertArea(43560, 'sqft', 'acre', 250), 1);
});
test('custom marla size is used in both directions', () => {
  assert.equal(convertArea(1000, 'sqft', 'marla', 200), 5);
  assert.equal(toSquareFeet(5, 'marla', 200), 1000);
});
test('plot dimensions calculate area in feet or metres', () => {
  const feet = rectangularArea(30, 60, 'ft', 250);
  assert.equal(feet.sqft, 1800);
  assert.equal(feet.marla, 7.2);
  const metres = rectangularArea(10, 10, 'm', 250);
  assert.ok(Math.abs(metres.sqft - 1076.39104167) < 1e-8);
});
test('known five-marla areas agree across conversions', () => {
  assert.equal(convertArea(5, 'marla', 'sqft', 272.25), 1361.25);
  assert.equal(convertArea(5, 'marla', 'sqft', 250), 1250);
  assert.equal(convertArea(5, 'marla', 'sqft', 225), 1125);
});
test('zero converts safely, while invalid values, units and dimensions are rejected', () => {
  assert.equal(convertArea(0, 'sqft', 'marla', 250), 0);
  for (const value of [-1, NaN, Infinity, 1e16]) assert.throws(() => toSquareFeet(value, 'sqft', 250));
  for (const size of [0, -10, NaN, Infinity, 1e10]) assert.throws(() => convertArea(1, 'marla', 'sqft', size));
  assert.throws(() => convertArea(1, 'sqft', 'unknown', 250));
  assert.throws(() => rectangularArea(0, 30, 'ft', 250));
  assert.throws(() => rectangularArea(30, -1, 'ft', 250));
});
test('round-trip conversion keeps the represented area', () => {
  const sqm = convertArea(1250, 'sqft', 'sqm', 250);
  assert.ok(Math.abs(convertArea(sqm, 'sqm', 'sqft', 250) - 1250) < 1e-8);
});
test('display formatting rounds to two decimals and groups large values', () => {
  assert.equal(formatArea(1361.256), '1,361.26');
  assert.equal(formatArea(1.2), '1.2');
  assert.equal(formatArea(-0), '0');
  assert.throws(() => formatArea(Infinity));
});
test('reference table values use the same conversion rule as the calculator', () => {
  for (const standard of [225, 250, 272.25, 200]) {
    for (const marla of [1, 3, 5, 10, 20]) {
      const tableSquareFeet = marla * standard;
      assert.equal(tableSquareFeet, convertArea(marla, 'marla', 'sqft', standard));
    }
  }
});
test('Murabba uses the explicitly selected 25-acre agricultural convention', () => {
  assert.equal(convertArea(1, 'murabba', 'acre', 272.25), 25);
  assert.equal(convertArea(25, 'acre', 'murabba', 250), 1);
  assert.equal(convertArea(1, 'murabba', 'kanal', 272.25), 200);
  assert.equal(convertArea(1, 'murabba', 'marla', 272.25), 4000);
  assert.equal(convertArea(1, 'murabba', 'marla', 225), 4840);
});

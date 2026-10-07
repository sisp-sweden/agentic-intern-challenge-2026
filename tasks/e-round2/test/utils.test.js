import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, daysBetween, formatStockholm, isoWeek, stockholmDay } from '../src/utils/dates.js';
import { parseCsv, parseCsvObjects, toCsv } from '../src/utils/csv.js';
import { escapeXml, pluralize, slugify, titleCase, truncate } from '../src/utils/strings.js';
import { clampInt, isEmail, isIsoTimestamp, requireFields } from '../src/utils/validate.js';
import { createLogger } from '../src/utils/log.js';

test('formatStockholm shows the Stockholm wall clock in winter time', () => {
  assert.equal(formatStockholm('2026-03-01T22:40:00Z'), '2026-03-01 23:40');
  assert.equal(formatStockholm('2026-03-01T23:05:00Z'), '2026-03-02 00:05');
});

test('stockholmDay accepts offsets', () => {
  assert.equal(stockholmDay('2026-02-10T12:00:00+01:00'), '2026-02-10');
});

test('daysBetween counts calendar days', () => {
  assert.equal(daysBetween('2026-03-01T23:59:59+01:00', '2026-03-02T08:00:00+01:00'), 1);
  assert.equal(daysBetween('2026-03-02T08:00:00+01:00', '2026-03-02T20:00:00+01:00'), 0);
});

test('isoWeek and addDays', () => {
  assert.equal(isoWeek('2026-01-05T12:00:00+01:00'), 2);
  assert.equal(stockholmDay(addDays('2026-03-01T12:00:00+01:00', 3)), '2026-03-04');
});

test('parseCsv handles quotes, commas and CRLF', () => {
  const rows = parseCsv('a,b\r\n"x, y","say ""hi"""\r\n');
  assert.deepEqual(rows, [['a', 'b'], ['x, y', 'say "hi"']]);
});

test('parseCsvObjects and toCsv round-trip', () => {
  const rows = [{ id: 'a', note: 'one, two' }, { id: 'b', note: '' }];
  const text = toCsv(rows, ['id', 'note']);
  assert.deepEqual(parseCsvObjects(text), rows);
});

test('slugify folds Swedish letters', () => {
  assert.equal(slugify('Åsa Öberg & Co.'), 'asa-oberg-co');
});

test('string helpers', () => {
  assert.equal(titleCase('jane DOE-smith'), 'Jane Doe-Smith');
  assert.equal(truncate('abcdefghij', 5), 'abcd…');
  assert.equal(pluralize(1, 'seat'), '1 seat');
  assert.equal(pluralize(3, 'seat'), '3 seats');
  assert.equal(escapeXml('a & <b>'), 'a &amp; &lt;b&gt;');
});

test('validators', () => {
  assert.equal(isEmail('anna@example.com'), true);
  assert.equal(isEmail('anna@'), false);
  assert.equal(clampInt('12', 0, 10), 10);
  assert.equal(clampInt('x', 1, 10), 1);
  assert.equal(isIsoTimestamp('2026-03-01T23:59:59+01:00'), true);
  assert.equal(isIsoTimestamp('2026-03-01'), false);
  assert.throws(() => requireFields({ a: 1 }, ['a', 'b', 'c']), /missing fields: b, c/);
});

test('logger respects the level', () => {
  const lines = [];
  const log = createLogger('t', { level: 'warn', sink: (l) => lines.push(l) });
  log.info('quiet');
  log.warn('loud', { n: 1 });
  assert.deepEqual(lines, ['WARN  [t] loud {"n":1}']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { bySection, collectPages } from '../src/site/build.js';
import { byCountry, distinctStartups, formatReport, parseJsonLines } from '../src/cohort/report.js';
import { proposeSessions } from '../src/mentors/sessions.js';
import { dueReminders, reminderMessage } from '../src/rsvp/reminders.js';
import { createStore } from '../src/rsvp/store.js';
import { rsvp } from '../src/rsvp/rsvp.js';
import { buildDigest } from '../src/email/digest.js';
import { companiesCsv } from '../src/crm/export.js';
import { retry } from '../src/utils/retry.js';

const root = fileURLToPath(new URL('../', import.meta.url));

test('collectPages finds every section and builds slugs', () => {
  const pages = collectPages(join(root, 'site/content'));
  const sections = bySection(pages);
  assert.ok(sections.blog.length >= 10);
  assert.ok(pages.some((p) => p.slug === 'calls/2026-round2' && p.date === '2026-01-15'));
  assert.ok(pages.every((p) => p.summary.length > 0));
});

test('parseJsonLines names the broken line', () => {
  assert.throws(() => parseJsonLines('{"a":1}\nnope\n'), /line 2/);
  assert.equal(parseJsonLines('{"a":1}\n\n{"a":2}\n').length, 2);
});

test('cohort report counts countries and distinct startups', () => {
  const apps = [
    { startup_id: 'ST-1', hq_country: 'SE' },
    { startup_id: 'st-1 ', hq_country: 'SE' },
    { startup_id: 'ST-2', hq_country: 'FI' },
    { startup_id: 'ST-3' },
  ];
  assert.deepEqual(byCountry(apps), [['SE', 2], ['FI', 1], ['unknown', 1]]);
  assert.equal(distinctStartups(apps), 3);
  assert.match(formatReport(apps), /^applications: 4\nstartups: 3\n/);
});

test('proposeSessions gives each pair its own day and reports what does not fit', () => {
  const mentors = [{ id: 'M', weekdays: [2] }];
  const assignments = [{ startup: 'S1', mentor: 'M' }, { startup: 'S2', mentor: 'M' }];
  const out = proposeSessions(assignments, mentors, '2026-03-02T09:00:00+01:00');
  assert.deepEqual(out.proposals, [{ startup: 'S1', mentor: 'M', day: '2026-03-03' }]);
  assert.deepEqual(out.unscheduled, ['S2']);
});

test('reminders go to confirmed attendees the day before', () => {
  const store = createStore();
  store.addEvent({ id: 'lab', title: 'Interview lab', capacity: 1, starts_at: '2026-01-29T17:30:00+01:00' });
  rsvp(store, 'lab', 'anna@example.com');
  rsvp(store, 'lab', 'bo@example.com');
  assert.equal(dueReminders(store, '2026-01-27T09:00:00+01:00').length, 0);
  const due = dueReminders(store, '2026-01-28T09:00:00+01:00');
  assert.equal(due.length, 1);
  const msg = reminderMessage(due[0]);
  assert.equal(msg.to, 'anna@example.com');
  assert.match(msg.subject, /Interview lab/);
});

test('digest lists upcoming events in order', () => {
  const events = [
    { title: 'B', starts_at: '2026-01-30T17:00:00+01:00' },
    { title: 'A', starts_at: '2026-01-29T17:00:00+01:00' },
    { title: 'Old', starts_at: '2026-01-01T17:00:00+01:00' },
  ];
  assert.equal(buildDigest(events, '2026-01-28T08:00:00+01:00'), 'This week at Fieldnote: 2 events\n\n* 2026-01-29 17:00  A\n* 2026-01-30 17:00  B\n');
  assert.equal(buildDigest([], '2026-01-28T08:00:00+01:00'), 'Nothing is scheduled this week.\n');
});

test('companies export as CSV with joined tags', () => {
  const csv = companiesCsv([{ external_id: 'st-1', name: 'Nordlys, AB', country: 'SE', tags: ['round-2', 'se'] }]);
  assert.equal(csv, 'external_id,name,country,tags\nst-1,"Nordlys, AB",SE,round-2;se\n');
});

test('retry waits between attempts and rethrows the last error', async () => {
  const waits = [];
  const sleep = async (ms) => waits.push(ms);
  assert.equal(await retry(async (n) => { if (n < 2) throw new Error('x'); return 'ok'; }, [1, 2], sleep), 'ok');
  assert.deepEqual(waits, [1, 2]);
  await assert.rejects(retry(async () => { throw new Error('down'); }, [1], sleep), /down/);
});

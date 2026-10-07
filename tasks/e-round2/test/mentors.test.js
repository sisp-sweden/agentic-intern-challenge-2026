import test from 'node:test';
import assert from 'node:assert/strict';
import { allTopics, byId, byTopic, loadMentors, totalCapacity } from '../src/mentors/directory.js';
import { assignMentors, averageRank } from '../src/mentors/matching.js';
import { commonDays, openDays } from '../src/mentors/availability.js';

const mentors = loadMentors();

test('the directory loads and ids are unique', () => {
  assert.equal(mentors.length, 8);
  assert.equal(byId(mentors, 'M-04').name, 'Henrik Ekström');
  assert.equal(byId(mentors, 'nope'), null);
});

test('topic lookup is case-insensitive', () => {
  assert.deepEqual(byTopic(mentors, 'Legal').map((m) => m.id), ['M-06']);
  assert.ok(allTopics(mentors).includes('hardware'));
  assert.equal(totalCapacity(mentors), 26);
});

test('assignMentors respects capacity and falls through to the next preference', () => {
  const small = [{ id: 'A', monthly_capacity: 1 }, { id: 'B', monthly_capacity: 1 }];
  const startups = [
    { id: 'S1', preferences: ['A', 'B'] },
    { id: 'S2', preferences: ['A', 'B'] },
    { id: 'S3', preferences: ['A', 'B'] },
  ];
  const out = assignMentors(startups, small);
  assert.deepEqual(out.assignments.map((a) => [a.startup, a.mentor, a.rank]), [['S1', 'A', 1], ['S2', 'B', 2]]);
  assert.deepEqual(out.unmatched, ['S3']);
  assert.equal(averageRank(out.assignments), 1.5);
});

test('openDays lists the mentor weekdays in a week and skips booked days', () => {
  const m = { weekdays: [2, 4] };
  assert.deepEqual(openDays(m, '2026-03-02T09:00:00+01:00'), ['2026-03-03', '2026-03-05']);
  assert.deepEqual(openDays(m, '2026-03-02T09:00:00+01:00', ['2026-03-03']), ['2026-03-05']);
  assert.deepEqual(commonDays(m, { weekdays: [4, 5] }, '2026-03-02T09:00:00+01:00'), ['2026-03-05']);
});

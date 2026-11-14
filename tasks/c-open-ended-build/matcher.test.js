'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { matchMentors } = require('./matcher');

function mentor(id, capacity) {
  return { id, name: id, expertise: 'general', monthlyCapacity: capacity };
}

function startup(id, preferences) {
  return { id, name: id, preferredMentorIds: preferences };
}

test('breaks an identical-rank contested final seat by startup ID', () => {
  const result = matchMentors(
    [mentor('m1', 1), mentor('m2', 0), mentor('m3', 0)],
    [startup('s2', ['m1']), startup('s1', ['m1'])]
  );

  assert.equal(result.assignments.find((item) => item.startupId === 's1').status, 'assigned');
  assert.equal(result.assignments.find((item) => item.startupId === 's2').status, 'unassigned');
});

test('unassigns a startup when all three preferred mentors are full', () => {
  const result = matchMentors(
    [mentor('m1', 1), mentor('m2', 1), mentor('m3', 1)],
    [
      startup('s1', ['m1', 'm2', 'm3']),
      startup('s2', ['m2', 'm3', 'm1']),
      startup('s3', ['m3', 'm1', 'm2']),
      startup('s4', ['m1', 'm2', 'm3'])
    ]
  );

  const assignment = result.assignments.find((item) => item.startupId === 's4');
  assert.equal(assignment.status, 'unassigned');
  assert.equal(assignment.reason, 'capacity_exhausted');
});

test('matches only available capacity when demand exceeds capacity', () => {
  const result = matchMentors(
    [mentor('m1', 1)],
    [startup('s1', ['m1']), startup('s2', ['m1']), startup('s3', ['m1'])]
  );

  assert.equal(result.summary.matchedCount, 1);
  assert.equal(result.summary.unassignedCount, 2);
  assert.equal(result.summary.matchRate, 1 / 3);
});

test('returns identical output across repeated runs', () => {
  const mentors = [mentor('m1', 1), mentor('m2', 1)];
  const startups = [
    startup('s2', ['m1', 'm2']),
    startup('s1', ['m1', 'm2']),
    startup('s3', ['m1', 'm2'])
  ];

  const first = matchMentors(mentors, startups);
  const second = matchMentors(mentors, startups);
  assert.deepEqual(first, second);
});

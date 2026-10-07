import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/rsvp/store.js';
import { cancel, rsvp, summary } from '../src/rsvp/rsvp.js';

function setup(capacity) {
  const store = createStore();
  store.addEvent({ id: 'demo', capacity });
  return store;
}

test('seats are confirmed up to capacity, then waitlisted', () => {
  const store = setup(2);
  assert.equal(rsvp(store, 'demo', 'a@example.com').status, 'confirmed');
  assert.equal(rsvp(store, 'demo', 'b@example.com').status, 'confirmed');
  assert.equal(rsvp(store, 'demo', 'c@example.com').status, 'waitlisted');
  assert.deepEqual(summary(store, 'demo'), { event: 'demo', capacity: 2, confirmed: 2, waitlisted: 1, seatsLeft: 0 });
});

test('the same address cannot book twice', () => {
  const store = setup(5);
  rsvp(store, 'demo', 'a@example.com');
  const again = rsvp(store, 'demo', ' A@Example.com ');
  assert.equal(again.duplicate, true);
  assert.equal(summary(store, 'demo').confirmed, 1);
});

test('cancelling promotes the first person on the waitlist', () => {
  const store = setup(1);
  rsvp(store, 'demo', 'a@example.com');
  rsvp(store, 'demo', 'b@example.com');
  rsvp(store, 'demo', 'c@example.com');
  assert.deepEqual(cancel(store, 'demo', 'a@example.com'), { cancelled: true, promoted: 'b@example.com' });
  assert.equal(summary(store, 'demo').waitlisted, 1);
});

test('bad input is reported, not thrown', () => {
  const store = setup(1);
  assert.equal(rsvp(store, 'missing', 'a@example.com').status, 'error');
  assert.equal(rsvp(store, 'demo', 'not-an-email').status, 'error');
  assert.deepEqual(cancel(store, 'demo', 'x@example.com'), { cancelled: false, promoted: null });
});

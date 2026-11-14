import test from "node:test";
import assert from "node:assert/strict";
import { rsvpToEvent } from "./rsvp.js";
import { getEvent, _createEventForTests, _resetForTests } from "./store.js";

test("summer-demo-day never seats more attendees than its capacity", async () => {
  const eventId = "summer-demo-day";
  _resetForTests(eventId);
  const event = getEvent(eventId);

  // Six people RSVP at effectively the same moment for a 3-seat event —
  // this is a normal traffic pattern right when an event announcement goes out.
  const requests = Array.from({ length: 6 }, (_, i) => rsvpToEvent(eventId, `user-${i}`));
  const results = await Promise.all(requests);

  const confirmed = results.filter((r) => r.status === "confirmed").length;

  assert.ok(
    confirmed <= event.capacity,
    `expected at most ${event.capacity} confirmed RSVPs, but got ${confirmed}`
  );
});

test("duplicate user submissions retain the existing behavior", async () => {
  const eventId = "summer-demo-day";
  _resetForTests(eventId);
  const event = getEvent(eventId);

  const results = await Promise.all([
    rsvpToEvent(eventId, "same-user"),
    rsvpToEvent(eventId, "same-user"),
  ]);

  assert.deepEqual(results.map((result) => result.status), ["confirmed", "confirmed"]);
  assert.equal(event.attendeeIds.length, 2);
});

test("unknown events return not_found", async () => {
  assert.deepEqual(await rsvpToEvent("missing-event", "user-1"), { status: "not_found" });
});

test("full events add RSVPs to the waitlist", async () => {
  const eventId = "summer-demo-day";
  _resetForTests(eventId);

  await Promise.all([
    rsvpToEvent(eventId, "user-1"),
    rsvpToEvent(eventId, "user-2"),
    rsvpToEvent(eventId, "user-3"),
  ]);
  const result = await rsvpToEvent(eventId, "user-4");

  assert.deepEqual(result, { status: "waitlisted", position: 0 });
  assert.equal(getEvent(eventId).attendeeIds.length, 3);
});

test("concurrent RSVPs for separate events do not share capacity", async () => {
  const firstEventId = "test-event-one";
  const secondEventId = "test-event-two";
  _createEventForTests(firstEventId, 2);
  _createEventForTests(secondEventId, 2);

  const results = await Promise.all(
    Array.from({ length: 8 }, (_, index) =>
      rsvpToEvent(index % 2 ? firstEventId : secondEventId, `user-${index}`)
    )
  );

  assert.equal(
    results.filter((result, index) => result.status === "confirmed" && index % 2 === 0).length,
    2
  );
  assert.equal(
    results.filter((result, index) => result.status === "confirmed" && index % 2 === 1).length,
    2
  );
  assert.equal(getEvent(firstEventId).attendeeIds.length, 2);
  assert.equal(getEvent(secondEventId).attendeeIds.length, 2);
});

test("high-concurrency bursts never exceed capacity", async () => {
  const eventId = "summer-demo-day";
  _resetForTests(eventId);
  const event = getEvent(eventId);
  const requestCount = 100;

  const results = await Promise.all(
    Array.from({ length: requestCount }, (_, index) => rsvpToEvent(eventId, `user-${index}`))
  );

  assert.equal(results.filter((result) => result.status === "confirmed").length, event.capacity);
  assert.equal(
    results.filter((result) => result.status === "waitlisted").length,
    requestCount - event.capacity
  );
  assert.equal(event.attendeeIds.length, event.capacity);
  assert.equal(event.waitlistIds.length, requestCount - event.capacity);
});

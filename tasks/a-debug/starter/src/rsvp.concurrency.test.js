import test from "node:test";
import assert from "node:assert/strict";
import { rsvpToEvent } from "./rsvp.js";
import { getEvent, _resetForTests } from "./store.js";

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

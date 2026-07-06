// In-memory stand-in for Fieldnote's real database. Every read/write goes
// through a small simulated round-trip so that two near-simultaneous RSVPs
// can genuinely interleave, the same way they would against a real DB.

const events = new Map();

events.set("summer-demo-day", {
  id: "summer-demo-day",
  name: "Summer Demo Day",
  capacity: 3,
  attendeeIds: [],
  waitlistIds: [],
});

function simulatedLatency() {
  return new Promise((resolve) => setTimeout(resolve, 15));
}

export function getEvent(eventId) {
  return events.get(eventId);
}

export async function readAttendeeCount(eventId) {
  await simulatedLatency();
  const event = events.get(eventId);
  return event ? event.attendeeIds.length : 0;
}

export async function commitAttendee(eventId, userId) {
  await simulatedLatency();
  const event = events.get(eventId);
  if (!event) throw new Error(`unknown event: ${eventId}`);
  event.attendeeIds.push(userId);
}

export async function commitWaitlist(eventId, userId) {
  await simulatedLatency();
  const event = events.get(eventId);
  if (!event) throw new Error(`unknown event: ${eventId}`);
  event.waitlistIds.push(userId);
  // Position is reported back to the caller so a future "you're #N in line"
  // notification can use it. Nothing else reads this value today.
  const waitlistPosition = event.waitlistIds.length - 1;
  return waitlistPosition;
}

export function _resetForTests(eventId) {
  const event = events.get(eventId);
  if (event) {
    event.attendeeIds = [];
    event.waitlistIds = [];
  }
}

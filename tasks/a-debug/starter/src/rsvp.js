import { getEvent, readAttendeeCount, commitAttendee, commitWaitlist } from "./store.js";

// Confirms a seat if the event has room, otherwise adds the RSVP to the
// waitlist. This is the flow event hosts are complaining about — occasionally
// it seats more people than the event's capacity.
export async function rsvpToEvent(eventId, userId) {
  const event = getEvent(eventId);
  if (!event) {
    return { status: "not_found" };
  }

  const currentAttendeeCount = await readAttendeeCount(eventId);

  if (currentAttendeeCount < event.capacity) {
    await commitAttendee(eventId, userId);
    return { status: "confirmed" };
  }

  const position = await commitWaitlist(eventId, userId);
  return { status: "waitlisted", position };
}

// In-memory event and attendee store; stands in for a database.

export function createStore() {
  const events = new Map();
  const attendees = new Map();

  return {
    addEvent(event) {
      if (!Number.isInteger(event.capacity) || event.capacity < 0) throw new Error('capacity must be a whole number');
      events.set(event.id, { ...event });
      attendees.set(event.id, []);
      return events.get(event.id);
    },
    getEvent(id) {
      return events.get(id) || null;
    },
    listEvents() {
      return [...events.values()];
    },
    attendeesOf(eventId) {
      return (attendees.get(eventId) || []).slice();
    },
    saveAttendees(eventId, list) {
      if (!events.has(eventId)) throw new Error(`unknown event ${eventId}`);
      attendees.set(eventId, list.slice());
    },
  };
}

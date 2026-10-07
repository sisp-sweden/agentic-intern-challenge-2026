// RSVP flow for accelerator events: confirmed seats up to capacity, then a waitlist.
import { isEmail } from '../utils/validate.js';

function emailKey(email) {
  return email.trim().toLowerCase();
}

export function rsvp(store, eventId, email) {
  const event = store.getEvent(eventId);
  if (!event) return { status: 'error', reason: 'unknown event' };
  if (!isEmail(email)) return { status: 'error', reason: 'invalid email' };

  const list = store.attendeesOf(eventId);
  const key = emailKey(email);
  const existing = list.find((a) => a.email === key);
  if (existing) return { status: existing.state, duplicate: true };

  const confirmed = list.filter((a) => a.state === 'confirmed').length;
  const state = confirmed < event.capacity ? 'confirmed' : 'waitlisted';
  store.saveAttendees(eventId, [...list, { email: key, state, order: list.length + 1 }]);
  return { status: state, duplicate: false };
}

// Cancel a booking and promote the first person on the waitlist, if any.
export function cancel(store, eventId, email) {
  const list = store.attendeesOf(eventId);
  const key = emailKey(email);
  const index = list.findIndex((a) => a.email === key);
  if (index === -1) return { cancelled: false, promoted: null };

  const wasConfirmed = list[index].state === 'confirmed';
  const rest = list.filter((_, i) => i !== index);
  let promoted = null;
  if (wasConfirmed) {
    const next = rest.find((a) => a.state === 'waitlisted');
    if (next) {
      next.state = 'confirmed';
      promoted = next.email;
    }
  }
  store.saveAttendees(eventId, rest);
  return { cancelled: true, promoted };
}

export function summary(store, eventId) {
  const event = store.getEvent(eventId);
  const list = store.attendeesOf(eventId);
  const confirmed = list.filter((a) => a.state === 'confirmed').length;
  return {
    event: event ? event.id : null,
    capacity: event ? event.capacity : 0,
    confirmed,
    waitlisted: list.length - confirmed,
    seatsLeft: event ? Math.max(0, event.capacity - confirmed) : 0,
  };
}

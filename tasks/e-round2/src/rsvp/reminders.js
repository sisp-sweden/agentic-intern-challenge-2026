// Reminder emails for confirmed attendees, sent the day before an event.
import { daysBetween } from '../utils/dates.js';
import { renderEmail } from '../email/render.js';

export function dueReminders(store, now, leadDays = 1) {
  const due = [];
  for (const event of store.listEvents()) {
    if (daysBetween(now, event.starts_at) !== leadDays) continue;
    for (const attendee of store.attendeesOf(event.id)) {
      if (attendee.state === 'confirmed') due.push({ event, attendee });
    }
  }
  return due;
}

export function reminderMessage({ event, attendee }) {
  const mail = renderEmail('rsvp-confirmed', {
    name: attendee.email.split('@')[0],
    event: event.title,
    date: event.starts_at.slice(0, 10),
    doors: event.doors || '17:30',
    venue: event.venue || 'the Fieldnote office',
  });
  return { to: attendee.email, ...mail };
}

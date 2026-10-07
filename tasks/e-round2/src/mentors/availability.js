// Which days of a given week a mentor can take a session.
import { addDays, stockholmDay, stockholmParts } from '../utils/dates.js';

// weekdays use 1 = Monday ... 7 = Sunday.
function weekdayOf(date) {
  const p = stockholmParts(date);
  const d = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)));
  return d.getUTCDay() || 7;
}

// Calendar days (YYYY-MM-DD) in the seven days from `start` on which the mentor is free.
export function openDays(mentor, start, booked = []) {
  const taken = new Set(booked);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const day = stockholmDay(date);
    if (mentor.weekdays.includes(weekdayOf(date)) && !taken.has(day)) days.push(day);
  }
  return days;
}

// Days on which both mentors are free, for a joint session.
export function commonDays(a, b, start) {
  const other = new Set(openDays(b, start));
  return openDays(a, start).filter((d) => other.has(d));
}

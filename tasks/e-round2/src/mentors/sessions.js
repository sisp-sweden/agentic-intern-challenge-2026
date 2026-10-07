// Proposes a first session day for every mentor/startup pair that matching produced.
import { openDays } from './availability.js';

// `assignments` come from assignMentors(); `from` is the first day of the month's planning window.
export function proposeSessions(assignments, mentors, from) {
  const booked = new Map();
  const proposals = [];
  const unscheduled = [];
  for (const a of assignments) {
    const mentor = mentors.find((m) => m.id === a.mentor);
    const taken = booked.get(a.mentor) || [];
    const day = mentor ? openDays(mentor, from, taken)[0] : undefined;
    if (!day) {
      unscheduled.push(a.startup);
      continue;
    }
    booked.set(a.mentor, [...taken, day]);
    proposals.push({ startup: a.startup, mentor: a.mentor, day });
  }
  return { proposals, unscheduled };
}

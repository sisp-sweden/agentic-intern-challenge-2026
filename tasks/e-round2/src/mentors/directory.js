// Mentor directory: the people who give office hours to the cohort.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('./mentors.json', import.meta.url));

export function loadMentors(file = FILE) {
  const mentors = JSON.parse(readFileSync(file, 'utf8'));
  const seen = new Set();
  for (const m of mentors) {
    if (seen.has(m.id)) throw new Error(`duplicate mentor id ${m.id}`);
    seen.add(m.id);
    if (!Number.isInteger(m.monthly_capacity) || m.monthly_capacity < 0) {
      throw new Error(`mentor ${m.id}: monthly_capacity must be a whole number`);
    }
  }
  return mentors;
}

export function byId(mentors, id) {
  return mentors.find((m) => m.id === id) || null;
}

export function byTopic(mentors, topic) {
  const wanted = String(topic).trim().toLowerCase();
  return mentors.filter((m) => m.topics.some((t) => t.toLowerCase() === wanted));
}

export function allTopics(mentors) {
  return [...new Set(mentors.flatMap((m) => m.topics))].sort((a, b) => a.localeCompare(b));
}

export function totalCapacity(mentors) {
  return mentors.reduce((sum, m) => sum + m.monthly_capacity, 0);
}

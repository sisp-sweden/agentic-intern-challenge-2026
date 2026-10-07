// Reads ops/interviews/round2-schedule.csv: one row per interview slot.
import { readFileSync } from 'node:fs';
import { parseCsvObjects } from '../utils/csv.js';

export function loadSlots(file) {
  return parseCsvObjects(readFileSync(file, 'utf8'));
}

export function slotsByDay(slots) {
  const days = {};
  for (const slot of slots) (days[slot.start.slice(0, 10)] ||= []).push(slot);
  return days;
}

// Slots per room, for the room booking sheet.
export function roomLoad(slots) {
  const rooms = {};
  for (const slot of slots) rooms[slot.room] = (rooms[slot.room] || 0) + 1;
  return rooms;
}

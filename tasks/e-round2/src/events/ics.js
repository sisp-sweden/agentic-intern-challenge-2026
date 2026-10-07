// Calendar invites (RFC 5545) for events and interview slots.
import { addMinutes } from '../utils/dates.js';

function stamp(date) {
  return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeText(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

// Lines longer than 75 octets are folded with a leading space.
function fold(line) {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(` ${line.slice(i, i + 74)}`);
  return parts.join('\r\n');
}

export function buildInvite({ uid, title, start, minutes = 60, location = '', description = '' }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fieldnote//Events//EN',
    'BEGIN:VEVENT',
    `UID:${uid}@fieldnote.example`,
    `DTSTAMP:${stamp(start)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(addMinutes(start, minutes))}`,
    `SUMMARY:${escapeText(title)}`,
  ];
  if (location) lines.push(`LOCATION:${escapeText(location)}`);
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

// Date helpers. Fieldnote works in Stockholm time, so everything that is shown
// to a person goes through the Europe/Stockholm zone.
const ZONE = 'Europe/Stockholm';

const partsFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// Wall-clock parts of an instant in Stockholm.
export function stockholmParts(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid date: ${input}`);
  const out = {};
  for (const part of partsFormat.formatToParts(date)) {
    if (part.type !== 'literal') out[part.type] = part.value;
  }
  return { year: out.year, month: out.month, day: out.day, hour: out.hour, minute: out.minute };
}

// "2026-03-26 09:00" in Stockholm time.
export function formatStockholm(input) {
  const p = stockholmParts(input);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

// "2026-03-26" in Stockholm time.
export function stockholmDay(input) {
  const p = stockholmParts(input);
  return `${p.year}-${p.month}-${p.day}`;
}

export function addMinutes(input, minutes) {
  return new Date(new Date(input).getTime() + minutes * 60_000);
}

export function addDays(input, days) {
  return addMinutes(input, days * 24 * 60);
}

// Whole days from a to b, ignoring the time of day in Stockholm.
export function daysBetween(a, b) {
  const toUtc = (x) => {
    const p = stockholmParts(x);
    return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

// ISO week number (1-53) of a Stockholm calendar day.
export function isoWeek(input) {
  const p = stockholmParts(input);
  const d = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)));
  const weekday = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86_400_000 + 1) / 7);
}

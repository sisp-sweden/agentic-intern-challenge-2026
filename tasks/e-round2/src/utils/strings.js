// Small string helpers used by the email templates, the site feed and the CRM sync.

const SWEDISH = { å: 'a', ä: 'a', ö: 'o', Å: 'a', Ä: 'a', Ö: 'o', é: 'e', ü: 'u' };

export function slugify(text) {
  return String(text)
    .replace(/[åäöÅÄÖéü]/g, (c) => SWEDISH[c])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleCase(text) {
  return String(text)
    .toLowerCase()
    .replace(/(^|[\s-])([a-zåäö])/g, (_, sep, c) => sep + c.toUpperCase());
}

export function truncate(text, max) {
  const s = String(text);
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function pluralize(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

// Escape the five characters that matter in XML and HTML text.
export function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function normalizeId(value) {
  return String(value ?? '').trim().toLowerCase();
}

// Input checks for the small HTTP-facing helpers.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value) {
  return typeof value === 'string' && EMAIL.test(value.trim());
}

// Throws one readable error that lists every missing field.
export function requireFields(object, fields) {
  const missing = fields.filter((f) => object == null || object[f] === undefined || object[f] === '');
  if (missing.length > 0) throw new Error(`missing field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
  return object;
}

export function clampInt(value, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function isIsoTimestamp(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(value);
}

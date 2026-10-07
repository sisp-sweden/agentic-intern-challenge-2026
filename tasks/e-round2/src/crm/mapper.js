// Maps Fieldnote records to the shape the CRM expects.
import { normalizeId, slugify } from '../utils/strings.js';

export function toCrmCompany(application) {
  return {
    external_id: normalizeId(application.startup_id),
    name: String(application.name || '').trim(),
    country: application.hq_country || null,
    source: 'fieldnote-application',
    tags: [`round-${Number.isInteger(application.round) ? application.round : 1}`],
  };
}

export function toCrmContact(person) {
  return {
    external_id: slugify(person.email),
    email: person.email.trim().toLowerCase(),
    full_name: person.name.trim(),
    company_external_id: normalizeId(person.startup_id),
  };
}

// Stable string used to decide whether a record changed since the last sync.
export function fingerprint(record) {
  return JSON.stringify(Object.keys(record).sort().map((k) => [k, record[k]]));
}

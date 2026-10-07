// Fills a template with values. Missing values are an error, never a silent blank.
import { TEMPLATES } from './templates.js';

const PLACEHOLDER = /\{\{\s*([a-z_]+)\s*\}\}/gi;

export function placeholdersOf(text) {
  return [...new Set([...text.matchAll(PLACEHOLDER)].map((m) => m[1]))];
}

function fill(text, values, template) {
  return text.replace(PLACEHOLDER, (_, key) => {
    if (values[key] === undefined || values[key] === null) {
      throw new Error(`template ${template}: no value for {{${key}}}`);
    }
    return String(values[key]);
  });
}

export function renderEmail(template, values) {
  const t = TEMPLATES[template];
  if (!t) throw new Error(`unknown template ${template}`);
  return { subject: fill(t.subject, values, template), body: fill(t.body, values, template) };
}

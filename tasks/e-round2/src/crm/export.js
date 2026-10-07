// CSV export of mapped CRM companies, for the coordinator's spreadsheet.
import { toCsv } from '../utils/csv.js';

const COLUMNS = ['external_id', 'name', 'country', 'tags'];

export function companiesCsv(companies) {
  return toCsv(companies.map((c) => ({ ...c, tags: c.tags.join(';') })), COLUMNS);
}

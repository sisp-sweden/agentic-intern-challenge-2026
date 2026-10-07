import { count } from './util.js';

const MAX_COUNTED_FOUNDERS = 4;
const MAX_COUNTED_YEARS = 12;

// 10 points per founder (at most 4), 5 points per year of prior experience
// (at most 12 years). Range 0-100.
export function team(app) {
  const founder = app.founder || {};
  const founders = Math.min(count(founder.count), MAX_COUNTED_FOUNDERS);
  const years = Math.min(count(founder.experience_years), MAX_COUNTED_YEARS);
  return founders * 10 + years * 5;
}

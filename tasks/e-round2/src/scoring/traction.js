import { count, intDiv } from './util.js';

// One point per 1 000 of monthly recurring revenue, capped at 100.
export function traction(app) {
  const mrr = count((app.metrics || {}).mrr);
  return Math.min(100, intDiv(mrr, 1000));
}

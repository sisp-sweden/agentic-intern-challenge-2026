import { count, intDiv } from './util.js';

// One point per 25 kSEK of R&D spend, capped at 100.
export function deeptech(app) {
  const spend = count((app.deeptech || {}).rd_spend_ksek);
  return Math.min(100, intDiv(spend, 25));
}

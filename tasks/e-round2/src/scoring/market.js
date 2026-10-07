import { count, intDiv } from './util.js';

// One point per 50 MSEK of addressable market, capped at 100.
export function market(app) {
  const tam = count((app.market || {}).tam_msek);
  return Math.min(100, intDiv(tam, 50));
}

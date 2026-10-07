import { team } from './team.js';
import { traction } from './traction.js';
import { market } from './market.js';
import { product } from './product.js';
import { deeptech } from './deeptech.js';
import { intDiv } from './util.js';

export const CRITERIA = { team, traction, market, product, deeptech };

// Each criterion is an integer 0-100 computed from the raw application.
export function criterionScores(app) {
  const scores = {};
  for (const [name, fn] of Object.entries(CRITERIA)) scores[name] = fn(app);
  return scores;
}

// weights are integer percentages, so this is the total in hundredths.
export function weightedHundredths(scores, weights) {
  let sum = 0;
  for (const name of Object.keys(CRITERIA)) sum += scores[name] * weights[name];
  return sum;
}

// Hundredths to tenths, rounding half up (6995 -> 700).
export function toTenths(hundredths) {
  return intDiv(hundredths + 5, 10);
}

// Total score in integer tenths (700 = 70.0).
export function scoreApplication(app, weights) {
  return toTenths(weightedHundredths(criterionScores(app), weights));
}

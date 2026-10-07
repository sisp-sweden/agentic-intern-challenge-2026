// Scores one application: the five criteria, plus the point adjustments in config/adjustments.json.
import { readFileSync } from 'node:fs';
import { team } from '../scoring/team.js';
import { traction } from '../scoring/traction.js';
import { market } from '../scoring/market.js';
import { product } from '../scoring/product.js';
import { deeptech } from '../scoring/deeptech.js';
import { intDiv } from '../scoring/util.js';

const adjustments = JSON.parse(
  readFileSync(new URL('../../config/adjustments.json', import.meta.url), 'utf8')
);

const MODULES = { team, traction, market, product, deeptech };

function hasPriorPrograms(app) {
  const programs = (app.founder || {}).prior_programs;
  return Array.isArray(programs) && programs.length > 0;
}

// Points added on top of the weighted total, in tenths.
function adjustmentTenths(app) {
  let tenths = 0;
  if (hasPriorPrograms(app)) tenths += (adjustments.alumni || 0) * 10;
  return tenths;
}

export function criterionScores(app) {
  const scores = {};
  for (const [name, fn] of Object.entries(MODULES)) scores[name] = fn(app);
  return scores;
}

export function scoreApplication(app, weights) {
  const scores = criterionScores(app);
  let hundredths = 0;
  for (const name of Object.keys(MODULES)) hundredths += scores[name] * weights[name];
  return intDiv(hundredths + 5, 10) + adjustmentTenths(app);
}

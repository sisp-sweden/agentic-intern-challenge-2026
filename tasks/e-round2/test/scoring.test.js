import test from 'node:test';
import assert from 'node:assert/strict';
import { CRITERIA, criterionScores, scoreApplication, toTenths, weightedHundredths } from '../src/scoring/index.js';

const WEIGHTS = { team: 20, traction: 25, market: 20, product: 20, deeptech: 15 };
const EVEN = { team: 20, traction: 20, market: 20, product: 20, deeptech: 20 };

function app({ count = 0, years = 0, mrr = 0, tam = 0, users = 0, rd = 0 } = {}) {
  return {
    id: 'APP-TEST',
    round: 2,
    founder: { count, experience_years: years },
    metrics: { mrr },
    market: { tam_msek: tam },
    product: { active_users: users },
    deeptech: { rd_spend_ksek: rd },
  };
}

const sample = app({ count: 4, years: 2, mrr: 62000, tam: 3500, users: 1400, rd: 2250 });

// team

test('team: one founder without experience scores 10', () => {
  assert.equal(CRITERIA.team(app({ count: 1 })), 10);
});

test('team: four founders score 40', () => {
  assert.equal(CRITERIA.team(app({ count: 4 })), 40);
});

test('team: five points per year of experience', () => {
  assert.equal(CRITERIA.team(app({ count: 2, years: 3 })), 35);
});

test('team: experience stops counting after twelve years', () => {
  assert.equal(CRITERIA.team(app({ count: 1, years: 20 })), 70);
});

test('team: the best possible team scores 100', () => {
  assert.equal(CRITERIA.team(app({ count: 4, years: 12 })), 100);
});

test('team: a missing founder block scores 0', () => {
  assert.equal(CRITERIA.team({ id: 'APP-TEST' }), 0);
});

test('team: fractional founder counts are ignored', () => {
  assert.equal(CRITERIA.team(app({ count: 2.5, years: 4 })), 20);
});

test('team: founders beyond four add nothing', () => {
  assert.equal(CRITERIA.team(app({ count: 6, years: 2 })), CRITERIA.team(app({ count: 4, years: 2 })));
});

// traction

test('traction: one point per thousand of monthly revenue', () => {
  assert.equal(CRITERIA.traction(app({ mrr: 62000 })), 62);
});

test('traction: under one thousand scores 0', () => {
  assert.equal(CRITERIA.traction(app({ mrr: 999 })), 0);
});

test('traction: capped at 100', () => {
  assert.equal(CRITERIA.traction(app({ mrr: 130000 })), 100);
});

test('traction: negative revenue counts as 0', () => {
  assert.equal(CRITERIA.traction(app({ mrr: -5000 })), 0);
});

// market

test('market: one point per fifty MSEK of addressable market', () => {
  assert.equal(CRITERIA.market(app({ tam: 3500 })), 70);
});

test('market: under fifty scores 0', () => {
  assert.equal(CRITERIA.market(app({ tam: 49 })), 0);
});

test('market: capped at 100', () => {
  assert.equal(CRITERIA.market(app({ tam: 6000 })), 100);
});

// product

test('product: one point per twenty active users', () => {
  assert.equal(CRITERIA.product(app({ users: 1400 })), 70);
});

test('product: under twenty users scores 0', () => {
  assert.equal(CRITERIA.product(app({ users: 19 })), 0);
});

test('product: capped at 100', () => {
  assert.equal(CRITERIA.product(app({ users: 3000 })), 100);
});

// deeptech

test('deeptech: one point per twenty-five kSEK of R&D spend', () => {
  assert.equal(CRITERIA.deeptech(app({ rd: 2250 })), 90);
});

test('deeptech: under twenty-five scores 0', () => {
  assert.equal(CRITERIA.deeptech(app({ rd: 24 })), 0);
});

test('deeptech: capped at 100', () => {
  assert.equal(CRITERIA.deeptech(app({ rd: 5000 })), 100);
});

// totals

test('criterionScores returns all five criteria', () => {
  assert.deepEqual(criterionScores(sample), { team: 50, traction: 62, market: 70, product: 70, deeptech: 90 });
});

test('weightedHundredths multiplies each criterion by its weight', () => {
  assert.equal(weightedHundredths(criterionScores(sample), WEIGHTS), 6700);
});

test('scoreApplication returns tenths', () => {
  assert.equal(scoreApplication(sample, WEIGHTS), 670);
});

test('scoreApplication uses the weights it is given', () => {
  assert.equal(scoreApplication(sample, EVEN), 684);
});

test('a perfect application scores 100.0', () => {
  const best = app({ count: 4, years: 12, mrr: 100000, tam: 5000, users: 2000, rd: 2500 });
  assert.equal(scoreApplication(best, WEIGHTS), 1000);
});

test('an empty application scores 0.0', () => {
  assert.equal(scoreApplication({ id: 'APP-TEST' }, WEIGHTS), 0);
});

test('a larger founding team does not change the total beyond four', () => {
  const four = app({ count: 4, years: 3, mrr: 50000, tam: 2500, users: 1000, rd: 1250 });
  const six = app({ count: 6, years: 3, mrr: 50000, tam: 2500, users: 1000, rd: 1250 });
  assert.equal(scoreApplication(six, WEIGHTS), scoreApplication(four, WEIGHTS));
});

// rounding

test('rounding: 69.95 rounds half up to 70.0', () => {
  assert.equal(toTenths(6995), 700);
});

test('rounding: 69.90 stays 69.9', () => {
  assert.equal(toTenths(6990), 699);
});

// Ranks applications and prints one line per application: ID score invited.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadConfig } from '../config/load.js';
import { scoreApplication } from '#scoring';

const INVITE_FROM_TENTHS = 700;

const input = resolve(process.env.FIELDNOTE_INPUT || 'data/applications-round2.jsonl');
if (!existsSync(input)) {
  console.error(`rank: ${input} not found - run \`node variant.js <email>\` first`);
  process.exit(1);
}

const config = loadConfig();
const applications = readFileSync(input, 'utf8')
  .split(/\r?\n/)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line));

for (const app of applications) {
  const round = Number.isInteger(app.round) ? app.round : 1;
  const tenths = scoreApplication(app, config.weightsFor(round));
  const score = `${(tenths - (tenths % 10)) / 10}.${tenths % 10}`;
  console.log(`${app.id} ${score} ${tenths >= INVITE_FROM_TENTHS ? 'yes' : 'no'}`);
}

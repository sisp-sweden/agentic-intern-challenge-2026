// Scoring configuration loader.
//
// A profile (config/profiles/<name>.json) holds weights and/or a list of
// overlay files and may extend another profile. An overlay carries `fromRound`
// and `weights`; it only applies to applications whose `round` is at least
// that. The profile name comes from FIELDNOTE_PROFILE (default "default").
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CONFIG_DIR = fileURLToPath(new URL('./', import.meta.url));
const NAMES = ['team', 'traction', 'market', 'product', 'deeptech'];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function resolveProfile(name, seen = []) {
  if (!/^[a-z0-9._-]+$/i.test(name)) throw new Error(`invalid profile name: ${name}`);
  if (seen.includes(name)) throw new Error(`profile cycle: ${[...seen, name].join(' -> ')}`);
  const own = readJson(`${CONFIG_DIR}profiles/${name}.json`);
  const base = own.extends ? resolveProfile(own.extends, [...seen, name]) : { weights: {}, overlays: [] };
  return {
    weights: { ...base.weights, ...(own.weights || {}) },
    overlays: [...base.overlays, ...(own.overlays || [])],
  };
}

function checkWeights(weights, label) {
  let sum = 0;
  for (const n of NAMES) {
    if (!Number.isInteger(weights[n])) throw new Error(`${label}: missing weight for ${n}`);
    sum += weights[n];
  }
  if (sum !== 100) throw new Error(`${label}: weights add up to ${sum}, expected 100`);
}

export function loadConfig(profile = process.env.FIELDNOTE_PROFILE || 'default') {
  const resolved = resolveProfile(profile);
  const overlays = resolved.overlays.map((file) => {
    const overlay = readJson(`${CONFIG_DIR}${file}`);
    checkWeights(overlay.weights || {}, file);
    return { fromRound: overlay.fromRound || 1, weights: overlay.weights };
  });
  checkWeights(resolved.weights, `profile ${profile}`);

  return {
    profile,
    // Integer percentage weights that apply to an application of this round.
    weightsFor(round) {
      let weights = resolved.weights;
      for (const o of overlays) if (round >= o.fromRound) weights = o.weights;
      return weights;
    },
  };
}

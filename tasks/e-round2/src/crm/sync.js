// One-way sync of companies and contacts into the CRM. Only records whose
// fingerprint changed since the last run are sent, in batches.
import { fingerprint } from './mapper.js';

const DEFAULT_BATCH = 50;

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

// `client.upsert(kind, records)` is injected; `state` maps external_id -> fingerprint.
export async function syncRecords(client, kind, records, state, { batchSize = DEFAULT_BATCH } = {}) {
  const seen = new Set();
  const changed = [];
  for (const record of records) {
    if (seen.has(record.external_id)) continue;
    seen.add(record.external_id);
    const print = fingerprint(record);
    if (state.get(record.external_id) !== print) changed.push({ record, print });
  }

  let sent = 0;
  const failed = [];
  for (const batch of chunk(changed, batchSize)) {
    try {
      await client.upsert(kind, batch.map((b) => b.record));
      for (const b of batch) state.set(b.record.external_id, b.print);
      sent += batch.length;
    } catch (err) {
      failed.push({ ids: batch.map((b) => b.record.external_id), error: String(err && err.message ? err.message : err) });
    }
  }
  return { kind, total: seen.size, unchanged: seen.size - changed.length, sent, failed };
}

// A client that keeps everything in memory; useful for dry runs and tests.
export function createMemoryClient() {
  const tables = new Map();
  return {
    async upsert(kind, records) {
      const table = tables.get(kind) || new Map();
      for (const r of records) table.set(r.external_id, r);
      tables.set(kind, table);
    },
    count(kind) {
      return (tables.get(kind) || new Map()).size;
    },
  };
}

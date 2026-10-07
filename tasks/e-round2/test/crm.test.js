import test from 'node:test';
import assert from 'node:assert/strict';
import { fingerprint, toCrmCompany, toCrmContact } from '../src/crm/mapper.js';
import { createMemoryClient, syncRecords } from '../src/crm/sync.js';

test('companies are keyed by a normalised startup id', () => {
  const c = toCrmCompany({ startup_id: 'ST-0412 ', name: ' Nordlys ', hq_country: 'SE', round: 2 });
  assert.equal(c.external_id, 'st-0412');
  assert.equal(c.name, 'Nordlys');
  assert.deepEqual(c.tags, ['round-2']);
});

test('contacts are keyed by their email', () => {
  const p = toCrmContact({ email: ' Anna@Example.com ', name: 'Anna S ', startup_id: 'ST-1' });
  assert.deepEqual(p, { external_id: 'anna-example-com', email: 'anna@example.com', full_name: 'Anna S', company_external_id: 'st-1' });
});

test('fingerprint ignores key order', () => {
  assert.equal(fingerprint({ a: 1, b: 2 }), fingerprint({ b: 2, a: 1 }));
});

test('sync sends only changed records and skips duplicates', async () => {
  const client = createMemoryClient();
  const state = new Map();
  const records = [{ external_id: 'a', name: 'A' }, { external_id: 'b', name: 'B' }, { external_id: 'a', name: 'A' }];
  const first = await syncRecords(client, 'company', records, state, { batchSize: 1 });
  assert.deepEqual([first.total, first.sent, first.unchanged], [2, 2, 0]);
  const second = await syncRecords(client, 'company', [{ external_id: 'a', name: 'A2' }, records[1]], state);
  assert.deepEqual([second.sent, second.unchanged], [1, 1]);
  assert.equal(client.count('company'), 2);
});

test('a failing batch is reported and not marked as synced', async () => {
  const state = new Map();
  const client = { async upsert() { throw new Error('503'); } };
  const out = await syncRecords(client, 'company', [{ external_id: 'a' }], state);
  assert.equal(out.sent, 0);
  assert.deepEqual(out.failed, [{ ids: ['a'], error: '503' }]);
  assert.equal(state.size, 0);
});

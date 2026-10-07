import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, templateNames } from '../src/email/templates.js';
import { placeholdersOf, renderEmail } from '../src/email/render.js';
import { createOutbox } from '../src/email/queue.js';

test('every template renders when all of its placeholders are supplied', () => {
  for (const name of templateNames()) {
    const t = TEMPLATES[name];
    const keys = [...new Set([...placeholdersOf(t.subject), ...placeholdersOf(t.body)])];
    const out = renderEmail(name, Object.fromEntries(keys.map((k) => [k, `<${k}>`])));
    assert.ok(out.subject.length > 0);
    assert.ok(!out.body.includes('{{'));
  }
});

test('a missing value is an error', () => {
  assert.throws(() => renderEmail('rsvp-confirmed', { name: 'Anna' }), /no value for/);
  assert.throws(() => renderEmail('nope', {}), /unknown template/);
});

test('outbox delivers due messages', async () => {
  const sent = [];
  const box = createOutbox(async (m) => sent.push(m));
  box.enqueue({ to: 'a@example.com' }, 0);
  box.enqueue({ to: 'b@example.com' }, 0);
  assert.equal(await box.flush(0), 2);
  assert.deepEqual(box.stats(), { pending: 0, sent: 2, failed: 0 });
});

test('outbox retries with backoff and then gives up', async () => {
  let calls = 0;
  const box = createOutbox(async () => {
    calls++;
    throw new Error('smtp down');
  }, { maxAttempts: 2, baseDelayMs: 1000 });
  const id = box.enqueue({ to: 'a@example.com' }, 0);
  await box.flush(0);
  assert.equal(box.get(id).dueAt, 1000);
  await box.flush(500);
  assert.equal(calls, 1);
  await box.flush(1000);
  assert.equal(box.get(id).state, 'failed');
  assert.equal(box.get(id).lastError, 'smtp down');
});

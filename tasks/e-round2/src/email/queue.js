// Outbox with retries. `send` is injected (SMTP in production, a stub in tests).
// Failed messages are retried with exponential backoff, then parked as "failed".

export function createOutbox(send, { maxAttempts = 4, baseDelayMs = 1000 } = {}) {
  const items = [];
  let nextId = 1;

  return {
    enqueue(message, now = Date.now()) {
      const item = { id: nextId++, message, attempts: 0, state: 'pending', dueAt: now, lastError: null };
      items.push(item);
      return item.id;
    },

    // Try every message that is due. Returns how many were delivered.
    async flush(now = Date.now()) {
      let delivered = 0;
      for (const item of items) {
        if (item.state !== 'pending' || item.dueAt > now) continue;
        item.attempts++;
        try {
          await send(item.message);
          item.state = 'sent';
          delivered++;
        } catch (err) {
          item.lastError = String(err && err.message ? err.message : err);
          if (item.attempts >= maxAttempts) item.state = 'failed';
          else item.dueAt = now + baseDelayMs * 2 ** (item.attempts - 1);
        }
      }
      return delivered;
    },

    stats() {
      const out = { pending: 0, sent: 0, failed: 0 };
      for (const item of items) out[item.state]++;
      return out;
    },

    get(id) {
      return items.find((i) => i.id === id) || null;
    },
  };
}

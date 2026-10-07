// Thin HTTP wrapper around the RSVP flow. Run with `node src/rsvp/server.js`.
import { createServer } from 'node:http';
import { createStore } from './store.js';
import { cancel, rsvp, summary } from './rsvp.js';
import { createLogger } from '../utils/log.js';

export function createRsvpServer(store = createStore(), log = createLogger('rsvp')) {
  return createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const match = url.pathname.match(/^\/events\/([\w-]+)\/(rsvp|cancel|summary)$/);
    if (!match) {
      res.writeHead(404).end();
      return;
    }
    const [, eventId, action] = match;
    const send = (code, body) => {
      res.writeHead(code, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (action === 'summary' && req.method === 'GET') return send(200, summary(store, eventId));
    if (req.method !== 'POST') return send(405, { error: 'method not allowed' });

    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      let body;
      try {
        body = JSON.parse(raw || '{}');
      } catch {
        return send(400, { error: 'invalid json' });
      }
      const result = action === 'rsvp' ? rsvp(store, eventId, body.email) : cancel(store, eventId, body.email || '');
      log.info(`${action} ${eventId}`);
      send(result.status === 'error' ? 400 : 200, result);
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const store = createStore();
  store.addEvent({ id: 'demo-day', capacity: 60 });
  createRsvpServer(store).listen(Number(process.env.PORT) || 3000);
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseFrontMatter } from '../src/site/frontmatter.js';
import { buildFeed, rfc822 } from '../src/site/feed.js';
import { renderSite, writeSite } from '../src/site/build.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { buildInvite } from '../src/events/ics.js';
import { loadSlots, roomLoad, slotsByDay } from '../src/interviews/slots.js';

const root = fileURLToPath(new URL('../', import.meta.url));

function pagesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? pagesUnder(path) : [path];
  });
}

test('front matter is parsed and the body is kept', () => {
  const { data, body } = parseFrontMatter('---\ntitle: "Hello"\ndate: 2026-01-02\n---\nText\n');
  assert.deepEqual(data, { title: 'Hello', date: '2026-01-02' });
  assert.equal(body, 'Text\n');
  assert.deepEqual(parseFrontMatter('no header').data, {});
});

test('every content page has a title and a date', () => {
  const files = pagesUnder(join(root, 'site/content')).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 38);
  for (const file of files) {
    const { data } = parseFrontMatter(readFileSync(file, 'utf8'));
    assert.ok(data.title, `${file} has no title`);
    assert.match(data.date || data.published || '', /^\d{4}-\d{2}-\d{2}$/, `${file} has no date`);
  }
});

test('the site config freezes feed items', () => {
  const config = JSON.parse(readFileSync(join(root, 'site/config.json'), 'utf8'));
  assert.equal(config.feed.freezeItems, true);
});

test('frozen feed items keep their published text', () => {
  const config = { title: 'T', baseUrl: 'https://x.test', feed: { freezeItems: true, sections: ['calls'] } };
  const page = { slug: 'calls/a', section: 'calls', title: 'A', date: '2026-01-15T09:00:00+01:00', summary: 'new text' };
  const published = [{ slug: 'calls/a', title: 'A', date: '2026-01-15T09:00:00+01:00', summary: 'old text' }];
  assert.equal(buildFeed(config, [page], published).items[0].summary, 'old text');
  assert.equal(buildFeed({ ...config, feed: { ...config.feed, freezeItems: false } }, [page], published).items[0].summary, 'new text');
  assert.equal(buildFeed(config, [page], []).items[0].summary, 'new text');
});

test('feed dates are RFC 822 in Stockholm time and the limit is honoured', () => {
  assert.equal(rfc822('2026-01-15T09:00:00+01:00'), 'Thu, 15 Jan 2026 09:00:00 +0100');
  assert.equal(rfc822('2026-07-01T08:00:00Z'), 'Wed, 01 Jul 2026 10:00:00 +0200');
  assert.equal(rfc822('2026-01-19'), 'Mon, 19 Jan 2026 09:00:00 +0100');
  const config = { title: 'T', description: 'D', baseUrl: 'https://x.test', feed: { freezeItems: false, sections: ['blog'], limit: 2 } };
  const pages = [1, 2, 3].map((n) => ({ slug: `blog/${n}`, section: 'blog', title: `P${n}`, date: `2026-01-0${n}`, summary: 's' }));
  const { items, xml } = buildFeed(config, pages, []);
  assert.deepEqual(items.map((i) => i.title), ['P3', 'P2']);
  assert.match(xml, /<description>D<\/description>/);
});

test('site/public is exactly what the build produces, and the build is deterministic', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'fieldnote-site-'));
  try {
    const paths = writeSite(tmp);
    assert.deepEqual(writeSite(tmp), paths);
    const built = renderSite();
    const onDisk = pagesUnder(join(root, 'site/public')).map((f) => f.slice(join(root, 'site/public/').length)).sort();
    assert.deepEqual(onDisk, Object.keys(built).sort());
    for (const [path, text] of Object.entries(built)) {
      assert.equal(readFileSync(join(root, 'site/public', path), 'utf8'), text, `${path} is stale: run node src/site/build.js`);
      assert.equal(readFileSync(join(tmp, path), 'utf8'), text);
    }
    assert.ok(paths.length >= 45);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('calendar invites use UTC stamps and CRLF line ends', () => {
  const ics = buildInvite({ uid: 'demo-1', title: 'Demo day, spring', start: '2026-03-26T09:00:00+01:00', minutes: 30 });
  assert.match(ics, /DTSTART:20260326T080000Z\r\n/);
  assert.match(ics, /DTEND:20260326T083000Z\r\n/);
  assert.match(ics, /SUMMARY:Demo day\\, spring\r\n/);
});

test('the interview sheet parses into days and rooms', () => {
  const slots = loadSlots(join(root, 'ops/interviews/round2-schedule.csv'));
  assert.ok(slots.length > 0);
  const days = slotsByDay(slots);
  assert.equal(Object.values(days).flat().length, slots.length);
  assert.equal(Object.values(roomLoad(slots)).reduce((a, b) => a + b, 0), slots.length);
});

// Builds an RSS feed. Items are frozen at first publish: once an item is in
// the previously published feed (site/published/feed-items.json), its text is
// copied as it was and never re-rendered from the page (see site/config.json
// and ADR-0005).
// Text nodes only need & < > escaped; quotes stay as written.
const escapeXml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ZONE = 'Europe/Stockholm';
const partsFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

// A date-only value ("2026-01-19") means 09:00 Stockholm time that day.
export function instantOf(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value).getTime();
  const [y, m, d] = value.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, 9);
  return guess - stockholmOffsetMinutes(guess) * 60_000;
}

function stockholmOffsetMinutes(ms) {
  const p = Object.fromEntries(partsFormat.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(p.year, new Date(`${p.month} 1 2000`).getMonth(), p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60_000);
}

// "Thu, 15 Jan 2026 09:00:00 +0100"
export function rfc822(value) {
  const ms = instantOf(value);
  const p = Object.fromEntries(partsFormat.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  const off = stockholmOffsetMinutes(ms);
  const sign = off < 0 ? '-' : '+';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  const mm = String(Math.abs(off) % 60).padStart(2, '0');
  return `${p.weekday}, ${p.day} ${p.month} ${p.year} ${p.hour}:${p.minute}:${p.second} ${sign}${hh}${mm}`;
}

export function buildFeed(config, pages, published = []) {
  const feed = config.feed;
  const frozen = new Map(published.map((item) => [item.slug, item]));
  let items = [];
  for (const page of pages) {
    if (!feed.sections.includes(page.section)) continue;
    const previous = frozen.get(page.slug);
    items.push(
      feed.freezeItems && previous
        ? previous
        : { slug: page.slug, title: page.title, date: page.date, summary: page.summary }
    );
  }
  items.sort((a, b) => instantOf(b.date) - instantOf(a.date) || (a.slug < b.slug ? -1 : 1));
  if (feed.limit) items = items.slice(0, feed.limit);

  const body = items
    .map(
      (i) =>
        `    <item>\n      <title>${escapeXml(i.title)}</title>\n      <guid>${escapeXml(`${config.baseUrl}/${i.slug}`)}</guid>\n` +
        `      <pubDate>${rfc822(i.date)}</pubDate>\n      <description>${escapeXml(i.summary)}</description>\n    </item>`
    )
    .join('\n');

  return {
    items,
    xml:
      `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escapeXml(feed.title || config.title)}</title>\n` +
      `    <link>${escapeXml(config.baseUrl)}</link>\n    <description>${escapeXml(feed.description || config.description || config.title)}</description>\n${body}\n  </channel>\n</rss>\n`,
  };
}

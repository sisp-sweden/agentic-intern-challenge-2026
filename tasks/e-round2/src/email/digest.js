// Plain-text weekly digest of upcoming events.
import { formatStockholm } from '../utils/dates.js';
import { pluralize } from '../utils/strings.js';

export function buildDigest(events, now) {
  const upcoming = events
    .filter((e) => new Date(e.starts_at) >= new Date(now))
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  if (upcoming.length === 0) return 'Nothing is scheduled this week.\n';
  const lines = [`This week at Fieldnote: ${pluralize(upcoming.length, 'event')}`, ''];
  for (const e of upcoming) lines.push(`* ${formatStockholm(e.starts_at)}  ${e.title}`);
  return `${lines.join('\n')}\n`;
}

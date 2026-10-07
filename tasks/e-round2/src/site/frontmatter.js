// Reads the `key: value` front matter block at the top of a content page.
export function parseFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    data[key] = value;
  }
  return { data, body: match[2] };
}

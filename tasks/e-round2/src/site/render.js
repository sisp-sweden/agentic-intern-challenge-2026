// Minimal Markdown-to-HTML and the page shell. Handles what the content pages
// use: headings, paragraphs, bullet lists, tables, bold, italic and links.
import { escapeXml } from '../utils/strings.js';

function inline(text) {
  return escapeXml(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function markdownToHtml(source) {
  const out = [];
  let para = [];
  let list = [];
  let table = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    if (list.length) out.push(`<ul>\n${list.map((l) => `<li>${inline(l)}</li>`).join('\n')}\n</ul>`);
    if (table.length) {
      const rows = table.filter((r) => !/^\|[\s|:-]+\|$/.test(r)).map((r) => r.slice(1, -1).split('|').map((c) => c.trim()));
      const [head, ...rest] = rows;
      out.push(
        `<table>\n<tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr>\n` +
          rest.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('\n') +
          '\n</table>'
      );
    }
    para = [];
    list = [];
    table = [];
  };
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (!line.trim()) flush();
    else if (heading) {
      flush();
      out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
    } else if (line.startsWith('|')) {
      if (para.length || list.length) flush();
      table.push(line);
    } else if (/^[-*]\s+/.test(line)) {
      if (para.length || table.length) flush();
      list.push(line.replace(/^[-*]\s+/, ''));
    } else {
      if (list.length || table.length) flush();
      para.push(line.trim());
    }
  }
  flush();
  return out.join('\n');
}

export function pageShell(config, { title, body }) {
  const nav = config.nav.map((n) => `<a href="${escapeXml(n.path)}">${escapeXml(n.label)}</a>`).join(' | ');
  return (
    `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${escapeXml(title)} - ${escapeXml(config.title)}</title>\n` +
    `<link rel="alternate" type="application/rss+xml" title="${escapeXml(config.title)}" href="${escapeXml(config.feed.path)}">\n</head>\n<body>\n` +
    `<header><a href="/">${escapeXml(config.title)}</a> | ${nav}</header>\n<main>\n${body}\n</main>\n` +
    `<footer>Fieldnote, Stockholm. Questions to programme@fieldnote.example.</footer>\n</body>\n</html>\n`
  );
}

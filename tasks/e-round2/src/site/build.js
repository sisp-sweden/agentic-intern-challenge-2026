// Reads site/content/**.md into page records for the feed and the page index.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter } from './frontmatter.js';
import { buildFeed } from './feed.js';
import { markdownToHtml, pageShell } from './render.js';
import { escapeXml, truncate } from '../utils/strings.js';

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return name.endsWith('.md') ? [path] : [];
  });
}

// First paragraph of prose after the heading, used when a page has no summary.
function firstParagraph(body) {
  const paragraph = body
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('|') && !p.startsWith('-'));
  return paragraph ? truncate(paragraph.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*+/g, '').replace(/\s+/g, ' '), 200) : '';
}

export function collectPages(contentDir) {
  const pages = markdownFiles(contentDir).map((file) => {
    const { data, body } = parseFrontMatter(readFileSync(file, 'utf8'));
    const slug = relative(contentDir, file).split(sep).join('/').replace(/\.md$/, '');
    return {
      slug,
      section: data.section || slug.split('/')[0],
      title: data.title || slug,
      date: data.published || data.date || null,
      updated: data.updated || null,
      summary: data.summary || firstParagraph(body),
      body,
    };
  });
  return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function bySection(pages) {
  const out = {};
  for (const page of pages) (out[page.section] ||= []).push(page);
  return out;
}

const siteRoot = fileURLToPath(new URL('../../site/', import.meta.url));

// Renders the whole site to a { 'path/relative/to/public': text } map. Pure: no clock, no randomness.
export function renderSite(root = siteRoot) {
  const config = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));
  const published = JSON.parse(readFileSync(join(root, config.feed.published), 'utf8'));
  const pages = collectPages(join(root, 'content'));
  const files = {};
  for (const page of pages) {
    const path = page.slug === 'index' ? 'index.html' : `${page.slug}/index.html`;
    const body = markdownToHtml(page.body);
    files[path] = pageShell(config, { title: page.title, body });
  }
  const sections = bySection(pages);
  for (const section of ['calls', 'mentors', 'events', 'blog']) {
    const label = config.nav.find((n) => n.path === `/${section}/`)?.label || section;
    const rows = [...(sections[section] || [])].sort((a, b) => (a.date < b.date ? 1 : -1));
    const list = rows.map((p) => `<li><a href="/${escapeXml(p.slug)}/">${escapeXml(p.title)}</a> (${escapeXml(p.date)})</li>`).join('\n');
    files[`${section}/index.html`] = pageShell(config, { title: label, body: `<h1>${escapeXml(label)}</h1>\n<ul>\n${list}\n</ul>` });
  }
  const feeds = [config.feed, ...(config.feed.more || []).map((f) => ({ ...config.feed, ...f }))];
  for (const feed of feeds) {
    files[feed.path.replace(/^\//, '')] = buildFeed({ ...config, feed }, pages, published).xml;
  }
  return files;
}

export function writeSite(out, root = siteRoot) {
  const files = renderSite(root);
  rmSync(out, { recursive: true, force: true });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), text);
  }
  return Object.keys(files).sort();
}

// node src/site/build.js [outDir]   (default: site/public)
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = resolve(process.argv[2] || join(siteRoot, 'public'));
  console.log(`${writeSite(out).length} files written to ${out}`);
}

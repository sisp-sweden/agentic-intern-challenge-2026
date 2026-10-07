// Small summaries of an application export for the programme coordinator.
// Reads only identifying fields; nothing here looks at how an application is assessed.

export function parseJsonLines(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`line ${i + 1} is not valid JSON`);
      }
    });
}

export function countBy(items, keyOf) {
  const counts = {};
  for (const item of items) {
    const key = keyOf(item) ?? 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

// Applications per headquarters country, largest first.
export function byCountry(applications) {
  return Object.entries(countBy(applications, (a) => a.hq_country)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// Distinct startups (ids compared after trimming and lower-casing).
export function distinctStartups(applications) {
  return new Set(applications.map((a) => String(a.startup_id ?? '').trim().toLowerCase())).size;
}

export function formatReport(applications) {
  const lines = [`applications: ${applications.length}`, `startups: ${distinctStartups(applications)}`];
  for (const [country, n] of byCountry(applications)) lines.push(`  ${country}: ${n}`);
  return lines.join('\n');
}

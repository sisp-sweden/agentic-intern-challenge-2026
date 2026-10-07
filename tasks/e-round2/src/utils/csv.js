// Minimal CSV reader/writer for the small ops files (quoted fields, CRLF).

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Rows as objects keyed by the header line.
export function parseCsvObjects(text) {
  const [header, ...rest] = parseCsv(text);
  if (!header) return [];
  return rest.map((cells) => Object.fromEntries(header.map((name, i) => [name.trim(), cells[i] ?? ''])));
}

function escapeCell(value) {
  const s = value == null ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows, columns) {
  const lines = [columns.map(escapeCell).join(',')];
  for (const row of rows) lines.push(columns.map((c) => escapeCell(row[c])).join(','));
  return `${lines.join('\n')}\n`;
}

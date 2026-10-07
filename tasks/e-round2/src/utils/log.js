// Tiny leveled logger. The sink is injectable so tests can capture output.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

export function createLogger(scope, { level = 'info', sink = (line) => console.error(line) } = {}) {
  const threshold = LEVELS[level] ?? LEVELS.info;
  const emit = (name, message, fields) => {
    if (LEVELS[name] < threshold) return;
    const extra = fields ? ` ${JSON.stringify(fields)}` : '';
    sink(`${name.toUpperCase().padEnd(5)} [${scope}] ${message}${extra}`);
  };
  return {
    debug: (m, f) => emit('debug', m, f),
    info: (m, f) => emit('info', m, f),
    warn: (m, f) => emit('warn', m, f),
    error: (m, f) => emit('error', m, f),
  };
}

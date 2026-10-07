// Retry an async function with a fixed list of delays (milliseconds).
export async function retry(fn, delays = [200, 800, 2000], sleep = (ms) => new Promise((r) => setTimeout(r, ms))) {
  let lastError;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt < delays.length) await sleep(delays[attempt]);
    }
  }
  throw lastError;
}

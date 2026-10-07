import { count, intDiv } from './util.js';

// One point per 20 active users, capped at 100.
export function product(app) {
  const users = count((app.product || {}).active_users);
  return Math.min(100, intDiv(users, 20));
}

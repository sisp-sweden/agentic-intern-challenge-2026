// Small integer helpers shared by the scoring modules. Scores are integers;
// nothing in here touches floating point on purpose.

// Non-negative whole number from a raw field, 0 for anything else.
export function count(value) {
  return Number.isInteger(value) && value > 0 ? value : 0;
}

// Exact integer division (floor) for non-negative integers.
export function intDiv(a, b) {
  return (a - (a % b)) / b;
}

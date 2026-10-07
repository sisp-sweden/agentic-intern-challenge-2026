// Monthly mentor assignment. Startups list up to three preferred mentors;
// each mentor has a monthly capacity. Startups are served in the order they
// arrive and take the first preference that still has room.

export function assignMentors(startups, mentors) {
  const left = new Map(mentors.map((m) => [m.id, m.monthly_capacity]));
  const assignments = [];
  const unmatched = [];

  for (const startup of startups) {
    const choice = (startup.preferences || []).find((id) => (left.get(id) || 0) > 0);
    if (choice === undefined) {
      unmatched.push(startup.id);
      continue;
    }
    left.set(choice, left.get(choice) - 1);
    assignments.push({ startup: startup.id, mentor: choice, rank: startup.preferences.indexOf(choice) + 1 });
  }

  return { assignments, unmatched, remaining: Object.fromEntries(left) };
}

// Average preference rank of the matched startups (1 = everyone got their first choice).
export function averageRank(assignments) {
  if (assignments.length === 0) return 0;
  const total = assignments.reduce((sum, a) => sum + a.rank, 0);
  return Math.round((total / assignments.length) * 100) / 100;
}

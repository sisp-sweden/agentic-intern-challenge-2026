'use strict';

const UNASSIGNED = null;

function assertArray(value, name) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array`);
  }
}

function validateInput(mentors, startups) {
  assertArray(mentors, 'mentors');
  assertArray(startups, 'startups');

  const mentorIds = new Set();
  for (const mentor of mentors) {
    if (!mentor || typeof mentor.id !== 'string' || mentor.id.length === 0) {
      throw new TypeError('Each mentor must have a non-empty string id');
    }
    if (mentorIds.has(mentor.id)) {
      throw new TypeError(`Duplicate mentor id: ${mentor.id}`);
    }
    mentorIds.add(mentor.id);
    if (!Number.isInteger(mentor.monthlyCapacity) || mentor.monthlyCapacity < 0) {
      throw new TypeError(`Invalid monthlyCapacity for mentor ${mentor.id}`);
    }
  }

  const startupIds = new Set();
  for (const startup of startups) {
    if (!startup || typeof startup.id !== 'string' || startup.id.length === 0) {
      throw new TypeError('Each startup must have a non-empty string id');
    }
    if (startupIds.has(startup.id)) {
      throw new TypeError(`Duplicate startup id: ${startup.id}`);
    }
    startupIds.add(startup.id);
    assertArray(startup.preferredMentorIds, `preferredMentorIds for ${startup.id}`);
    if (startup.preferredMentorIds.length > 3) {
      throw new TypeError(`Startup ${startup.id} has more than three preferences`);
    }
    const preferences = new Set();
    for (const mentorId of startup.preferredMentorIds) {
      if (typeof mentorId !== 'string' || !mentorIds.has(mentorId)) {
        throw new TypeError(`Startup ${startup.id} has invalid mentor id: ${mentorId}`);
      }
      if (preferences.has(mentorId)) {
        throw new TypeError(`Startup ${startup.id} has duplicate mentor preference: ${mentorId}`);
      }
      preferences.add(mentorId);
    }
  }
}

function compareAssignments(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    const leftMentor = left[index].mentorId;
    const rightMentor = right[index].mentorId;
    if (leftMentor === rightMentor) continue;
    if (leftMentor === UNASSIGNED) return 1;
    if (rightMentor === UNASSIGNED) return -1;
    return leftMentor < rightMentor ? -1 : 1;
  }
  return 0;
}

function isBetter(left, right) {
  if (right === undefined) return true;
  if (left.matched !== right.matched) return left.matched > right.matched;
  if (left.rankCost !== right.rankCost) return left.rankCost < right.rankCost;
  return compareAssignments(left.assignments, right.assignments) < 0;
}

function matchMentors(mentors, startups) {
  validateInput(mentors, startups);

  const sortedMentors = [...mentors].sort((a, b) => a.id.localeCompare(b.id));
  const sortedStartups = [...startups].sort((a, b) => a.id.localeCompare(b.id));
  const mentorIndex = new Map(sortedMentors.map((mentor, index) => [mentor.id, index]));
  const initialCapacity = sortedMentors.map((mentor) => mentor.monthlyCapacity);
  let states = new Map([[
    initialCapacity.map(() => 0).join(','),
    { matched: 0, rankCost: 0, assignments: [] }
  ]]);

  for (const startup of sortedStartups) {
    const nextStates = new Map();
    for (const [key, state] of states) {
      const used = key.split(',').map(Number);
      const options = [UNASSIGNED, ...startup.preferredMentorIds];

      for (const mentorId of options) {
        const nextUsed = [...used];
        const assignment = {
          startupId: startup.id,
          startupName: startup.name,
          mentorId,
          mentorName: mentorId === UNASSIGNED
            ? null
            : sortedMentors[mentorIndex.get(mentorId)].name,
          preferenceRank: mentorId === UNASSIGNED
            ? null
            : startup.preferredMentorIds.indexOf(mentorId) + 1,
          assignmentType: mentorId === UNASSIGNED ? 'unassigned' : 'ranked',
          reason: mentorId === UNASSIGNED ? 'capacity_exhausted' : undefined
        };

        if (mentorId !== UNASSIGNED) {
          const index = mentorIndex.get(mentorId);
          if (nextUsed[index] >= sortedMentors[index].monthlyCapacity) continue;
          nextUsed[index] += 1;
        }

        const candidate = {
          matched: state.matched + (mentorId === UNASSIGNED ? 0 : 1),
          rankCost: state.rankCost + (
            mentorId === UNASSIGNED
              ? 0
              : startup.preferredMentorIds.indexOf(mentorId)
          ),
          assignments: [...state.assignments, assignment]
        };
        const nextKey = nextUsed.join(',');
        if (isBetter(candidate, nextStates.get(nextKey))) {
          nextStates.set(nextKey, candidate);
        }
      }
    }
    states = nextStates;
  }

  let best;
  for (const state of states.values()) {
    if (isBetter(state, best)) best = state;
  }

  const assignments = best.assignments.map((assignment) => {
    if (assignment.mentorId !== UNASSIGNED) return assignment;
    return { ...assignment, reason: 'capacity_exhausted' };
  });
  const assignedByMentor = new Map(sortedMentors.map((mentor) => [mentor.id, 0]));
  for (const assignment of assignments) {
    if (assignment.mentorId !== UNASSIGNED) {
      assignedByMentor.set(
        assignment.mentorId,
        assignedByMentor.get(assignment.mentorId) + 1
      );
    }
  }

  const mentorUtilization = sortedMentors.map((mentor) => {
    const assigned = assignedByMentor.get(mentor.id);
    return {
      mentorId: mentor.id,
      mentorName: mentor.name,
      capacity: mentor.monthlyCapacity,
      assigned,
      remaining: mentor.monthlyCapacity - assigned,
      utilizationRate: mentor.monthlyCapacity === 0
        ? 0
        : assigned / mentor.monthlyCapacity
    };
  });
  const rankDistribution = { rank1: 0, rank2: 0, rank3: 0, fallback: 0, unassigned: 0 };
  for (const assignment of assignments) {
    if (assignment.mentorId === UNASSIGNED) continue;
    rankDistribution[`rank${assignment.preferenceRank}`] += 1;
  }
  rankDistribution.unassigned = assignments.filter(
    (assignment) => assignment.mentorId === UNASSIGNED
  ).length;

  return {
    assignments: assignments.map(({ status, ...assignment }) => ({
      ...assignment,
      status: assignment.mentorId === UNASSIGNED ? 'unassigned' : 'assigned'
    })),
    mentorUtilization,
    summary: {
      startupCount: sortedStartups.length,
      matchedCount: best.matched,
      unassignedCount: sortedStartups.length - best.matched,
      matchRate: sortedStartups.length === 0 ? 0 : best.matched / sortedStartups.length,
      rankDistribution,
      objective: {
        primary: 'maximize_matched_startups',
        secondary: 'minimize_preference_rank_cost',
        tieBreaker: 'startup_id_then_mentor_id'
      }
    }
  };
}

module.exports = { matchMentors };

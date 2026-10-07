# ADR-0004: Scoring settings come from named profiles

Status: Accepted
Date: 2025-09-30

## Context

Weights used to be constants in the scoring code. Trying a different weighting meant editing code and remembering to revert it.

## Decision

Weights live in `config/profiles/<name>.json`. A profile can extend another profile and can list overlay files from `config/experiments/`. An overlay carries a `fromRound` and only applies to applications of that round or later. The job picks the profile from `FIELDNOTE_PROFILE` and uses `default` when it is not set.

## Consequences

- A new weighting is a new overlay file plus one line in a profile, and can be reviewed like any other change.
- Which weights a given run used depends on the profile name.

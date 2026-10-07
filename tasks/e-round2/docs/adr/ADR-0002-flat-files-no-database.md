# ADR-0002: Flat files instead of a database

Status: Accepted
Date: 2025-06-24

## Context

A call brings in a couple of thousand applications. They are written once at the deadline, read by one batch job and never updated in place. Running and backing up a database for that is more work than the data justifies.

## Decision

Applications are exported as JSON Lines, one object per line. Decisions, withdrawals and interview schedules are small CSV files. Everything lives in the repository folders `data/` and `ops/`.

## Consequences

- Any export can be inspected with standard command line tools.
- Nothing enforces uniqueness or referential integrity. Checks such as duplicate startups are done by the people who read the output.
- If volumes grow tenfold we will look at SQLite.

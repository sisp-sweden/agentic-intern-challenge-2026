# ADR-0001: Plain Node.js with no dependencies

Status: Accepted
Date: 2025-06-10

## Context

Fieldnote's tooling is run by a small programme team and a rotating group of interns. Past projects stalled because a dependency needed a newer toolchain or a native build that nobody could install on a locked-down laptop.

## Decision

All Fieldnote tooling is written in plain JavaScript (ES modules) for Node 18 and later. We use only the Node standard library and add no packages. Tests use the built-in `node:test` runner.

## Consequences

- `git clone` and `node` are all anyone needs to run or test a job.
- We write small helpers ourselves (CSV, front matter, calendar invites). They live in `src/utils`.
- If a helper outgrows a hundred lines, we revisit this decision rather than quietly adding a package.

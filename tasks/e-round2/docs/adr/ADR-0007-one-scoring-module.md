# ADR-0007: One scoring module

Status: Accepted
Date: 2026-02-24

## Context

Until last autumn there were two scoring implementations: the original batch scorer and the newer modular one in `src/scoring`. Both computed the same five criteria. Every fix had to be made twice, and twice a fix reached only one of them. The test suite exercises only the modular scorer.

## Decision

The original batch scorer is deleted. `src/scoring/index.js` is the only scorer, and the ranking job imports it. New work goes there.

## Consequences

- One place to fix a criterion, one place to test it.
- Scores from before the consolidation were produced by the old scorer. We did not re-run them.
- Anything that still refers to the old file path is a leftover and should be cleaned up.

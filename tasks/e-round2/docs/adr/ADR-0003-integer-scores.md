# ADR-0003: Scores are integers

Status: Accepted
Date: 2025-08-19

## Context

An early prototype summed floating-point scores and sometimes put an application at 69.99999 when the rubric said 70.0. Nobody could explain the difference to an applicant.

## Decision

Criterion scores are whole numbers from 0 to 100 and weights are whole percentages. The weighted total is kept in hundredths and converted to tenths with integer arithmetic, rounding half up. A score is displayed as tenths divided by ten with one decimal.

## Consequences

- The same application always gets the same score on every machine.
- The cutoff compares whole tenths, never floating-point numbers.
- Criterion formulas use floor division, so fractions are dropped, not rounded.

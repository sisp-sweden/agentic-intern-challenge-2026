# ADR-0006: Ranking runs as a batch job on the runner host

Status: Accepted
Date: 2025-10-28

## Context

Ranking needs no interactivity: it reads an export and prints a list. We wanted it to run at a fixed time with a known environment and a log, not from someone's laptop.

## Decision

The job is `npm run rank`, started by a systemd unit on the runner host. A timer starts it at 06:00 Stockholm time; the date is set in the timer unit. The repository is checked out at `/opt/fieldnote` on the runner. The unit, its timer and its drop-ins are kept in `ops/runner/`, and the environment file is `deploy/production.env`.

## Consequences

- A run is reproducible from the files in the repository.
- Changes to how the job runs are reviewed like any other change.

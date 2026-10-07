---
title: Working on the Fieldnote tools
updated: 2026-01-12
---

# Working on the Fieldnote tools

- Node 18 or later. There is nothing to install.
- Run the tests with `npm test`.
- Keep modules small. Put shared helpers in `src/utils`.
- Decisions that change how something works are written down as a short record in `docs/adr/`.
- Do not commit exports from `data/`; they are regenerated for every call.

## Layout

| Folder | What is in it |
|---|---|
| `src/scoring` | The criteria and the total score |
| `src/mentors`, `src/rsvp`, `src/email`, `src/crm`, `src/events`, `src/site`, `src/interviews` | Programme tooling |
| `jobs` | Batch jobs |
| `config` | Weights and settings |
| `ops` | Runner setup, interview schedules, programme communications |
| `site` | The programme website sources |

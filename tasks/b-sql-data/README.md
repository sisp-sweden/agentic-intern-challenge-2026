# Task B — SQL: mentor session counts

Fieldnote's ops team wants a report: **for every startup that has completed the mentorship program, how many mentor sessions did they have, and when was the most recent one?** Startups that completed the program but never had a session should still show up, with a count of 0.

## What's here

- `schema.sql` — the relevant tables (`startups`, `applications`, `mentors`, `mentor_sessions`), PostgreSQL syntax
- `seed.sql` — sample data to load and test against

Load both into any Postgres database (or adapt to whatever engine you have handy — the trap isn't dialect-specific):

```
psql -d your_db -f schema.sql
psql -d your_db -f seed.sql
```

## Your task

Write a single query that returns, for each startup with at least one **completed** application: the startup's name, its total mentor session count, and its most recent session date.

- Startups that never completed the program should not appear at all.
- Startups that completed the program but have zero sessions should appear, with count `0` and a null/blank date.

## Submit

- Your final query
- The result set it produces against the seed data
- Your **complete chat transcript** with whichever model you used

~20–30 minutes.

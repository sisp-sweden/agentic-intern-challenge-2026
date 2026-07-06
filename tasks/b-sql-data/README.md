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

No Postgres installed? Either of these gets you a database in under a minute, no local install:

- `docker run --rm -e POSTGRES_PASSWORD=pw -p 5432:5432 postgres` (needs Docker)
- Paste `schema.sql` and `seed.sql` into a free online sandbox like [db-fiddle.com](https://www.db-fiddle.com/) (set the engine to PostgreSQL)

Or skip running it entirely: trace the query against the seed data by hand with your model and show that reasoning in your transcript — we care more about a correct, verified answer than about which environment produced it.

## Your task

Write a single query that returns, for each startup with at least one **completed** application: the startup's name, its total mentor session count, and its most recent session date.

- Startups that never completed the program should not appear at all.
- Startups that completed the program but have zero sessions should appear, with count `0` and a null/blank date.

## Submit

- Your final query
- The result set it produces against the seed data
- Your **complete chat transcript** with whichever model you used

~20–30 minutes.

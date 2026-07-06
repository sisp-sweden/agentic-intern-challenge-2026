-- Fieldnote's mentorship program schema (PostgreSQL).
-- A startup can apply to the program more than once across different cohorts
-- (e.g. rejected in spring, reapplies and gets accepted in the fall).

create table startups (
  id serial primary key,
  name text not null,
  industry text not null
);

create table applications (
  id serial primary key,
  startup_id integer not null references startups(id),
  cohort text not null,
  status text not null check (status in ('submitted', 'in_review', 'completed', 'rejected'))
);

create table mentors (
  id serial primary key,
  name text not null,
  expertise text not null
);

create table mentor_sessions (
  id serial primary key,
  startup_id integer not null references startups(id),
  mentor_id integer not null references mentors(id),
  session_date date not null
);

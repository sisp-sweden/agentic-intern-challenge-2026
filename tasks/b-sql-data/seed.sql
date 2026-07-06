insert into startups (id, name, industry) values
  (1, 'Voltbrew', 'energy'),
  (2, 'Nordlys', 'healthtech'),
  (3, 'Kelpwave', 'materials'),
  (4, 'Driftloop', 'logistics');

-- Voltbrew completed the program twice — once in the spring cohort, then
-- again in the fall after coming back for a second track.
insert into applications (startup_id, cohort, status) values
  (1, 'spring-2026', 'completed'),
  (1, 'fall-2026', 'completed'),
  (2, 'fall-2026', 'completed'),
  (3, 'fall-2026', 'completed'),
  (4, 'fall-2026', 'submitted');

insert into mentors (id, name, expertise) values
  (1, 'Elin Aström', 'go-to-market'),
  (2, 'Marcus Bly', 'hardware ops');

-- Voltbrew: 3 sessions. Nordlys: 0 sessions. Kelpwave: 1 session.
-- Driftloop: 2 sessions, but its application was never completed.
insert into mentor_sessions (startup_id, mentor_id, session_date) values
  (1, 1, '2026-09-02'),
  (1, 2, '2026-09-16'),
  (1, 1, '2026-10-01'),
  (3, 1, '2026-09-10'),
  (4, 2, '2026-09-05'),
  (4, 2, '2026-09-20');

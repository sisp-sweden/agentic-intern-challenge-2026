WITH completed_startups AS (
  SELECT DISTINCT
    s.id,
    s.name
  FROM startups AS s
  JOIN applications AS a
    ON a.startup_id = s.id
  WHERE a.status = 'completed'
),
session_totals AS (
  SELECT
    startup_id,
    COUNT(*) AS total_sessions,
    MAX(session_date) AS most_recent_session
  FROM mentor_sessions
  GROUP BY startup_id
)
SELECT
  cs.name AS startup_name,
  COALESCE(st.total_sessions, 0) AS total_mentor_sessions,
  st.most_recent_session
FROM completed_startups AS cs
LEFT JOIN session_totals AS st
  ON st.startup_id = cs.id
ORDER BY cs.name;

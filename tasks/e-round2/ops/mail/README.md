# Staff mailbox export

A plain export of the programme team's shared mailbox, January to March 2026, one JSON object per line
(`id`, `thread`, `date`, `from`, `to`, `subject`, `body`), one file per month. Times are Stockholm time.

Transactional mail to applicants (confirmations, invitations) does not live here; it goes through
`src/email/queue.js`. This is staff correspondence only, and it is not a record of decisions.

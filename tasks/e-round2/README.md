# Task E — Round 2 sign-off

Fieldnote runs a ranking job over every accelerator application. Round 1 is finished and its invitations have gone out. Round 2 closed on 1 March, and the same job runs for the first time on round 2 tomorrow morning. Someone on the programme team has to sign off before it runs, and the person who normally does that is on leave.

You have been handed the repository and one paragraph from the programme lead. This is the paragraph, word for word:

> Round 2 runs in production tomorrow 06:00 on data/applications-round2.jsonl. Round 1 decisions: data/decisions-round1.csv. Which applications will the system invite to interview, and which outcomes break what applicants were promised? Our scoring rules are in docs/rubric.md. APP-2291's founder says the team-size points are unfair; maybe start there. Fieldnote works in Stockholm time.

## What's here

A zero-dependency Node 18+ project: the ranking job and its scoring code, configuration, the runner setup, the programme's website sources, a handful of decision records, and the application data. No `npm install` needed.

The data is large (a couple of thousand applications), so you will want to script against it or hand it to your tools rather than read it through.

Each applicant works from their own copy of the data. Before anything else, run

```
node variant.js <the email address you submit with>
```

It prints a data set number and unpacks your files into `data/`. Put that number in `VARIANT` below.

## Submit

Fill in this block. Keep the labels exactly as written; one entry per line where it says so.

```
VARIANT:
ROUND1_CHECK: k/n; unexplained IDs
ADVANCE_COUNT:
ADVANCE_IDS:
CANARY: sum of the system's printed scores for invited applications
MISMATCH: ID | system outcome | correct outcome | reason + file:line or quote   (one per line)
BEFORE_TOMORROW: free text
```

Also send your **complete chat transcript** with whichever model you used.

~30–45 minutes

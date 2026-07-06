# Task A — Debug: the summer demo day overbooking

Fieldnote runs an RSVP service for accelerator events. Three event hosts have filed support tickets this month saying they showed up to find more attendees checked in than the room's capacity allowed. Nobody's touched the seating logic in months, so it's not a regression from a recent change — it's a bug that's always been there and finally got unlucky enough to surface.

Your job: find it, fix it, and explain why it happens.

## What's here

```
starter/
  package.json
  src/
    store.js                       — in-memory event/attendee store (stands in for a real DB)
    rsvp.js                        — the RSVP flow support is complaining about
    server.js                      — a thin HTTP wrapper around it
    rsvp.concurrency.test.js       — a test that reproduces the reported symptom
```

Requires Node 18+, no `npm install` needed — it's dependency-free.

## Steps

1. From `starter/`, run the test:
   ```
   npm test
   ```
   It should **fail** — that failure is the bug, reproduced. Read what it's telling you.
2. Find the actual defect in `src/`. Fix it so the test passes.
3. Don't just patch the symptom — make sure your fix holds up under the same conditions the test exercises, not just for a single request.

## Submit

- Your fixed code (a diff, or the changed files)
- A short written explanation: what was actually wrong, and why it only shows up sometimes
- Your **complete chat transcript** with whichever model you used

~20–30 minutes.

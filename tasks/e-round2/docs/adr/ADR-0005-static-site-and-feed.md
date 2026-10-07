# ADR-0005: Static site with a frozen RSS feed

Status: Accepted
Date: 2025-10-14

## Context

The programme site is a folder of Markdown pages built to static HTML. Subscribers follow calls and news through an RSS feed. Readers complained when a feed reader showed an old item that had been silently edited.

## Decision

The site is built with `node src/site/build.js` into `site/public/`. The build reads the items already published from `site/published/feed-items.json`. An item that is in that file is copied through unchanged into every feed on later builds; only new pages become new items. The setting is `feed.freezeItems` in `site/config.json`. Pages themselves may be edited freely.

## Consequences

- A subscriber sees an item exactly as it was announced.
- Fixing a typo in a feed item means editing `site/published/feed-items.json` by hand.

# Kalka

[![Pages](https://github.com/filgomul/kalka/actions/workflows/pages.yml/badge.svg)](https://github.com/filgomul/kalka/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Planner for an architectural studio: one record per building project with its
milestones (permit dates and the like), lead architect and the scope handed to branch
engineers. Replaces an Excel sheet. Polish UI.

**Live:** <https://filgomul.github.io/kalka/> - **Try it without data:** <https://filgomul.github.io/kalka/?demo>

## Features

- **Projects:** list with filter, search and sort; create and edit form; status, type
  and per-project milestones seeded from a template (building project, interior, other).
- **Calendar:** month grid, range overview and a per-project schedule ("Harmonogram"),
  plus a list of upcoming and recently passed milestones.
- **Tasks:** a board per project and a tab with everyone's tasks (to do, doing, in
  review, done), assignees, reviewers, urgent flag, done tasks grouped by week.
- **Meetings and leaves:** in the calendar and in their own tabs.
- **Demo mode:** `?demo` opens made-up data in memory; the real folder is never touched.

## Prerequisites

- Node 24+
- `pnpm`
- Chrome or Edge (the File System Access API is not available in Safari or Firefox; only
  the demo works there)

## Install and start

```bash
git clone https://github.com/filgomul/kalka.git
cd kalka
pnpm install --ignore-scripts
pnpm dev
```

Open <http://localhost:5173/kalka/?demo> for made-up data, or
<http://localhost:5173/kalka/> and pick a data folder.

Other commands:

```bash
pnpm test     # node --test
pnpm build    # type-check + production build into dist/
```

## How it works

No server, no accounts. The app is static HTML/JS hosted on GitHub Pages. All data is
JSON files in a folder synced between the studio's computers, which the browser opens
through the File System Access API. Whoever has the folder has the data. Pages must be
served over HTTPS or from `localhost`. A save never overwrites a file that someone else
changed after it was read.

Built with TypeScript, Vite and Preact; no router, date, calendar or CSS libraries.
Specs of what the app does live in `openspec/specs/`.

## Limits

Small production tool, built lean. Not included: authentication, backend, analytics,
offline mode, merging of concurrent edits.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Never commit project data (addresses, client or
contractor names); see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)

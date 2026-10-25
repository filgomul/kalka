## Why

The studio tracks all projects in one Excel sheet. It has no overview of what is due
when, no filtering, and the branch-scope columns have grown into unreadable paragraphs.
Kalka needs a place for the data that stays inside the studio's OneDrive, and a project
list and form that replace the sheet one to one, before any calendar makes sense.

## What Changes

- On first use the user picks the Kalka data folder on the synced OneDrive; the browser
  remembers it, and later visits need one click to reopen it.
- Every project is one JSON file in that folder. The app reads all of them on open and
  writes one file on save, refusing to overwrite a file someone else changed meanwhile.
- A project list with the sheet's running number (l.p.), filter by lead architect and
  status, text search, and the next milestone per project.
- A create/edit form with the fields from the sheet: l.p., title, location, lead
  architect (picked from a list kept in `kalka.json`), status, six optional milestones
  (day or month precision), six branch-scope texts, notes.
- A one-off script that imports the exported CSV of the sheet into project files.

## Impact

- Specs: `storage` (ADDED: choose data folder, reopen data folder, unsupported browser,
  folder layout, read all projects, save with conflict check, duplicate ids),
  `projects` (ADDED: project list, filter and search, next milestone, create project,
  edit project, running number, lead architect list, milestone precision, branch scope,
  CSV import)
- Code: `src/` (new app), `scripts/import-csv.ts`, GitHub Pages workflow
- Tests: `src/model.test.ts` (dates, next milestone), `src/storage.test.ts` (conflict
  check on a fake file handle), `scripts/import-csv.test.ts`

## Decisions

Settled with the engineer on 2026-10-25:

1. **No delete in the UI.** A finished project is marked `zakończony`; a file can be
   removed in OneDrive if ever needed.
2. **Lead architects are a fixed list in `kalka.json`** (`"architects": [...]`), edited
   by hand in the data folder; no settings screen. The names are real people, so they
   live only in the OneDrive folder, never in this public repo or its defaults.
3. **The list shows l.p.** as its first column. Sorting stays by next milestone.
4. **"MINIMUM" in branch scopes stays plain text**; no flag.
5. **OneDrive conflict copies are cleaned up by the user** in OneDrive; the app only
   marks them.

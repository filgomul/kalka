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
- A project list with filter by lead architect and status, text search, and the next
  milestone per project.
- A create/edit form with the fields from the sheet: title, location, lead architect,
  status, six optional milestones (day or month precision), six branch-scope texts, notes.
- A one-off script that imports the exported CSV of the sheet into project files.

## Impact

- Specs: `storage` (ADDED: choose data folder, reopen data folder, unsupported browser,
  folder layout, read all projects, save with conflict check, duplicate ids),
  `projects` (ADDED: project list, filter and search, next milestone, create project,
  edit project, milestone precision, branch scope, CSV import)
- Code: `src/` (new app), `scripts/import-csv.ts`, GitHub Pages workflow
- Tests: `src/model.test.ts` (dates, next milestone), `src/storage.test.ts` (conflict
  check on a fake file handle), `scripts/import-csv.test.ts`

## Open questions

1. Delete a project or only mark it `zakończony`? This proposal assumes **no delete in
   the UI**; a file can be removed in OneDrive if ever needed.
2. Lead architect as free text with suggestions, or a fixed list in `kalka.json`? This
   proposal assumes **free text with suggestions from existing values**, so a new
   employee needs no settings screen.
3. Should the list also show the old sheet's running number (l.p.)? This proposal
   assumes **no**; projects are sorted by next milestone instead.

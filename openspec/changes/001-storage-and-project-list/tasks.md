## 1. Project skeleton

- [x] 1.1 `pnpm add preact --ignore-scripts`; `pnpm add -D vite typescript @preact/preset-vite @types/node --ignore-scripts` (add `@types/wicg-file-system-access` only if `lib.dom` lacks `showDirectoryPicker`)
- [x] 1.2 `vite.config.ts` with the Preact preset and `base: '/kalka/'`; `index.html`, `src/main.tsx`, `src/pl.ts` for UI strings
- [x] 1.3 `src/model.ts`: `Project` (with optional `lp`), `MilestoneKey`, `BranchKey`, `parseDate`, `nextMilestone`, `nextLp`, `architectOptions` (list from `kalka.json` plus values found in projects), `newId`; tests for next milestone, running number and architect options

## 2. Storage

- [x] 2.1 `src/storage.ts`: pick folder, persist handle in IndexedDB, reopen with permission request, create `kalka.json` (`{ "schema": 1, "architects": [] }`) and `projekty/`, read `architects`
- [x] 2.2 Read all `projekty/*.json`, collect parse errors and duplicate ids instead of throwing
- [x] 2.3 Save: re-read, compare `updatedAt`, write with new `updatedAt`; tests for the conflict check against an in-memory handle

## 3. Projects UI

- [x] 3.1 List view: columns (l.p. first), architect and status filter, search, sort by next milestone, filters kept in the URL hash
- [x] 3.2 Form view: all fields, l.p. pre-filled for new projects, lead architect select with the off-list value kept and the empty-list hint, milestone inputs with day/month toggle, save and cancel, conflict message
- [x] 3.3 Unsupported-browser and no-folder screens

## 4. Import

- [x] 4.1 `scripts/import-csv.ts <csv> <outDir>`: header mapping, l.p. to `lp`, date shapes, MINIMUM kept as text, `brak`/`-` to empty, location split; tests with made-up rows

## 5. Deploy

- [x] 5.1 `.github/workflows/pages.yml`: pnpm install, build, deploy `dist/` to GitHub Pages

## 6. Verify

- [x] 6.1 Tests are green
- [x] 6.2 Verify in the running dev environment: pick a scratch folder, import the real CSV into it, add the architects to its `kalka.json` by hand, open, filter by architect, edit a project in two tabs and confirm the second save is refused

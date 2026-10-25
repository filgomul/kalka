## 1. Project skeleton

- [ ] 1.1 `pnpm add preact --ignore-scripts`; `pnpm add -D vite typescript @preact/preset-vite @types/node --ignore-scripts` (add `@types/wicg-file-system-access` only if `lib.dom` lacks `showDirectoryPicker`)
- [ ] 1.2 `vite.config.ts` with the Preact preset and `base: '/kalka/'`; `index.html`, `src/main.tsx`, `src/pl.ts` for UI strings
- [ ] 1.3 `src/model.ts`: `Project`, `MilestoneKey`, `BranchKey`, `parseDate`, `nextMilestone`, `newId`

## 2. Storage

- [ ] 2.1 `src/storage.ts`: pick folder, persist handle in IndexedDB, reopen with permission request, create `kalka.json` and `projekty/`
- [ ] 2.2 Read all `projekty/*.json`, collect parse errors and duplicate ids instead of throwing
- [ ] 2.3 Save: re-read, compare `updatedAt`, write with new `updatedAt`; tests for the conflict check against an in-memory handle

## 3. Projects UI

- [ ] 3.1 List view: columns, architect and status filter, search, sort by next milestone, filters kept in the URL hash
- [ ] 3.2 Form view: all fields, milestone inputs with day/month toggle, save and cancel, conflict message
- [ ] 3.3 Unsupported-browser and no-folder screens

## 4. Import

- [ ] 4.1 `scripts/import-csv.ts <csv> <outDir>`: header mapping, date shapes, `brak`/`-` to empty, location split; tests with made-up rows

## 5. Deploy

- [ ] 5.1 `.github/workflows/pages.yml`: pnpm install, build, deploy `dist/` to GitHub Pages

## 6. Verify

- [ ] 6.1 Tests are green
- [ ] 6.2 Verify in the running dev environment: pick a scratch folder, import the real CSV into it, open, filter by architect, edit a project in two tabs and confirm the second save is refused

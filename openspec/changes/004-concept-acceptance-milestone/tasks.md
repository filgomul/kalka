## 1. Seventh milestone

- [ ] 1.1 `src/model.ts`: add `akceptacja` to `MILESTONES` between `koncepcja` and `pbDoUrzedu`. Verify: `pnpm build` type-checks and points at every `Record<MilestoneKey, …>` that needs the new key
- [ ] 1.2 `src/pl.ts`: `milestoneLabels.akceptacja = 'akceptacja koncepcji'`, `milestoneShort.akceptacja = 'akc.'`. Verify: `pnpm build` type-checks
- [ ] 1.3 `src/model.test.ts`: tests "projects: Form order" (milestone order from `MILESTONES` with their labels), "projects: Save a date" (`prepareForSave` keeps `akceptacja: '2026-11-14'`), "projects: Next milestone" (concept done, acceptance next) and "projects: Older file" (`normalize` on a file without `akceptacja`, then `prepareForSave` writes no key). Verify: `pnpm test` green
- [ ] 1.4 `src/style.css`: `[data-kind='akceptacja']` with bar, tint and text colours in a muted olive, distinct from the six kinds and from `--error`. Verify: the legend and an "akc." chip in the dev server
- [ ] 1.5 `src/calendar.test.ts`: tests "calendar: Concept acceptance chip" (entry for `akceptacja` on 2026-11-14) and "calendar: Same day as the concept" (`koncepcja` before `akceptacja` on the same day). Verify: `pnpm test` green

## 2. Remove the CSV import

- [ ] 2.1 Delete `scripts/import-csv.ts`, `scripts/import-csv.test.ts` and the empty `scripts/` folder; drop `"scripts/**/*.test.ts"` from the `test` script in `package.json` and `"scripts"` from `include` in `tsconfig.json`. Verify: `pnpm test` and `pnpm build` green, `grep -rn import-csv` outside `openspec/` finds nothing

## 3. Docs

- [ ] 3.1 `AGENTS.md`: "six optional milestones" becomes seven; add the row `akceptacja koncepcji | akceptacja | Client accepted the concept design` after "wydanie koncepcji" in the domain terms table; drop the "one-off CSV import" sentence under **projects** and "one-off scripts in `scripts/`" under Stack. Keep the gitignore note and the CLAUDE.md warning about the sheet's personal data. Verify: `git diff AGENTS.md` shows only those lines

## 4. Verify

- [ ] 4.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [ ] 4.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, a scratch data folder outside the repo): open an existing project and see "akceptacja koncepcji" empty between "wydanie koncepcji" and "PB do urzędu"; enter 14.11.2026, save, and see `"akceptacja": "2026-11-14"` in its file and the "akc." chip in November 2026 next to the legend entry; set it to a past date not done and see it overdue in the calendar, in "Terminy" and as the list's next milestone; tick "zrobione" and see the chip dimmed and the entry gone from "Terminy"

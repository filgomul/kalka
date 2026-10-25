## Why

Between handing the concept to the client ("wydanie koncepcji") and filing the permit
design ("PB do urzędu") the studio waits for the client to accept the concept. That step
often decides when PB work can start, but Kalka has no place for it, so it lives in
notes or in someone's head.

## What Changes

- A seventh milestone, "akceptacja koncepcji" (key `akceptacja`), right after
  "wydanie koncepcji" everywhere milestones are listed: the form, the calendar legend,
  chips, the month strip, the overview and "Terminy".
- It behaves like the other six: optional, day or month precision, done flag, counts for
  the project list's next milestone and for overdue marking.
- In the calendar it gets the short label "akc." and its own colour.
- Existing project files stay valid: they simply have no `akceptacja` date and it is not
  done. Every studio folder is already migrated from the old sheet, so nobody has to
  fill anything in.
- The one-off CSV import script is deleted: the migration is done, and with seven
  milestones the script no longer type-checks.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `projects`: seven milestones instead of six in the form and the done flag; the CSV
  import requirement goes away
- `calendar`: chip labels, legend and colours cover the new milestone

## Impact

- Specs: `projects` (ADDED: concept acceptance milestone; MODIFIED: edit project,
  milestone done; REMOVED: CSV import), `calendar` (MODIFIED: milestone chips, chip
  state)
- Code: `src/model.ts` (milestone list), `src/pl.ts` (full and short label),
  `src/style.css` (seventh kind colour); `scripts/` deleted, and `package.json` and
  `tsconfig.json` stop pointing at it
- Tests: `src/model.test.ts`, `src/calendar.test.ts`; `scripts/import-csv.test.ts` goes
  with the script
- Docs: `AGENTS.md` (milestone count, domain terms table, no more CSV import or
  `scripts/`)
- Data: no migration; the new key is optional like the others, and the folders are
  already migrated

## Decisions

Settled with the engineer on 2026-10-25:

1. **Folders are already migrated.** The CSV import is finished; the script is deleted
   rather than kept compiling for a run that won't happen again.

Assumed, for the engineer to confirm in review:

2. **Key `akceptacja`, short label "akc."**, in line with "konc." and "uzup.".
3. **Colour**: a muted olive, distinct from the six existing kinds and from the
   overdue outline.

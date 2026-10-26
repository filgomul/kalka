## Why

Many milestone dates are guesses when they are entered: the studio expects the permit
"some time in March" or pencils in a concept date before the client has agreed to it.
Kalka shows a guess exactly like a date agreed with the client or the office, so in the
calendar nobody can tell which deadlines are fixed and which may still move.

## What Changes

- Each milestone gets a two-state choice, "planowane" or "potwierdzone", shown as a pair
  of radio buttons next to the date. Every date is "planowane" until someone marks it
  "potwierdzone"; new projects and existing files start that way.
- The done checkbox stays as it is, renamed from "zrobione" to "zrealizowane". It is
  independent of the planned / confirmed choice.
- In the calendar (day chips, month strip, overview) a planned milestone that is not
  done is drawn fainter than a confirmed one, not struck through, with a question mark
  before its short label. Past its due date it is overdue like any open milestone: "!"
  and the overdue outline, plus the question mark. A done milestone looks as before.
- The legend explains the question mark.
- The project list's next milestone and "Terminy" show a question mark before a planned
  date.
- Project files gain an optional list of confirmed milestones next to the done list.
  Existing files stay valid; nothing in them is confirmed yet.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `projects`: planned / confirmed choice per milestone, stored in the file and marked in
  the project list; the done checkbox is renamed
- `calendar`: chips, strip and overview entries and "Terminy" show planned milestones;
  the legend explains the mark

## Impact

- Specs: `projects` (MODIFIED: milestone done, next milestone; ADDED: confirmed date),
  `calendar` (MODIFIED: chip state, deadlines list)
- Code: `src/model.ts` (confirmed list, normalize, save), `src/calendar.ts` (entry
  carries the confirmed flag), `src/form.tsx` (radio pair), `src/calendar-view.tsx`
  (chip mark, hover text, legend), `src/list.tsx`, `src/deadlines.tsx`, `src/pl.ts`,
  `src/style.css`
- Tests: `src/model.test.ts`, `src/calendar.test.ts`
- Docs: `AGENTS.md` (domain terms)
- Data: no migration; the new key is optional

## Decisions

Settled with the engineer on 2026-10-26:

1. **Two controls, not one**: a "planowane | potwierdzone" radio pair and the existing
   done checkbox, renamed "zrealizowane".
2. **Planned by default**: a date is planned until someone confirms it, and only planned
   dates get the faint look and the question mark.

Assumed, for the engineer to confirm in review:

3. **Existing files**: they have no confirmed marks, so after this change every date in
   them shows as planned (faint, with "?") until someone confirms it.
4. **Done wins**: a done milestone is drawn as done (dimmed, struck through) with no
   question mark, whether or not it was confirmed.
5. **File format**: `"confirmed": ["pbDoUrzedu"]` next to `"done": [...]`, so older
   files and older copies of the app keep working.
6. **Confirming without a date** is allowed and saved, like done without a date; it
   shows nowhere until the milestone gets a date. Changing the date keeps the choice.
7. **The question mark** is drawn as a small round "?" in the milestone's colour, in the
   style of the overdue "!", rather than as an emoji, so it looks the same on every PC.
   In the list and "Terminy" it sits before the date. Hover text and legend call it
   "niepotwierdzone".

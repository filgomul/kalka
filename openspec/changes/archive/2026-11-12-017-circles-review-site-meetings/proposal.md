# Proposal

## Why

Three small requests from QA, bundled into one change (Trello collective card for
"Gantt chart", "Nowy rodzaj spotkania: na budowie" and "Nowa kolumna/stan zadania:
Do weryfikacji"):

- The diamonds in "Harmonogram" read poorly; QA asked for circles or dots and picked
  variant D of a mock: circles, with rounded, outlined month bands.
- The studio meets on site often, and neither "stacjonarne" nor "online" says so.
- A finished task often waits for someone to check it before it is really done; today
  it has to sit in "W trakcie" or be marked done too early.

## What Changes

- **Harmonogram**: a day milestone is a circle instead of a diamond, same size and
  colour; several milestones of a project on one day are one dark circle with their
  number. A month band gets rounded ends and an outline in its style's colour instead
  of the stripe on its left. Done, overdue and planned look as before.
- **Meetings**: a third type "na budowie", stored as `budowa`, marked with a hard hat
  in its own colour wherever the type mark is shown, and offered in the meeting
  dialog's type choice. A new meeting is still "stacjonarne". No link to the "nadzór
  autorski" milestone.
- **Tasks**: a fourth state "Do weryfikacji", stored as `review`, with its own
  light-blue column between "W trakcie" and "Wykonane" on the project board and in
  the "Zadania" tab. It works like "Do zrobienia" and "W trakcie": a task there past
  its date is "po terminie"; in the tab it is ordered like "W trakcie" (urgent first,
  then by date). The "wykonane" checkbox is unchanged: ticking sets `done`, unticking
  sets `todo`.
- **Demo**: some demo tasks are in "Do weryfikacji" and some demo meetings are "na
  budowie".
- Older files need no conversion: `todo`/`doing`/`done` and `stacjonarne`/`online`
  keep their meaning. A file written with `review` or `budowa` read by an older Kalka
  falls back to `todo` / `stacjonarne`, which is harmless since every PC loads the same
  live version.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `calendar`: circles instead of diamonds in Harmonogram (MODIFIED: Harmonogram bars
  and marks, Harmonogram mark state, Stacked marks, Open project from calendar)
- `meetings`: the third type (MODIFIED: Meeting fields, Meeting type mark, Meeting
  file)
- `tasks`: the fourth state (MODIFIED: Task board on the project page, Task card,
  Task file, Tasks tab, Order in the tasks tab, Done checkbox)
- `demo`: demo data covers the new state and type (MODIFIED: Demo data)

## Impact

- Specs: `calendar`, `meetings`, `tasks`, `demo`
- Code: `src/calendar-view.tsx` (mark class `gantt-diamond` becomes `gantt-dot`),
  `src/calendar.ts` (comment), `src/meetings.ts` (`MEETING_TYPES`),
  `src/meetings-view.tsx` (hard-hat mark), `src/tasks.ts` (`TASK_STATUSES`),
  `src/tasks-view.tsx` (order of the new column), `src/pl.ts` (labels),
  `src/style.css` (circles, bands, hard-hat colour, new lane colour, four board
  columns), `src/demo.ts` (data)
- Tests: `src/tasks.test.ts`, `src/meetings.test.ts`, `src/demo.test.ts`
- Docs: `AGENTS.md` (domain table: `review`, `budowa`; tasks and meetings lines)
- No new dependency, no URL change

## Decisions

Settled with the engineer on 2026-11-12:

1. **Variant D** of the Harmonogram mock: circles, rounded outlined month bands,
   states unchanged.
2. **"Do weryfikacji" is not done**: it follows the rules of "Do zrobienia" and "W
   trakcie" (overdue marking, ordering in the tab).
3. **Hard hat** marks "na budowie", in an orange (`#c25a1c`) set apart from the
   brown of "stacjonarne" and the blue of "online".
4. **"Do weryfikacji" is light blue** (accent `#4a86b8`, tint `#e8f1f8`).
5. **No link** between "na budowie" meetings and the "nadzór autorski" milestone.
6. **One change** for the three requests.

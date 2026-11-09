## Why

The studio runs building projects and interior projects side by side. Once a project
is created, nothing records which kind it is, so the list can't show or narrow to one
kind. The list also sorts only by the next milestone, so finding a project by number,
city or architect means scanning the whole table.

## What Changes

- A project keeps its type: "projekt budowlany", "projekt wnętrz" or "inny", stored as
  `type` with the template keys `budowlany`, `wnetrza`, `inny`.
- A new project takes its type from the template picked in "Nowy projekt" (the
  building one when the address has no template).
- A project file without a valid `type` reads as "inny". The file gets `type` only when
  the project is written (a "Zapisz" or a milestone change), like the conversion of
  older milestone files.
- The project form gets a "typ projektu" choice. It is saved with "Zapisz" and does not
  change the milestones.
- Project list: a "typ" column after "tytuł", and a "Typ projektu" filter next to the
  architect and status filters, kept in the URL (`y`).
- Clicking a column header sorts by that column, and a second click reverses the
  order. Empty values stay last in both directions, and status and type sort in their
  list order. The default stays by next milestone. The sort is kept in the URL (`o`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `projects`: project list columns and order, the type filter, the editable fields,
  templates seeding a type; new requirements for the project type and sorting by column

## Impact

- Specs: `projects` (MODIFIED: Project list, Filter and search, Edit project, Project
  templates; ADDED: Project type, Sort by column)
- Code: `src/model.ts` (`type` on `Project`, `normalize`, type filter, sort by column),
  `src/list.tsx` (column, filter, sortable headers), `src/main.tsx` (`y` and `o` in
  the URL), `src/form.tsx` (type choice, type of a new project), `src/pl.ts`,
  `src/style.css`
- Tests: `src/model.test.ts`
- Docs: `AGENTS.md` (`type` domain term, the template no longer forgotten)
- Data: no migration. Existing projects show as "inny" until someone sets their type.
- No new dependency
- Runs alongside 011 and 013, which touch the same files. 012 owns the MODIFIED
  "Edit project" requirement, and 013 only adds requirements. Merge order: 011, 012,
  013.

## Decisions

Settled with the engineer on 2026-11-09 (also on the card's "Ustalenia"):

1. **Keys are the template ids** `budowlany`, `wnetrza`, `inny`, not `wnetrz`. The type
   is the template id, so no mapping is needed, and the `t=` links in "Nowy projekt"
   stay as they are.
2. **URL letters**: `y` for the type filter, `o` for the sort (`o=tytul`, `o=-tytul`).
   `t` is already the template on the new-project link, and going back from the form
   drops it.
3. **Empty values last** in both directions.
4. **Status and type sort in list order** (aktywny, wstrzymany, zakończony;
   budowlany, wnętrz, inny), not alphabetically.
5. **Files without `type` read as "inny"**, older-shape files included.
6. **Changing the type leaves the milestones alone** and waits for "Zapisz".
7. **Out of scope**: a type filter in the calendar, "Terminy" and "Zadania"; working
   out the type of existing projects from their milestones.

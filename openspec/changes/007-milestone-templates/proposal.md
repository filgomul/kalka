## Why

Every project today has the same seven building-permit milestones, but the studio also
does interior design, whose stages are different (layouts, visualisations, author's
supervision). Projects also have one-off events the fixed list cannot hold: a second
supplement filed with the office, an unplanned stop. A project's milestones need to be
seeded from its kind and then be a list the studio can extend, trim and reorder.

## What Changes

- "Nowy projekt" opens a menu of templates: "projekt budowlany", "projekt wnętrz" and
  "inny". Picking one opens an empty project form with that template's milestones,
  undated, in its order. "inny" starts with no milestones.
- A template only seeds the list. The project does not remember which template it came
  from, and later template edits (a future configuration view) never touch existing
  projects.
- The building template gains a new milestone, "wydanie projektu", after "termin
  branżystów". The interior template is: data rozpoczęcia, układy funkcjonalne,
  akceptacja układów, pierwsze wizualizacje, akceptacja wizualizacji, wydanie projektu,
  nadzór autorski.
- Each milestone has a style: a name, a short label and a colour used by the calendar,
  the overview and "Terminy". There are 14 built-in styles, the 13 milestone kinds of
  the two templates plus "inny" (black, short label "inny").
- In the project form the user can add a milestone ("+ Dodaj termin": a dialog with a
  title and a style, "inny" by default; it goes to the end of the list), edit the title
  and style of a milestone they added, delete any milestone (after a confirmation) and
  drag milestones to reorder them. The same style may appear more than once in a
  project. All of this is part of the project draft, written by "Zapisz" and undone by
  "Anuluj".
- Done, planned / confirmed and day / month precision stay as they are, now per
  milestone instead of per kind.
- The calendar legend lists only the styles that the visible projects use. Milestones on
  the same day keep the order they have in their project.
- **BREAKING** (file format): project files store milestones as an ordered list under a
  new `timeline` key. Older files are converted when read (their seven milestones in the
  usual order plus an empty "wydanie projektu") and written in the new shape on their
  next save.

## Capabilities

### New Capabilities

None. Templates, styles and the milestone list belong to `projects`.

### Modified Capabilities

- `projects`: creating a project from a template; the milestone list replaces the seven
  fixed milestones (add, edit, delete, reorder); milestone styles; reading older project
  files; done, confirmed and precision per milestone
- `calendar`: chip label, colour and legend come from the milestone's style; same-day
  order follows the project's milestone order

## Impact

- Specs: `projects` (ADDED: templates, styles, add / edit / delete / reorder milestones,
  older files; MODIFIED: create, edit, precision, done, confirmed; REMOVED: concept
  acceptance milestone, folded into the building template), `calendar` (MODIFIED:
  milestone chips, chip state)
- Code: `src/model.ts` (milestone list, styles, templates, conversion of older files,
  next milestone), `src/form.tsx` (milestone list, dialog, drag), `src/list.tsx`
  (template menu, next milestone title), `src/main.tsx` (template in the new-project
  route), `src/calendar.ts` and `src/calendar-view.tsx` (entries per milestone, chip
  colour and legend from styles), `src/deadlines.tsx`, `src/pl.ts` (milestone labels
  move to the style list), `src/style.css` (colours from data instead of seven CSS rules)
- Tests: `src/model.test.ts`, `src/calendar.test.ts`
- Docs: `AGENTS.md` (milestones, domain terms)
- Data: no migration step; older project files keep working and change shape when saved
- No new dependency: the menu uses the browser's `popover`, the dialog and drag-and-drop
  reuse what the task board already does

## Decisions

Settled with the engineer on 2026-11-07:

1. **Older projects** are read as the building template: their seven milestones with
   dates, done and confirmed marks, plus an empty "wydanie projektu" at the end.
2. **No template stored** on the project. The milestone list is a snapshot of the
   template at the time the project was created.
3. **Styles and templates are built into the app** for now, as data a later
   configuration view (stored in `kalka.json`) can override by id. A project stores only
   a milestone's style id, so editing a style later recolours and renames its milestones
   everywhere. Styles will be hidden, never deleted, once they can be edited.
4. **Template milestones keep their title** (the style's name). Milestones the user
   added have their own required title and can be edited (title and style) in the same
   dialog.
5. **Saved with "Zapisz"**: adding, editing, deleting and reordering milestones change
   the draft; "Anuluj" undoes them, unlike tasks, which are written at once.
6. **Colours**: one colour per style; black is reserved for "inny" and the overdue red
   for overdue. The six new styles get indigo, rose, violet, green, dark green and dark
   brown (values in design.md).
7. **Legend** shows only the styles in use by the visible projects.
8. **Nadzór autorski** is a single day or month like any other milestone (the date of a
   site visit), not a period.
9. **Template menu** opens from the "Nowy projekt" button and lists the templates with
   "inny" last.
10. **Older app versions** open on another computer at the same time are not handled;
    the QA note asks to reload the page.

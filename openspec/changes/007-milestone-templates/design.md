## Context

A milestone is identified everywhere by one of seven fixed keys: `MILESTONES` in
`src/model.ts` sets the order, `Project.milestones` is a map keyed by them, `done` and
`confirmed` are lists of them, `pl.ts` holds `milestoneLabels` / `milestoneShort` per key,
`style.css` has seven `[data-kind=...]` colour rules, and `calendar.ts` uses the key's
index as the same-day tiebreak. The project form (`src/form.tsx`) renders the seven keys
in a loop. The task board (`src/board.tsx`) already has a native `<dialog>` in a small
`Portal`, a `confirm()` delete and native drag-and-drop. See proposal.md for why and the
specs for the behaviour.

## Goals / Non-Goals

**Goals:**

- A milestone with its own identity, so one style can appear twice and done / confirmed
  belong to the milestone.
- Styles and templates as plain data a later configuration view can override from
  `kalka.json` without another file-format change.
- Older project files read without a migration step.

**Non-Goals:**

- Reading styles or templates from `kalka.json` now, or any configuration screen.
- Milestones that span a period.
- Protecting against an older copy of the app saving a new-shape file (decision 10 in
  the proposal).

## Decisions

### 1. Project file: an ordered `timeline` list

```json
"timeline": [
  { "id": "rozpoczecie", "style": "rozpoczecie", "date": "2026-10-01", "confirmed": true },
  { "id": "uzupelnienie", "style": "uzupelnienie", "date": "2026-12" },
  { "id": "k3f9a2", "style": "uzupelnienie", "title": "drugie uzupełnienie", "done": true },
  { "id": "p81c0d", "style": "inny", "title": "zmiana inwestora" }
]
```

`Milestone = { id, style, title?, date?, done?, confirmed? }`. The array order is the
project's order. `title` is present only on milestones the user added; without it the
milestone shows its style's name, and that absence is also what marks a template
milestone (no edit dialog). `done` and `confirmed` are written only when true.

Milestones seeded from a template take the style id as their id (unique within a
template, readable in the file); added milestones get a short random id
(`crypto.randomUUID().slice(0, 8)`, fine for a few dozen per project).

A new key instead of reusing `milestones`: the read code tells old from new by key
rather than by type, and an older app copy that saves such a file keeps `timeline`
(its `normalize` and `prepareForSave` spread unknown fields through) instead of wiping
it. Not a goal, but free.

Alternative: keep the map and add an `extra` list for added milestones. Rejected:
reordering and deleting template milestones would need a second structure, and done /
confirmed would still be per kind.

### 2. Styles and templates as data in `src/model.ts`

```ts
type MilestoneStyle = { id: string; name: string; short: string; color: string }
type Template = { id: string; name: string; styles: string[] }
export const STYLES: MilestoneStyle[]      // 14, "inny" last
export const TEMPLATES: Template[]         // budowlany, wnetrza, inny (empty)
export const styleOf = (id: string) => STYLES.find(s => s.id === id) ?? INNY
```

They live in `model.ts` next to the code that uses them, not in `pl.ts`, because they
are default data that a later change will merge with `kalka.json` (`styles` / `templates`
arrays, override by id, `hidden: true` instead of delete). That change only has to swap
`STYLES` for a merged list passed in from settings. `milestoneLabels` and
`milestoneShort` leave `pl.ts`.

| id | name | short | colour |
| --- | --- | --- | --- |
| `rozpoczecie` | data rozpoczęcia | rozp. | `#7d776d` |
| `koncepcja` | wydanie koncepcji | konc. | `#a07a3c` |
| `akceptacja` | akceptacja koncepcji | akc. | `#807a35` |
| `pbDoUrzedu` | PB do urzędu | PB | `#4e6b80` |
| `uzupelnienie` | uzupełnienie do urzędu | uzup. | `#7a5f7f` |
| `pozwolenie` | uzyskanie pozwolenia | pozw. | `#697662` |
| `branzysci` | termin branżystów | branż. | `#3e7d77` |
| `wydanieProjektu` | wydanie projektu | wyd. | `#4a5899` |
| `uklady` | układy funkcjonalne | ukł. | `#a0587a` |
| `akceptacjaUkladow` | akceptacja układów | akc. ukł. | `#8a4f9a` |
| `wizualizacje` | pierwsze wizualizacje | wiz. | `#3f8a5c` |
| `akceptacjaWizualizacji` | akceptacja wizualizacji | akc. wiz. | `#2c5e3c` |
| `nadzor` | nadzór autorski | nadz. | `#6b4a35` |
| `inny` | inny | inny | `#000000` |

The first seven keep today's colours. The six new ones were checked with a script: each
is at least as far (OKLab) from its nearest neighbour as today's closest pair (rozp. /
pozw.), none is close to `--error` `#9b3b2f`, and the derived text-on-tint contrast is
6.6:1 or better. Style order in the list is the legend order.

### 3. Colour from data, tint and text derived in CSS

Chips, strip entries, overview entries, legend swatches, the "?" mark and the
"Terminy" kind label get `style={{ '--c': styleOf(m.style).color }}`. The seven
`[data-kind]` rules become one:

```css
.chip, .kind, .legend i, .q {
  --t: color-mix(in oklab, var(--c) 12%, white);
  --x: color-mix(in oklab, var(--c), black 32%);
}
```

One colour per style is what a later colour picker will edit. The derived tint and text
differ slightly from today's hand-picked ones; the dev-environment check compares them.

### 4. Reading older files in `normalize`

When the raw file has `timeline` (an array), `normalize` keeps its well-formed items
(object with a text `id` and `style`), drops the rest, and coerces `done` / `confirmed`
to booleans. Otherwise it builds the list from the old shape: the building template's
styles in order, each with id = style id, `date` from `raw.milestones[key]`, `done` /
`confirmed` from the old lists; `wydanieProjektu` has no old key, so it comes out empty.
`prepareForSave` writes `timeline` (drops a `date` that `parseDate` rejects, drops false
flags, trims titles) and deletes `milestones`, `done` and `confirmed`. The project type
loses those three fields.

### 5. Pure helpers, call sites follow

- `fromTemplate(id)`: the seeded list; an unknown or missing id gives the building
  template (old `#/nowy` bookmarks).
- `nextMilestone(p)`: same rule, walks `p.timeline`; returns the milestone, so the list
  shows `titleOf(m)` (`m.title ?? styleOf(m.style).name`).
- `moveMilestone(list, from, to)`: returns a new array; used by drag and arrow keys.
- `calendar.ts` `entries`: one entry per dated milestone with `milestone` and its
  `index` in the project; tiebreak `index` instead of `MILESTONES.indexOf`. `Entry.key`
  goes; views read `styleOf(e.milestone.style)` and `titleOf(e.milestone)`.
- Legend: the distinct styles of `all` (the visible entries), sorted by `STYLES` order.

### 6. New-project menu with `popover`

"Nowy projekt" becomes `<button popovertarget="templates">` with a `<div popover
id="templates">` of links `#/nowy?t=<id>` (keeping the filter query). The browser
handles open, Esc and click-outside. `main.tsx` passes `route.params.get('t')` to the
form, which seeds `timeline` with `fromTemplate`. The `t` parameter is dropped from the
return link the same way `z` is today.

### 7. Milestone rows, dialog and drag in the form

Each milestone row gets a handle `<button type="button" draggable>` (aria-label "Przesuń
termin"), the existing date / precision / planned-confirmed / done controls keyed by
milestone id, an "Edytuj" button only when it has a `title`, and an "Usuń" button
(`confirm()`, like tasks). The precision state becomes a map by milestone id.

The add / edit dialog reuses the board's `<dialog>` + `Portal` (exported from
`board.tsx`), outside the project `<form>` so Enter does not submit the project.
Buttons "Dodaj" / "Zmień" and "Anuluj"; the style select lists `STYLES` in order. The
"+ Dodaj termin" button sits in the section header, top right, like "+ Dodaj zadanie".

Drag: the grid wraps, so `dragover` goes by reading order (rows, then the left or right
half of a card) to find the insertion index and draws a line, as the board does; `drop`
calls `moveMilestone`. ArrowUp / ArrowDown on a focused handle call `moveMilestone` by
one and refocus the moved handle. No order numbers are needed because the whole list is
written at once (decision 8).

### 8. Milestones saved at once

The project file holds the milestones and the other fields together, so a milestone write
must not carry unsaved title or notes edits, and a later "Zapisz" must not trip the
conflict check on the milestone write that came before it.

```
            base (project as last written; starts as loaded.project)
             |
milestone    |  withTimeline(base, list) = prepareForSave({ ...base, timeline: list })
change ------+--> saveProject(dir, that, file, base.updatedAt) --> base = result
             |                                                    draft.timeline = list
"Zapisz" ----+--> saveProject(dir, prepareForSave(draft), file, base.updatedAt)
"Anuluj" ----+--> leaves; only the non-milestone draft fields are lost
```

- `withTimeline` is a pure helper in `model.ts`, so the "fields stay out" rule is tested
  with `node --test`.
- Writes go through one promise chain in the form, so two quick toggles never both
  write against the same `updatedAt` (the second would be a false conflict).
- The date input updates the draft at once but writes after 500 ms without input; a
  pending write is flushed before "Zapisz", before "Anuluj" and when the form unmounts.
  Every other action (radios, checkbox, add, edit, delete, drop, arrow keys, switching
  day to month) writes straight away.
- Switching month to day clears the field in the draft only; `precision` says "day" and
  the next picked date writes. The stored month stays until then.
- After each write `main.tsx` re-reads the projects without navigating
  (`reloadProjects`), so the list and calendar are current when the user goes back. The
  form keeps its own draft state, so the re-read does not disturb it.
- `ConflictError`: nothing was written. The form re-reads the projects, takes the file's
  project as the new `base`, replaces `draft.timeline` (and the precision map) with it,
  keeps the other draft fields, and shows the milestone conflict message.
- "Zapisz" checks against its own baseline, `saveAt`, not `base.updatedAt`: `saveAt`
  moves forward with our own milestone writes only. After a conflict re-read `base` is
  the other person's version, but the draft's other fields are still older than it, so
  "Zapisz" keeps refusing with the existing conflict message instead of overwriting
  their title or notes. (Found while implementing; the diagram above shows the
  no-conflict case.)
- A project that has not been saved yet (`loaded` is null) has no file and no `base`:
  milestone changes stay in the draft and the first "Zapisz" writes everything, as
  before.

## Risks / Trade-offs

- [The file shape changes] -> conversion on read, covered by tests; existing calendar and
  model tests keep their old-shape fixtures by passing them through `normalize`, so they
  double as conversion tests.
- [An older app copy open elsewhere shows a saved project without milestones] -> accepted
  for now; the QA note asks to reload; the data itself survives (decision 1).
- [Derived tints look different from today's] -> compared in the dev environment; a style
  can carry explicit `tint` / `text` later if needed.
- [14 colours are hard to tell apart] -> the legend lists only styles in use, and
  building and interior styles rarely meet in one view.
- [Drag-and-drop does not work on touch] -> same accepted limit as the task board; arrow
  keys cover keyboard users.
- ["Anuluj" no longer undoes milestone changes] -> the hint "Zmiany terminów zapisują się
  od razu." under the heading, as on the task board.
- [Every toggle rewrites the project file and syncs through OneDrive] -> a few writes a
  minute at most; the date debounce avoids a write per keystroke.
- [A conflict drops the user's milestone change] -> the message asks to repeat it; the
  milestones on screen already show what the file holds. Merging stays out of scope.

## Migration Plan

No step to run. Older files convert on read and change shape on save. Rollback to the
previous build: files saved in the new shape would show no milestones there (their
`timeline` stays in the file), so roll forward instead of back once the studio has saved
projects.

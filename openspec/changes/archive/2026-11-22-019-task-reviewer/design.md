# Design

## Context

Both task views share `useTaskEdit` in `src/board.tsx`: it owns the open dialog,
`persist`, `moveTo` and `saveDialog`. `saveDialog(before, task)` compares the task as
read (`before`) with the edited one to decide whether the task changed column and so
goes to the bottom of the new one. The board drops through `placeAt` at an index; the
tab drops through `moveTo` (bottom). `filterTaskRows` in `src/tasks.ts` narrows by
assignee for every column.

## Goals / Non-Goals

**Goals:** one reviewer check shared by both drop paths and the dialog; no change to
how files are written apart from two text fields.

**Non-Goals:** keeping the exact drop position when the dialog had to ask for a
reviewer; any per-round history of reviewer notes.

## Decisions

1. **Fields `reviewer` and `reviewNote` are always-present strings**, like `assignee`
   and `description`: `emptyTask` sets them to `''`, `normalizeTask` reads anything
   that is not a string as `''`, `prepareTaskForSave` trims `reviewNote`. Optional
   keys would need `delete` handling everywhere for no gain.
2. **One pure check** in `src/tasks.ts`: `needsReviewer(task)` is true when
   `task.status === 'review'` and `task.reviewer` is empty. The dialog runs it on the
   draft before saving. The drops use `dropNeedsReviewer(task, to)`, which runs it on
   `{ ...task, status: to }` only when the task comes from another column, so
   reordering or ticking an older reviewer-less task in review keeps working.
3. **Opening the dialog with a preset state**: `useTaskEdit.edit` takes an optional
   initial state for the draft, and keeps the task as read as `before`. Then
   `saveDialog` sees the state change and puts the task at the bottom of "Do
   weryfikacji", and "Anuluj" writes nothing. Alternative, opening the dialog on a
   copy already in `review`, would make `saveDialog` treat it as unchanged and keep
   its old `order` in the wrong column.
4. **Drop position after the dialog is the bottom**, on the board too. Carrying the
   drop index through the dialog is extra state for a rare path.
5. **Filter**: in `filterTaskRows` the person matched is `task.reviewer` for a task
   in `review` and `task.assignee` otherwise, both for an architect and for
   "nieprzypisane". The building of the week counts done tasks, so it still goes by
   assignee. `architectOptions` gets reviewers along with assignees.
6. **Circles**: both cards render the reviewer circle with the same `badgeFor` /
   `textOn` as the assignee, plus a small check mark (CSS on a modifier class), and
   one `title` on the pair from a `pl.ts` helper. Only for tasks in `review`.

## Risks / Trade-offs

- [An architect filtering on themselves no longer sees their own tasks waiting in
  review] → as agreed on the card: "Do weryfikacji" is the reviewer's column; the
  card on the project board still shows both people.
- [An older Kalka build reading a new file] → the extra keys pass through `...raw` and
  are written back unchanged; every PC loads the same live version anyway.

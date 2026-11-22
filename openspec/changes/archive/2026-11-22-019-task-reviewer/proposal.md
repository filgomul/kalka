# Proposal

## Why

Change 017 added the task state "Do weryfikacji", but nothing says who should check a
task there. QA asked that a task waiting for a check names the person who checks it,
and that this person sees it among their own tasks in the "Zadania" tab (Trello card
"Osoba weryfikująca zadanie").

## What Changes

- **Reviewer**: a task gets a reviewer, "weryfikuje", picked from the architects in
  `kalka.json` (anyone, the assignee included). The field is always in the task
  dialog; it is required only while the state is "Do weryfikacji". Saving a task in
  that state without a reviewer shows an error and writes nothing.
- **Reviewer notes**: a free-text field "uwagi z weryfikacji" in the task dialog for
  what the reviewer found. One field per task, kept across rounds of review and fixes.
- **Drag without a reviewer**: dragging a task without a reviewer onto "Do
  weryfikacji" (project board or "Zadania" tab) writes nothing and opens the task
  dialog with the state set to "Do weryfikacji". "Zapisz" with a reviewer puts the
  task at the bottom of that column; "Anuluj" leaves it where it was.
- **Kept on the way back**: the reviewer and the notes stay on the task when it leaves
  "Do weryfikacji" (back to "W trakcie" for fixes, or to "Wykonane"), so the next move
  to review has the reviewer already chosen.
- **"Zadania" tab**: with an architect chosen, "Do weryfikacji" shows the tasks that
  architect reviews; the other columns still go by assignee. "nieprzypisane" shows
  in "Do weryfikacji" the tasks without a reviewer (such as those put there before
  this change). The "Architekt" choice also lists reviewers no longer in `kalka.json`.
- **Card**: a card in "Do weryfikacji" shows two circles, the assignee's (as today)
  and the reviewer's with a small check mark; hovering either names both people.
  Cards in the other columns are unchanged.
- **Demo**: demo tasks in "Do weryfikacji" have reviewers, one task has reviewer
  notes, and one task in "W trakcie" came back from review with notes.
- Older files need no conversion: a task file without `reviewer` or `reviewNote`
  reads as having none. Tasks already in "Do weryfikacji" without a reviewer stay
  there; they need one only when saved from the dialog.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tasks`: reviewer and reviewer notes (MODIFIED: Task fields, Move task by dragging,
  Task card, Task file, Tasks tab filters, Tasks tab card, Change state in the tasks
  tab; ADDED: Reviewer required in "Do weryfikacji", Reviewer asked for on the way to
  "Do weryfikacji")
- `demo`: demo data shows reviewers and reviewer notes (MODIFIED: Demo data)

## Impact

- Specs: `tasks`, `demo`
- Code: `src/tasks.ts` (fields, normalising, the filter's review column, the
  reviewer check), `src/board.tsx` (dialog fields and check, board drop, both
  circles on the card, opening the dialog with a preset state),
  `src/tasks-view.tsx` (tab drop, both circles, architect choices),
  `src/pl.ts` (labels, error, hover text), `src/style.css` (reviewer circle and its
  check mark), `src/demo.ts` (data)
- Tests: `src/tasks.test.ts`, `src/demo.test.ts`
- Docs: `AGENTS.md` (tasks line and domain table)
- No new dependency, no URL change

## Decisions

Settled with the engineer on 2026-11-22:

1. **Anyone reviews**: any architect, the task's assignee included.
2. **Reviewer kept** when the task leaves "Do weryfikacji", preselected on the next
   move to review.
3. **Reviewer notes**: one free-text field, kept across rounds; not required.
4. **Field always shown** in the dialog, required only in "Do weryfikacji".
5. **"nieprzypisane"** shows in "Do weryfikacji" the tasks without a reviewer.

Out of scope (card): notifications for the reviewer, several reviewers per task.

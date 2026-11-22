## Why

The studio wants to see what got done week by week. In the "Zadania" tab, "Wykonane" shows
the five most recently done tasks and hides the rest behind "pokaż starsze", so nothing
tells where one week ends and the next begins. "Do zrobienia" already groups by day; done
tasks should group by week the same way.

## What Changes

- "Wykonane" in the "Zadania" tab shows one group per week (Monday to Sunday) in which
  tasks were done, newest week first. Each group has a header with the week and its number
  of tasks, and groups alternate background bands like the day groups of "Do zrobienia".
- Headers: "ten tydzień", "w zeszłym tygodniu", and for any older week its Monday and
  Sunday, "02.11.2026 - 08.11.2026". Weeks with nothing done get no group. Inside a week,
  latest done first.
- Only this week and last week show at first. Older weeks hide behind "pokaż starsze (N)",
  N being the number of tasks in them.
- Each week shows its five latest tasks; the rest of that week hide behind
  "pokaż więcej (N)" at the bottom of its group.
- This replaces the "five most recent plus pokaż starsze" list.
- The task dialog gets a "data wykonania" field under "osoba" / "weryfikuje" / "stan",
  shown while the state is "Wykonane". It shows the day the task counts as done and can be
  changed, so a task dragged out of "Wykonane" and back (which stamps it with today) can
  be put back into its old week.
- "Do zrobienia", "W trakcie", "Do weryfikacji", the project boards, the filters, the
  building of the week and dragging stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tasks`: "Recently done tasks" is replaced by week groups in "Wykonane", with older
  weeks and long weeks folded; the completion time can be set in the task dialog

## Impact

- Specs: `tasks` (REMOVED: Recently done tasks; ADDED: Done tasks by week, Older weeks
  folded, Long weeks folded, Completion date in the task dialog; MODIFIED: Task file)
- Code: `src/tasks.ts` (grouping by week replaces `splitDone`; `stampDone` keeps a picked
  completion time), `src/board.tsx` (the "data wykonania" field), `src/tasks-view.tsx`
  (week groups and their buttons), `src/pl.ts` (labels), `src/style.css` (reuse the day
  group look), `src/demo.ts` (a task done today, so the demo always has "ten tydzień")
- Tests: `src/tasks.test.ts`
- Docs: `AGENTS.md` (the **tasks** line)
- No new dependency, no change to task files

## Decisions

Settled with the engineer on 2026-11-22:

1. **Only "Wykonane" in the "Zadania" tab.** The project boards keep the order users set
   by dragging.
2. **Always grouped**, no switch like "Pilne" / "Dni": done tasks have no urgency order
   worth keeping.
3. **Week headers**: "ten tydzień", "w zeszłym tygodniu", then dates "<od> - <do>".
4. **Two weeks open by default**, older weeks behind "pokaż starsze (N)"; **five tasks per
   week**, the rest behind "pokaż więcej (N)".
5. **Completion date editable** in the task dialog, under the people and state fields
   (added after the first review, 2026-11-22).

Assumptions (minor, recorded here):

- A task without a recorded completion time counts as done at its last change, as today.
- A completion time after the current week (another PC's clock running ahead) counts as
  this week, so no group shows above "ten tydzień".
- When this week and last week are both empty, the column shows only
  "pokaż starsze (N)".
- Opened "pokaż starsze" / "pokaż więcej" last while the tab is open, like
  "pokaż starsze" today.
- "data wykonania" is a day, not a time: a picked day is stored as noon that day (local),
  only days up to today can be picked, and the field can't be left empty while shown. It
  shows in the dialog on the project page too, as both use one dialog.
- Out of scope: week groups on the project boards, week numbers in headers, remembering
  which groups were opened, showing the completion date on the cards.

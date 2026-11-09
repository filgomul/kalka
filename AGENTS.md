# Kalka

Planner for an architectural studio: one record per building project with its milestones
(permit dates and the like), lead architect and the scope handed to branch engineers. It
replaces an Excel sheet. Used by the studio owner and a few employees. Polish UI.

## How it fits together

- **storage**: opens the data folder on the shared OneDrive (synced to every PC by the
  OneDrive client) through the File System Access API. One JSON file per project in
  `projekty/`, one per task in `zadania/`, one per leave in `urlopy/`, one per meeting in
  `spotkania/`, settings in `kalka.json`. No server, no
  accounts: whoever has the OneDrive folder has the data.
- **settings**: `kalka.json` lists the architects, each a name or
  `{ "name", "initials", "color" }` (hex); initials and colour fill the task card and
  meeting circles; the colour also marks the architect's leaves and meetings.
- **projects**: list (on `#/projekty`), filter (lead architect, status, type), search,
  sort by any column, create/edit form. The form has a folded "Dane projektu" section
  (investor, contact, plot, office contacts) that holds real people's data, so it lives
  only in the project files. The calendar is the start view and the first tab.
- **tasks**: a board on a saved project's page ("Do zrobienia", "W trakcie",
  "Wykonane"), cards dragged between and within columns. Each task change is written at
  once to its own file, apart from the project form's "Zapisz" / "Anuluj". The "Zadania"
  tab shows all tasks in the same columns, filtered by assignee (or "nieprzypisane"),
  project status and having a project, ordered by due date, with a "wykonane" checkbox,
  the five most recently done tasks and the week's tenement on the right. It also adds
  tasks; a task may have no project (then it shows only in that tab).
- **calendar**: month grid of milestones across all projects with the same filters, plus
  the "Terminy" list of upcoming and recently passed milestones. Meetings show as chips
  before the milestones of their day and among them in the overview, narrowed by the
  architect and project filters. Leaves show as bars in the month grid and at the top of
  overview blocks, for every architect whatever the filters; "Pokaż" is a multi-select of
  milestones, meetings and leaves.
- **meetings**: a meeting belongs to a project or to none. A saved project's page has a
  "Spotkania" section (cards or list) after "Zadania"; the "Spotkania" tab lists every
  meeting, filtered by architect and by having a project. Clicking a meeting anywhere,
  the calendar included, opens one dialog. Each meeting change is written at once to its
  own file.
- **leaves**: the "Urlopy" tab lists architects' leaves (current and upcoming, then past)
  and adds, edits and deletes them; clicking a leave in the calendar opens the same
  dialog. Each leave change is written at once to its own file.
- A project's milestones are an ordered list (`timeline`) seeded from a template
  ("projekt budowlany", "projekt wnętrz", "inny") when the project is created; the
  project keeps the template's id as its type, which can be changed later without
  touching the milestones. Each milestone has a style (name, short label,
  colour) from the built-in list in `src/model.ts`, and can be added, edited (only
  added ones), deleted and reordered per project. Each has day (`YYYY-MM-DD`) or month
  (`YYYY-MM`) precision, is planned or confirmed, and separately done or not. The
  calendar shows only milestones that have a date. Older project files (seven fixed
  milestones) are converted when read. Milestone changes of a saved project are written
  to its file at once (only the milestones), apart from the project form's "Zapisz" /
  "Anuluj", like tasks.
- A save never overwrites a project file that someone else changed after it was read.

Each area has a living spec in `openspec/specs/<area>/spec.md` once a change has touched it.

## Domain terms

| Polish (UI) | Key | Meaning |
| --- | --- | --- |
| l.p. | `lp` | Running number carried over from the old sheet |
| arch. prowadzący | `leadArchitect` | Architect responsible for the project; picked from `architects` in `kalka.json` |
| data rozpoczęcia | `rozpoczecie` | Project start |
| wydanie koncepcji | `koncepcja` | Concept design handed to the client |
| akceptacja koncepcji | `akceptacja` | Client accepted the concept design |
| PB do urzędu | `pbDoUrzedu` | Building-permit design (projekt budowlany) filed with the office |
| uzupełnienie do urzędu | `uzupelnienie` | Supplement requested by the office filed |
| uzyskanie pozwolenia | `pozwolenie` | Building permit granted |
| termin branżystów | `branzysci` | Estimated completion of branch (engineering) designs |
| wydanie projektu | `wydanieProjektu` | Final design handed over (both templates) |
| układy funkcjonalne / akceptacja układów | `uklady` / `akceptacjaUkladow` | Interior layouts handed to the client / accepted |
| pierwsze wizualizacje / akceptacja wizualizacji | `wizualizacje` / `akceptacjaWizualizacji` | First interior visualisations / accepted |
| nadzór autorski | `nadzor` | Author's supervision, a site visit |
| inny | `inny` | Style for any other milestone (black) |
| szablon | template | Ordered list of styles a new project starts with |
| typ projektu | `type` | `budowlany` / `wnetrza` / `inny`, the template ids; a file without it reads as `inny` |
| styl terminu | style | Name, short label and colour of a milestone; the keys above are style ids |
| terminy | `timeline` | A project's milestones in order, each `{ id, style, title?, date?, done?, confirmed? }` |
| branża konstrukcyjna / sanitarna / elektryczna / drogowa | `konstrukcja` / `sanitarna` / `elektryczna` / `drogowa` | Scope text for that engineering branch; empty means "brak" (none) |
| rzeczoznawca ppoż. / BHP i Sanepid | `ppoz` / `bhpSanepid` | Fire-protection and OHS/sanitary expert involvement |
| inwestor / telefon / e-mail | `investor` / `investorPhone` / `investorEmail` | Client and their contact, free text |
| identyfikator działki | `plot` | Land-registry plot id(s), free text |
| kontakt do urzędu | `officeContact` | Free-text notes on people at the office (permit officer, conservator) |
| status | `aktywny` / `wstrzymany` / `zakończony` | Active, on hold, finished |
| planowane / potwierdzone | `confirmed` | Milestone date is a guess until marked confirmed |
| zrealizowane | `done` | Milestone reached |
| zadanie | task | A job inside a project, file `zadania/<id>.json` with `projectId` (empty without a project); `doneAt` is when it last became done; `urgent: true` marks it "pilne" |
| osoba | `assignee` | Architect doing a task; any architect, not only the lead one |
| do zrobienia / w trakcie / wykonane | `todo` / `doing` / `done` | Task state, one board column each |
| urlop | leave | An architect's absence, file `urlopy/<id>.json` with `{ id, architect, from, to }` (whole days, both included) |
| spotkanie | meeting | File `spotkania/<id>.json` with `{ id, title, date, start?, end?, architect, projectId?, type, note }`; times `HH:MM` |
| stacjonarne / online | `type` | Meeting in person ("@" mark for online, building icon for stacjonarne) |
| pokaż | `k` | Calendar multi-select of "Terminy", "Spotkania", "Urlopy", all by default; `k` lists the chosen ones, `nic` none |

## Stack and limits

- TypeScript, Vite, Preact. App code in `src/`. No other
  runtime dependency without a stated reason; no router, date, calendar or CSS libraries.
- Tests: `node --test` on `*.test.ts` (Node 24 runs TypeScript directly; keep to
  erasable syntax, no enums). Pure logic lives in plain modules so it is testable
  without a browser.
- Runs only in Chrome and Edge (File System Access API) and only when served over
  HTTPS or localhost; browsers reject the API on `file://` pages.
- Hosted on GitHub Pages from a public repo, so the repo must never contain project
  data (addresses, client or contractor names). `*.csv` and `*.xlsx` are gitignored.
- Small production tool, built lean. Out of scope for now: auth, backend, analytics,
  offline mode, merging concurrent edits.
- Writing: UI strings in Polish, kept in `src/pl.ts`; milestone style and template
  names live in `src/model.ts` as default data. Plain dash instead of em dash in
  every file. No Co-Authored-By lines in commits.

## How to work here

Write specs and tasks by the rules in `openspec/config.yaml`.
The OpenSpec CLI and its `/opsx:*` commands are optional; setup is in `CLAUDE.md`.

1. Read the spec of every area you touch.
2. A behaviour change starts as a change folder, never as code:
   `openspec/changes/<change-id>/` with `proposal.md`, `tasks.md` and delta
   specs under `specs/<area>/spec.md` (`## ADDED / MODIFIED / REMOVED Requirements`).
   Don't edit `openspec/specs/` directly. Stop after the proposal so the
   engineer can review it.
3. Once the engineer approves, work through `tasks.md` in order and tick each
   task off. Spec, code and tests change together, in one branch and one PR.
4. Run the tests, then report what changed and how to verify it.
5. Archive as the last commit of the change's PR (`docs: archive <change-id>`),
   once the engineer has confirmed the behaviour in the running app: fold the
   deltas into `openspec/specs/` and move the folder to
   `openspec/changes/archive/YYYY-MM-DD-<change-id>/`. Merge the PR with a merge
   commit or rebase, not squash, so the change and archive commits stay apart.
   Merging to `main` deploys, so `openspec/specs/` on `main` describes what is live.

No change folder needed for:

- changes without visible behaviour (refactor, styling, typo);
- bugs where the code doesn't do what the spec says: fix the code and add a test.

## Commands

```bash
pnpm install --ignore-scripts
pnpm dev
pnpm test
pnpm build
```

# Kalka

Planner for an architectural studio: one record per building project with its milestones
(permit dates and the like), lead architect and the scope handed to branch engineers. It
replaces an Excel sheet. Used by the studio owner and a few employees. Polish UI.

## How it fits together

- **storage**: opens the data folder on the shared OneDrive (synced to every PC by the
  OneDrive client) through the File System Access API. One JSON file per project in
  `projekty/`, settings in `kalka.json`. No server, no accounts: whoever has the OneDrive
  folder has the data.
- **projects**: list, filter (lead architect, status), search, create/edit form.
- **calendar**: month grid of milestones across all projects with the same filters, plus
  the "Terminy" list of upcoming and recently passed milestones.
- A project has seven optional milestones, each with day (`YYYY-MM-DD`) or month
  (`YYYY-MM`) precision. The calendar shows only milestones that have a date.
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
| branża konstrukcyjna / sanitarna / elektryczna / drogowa | `konstrukcja` / `sanitarna` / `elektryczna` / `drogowa` | Scope text for that engineering branch; empty means "brak" (none) |
| rzeczoznawca ppoż. / BHP i Sanepid | `ppoz` / `bhpSanepid` | Fire-protection and OHS/sanitary expert involvement |
| status | `aktywny` / `wstrzymany` / `zakończony` | Active, on hold, finished |

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
- Writing: UI strings in Polish, kept in `src/pl.ts`. Plain dash instead of em dash in
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

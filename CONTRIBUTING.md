# Contributing

Kalka is a small tool for one studio, so changes are kept lean. Issues are disabled;
open a pull request or contact the maintainer.

## Setup

See "Prerequisites" and "Install and start" in the [README](README.md). Use
`pnpm install --ignore-scripts` (also set in `.npmrc`). Add packages only with a stated
reason: `pnpm add <pkg> --ignore-scripts`.

## Rules

- **No project data in the repo.** No addresses, client or contractor names, and no
  `.csv` / `.xlsx` of the studio's sheet. Examples, tests and demo data use made-up
  names. See [SECURITY.md](SECURITY.md).
- UI strings are Polish and live in `src/pl.ts`.
- Plain dash instead of em dash in every file.
- TypeScript, erasable syntax only (no enums): tests run on Node directly.
- Pure logic goes in plain modules with a `*.test.ts` next to them.

## Workflow

The app's behaviour is described by specs in `openspec/specs/<area>/spec.md`. Details
are in [AGENTS.md](AGENTS.md); in short:

1. Read the spec of every area you touch.
2. A behaviour change starts as a change folder, not as code:
   `openspec/changes/<change-id>/` with `proposal.md`, `tasks.md` and delta specs.
   Wait for review of the proposal.
3. Once approved, implement `tasks.md` in order. Spec, code and tests change in one
   branch and one PR.
4. Run `pnpm test` and `pnpm build`; check the change in `pnpm dev`
   (`http://localhost:5173/kalka/?demo` needs no data folder).
5. Archive the change as the last commit of the PR (`docs: archive <change-id>`).
   Merge with a merge commit or rebase, not squash.

Refactors, styling, typos and bugs where the code does not match the spec need no
change folder: fix the code and add a test.

Commits: clear, conventional messages (`feat:`, `fix:`, `docs:` ...).

The OpenSpec CLI and its `/opsx:*` commands are optional; setup is in `CLAUDE.md`.
Merging to `main` deploys to GitHub Pages.

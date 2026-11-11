# Tasks

## 1. In-memory folder

- [x] 1.1 `src/demo.ts`: move the in-memory handle (`Tree`, `notFound`, file and directory handles) out of `src/storage.test.ts` as an exported function taking a Map tree and a root `name`; no DOM or `window` at import, so `node --test` loads it. `src/storage.test.ts` imports it and keeps its tests unchanged. Verify: `pnpm test` green with the same storage test count as before

## 2. Demo data

- [x] 2.1 `src/demo.ts`: `demoFolder(today)` returns the handle (root name "Wersja demo") over a tree with `kalka.json` (4 architects, 3 with initials and colour, 1 plain name) and `projekty/`, `zadania/`, `urlopy/`, `spotkania/` built from typed `Project`, `Task`, `Leave` and `Meeting` objects as in the "Demo data" requirement. Dates are day and month offsets from `today` within -365 and +730 days; fixed ids (`demo-p1`, ...); `updatedAt` set; no `Math.random` or `newId`. Made-up names, places, phones and `@example.com` e-mails only. Verify: `pnpm build` type-checks
- [x] 2.2 `src/demo.test.ts`: read `demoFolder('2026-11-11')` with `openFolder` and `readProjects`. Tests: "demo: Architects" (4, 3 with badges); "demo: Projects" (8; every type and status; day and month dates, planned, confirmed, done, overdue, titled added milestone, undated milestone; no `broken`, no `duplicate`); "demo: Tasks" (all three statuses, urgent, overdue, due today, no due date, no assignee, no project, more than 5 done); "demo: Leaves and meetings" (past, current, upcoming, two overlapping; online and stacjonarne, with and without project, with and without times, one in the current month); "demo: Opened on 2026-11-11" (every date in 2025-11-11..2028-11-10); "demo: Opened a year later" (`demoFolder('2027-11-11')` gives the same ids with every day date 365 days later); "demo: Edit in the demo" (a `saveProject` on one demo folder leaves a second `demoFolder` call unchanged). Verify: `pnpm test` green

## 3. Opening the demo

- [x] 3.1 `src/main.tsx`: read `demo` from `location.search` once. In the demo, skip the remembered-folder effect and the `isSupported` gate, and load `(await import('./demo.ts')).demoFolder(todayIso())` through the existing `load`; show the loading text until then, and the error text if it fails. Start screen without a remembered folder and unsupported screen: a "Wersja demo" link to `?demo`. `src/pl.ts`: the new texts in one block. Verify: `pnpm build` passes and its output lists a separate demo chunk; `pnpm dev` with `?demo` shows the demo calendar, and without it the app starts as before
- [x] 3.2 `src/main.tsx`: in the demo, the banner from "Demo banner" under the header on every view (before the broken-files notice), with "Wyjdź z wersji demo" linking to the path without query or hash, and the Chrome and Edge line when `!isSupported()`. `src/style.css`: banner styling distinct from the error notice. Verify: in the dev server the banner shows on all six tabs and a project page; the exit link opens the normal start
- [x] 3.3 `AGENTS.md`: a **demo** line under "How it fits together" (`?demo`, in-memory, nothing kept, data in `src/demo.ts` built from today, new features add demo data there); "Runs only in Chrome and Edge" notes the demo exception; the commands block or "How to work here" mentions `?demo` for quick checks. Verify: `git diff AGENTS.md` shows only those lines

## 4. Verify

- [x] 4.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [x] 4.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge). Real folder: a scratch data folder outside the repo, made-up data only, picked before and opened again after the demo with none of the demo's projects. In `?demo` and `?demo#/zadania?a=...`: every tab, Harmonogram, Terminy past and upcoming; add, edit, delete, drag a task, change a meeting and a leave; reload brings the data back; the exit link; the start-screen link. In Firefox (or another browser without the folder API): `?demo` opens with the Chrome and Edge line, and the plain address shows the unsupported message with the demo link
- [x] 4.3 Before the archive commit: rebase on `main` and check the MODIFIED requirements still match `openspec/specs/storage/spec.md` (no other change touched "Choose data folder" or "Unsupported browser")

# Tasks

## 1. Project data fields

- [x] 1.1 `src/model.ts`: `investor`, `investorPhone`, `investorEmail`, `plot`, `officeContact` (strings) on `Project`, empty in `emptyProject`, so `normalize` fills them for older files. `src/model.test.ts`: "projects: File without project data" (normalize of a file without the keys gives five empty strings), "projects: Fill and save" (`prepareForSave` keeps the five values as set), "projects: Any text accepted" (values like "600 100 200, 601 200 300" and "biuro@" kept as typed), "projects: Not searched" (`filterProjects` with `q: 'Nowak'` leaves out a project whose only match is the investor). Made-up values only. Verify: `pnpm test` green

## 2. "Dane projektu" section

- [x] 2.1 `src/pl.ts`: `projectData`, `investor`, `investorPhone`, `investorEmail`, `plot`, `officeContact` labels in one block. `src/form.tsx`: a `<details class="card">` section (no `open`) between the "Projekt" section and `<Timeline>`, its `<summary>` holding the `h2` "Dane projektu" plus " - <investor>" when `investor.trim()` is not empty; four one-line inputs and a `textarea rows={4}` set through `set`. Keep the `pl.ts` and `form.tsx` edits as separate small hunks. `src/style.css`: summary shows it can be clicked and the `h2` sits inline. Verify: `pnpm build` type-checks; in the dev server the section is folded on open and unfolds on click
- [x] 2.2 `AGENTS.md`: the **projects** line mentions the project data section; domain term rows for `investor`, `investorPhone`, `investorEmail`, `plot`, `officeContact`. Verify: `git diff AGENTS.md` shows only those lines

## 3. Verify

- [x] 3.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [x] 3.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, a scratch data folder outside the repo, made-up data only): open an older project file without the keys (fields empty, file unchanged until a write), fill all five fields and "Zapisz", reopen (folded, heading "Dane projektu - Jan Nowak", values kept), change the investor then "Anuluj" (file keeps the old one), search "Nowak" in the list (not found), open "Nowy projekt" (section folded between "Projekt" and "Terminy")
- [x] 3.3 Before the archive commit: rebase on `main` and check the ADDED requirements still fit `openspec/specs/projects/spec.md` (no requirement of the same name, "Edit project" untouched)

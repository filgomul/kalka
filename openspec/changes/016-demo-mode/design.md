## Context

All data access goes through one `FileSystemDirectoryHandle` (`src/storage.ts`), held as
`data.dir` in `src/main.tsx` and passed to every save and reload. `src/storage.test.ts`
already has an in-memory stand-in for that handle (nested Maps, files as strings)
covering every method storage calls: `getDirectoryHandle` / `getFileHandle` with
`create` and `NotFoundError`, `entries()`, `removeEntry`, `getFile`, `createWritable`.

`App` in `src/main.tsx` stops at `isSupported()` (line 90) and otherwise reads the
remembered handle from IndexedDB, opening it straight away when access is kept
(lines 79-88). The header shows `data.dir.name` (line 231).

## Goals / Non-Goals

**Goals:**

- The demo goes through the same `openFolder` / `readProjects` / `save*` code as a real
  folder, so it shows real behaviour (normalising, conflict check, reloads).
- No storage abstraction or second code path in the views.
- The normal version neither runs nor downloads the demo code.

**Non-Goals:**

- Keeping demo changes across reloads.
- Old-format project files or broken files in the demo data.
- A mobile layout; the demo opens on phones, but no layout work is done for them.

## Decisions

1. **In-memory handle, moved into `src/demo.ts`.** The test stand-in moves from
   `storage.test.ts` to `demo.ts` as an exported function building a handle from a
   Map tree, given a root `name` (so the header shows "Wersja demo" with no change
   there). `storage.test.ts` imports it, so tests and demo share one fake and a
   storage test that passes also covers the demo.
   - *Alternative: OPFS* (`navigator.storage.getDirectory()`), a real handle. It keeps
     edits across reloads, which is not wanted, so it needs wipe-and-reseed code. The
     tests still need the fake. More code for no gain.
   - *Alternative: a storage interface with folder and memory implementations.* Two
     implementations of something the handle already abstracts.

2. **Data from a pure, typed builder.** `demoFolder(today)` builds the tree from typed
   `Project`, `Task`, `Leave` and `Meeting` objects plus the raw `kalka.json`,
   serialised as the app writes them. All dates are `today` plus fixed day or month
   offsets (-365 to +730 days), all ids fixed (`demo-p1`, `demo-t1`, ...), `updatedAt`
   set, no `Math.random` or `newId`. The same `today` always gives the same files.
   `tsc` flags any field the model gains or renames.
   - *Alternative: static JSON fixtures in the repo.* They go stale (everything
     overdue within weeks), and untyped JSON misses model changes.

3. **Read through the real path.** The demo calls the same `load(dir)` as a picked
   folder, so `openFolder`, `normalize`, `parseLeave` and the rest run on the demo
   files. A `demo.test.ts` reads `demoFolder(today)` with `readProjects` and checks
   counts, no `broken`, no `duplicate` and the date window. That test fails when a
   model change breaks the demo.

4. **`?demo` read once, in `main.tsx`.** `const demo = new URLSearchParams(location.search).has('demo')`.
   With it, `App` skips the IndexedDB effect and the `isSupported` gate, and loads
   `(await import('./demo.ts')).demoFolder(todayIso())`. The dynamic import gives Vite
   a separate chunk, fetched only in the demo. Hash routing never touches
   `location.search`, so `?demo` survives every route change. The start screen and
   unsupported screen link to `?demo` (a relative href: same path, no hash). "Wyjdź z
   wersji demo" links to `location.pathname`. Both are full page loads, so no state
   from one version carries into the other.
   - *Alternative: a hash flag (`#/kalendarz?demo`).* Every route builder would have to
     carry it.

5. **Banner next to the broken-files notice** in `App`'s layout, so it shows on every
   tab and the project page with one element. The extra Chrome/Edge line shows when
   `!isSupported()`.

## Risks / Trade-offs

- [The fake drifts from the real API, for example a method the app starts using] →
  The fake backs the storage tests too, so any storage change that uses a new method
  breaks those tests first.
- [A visitor thinks demo edits are saved] → The banner shows on every tab and says
  changes go on reload.
- [Made-up data looks like a real client in a public repo] → Invented names,
  places, phones (`600 000 xxx`) and `@example.com` e-mails only. Reviewed in the PR.
- [The demo looks broken on a phone] → Accepted; the app was never laid out for
  phones. The banner says the real version needs Chrome or Edge.
- [The demo chunk ends up in the main bundle after a refactor, for example a static
  import] → The `pnpm build` output lists a separate `demo-*.js` chunk; checked in the
  verify task.
- [Adding a project in the demo calls `crypto.randomUUID`, which needs HTTPS or
  localhost] → Pages and the dev server qualify.

## Migration Plan

None: no data format change. Rollback is reverting the PR; `?demo` links then open
the normal version.

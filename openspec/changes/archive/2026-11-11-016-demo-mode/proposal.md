## Why

Kalka shows nothing until someone picks the studio's OneDrive folder, so it cannot be
shown to anyone without real data, tried in a browser that lacks the folder API, or
checked by the engineer and the coding agent without setting up a scratch folder
(Trello card "Zmockowane dane / strona demo"). A demo version with made-up, varied data
covers all three.

## What Changes

- A demo version opens from `?demo` in the address (for example
  `https://<pages>/kalka/?demo#/kalendarz`) or from a "Wersja demo" link on the start
  screen and on the unsupported-browser screen.
- The demo fills the app with made-up data: 4 architects (one without initials and
  colour), 8 projects of all three types and statuses with varied milestones, tasks in
  every column (urgent, overdue, without a project, recently done), leaves (past,
  current, upcoming) and meetings (online and in person, with and without a project).
  Dates are placed relative to today, from about a year back to two years ahead, so
  the demo never goes stale.
- Everything works as with a real folder: editing, adding, deleting, dragging tasks.
  Changes live only in the open page; a reload, or opening the demo again, starts
  from the same fresh data.
- The demo never reads, opens or replaces the remembered data folder, and opens
  even when one is remembered.
- A banner under the header on every tab says it is the demo and changes are not
  saved, with a link back to the normal version; the header shows "Wersja demo"
  where the folder name goes.
- The demo also opens in browsers without the folder API (Firefox, Safari, phones);
  there the banner adds that the real version needs Chrome or Edge.
- The normal version does not load the demo code or data.

## Capabilities

### New Capabilities

- `demo`: the demo version: how it opens and exits, the made-up data it shows, that
  changes are not kept, the banner, and that it leaves the real folder alone.

### Modified Capabilities

- `storage`: the unsupported-browser screen gets a "Wersja demo" link (MODIFIED:
  Unsupported browser); the start screen without a remembered folder gets one too
  (MODIFIED: Choose data folder).

## Impact

- Specs: `demo` (new), `storage`
- Code: new `src/demo.ts` (the in-memory folder, moved from `src/storage.test.ts`, and
  the made-up data built from today), `src/main.tsx` (`?demo`, the banner, the links,
  the unsupported gate moved after the demo check), `src/pl.ts` (texts),
  `src/style.css` (banner)
- Tests: `src/storage.test.ts` imports the in-memory folder from `src/demo.ts`; new
  `src/demo.test.ts`
- Docs: `AGENTS.md` (a **demo** line under "How it fits together"; "Runs only in Chrome
  and Edge" notes the demo exception); the "verify in the running dev environment"
  task may use `?demo` instead of a scratch folder from now on
- URL: `?demo` before the hash; hash routes unchanged
- No change to the data folder format, no new dependency
- All demo names, addresses and contacts are made up; the repo is public.

## Decisions

Settled with the engineer on 2026-11-11:

1. **In-memory folder, not the browser's private file system (OPFS)**: nothing
   persists, so no reset or stale state; the same fake already backs the storage
   tests.
2. **On Pages and on localhost**, so it can be shown to others and used for checks.
3. **Entry by `?demo` and by a link** on the start and unsupported screens; `?demo`
   works when a folder is remembered.
4. **Other browsers get the demo**, with a banner line that the real version needs
   Chrome or Edge.
5. **8 projects, 4 architects**, data showing every feature; dates about one year back
   to two years ahead of today.
6. **Not kept**: a reload gives fresh data.

## Open questions

Defaults written into the spec; say if any should differ:

1. **Banner text**: "Wersja demo - zmyślone dane, zmiany nie są zapisywane i znikną po
   odświeżeniu strony." plus "Wyjdź z wersji demo"; in other browsers also "Pełna
   wersja działa w Google Chrome i Microsoft Edge, bo zapisuje dane w folderze na
   dysku."
2. **No broken or duplicate files** in the demo data: the "konflikt synchronizacji"
   badge and the broken-file notice would look like bugs to a visitor.
3. **Leaving the demo** goes to the normal start, which opens the remembered folder
   as usual.

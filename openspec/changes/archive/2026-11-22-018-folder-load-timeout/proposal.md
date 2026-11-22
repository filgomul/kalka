# Proposal

## Why

On a computer where the OneDrive folder is paused, offline or holds cloud-only files,
reading the remembered Kalka folder at startup never returns, so the page stays on
"Wczytywanie…" with nothing to click (Trello card "Kalka wisi na Wczytywanie przy
zapamiętanym folderze"). A private window works only because it has no remembered
folder. The browser cannot tell that OneDrive is stuck, so the app has to stop waiting
on its own.

## What Changes

- **Limit**: reading the remembered folder gets a 5 s limit, kept in one constant so
  it is easy to change. It applies at startup (when the browser kept access) and after
  the "Otwórz folder Kalka" click (when it did not); there it starts once the browser's
  permission prompt is answered, so time spent on the prompt does not count.
- **After the limit**: the start screen shows a Polish message (the folder does not
  answer, check that OneDrive runs and syncs) and the "Wybierz folder Kalka" button,
  the same screen as when the remembered folder cannot be opened. Picking a folder
  replaces the remembered one, which is the reset; no data is touched.
- **Late answer**: the read that timed out is not cancelled (the browser offers no
  way to). If it still finishes before the user clicks "Wybierz folder Kalka", the
  app opens normally with that data. After the click, its result is ignored.
- Saves, refreshes ("Odśwież", reads after a change) and reading a folder just picked
  with "Wybierz folder Kalka" are unchanged: no limit.

## Out of scope

- Detecting OneDrive's state (paused, offline): the browser cannot see it.
- Retrying the read in the background.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `storage`: a remembered folder that does not answer (ADDED: Remembered folder does
  not answer)

## Impact

- Specs: `storage`
- Code: `src/storage.ts` (limit constant and a timeout helper), `src/main.tsx`
  (startup and "Otwórz folder Kalka" reads under the limit, late result kept until
  the user picks a folder),
  `src/pl.ts` (message)
- Tests: `src/storage.test.ts`
- Docs: `AGENTS.md` (the **storage** line)
- No new dependency, no file format or URL change

## Decisions

Settled with the engineer on 2026-11-22:

1. **5 s** limit, not the card's "ok. 10 s", in one constant.
2. **"Wybierz folder Kalka"** after the limit, not "Otwórz folder Kalka": reopening
   would read the same stuck folder again.
3. **Late data is shown** if the stuck read finishes before the user clicks.
4. **"Otwórz folder Kalka" gets the same limit and fallback**: without it, a browser
   that did not keep access leaves the button disabled forever on a stuck OneDrive.
   This goes beyond the card's "only the startup read".

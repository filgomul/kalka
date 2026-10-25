@AGENTS.md

- Install with `pnpm install --ignore-scripts` (also set in `.npmrc`); add packages with `pnpm add <pkg> --ignore-scripts`.
- The studio's CSV/XLSX sheet contains personal data. Read it only from outside the repo (path passed as an argument), never copy it in, and never paste its rows into specs, tests or commits. Use made-up names and addresses in examples.

## OpenSpec toolkit (per clone)

The `/opsx:*` slash commands and the `openspec-*` skills live in `.claude/`, which is
gitignored, so every clone generates them once:

```bash
pnpm add -g @fission-ai/openspec --ignore-scripts
openspec init --tools claude --no-animation
openspec validate --all --strict
```

- `openspec init` writes only `.claude/commands/opsx/` and `.claude/skills/openspec-*/`;
  it leaves `AGENTS.md` and `openspec/config.yaml` alone. Check `git diff` afterwards
  anyway and restore anything it touched.
- After upgrading the CLI run `openspec update` in the repo to refresh the generated files.
- Daily loop: `/opsx:propose` (change folder, no code), `/opsx:apply <change-id>`
  (work through `tasks.md`), `/opsx:archive <change-id>` (fold deltas into
  `openspec/specs/`, only when asked). `/opsx:explore`, `/opsx:update` and `/opsx:sync`
  are there too. `openspec list` and `openspec status --change <change-id>` show progress.
- `design.md` in a change folder is optional; `/opsx:apply` runs without it.
- Other agents: `openspec init --tools <id>` (`openspec init --help` lists the ids).
- The `openspec-migrate` skill used to set this repo up comes from Hypa
  (https://hypa.hypersolid.com/docs/cli), not from the OpenSpec CLI; it is only needed
  to onboard a repo, not for daily work.


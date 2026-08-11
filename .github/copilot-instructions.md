@AGENTS.md

Shared project rules live in `AGENTS.md` (repo root, imported above) so this
file doesn't drift from what Claude Code and other tools read. Copilot-only
mechanics on top of it:

| Location | Purpose |
|---|---|
| `.github/instructions/*.instructions.md` | Path-scoped rules — see `AGENTS.md`'s "Start Here" for which file matches which area |
| `.github/prompts/*.prompt.md` | Reusable prompt templates |
| `.agents/skills/` | Repository skills |

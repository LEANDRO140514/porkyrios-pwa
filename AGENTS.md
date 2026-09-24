<!-- slashstack:kernel:start -->
# SlashStack Agent Kernel

This repository uses SlashStack as its local agent operating layer.

## Operating Rules

- Read `.agents/memory/project.md` before substantial changes.
- Recall subsystem references from `.agents/references` when relevant.
- Preserve user changes and keep edits scoped.
- Use goal-driven execution for multi-step work: define scope, acceptance, verification, and completion criteria in `.agents/memory/goal-registry.json`.
- Parallel goals are allowed only when their write scopes do not overlap.
- Run verification before claiming work is complete.
- Capture durable project knowledge with the remember workflow.

## Installed Workflows

- `vibe`: read project memory and references, then produce a scoped build direction with in-scope / out-of-scope items and a single next step.
- `preflight`: inspect git status, discover project constraints (tests, build, lint, conventions), and flag risks with severity before coding.
- `audit`: review changes against the original goal, detect bugs / missing edge cases / regressions, and approve or reject with concrete evidence.
- `remember`: save durable subsystem knowledge to `.agents/memory/project.md`, rejecting transient state, commit hashes, TODOs, and secrets.
- `recall`: load saved references, validate them against the current codebase, flag stale ones, and summarize subsystem context.
- `improve`: capture reusable self-improvement patterns into `.agents/memory/patterns.json` without overwriting existing learning.
- `ship`: run tests, review the diff, confirm the goal, and produce an evidence summary or a blocker list with severity.
- `execute`: turn multi-step tasks into goals with explicit scope, acceptance criteria, verification commands, and completion expectations.
- `explain`: translate technical agent output into beginner-friendly language while preserving exact file paths and commands.
- `next`: suggest safe next prompts when the user is unsure what to ask, without editing until the user chooses.
- `security`: run a beginner-friendly pre-deploy safety review for secrets, auth, public routes, and risky exposure.
- `factory`: turn an intention into a bounded order with frozen verification, run it through `slashstack factory`, and deliver a receipt tied to the exact repository state.
- `spawn`: decompose a task into 2-4 independent sub-goals with disjoint write scopes, dispatch them via the host tool's native parallelism, then gather and verify results.
- `cost`: scan the diff and dependencies for paid-service SDKs and produce a plain-language bill-risk table with estimated cost categories.
- `new`: create a custom user-owned slash command as a SKILL.md that survives update and uninstall.
- `forget`: list memory entries, confirm which to remove, remove them, and validate store integrity.
- `sync`: compare dependency versions against known latest, record deltas in project memory, and flag security advisories.
- `mobile`: inspect key viewport breakpoints, touch-target sizes, responsive images, and fixed-width elements, then report a pass/fail checklist.
- `health`: use the repo's already-authenticated cloud CLI to pull recent production errors and summarize them by frequency and severity.
- `senior`: guided seven-phase session with checkpoint, verification, and release verdict (READY, READY WITH WARNINGS, or BLOCKED).

## Always-On Guards

Before any git commit, git push, package install, or edit to a hands-off file, and before ending a session, read and apply the matching guard in `.agents/guards/`.

- `commit-guard`: scan the staged diff for secret patterns before any git commit.
- `push-guard`: scan commit history for secrets that escaped before any git push.
- `install-guard`: check new packages for typosquatting before any install.
- `fragile-guard`: warn before editing files listed under "## Hands-Off Files" in project memory.
- `env-guard`: compare `.env.local` keys against `.env.example` and flag drift.
- `memory-nudge`: prompt to run the remember workflow before ending a session.
<!-- slashstack:kernel:end -->

---
name: health
description: Use when production may have errors and the repo has an authenticated cloud CLI.
---

# health

## Purpose

Pull recent production errors through the repo's existing cloud CLI and summarize them.

## When to Use

Use when production may have errors and the repo has an authenticated cloud CLI.

## Workflow

1. Detect the cloud CLI the repo already has authenticated (vercel, supabase,
   fly, netlify, wrangler, railway, or similar) from config files and lockfiles.
2. Pull recent production errors: use that CLI's log or error commands to fetch
   recent production output. Do not add any code integration or new dependency.
3. Summarize by frequency and severity: group errors, count occurrences, and
   classify each group as High, Medium, or Low severity in plain language.
4. Flag regressions: compare against the previous health check recorded in
   `.agents/memory/project.md` and mark errors that are new or growing.
5. Record the summary in `.agents/memory/project.md` under a "## Health" section,
   preserving all other memory content.
6. Do not edit app code, restart services, or change configuration.

## Output

An error summary table containing:
- Error: the error group and where it occurs
- Count: occurrences in the checked window
- Severity: High / Medium / Low
- Regression: new, growing, stable, or resolved versus the previous check
- Suggested fix: one plain-language fix per error group

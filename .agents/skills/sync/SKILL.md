---
name: sync
description: Use when dependency versions may have drifted from the latest releases.
---

# sync

## Purpose

Track how project dependencies compare to their latest known versions.

## When to Use

Use when dependency versions may have drifted from the latest releases.

## Workflow

1. Read `package.json` and the lockfile (package-lock.json, yarn.lock, or
   pnpm-lock.yaml) to list installed dependency versions.
2. Compare each dependency against the known latest version (registry lookup or
   the tool's knowledge), noting the delta as patch, minor, or major.
3. Flag security advisories: check for known vulnerabilities in the installed
   versions (npm audit output or advisory knowledge) and mark affected packages.
4. Record deltas in `.agents/memory/project.md` under a "## Dependencies" section,
   preserving all other memory content.
5. Do not upgrade anything automatically; report and record only.

## Output

A dependency sync report containing:
- Deltas: each outdated dependency with installed vs latest version and delta size
- Security advisories: affected packages with severity, if any
- Memory update: confirmation the "## Dependencies" section in project.md was updated
- Safe next step: one suggested upgrade to consider first

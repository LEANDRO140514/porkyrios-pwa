---
name: forget
description: Use when saved memory entries are stale, wrong, or no longer wanted.
---

# forget

## Purpose

Remove stale or unwanted entries from project memory while keeping the stores valid.

## When to Use

Use when saved memory entries are stale, wrong, or no longer wanted.

## Workflow

1. List entries: read `.agents/memory/project.md` and `.agents/memory/patterns.json`
   and enumerate their entries with enough context to identify each one.
2. Confirm which to remove: present the candidates and wait for the user to choose.
   Never remove entries without explicit confirmation.
3. Remove the confirmed entries: delete the chosen sections from `project.md` and
   the chosen pattern objects from `patterns.json`, leaving all other entries intact.
4. Validate store integrity: confirm `patterns.json` still parses as valid JSON
   with `version: 1` and a `patterns` array, and `project.md` retains its
   remaining sections unchanged.
5. Report what was removed and what was preserved.

## Output

A forget summary containing:
- Removed: the entries deleted from each store
- Preserved: confirmation that all other entries are untouched
- Store integrity: validation result for `patterns.json` and `project.md`

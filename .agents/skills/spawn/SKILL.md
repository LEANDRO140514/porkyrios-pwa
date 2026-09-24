---
name: spawn
description: Use when a large task can be split into independent sub-goals that run in parallel.
---

# spawn

## Purpose

Decompose a large task into independent sub-goals with disjoint write scopes and
run them in parallel via the host tool's native parallelism.

## When to Use

Use when a large task can be split into independent sub-goals that run in parallel.

## Workflow

1. Decompose the task into 2-4 independent sub-goals. Each sub-goal must have a
   DISJOINT file-glob write scope: no two sub-goals may write to overlapping paths.
2. Register each sub-goal in `.agents/memory/goal-registry.json` with explicit
   scope, acceptance criteria, and verification commands.
3. Check for scope overlaps: if any two sub-goal scopes intersect, or a sub-goal
   overlaps an existing active goal, redraw the boundaries before dispatching.
4. Dispatch each sub-goal through the host tool's native parallelism (Claude Code
   Task subagents, Codex parallel sessions, or equivalent), passing each subagent
   its goal id, scope, acceptance criteria, and verification commands.
5. Gather results: collect each subagent's output and the files it changed.
6. Verify each goal: run its verification commands and confirm changed files stay
   within the declared scope.
7. Mark each verified goal `completed` in the registry with `updatedAt` and a
   brief evidence summary. Mark failed goals `abandoned` with a reason.

## Output

A spawn report containing:
- Sub-goals: each with goal id, write scope, and acceptance criteria
- Dispatch method: the host parallelism mechanism used
- Results: per-goal verification outcome (pass/fail) with evidence
- Registry state: each sub-goal marked completed or abandoned

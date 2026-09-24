---
name: senior
description: Use for a guided end-to-end session with checkpoint, verification, and release verdict.
---

# Senior

## Purpose

Guide a complete, recoverable, verified session from request to readiness verdict.

## When to Use

Use for a guided end-to-end session with checkpoint, verification, and release verdict.

## Workflow

This is a guided seven-phase session. Follow each phase in order:

### 1. Understand
Restate the requested outcome in plain language. List:
- In-scope work: specific files, features, or changes included
- Out-of-scope work: what is explicitly excluded
- Risks: potential issues or dependencies

### 2. Inspect
Run `preflight` to inspect project state, then load relevant memory from `.agents/memory/project.md`. Explain material risks in beginner-friendly language with Modo Aprendiz format (Qué significa, Por qué importa, Qué hacer ahora).

### 3. Checkpoint
Create a checkpoint before any edits:
- Run `slashstack checkpoint create --label "<brief description>"`
- If the repository is dirty or has untracked files, stop and offer explicit safe choices
- Do not stash, reset, or clean automatically

### 4. Plan
Create one scoped goal with:
- Acceptance criteria: one sentence describing "done"
- Verification commands: test, build, or lint commands that must pass
- Commit and push expectations: whether this goal requires commit/push

### 5. Execute
Perform the smallest implementation that satisfies acceptance criteria. Apply relevant guards (`commit-guard`, `push-guard`, `security`, `cost`, `mobile`, `audit`). Ask before:
- Scope changes beyond original request
- Installing dependencies
- Deploying to production
- Destructive Git operations
- Modifying paid-service configuration

### 6. Verify
Run all verification commands from the plan. Then run applicable Pro checks:
- `security`: check for secrets, auth issues, public route exposure
- `cost`: flag paid-service SDKs and bill-risk
- `mobile`: verify responsive readiness if UI changed
- `audit`: review for bugs, regressions, missing edge cases

### 7. Verdict
Report one of three verdicts with exact format:

```
Verdict: READY | READY WITH WARNINGS | BLOCKED
Checkpoint: <id>
Verification: <passed>/<total>
Blocking risks: <count>
Warnings: <count>
Next prompt: <one exact prompt>
```

Verdict rules:
- `BLOCKED`: any verification command fails OR any High security/cost risk remains
- `READY WITH WARNINGS`: all required verification passes AND only acknowledged Medium/Low risks remain
- `READY`: all required verification passes AND no unresolved material risk remains

Senior Mode does NOT deploy. It reports readiness and waits for a separate explicit deployment request.

## Safety Stops

- Stop and ask if scope changes beyond the original request
- Stop and ask before installing dependencies
- Stop and ask before deployment
- Stop and ask before destructive Git operations
- Stop and ask before modifying paid-service configuration

## Modo Aprendiz

Throughout the workflow, for each material risk or confusing concept, include:
- Qué significa: what it means in plain language
- Por qué importa: why it matters for the project
- Qué hacer ahora: one concrete action to take now

## Output

The final verdict message with exact format, including checkpoint id, verification summary, risk counts, and one exact next prompt.

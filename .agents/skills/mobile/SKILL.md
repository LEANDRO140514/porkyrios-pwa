---
name: mobile
description: Use before shipping UI changes to check mobile and responsive readiness.
---

# mobile

## Purpose

Check mobile and responsive readiness before UI changes ship.

## When to Use

Use before shipping UI changes to check mobile and responsive readiness.

## Workflow

1. Inspect key viewport breakpoints: review layout behavior at 320, 375, 768,
   and 1024 pixels wide using the project's CSS, media queries, and components.
2. Verify touch-target sizes: confirm interactive elements (buttons, links,
   inputs) render at least 44px in each dimension on touch viewports.
3. Check responsive images: confirm images use `srcset` (or equivalent
   responsive sizing) and lazy `loading` where appropriate.
4. Flag fixed-width elements: find hardcoded pixel widths, horizontal overflow,
   and elements that break below 375px.
5. Do not edit files; report findings only.

## Output

A numbered checklist containing:
- Breakpoints: pass/fail for each of 320, 375, 768, and 1024
- Touch targets: pass/fail with any elements under 44px
- Responsive images: pass/fail for srcset and loading usage
- Fixed-width elements: list of offenders with file paths
- Safe next prompt: one scoped prompt to fix the highest-impact failure first

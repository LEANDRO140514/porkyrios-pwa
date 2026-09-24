---
name: cost
description: Use when the codebase or a change may introduce paid services that create billing risk.
---

# cost

## Purpose

Flag paid services in the codebase and explain the billing risk in plain language.

## When to Use

Use when the codebase or a change may introduce paid services that create billing risk.

## Workflow

1. Scan the diff and dependencies (package.json, lockfile, imports, config) for
   SDKs and clients of paid services: stripe, openai, anthropic, twilio, sendgrid,
   AWS (aws-sdk, @aws-sdk/*), google cloud, azure, mongodb atlas, vercel, and similar.
2. Classify each finding by pricing model: per-call (charged per request or token),
   subscription (flat monthly fee), or usage-tiered (free tier with paid overage).
3. Estimate a cost category for each service in plain language: free tier likely
   sufficient, low (under ~$10/month), medium (~$10-100/month), or high (can scale
   unbounded with traffic).
4. Note bill-risk amplifiers: keys in client-side code, unbounded loops calling
   paid APIs, missing rate limits, or webhooks that trigger paid calls.
5. Modo Aprendiz: for EACH paid service flagged, include three sub-fields in
   beginner-friendly Spanish:
   - Qué significa: what the service charges for in plain language.
   - Por qué importa: why it matters for the bill.
   - Qué hacer ahora: one concrete action to take now.
6. Do not edit files or remove dependencies; report only.

## Output

A bill-risk table in plain language containing:
- Service: the paid service detected and where it was found
- Pricing model: per-call, subscription, or usage-tiered
- Estimated cost category: free tier / low / medium / high
- Risk notes: any amplifiers that could inflate the bill
- Modo Aprendiz: each service includes Qué significa, Por qué importa, and Qué hacer ahora
- Safe next step: one action to cap or confirm the highest risk

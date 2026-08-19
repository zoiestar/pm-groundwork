# Document engine

Everything that is true for **every** document, regardless of type. The per-type file supplies only the questions and the output sections.

Used by `pm-draft` directly, and by `pm-project-start` when it produces a track's document set.

---

## Filename convention

```
docs/<slug>-<descriptor>-<YYYY-MM-DD>.md
```

- `<slug>` comes from the type file
- `<descriptor>` is a short kebab-case hint about the subject — `user-onboarding`, `partner-portal`
- Project-wide documents that can only exist once drop the descriptor: `docs/project-charter-2026-08-19.md`

Examples:

```
docs/prd-user-onboarding-2026-08-19.md
docs/risk-management-plan-2026-08-19.md
docs/status-report-2026-08-19.md
```

## Metadata header

Every document opens with this, and nothing above it:

```yaml
---
title: [Document title]
type: [document type]
project: [project name]
author: [user's name from USER.md]
date: YYYY-MM-DD
status: draft
---
```

## Writing rules

1. **Never invent facts.** No made-up metrics, dates, names, budgets, or competitor claims. If a section needs information nobody supplied, write `[needs input: what specifically]` and list it in Open Questions. A document with three honest gaps is more useful than one with three plausible fabrications.
2. **Use the project's real vocabulary.** Pull terminology from CONTEXT.md and MEMORY.md. If the team says "partners," don't write "customers."
3. **Tables for anything with more than three parallel items.** Prose for reasoning and context. Don't put reasoning in a table or a list of items in a paragraph.
4. **Every table gets real rows.** An empty template with headers only is not a draft. Populate from workspace context, and mark what needs input.
5. **Match formality to audience**, from the audience answer:

   | Audience | Register |
   |---|---|
   | Leadership / executives | Outcome-first. Lead every section with the answer. Short. |
   | Project team | Detailed and actionable. Specifics over summary. |
   | Client / external | Polished and careful. No internal shorthand, no candid risk language that would land badly outside the org. |
   | Cross-functional partners | Plain, assumes no context from your team. Define your acronyms. |

6. **Respect the decision log.** Check DECISIONS.md before writing. A document that contradicts a logged decision is a real problem — if you find a conflict, stop and raise it rather than writing around it.
7. **Write in the user's voice, calibrated by tech level** — see `_shared/tone.md`. The concise rule governs your conversation with the user, not the document itself; documents are as long as their content requires.

## The slop gate

Before declaring any document finished, run the `no-ai-slop` skill in **detect mode** on the draft. It names each pattern with the quoted line and a short fix, without rewriting.

Then:

- Show the findings, grouped, with line references
- Offer to fix them
- The user decides what to change — findings are advisory, not a hard gate

Do not paraphrase or soften the findings, and do not skip the gate because a draft "reads fine." The whole point is that it reads fine to the thing that wrote it.

## Revisions

When updating an existing document rather than creating one:

- Read the current file first, in full
- Keep the original filename and date — do not create a second dated copy
- Update `status:` in the header if it changed (`draft` → `in review` → `approved`)
- Note what changed at the end under a `## Revision history` heading with the date
- Never silently rewrite a section the user didn't ask about

## After writing

1. Report the path, in one line.
2. If `PLAN.md` has a matching unchecked item in the current phase, tick it and append the path. Never create a phase or an item from here.
3. If the document locked in a decision, offer to log it per `_shared/decision-format.md`.

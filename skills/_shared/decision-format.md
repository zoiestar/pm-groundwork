# Decision log format

Used by `setup` (to create the file), `checkpoint` and `end-session` (to add entries), and `start-session` (to flag entries due for review).

## Location

- v3 / v2: `.claude/agent-memory/pm-lead/DECISIONS.md`
- v1 flat: `DECISIONS.md`

## When to create an entry

- Any choice that would be confusing or costly to reverse without the context behind it
- Any choice where stakeholders were consulted or had to align
- Any choice where alternatives were seriously considered

Do **not** log every tactical call. Only decisions with real stakes. A log nobody trusts because it's full of noise is worse than no log.

## How to create an entry

1. Assign the next sequential ID (`#001`, `#002`, …).
2. Fill in every field. Never leave **Alternatives** or **Confidence** blank — those are the two fields that make the entry worth having six months later.
3. Add a one-line row to the **Key decisions** table in `MEMORY.md` immediately.
4. If this reverses an earlier decision, mark the old entry `[superseded by #XXX]` — do not delete or edit its content — and add a `Reverses:` line to the new one explaining what changed.

## Review dates

At the start of each session, flag any Active entry whose review date has passed:

> Decision #XXX is due for review (review date: YYYY-MM-DD)

Never auto-update or clear a review date. Wait for the user.

## Confidence levels

- **High** — strong alignment, good data, unlikely to reverse
- **Medium** — reasonable, some unknowns remain, worth revisiting
- **Low** — made under uncertainty or time pressure, actively watch this one

## File template

````markdown
---
project: [PROJECT NAME]
last_updated: YYYY-MM-DD
---

# Decisions — [PROJECT NAME]

## Index

| # | Decision | Date | Owner | Status |
|---|----------|------|-------|--------|
| [#001] | | YYYY-MM-DD | | Active |

---

## Entries

<!-- Add new entries directly below this line. Newest at top. -->

### #001 — [Short decision title]

**Date:** YYYY-MM-DD
**Owner:** [Who owns this decision]
**Deciders:** [Who aligned on it]
**Status:** Active

**Decision:**
[One clear sentence stating what was decided.]

**Context:**
[Two to four sentences. What situation forced this decision?]

**Rationale:**
[Why this option over the others.]

**Alternatives considered:**

| Option | Why rejected |
|--------|-------------|
| [Alt 1] | |
| [Alt 2] | |

**Confidence:** High / Medium / Low
[One sentence explaining why.]

**Implications:**
[What this constrains, affects, or enables.]

**Supporting docs:** [Link or "None"]

**Review date:** YYYY-MM-DD
````

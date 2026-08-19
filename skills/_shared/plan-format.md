# PLAN.md — the delivery tracker

One file at the project root. Committed to git, so a PM can open it on GitHub and read it without any tooling.

## Format

```markdown
---
project: Acme Partner Portal
track: c
current_phase: 2
updated: 2026-08-19
---

# Delivery plan — Acme Partner Portal

**Track:** C — documentation, prototype, and full delivery
**Where we are:** Phase 2 of 6 — Requirements

---

## Phase 1 — Discovery and framing  ·  done
*Goal:* agree what we're building and who decides.

- [x] Project charter — `docs/project-charter-2026-08-04.md`
- [x] Stakeholder register — `docs/stakeholder-register-2026-08-05.md`
- [x] Sponsor sign-off on scope

## Phase 2 — Requirements  ·  in progress
*Goal:* a PRD engineering can estimate from.

- [x] PRD v1 — `docs/prd-partner-portal-2026-08-15.md`
- [ ] Engineering review of PRD  ·  blocked — waiting on Priya, since 08-18
- [ ] Risk plan

## Phase 3 — Prototype  ·  not started
*Goal:* prove the SSO flow before committing the build.

- [ ] Prototype scope note
- [ ] Working prototype
- [ ] Validation session with 3 partners
```

## Rules

- **Four statuses only**, on the phase heading after ` · `: `not started`, `in progress`, `blocked`, `done`.
- **A phase's checklist items are its exit criteria.** All boxes checked means the phase is done. There is no separate verification step.
- **A deliverable item ends with a backtick path** once the file exists. That path is the only link between the tracker and `docs/`.
- **Blockers are inline** on the item: `· blocked — <reason>, since <MM-DD>`. Risks live in `MEMORY.md`; only the ones actively blocking work appear here.
- **`current_phase` in the frontmatter is the pointer.** Update `updated:` on every write.
- Every phase has a one-line `*Goal:*` in plain language. If a goal cannot be written in one line, the phase is too big.

Nothing else. No separate state file, no roadmap file, no phases directory. If something needs more structure than this, it belongs in a document in `docs/`.

## Who writes what

| Skill | What it does to PLAN.md |
|---|---|
| `setup` | Nothing. Setup builds the workspace; the plan comes from `pm-project-start`. |
| `pm-project-start` | Creates it. Ticks items as documents are produced. |
| `start-session` | Reads only. Never writes. |
| `checkpoint` | Ticks boxes, adds newly discovered items, sets and clears blockers, bumps `updated`. Never advances `current_phase` without asking. |
| `end-session` | Same as checkpoint, plus: if every item in the current phase is checked, ask whether to advance to the next one. |
| `pm-draft` | If a matching unchecked item exists in the current phase, tick it and append the file path. Never creates phases. |

## Phase templates by track

**Track A — documentation only**
1. Discovery and framing
2. Core documents
3. Review and sign-off

**Track B — documentation and prototype**
1. Discovery and framing
2. Core documents
3. Prototype scope
4. Build and validate prototype
5. Review and sign-off

**Track C — full delivery**
1. Discovery and framing
2. Core documents
3. Prototype scope
4. Build and validate prototype
5. Delivery plan
6. Build — one phase per milestone the user names, or a single "Build — milestones to be defined" if they have none yet
7. Launch readiness
8. Retrospective

Only track C asks for target dates. Always show the proposed phases and let the user cut, rename, or reorder before writing the file.

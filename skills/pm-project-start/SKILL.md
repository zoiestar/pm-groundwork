---
name: pm-project-start
description: Start the project work in a PM workspace — pick a track (documentation only, documentation plus a prototype, or full delivery), build the delivery plan, and produce the document set for that track. Part 2 of PM Groundwork, run after setup. Use when the user is ready to begin planning or kicking off the actual project.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, Skill
model: sonnet
---

# Project start — part 2 of PM Groundwork

`setup` built the workspace. This runs the engagement: pick a track, build `PLAN.md`, produce the documents.

Read first: `${CLAUDE_PLUGIN_ROOT}/skills/_shared/plan-format.md`, `layout.md`, `tone.md`, `safety.md`.

**This skill is resumable.** `PLAN.md` is written before any drafting begins, and the only state that matters is which items are unticked. If a long run stops partway — context limit, interruption, anything — re-invoking this skill reads the plan and picks up where it left off. Say this to the user before starting a track C run.

---

## Step 0 — Check the ground

Detect the layout.

- **No workspace** — stop. Point at `/pm-groundwork:setup` and explain in one line that this skill needs the project context setup gathers.
- **`PLAN.md` already exists** — this is a resume, not a fresh start. Read it, report where things stand, and ask: continue the existing plan / add a new phase / start over (which archives the current plan to `docs/` rather than deleting it). Never overwrite a plan without that explicit choice.
- **Workspace, no plan** — continue to step 1.

Read `CONTEXT.md`, `MEMORY.md`, `USER.md`, `DECISIONS.md` before asking anything. Most of what you need is already there.

---

## Step 1 — Pick the track

> What are you planning to do with this project?

| Option | Description |
|---|---|
| **Documentation only** | Plans, requirements, and reports. No code, no prototype. |
| **Documentation and a prototype** | The documents, plus something clickable or runnable to prove the idea. |
| **Full delivery** | Documents, prototype, and a plan through build, launch, and retrospective. |

Store as TRACK A, B, or C.

Say plainly what the choice affects: how many questions come next, which documents get produced, and how many phases the plan has. A user can re-run this later to move up a track — nothing is locked.

---

## Step 2 — Track questions

Ask only the set for the chosen track. Check `MEMORY.md` and `CONTEXT.md` first — confirm what you already know instead of re-asking. Setup already covered project name, role, status, stakeholders, tools, and existing decisions; **do not ask any of those again.**

### All tracks

**Q1 — Who are these documents primarily for?**
Leadership / executives · Cross-functional partners · External or client · Mixed audience

**Q2 — Which documents do you need?** Accept several.
Project charter · Product roadmap · PRD · Status reports · Stakeholder register · Risk plan · Not sure — recommend a set

**Q3 — How often does this get reviewed?**
Weekly · Biweekly · Monthly · Ad hoc

### Tracks B and C add

**Q4 — What is the prototype for?**
Proving technical feasibility · Testing the user experience · Getting stakeholder buy-in · All three

**Q5 — Is the tech stack decided?**
Yes, here it is → freeform · The team will decide · I need help choosing

**Q6 — What does a successful prototype look like?** Freeform. Push for something observable — "the SSO flow works end to end for one test partner" beats "it looks good."

**Q7 — How much timeline pressure is there?**
Tight — weeks · Moderate — a quarter · Flexible · Fixed external date → freeform

### Track C adds

**Q8 — What's the team?**
Just me · 2-5 people · 6-15 people · Larger, multiple teams

**Q9 — How does this ship?**
Single release · Phased rollout · Continuous delivery · Not decided yet

**Q10 — Do you have milestone targets?**
Yes, with dates → freeform · Rough sequence, no dates · Not yet

**Q11 — What worries you most about delivering this?**
Timeline · Scope creep · Technical unknowns · Team or resourcing

Q11's answer goes straight into `MEMORY.md` open risks, not just the plan. It's usually the most useful sentence in the whole interview.

---

## Step 3 — Propose the plan

Build the phase list from the track templates in `_shared/plan-format.md`, then adapt:

- **Track C**: create one build phase per milestone from Q10. If they have none, create a single `Build — milestones to be defined`.
- Turn the Q2 document choices into deliverable items in the phases where they belong — a charter belongs in discovery, a status report cadence doesn't belong in the plan at all.
- Every phase gets a one-line goal in plain language.

If the user picked "recommend a set" on Q2, propose by track:

| Track | Recommended documents |
|---|---|
| **A** | Project charter · Stakeholder register · Product roadmap · Status report cadence |
| **B** | Track A's, plus a PRD and user stories |
| **C** | Track B's, plus risk management plan, project schedule, communication plan, and lessons learned at the end |

Show the whole proposed plan — phases, goals, and deliverable items — and ask them to cut, rename, or reorder before anything is written. A plan the user edited is a plan they'll use.

Also say once, before writing: `PLAN.md` is committed to git by default and its blocker notes will name people. If that's a problem for how this repo gets shared, now is the time to say so.

---

## Step 4 — Write the plan

Write `PLAN.md` per `_shared/plan-format.md` with `track:` and `current_phase: 1` in the frontmatter.

Then update the workspace so the rest of the tooling knows about the track:

- Add the track and its phase count to `MEMORY.md` under the snapshot
- Add the Q11 concern to `MEMORY.md` open risks
- Add a **Document defaults** section to `MEMORY.md` recording the Q1 audience and the Q3 review cadence, so `pm-draft` doesn't ask the same two questions for every document in the set
- Note the kickoff in today's `memory/YYYY-MM-DD.md`

**Write the plan before drafting a single document.** That ordering is what makes this skill resumable.

---

## Step 5 — Widen permissions, if the track needs it

`setup` deliberately wrote the narrowest permission set. Track B and C need more. Ask before changing anything — broadening what the assistant is allowed to do is a security decision, not a formality.

State plainly what is being granted. "Write files and run build commands" understates it for someone who is not a developer:

> Track [B/C] involves building, so I'd need permission to **create or change any file in this project** and **run programs from the terminal** (npm, npx). That's broader than the documents-only access you have now. Update `.claude/settings.json`?

Prefer the narrowest thing that works: if the prototype will live in one directory, scope the write permission to that directory rather than the whole project.

| Track | Add to `permissions.allow` |
|---|---|
| A | Nothing — the narrow set stands |
| B | `Write(*)`, `Edit(*)`, `Bash(npm run *)`, `Bash(npx *)` |
| C | Track B's, plus `Bash(npm *)`, `Bash(git *)`, `Bash(gh *)` |

If they decline, continue anyway. Say which parts of the track will need a manual approval each time.

---

## Step 6 — Produce the documents

Loop over the deliverable items in the current phase, one document at a time.

For each one:

1. Ask whether to draft it now or later. Nobody wants eight documents generated at them without a pause.
2. If yes, invoke the `pm-draft` skill with the document type. **Carry no document formatting instructions here** — `pm-draft` owns the format, the questions, the writing rules, and the slop gate. Your job is only to say which document is next.
3. When it returns, confirm the item is ticked in `PLAN.md` with its path.
4. Move to the next.

If drafting is interrupted, the plan already records exactly what's done. Re-invoking this skill resumes.

### Items that are not documents

Track B and C plans contain items no document satisfies — "Working prototype", "Validation session with 3 partners", build milestones. `pm-draft` does not do these; it writes documents and never code.

These are done as ordinary work in the session, with the user, not by a skill. When the next unchecked item is one of them:

1. Say plainly that this one is hands-on work rather than a document, and ask whether to start now or later.
2. Before creating or modifying anything outside `docs/`, say what you're about to write and where. The permission widening in step 5 makes this possible; it does not make it unsupervised.
3. Checkpoint after each meaningful piece, so an interrupted build doesn't lose its place.
4. Tick the item only when the user agrees it's actually done — you cannot judge "the SSO flow works for one test partner" on your own.

Never treat a build item as complete because you produced a file.

When the phase's items are complete, stop. Do not roll into the next phase — that's `end-session`'s call, and only after asking.

---

## Step 7 — Close

```
[PROJECT NAME] — track [A/B/C]

Plan:      PLAN.md — [N] phases
Phase 1:   [X] of [Y] done
Documents: [count] in docs/
Next:      [first unchecked item]

Daily from here: start-session → work → checkpoint → end-session
```

---

## Guardrails

- Never overwrite an existing `PLAN.md` without an explicit choice; archive rather than delete.
- Never re-ask what `setup` already recorded.
- Never widen permissions without a yes.
- Never generate the whole document set in one unbroken run — ask between each.
- Never advance `current_phase` here.
- Track C with many milestones is a long run. Warn about it, write the plan first, and remind the user it resumes.

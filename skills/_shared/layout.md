# Workspace layout and migration

## Detecting the layout

Check in this order and stop at the first match.

| Signal | Layout |
|---|---|
| `PLAN.md` exists with `track:` in its frontmatter | **v3** (current) |
| `.claude/rules/session-protocol.md` mentions `pm-groundwork:checkpoint` | **v3** — set up, no plan yet |
| `.claude/agents/pm-lead/AGENT.md` exists | **v2** |
| Root `MEMORY.md`, `IDENTITY.md`, `SOUL.md`, or `HEARTBEAT.md` exists | **v1 flat** |
| None of the above | **fresh** |

## Where files live

| What it is | v3 and v2 | v1 flat |
|---|---|---|
| Project entrypoint | `CLAUDE.md` | `CLAUDE.md` |
| Quick orientation | `CONTEXT.md` | `CONTEXT.md` |
| About the user | `USER.md` | `USER.md` |
| Agent definition | `.claude/agents/pm-lead/AGENT.md` | `IDENTITY.md` + `SOUL.md` |
| Project memory | `.claude/agent-memory/pm-lead/MEMORY.md` | `MEMORY.md` |
| Decision log | `.claude/agent-memory/pm-lead/DECISIONS.md` | `DECISIONS.md` |
| Behavior rules | `.claude/rules/behavior.md` | `AGENTS.md` |
| Session protocol | `.claude/rules/session-protocol.md` | `HEARTBEAT.md` |
| Delivery plan | `PLAN.md` (v3 only) | — |
| Daily logs | `memory/YYYY-MM-DD.md` | same |
| Documents | `docs/` | same |

**Read from wherever you found it, write back to the same place.** A v1 user who never migrates keeps working — they just have no `PLAN.md` until they run `pm-project-start`.

## Migration

Migration is always **offered**, never automatic, and always **copies** — originals stay on disk until the user deletes them.

Every new user sits in the second row between running `setup` and running `pm-project-start`. Treating that state as v2 would offer them a migration they don't need, so check it before the v2 signal.

### From v2

No file moves needed; v3 uses the same paths. The only difference is that v2 files contain references to the GSD planning framework, which v3 no longer uses.

Offer: *Refresh the rules files to remove references to a planning framework this version no longer uses? Your memory, decisions, and documents are not touched.*

If yes, rewrite only `CLAUDE.md`, `.claude/rules/behavior.md`, and `.claude/rules/session-protocol.md`. **Never** modify `MEMORY.md` or `DECISIONS.md` content during a refresh.

### From v1 flat

Show a before/after table of every path, then ask for a yes. On approval, copy:

| From | To |
|---|---|
| `IDENTITY.md` + `SOUL.md` | `.claude/agents/pm-lead/AGENT.md` (merged) |
| `MEMORY.md` | `.claude/agent-memory/pm-lead/MEMORY.md` (verbatim) |
| `DECISIONS.md` | `.claude/agent-memory/pm-lead/DECISIONS.md` (verbatim) |
| `HEARTBEAT.md` | `.claude/rules/session-protocol.md` |
| `AGENTS.md` | `.claude/rules/behavior.md` + `.claude/rules/security.md` |

MEMORY.md and DECISIONS.md must survive byte-identical. Tell the user the originals are still there and they can delete them once they are satisfied.

### Verify the migration before reporting success

Migration moves a user's entire project history. Check it rather than assuming it worked:

```bash
diff MEMORY.md .claude/agent-memory/pm-lead/MEMORY.md && echo "memory identical"
diff DECISIONS.md .claude/agent-memory/pm-lead/DECISIONS.md && echo "decisions identical"
```

Both must be identical. If either differs, say so plainly, do not delete or modify the originals, and stop — a partial migration the user believes succeeded is worse than a failed one.

Then confirm every original still exists. Migration copies; nothing is removed. Report the count of files copied and the count of originals still in place.

### Leftovers from older installs

- **`.planning/` directory** — from the GSD framework used by v1 and v2. Never delete it, never write into it. Offer once to read `.planning/ROADMAP.md` and `.planning/STATE.md` and import the phases into `PLAN.md`, marking which items came from the import. Then say plainly: PM Groundwork no longer reads `.planning/`, and GSD still works on its own if the user wants it. After that one offer, ignore the directory.
- **`.claude/commands/pm-*.md`** — copied by hand under the old install instructions. They still work and still reference the removed framework. Tell the user to delete them, and give the exact command.

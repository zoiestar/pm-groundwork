# Changelog

## MCP server 3.0.1 — 2026-08-19

Package-only release; the plugin and skills are unchanged at 3.0.0.

- Corrected the package README, which is the npm landing page. It told Claude Desktop and Cowork users to type a slash command; those surfaces install through the Customize panel.
- Dropped `glob`, which was declared as a dependency but never imported. The package now has exactly one runtime dependency.
- Updated the MCP SDK to 1.30.0.
- Documented that this server is stdio-only, so the SDK's HTTP-transport advisories reported by `npm audit` do not apply to code paths it executes.

## 3.0.0 — 2026-08-19

Published to npm as [`pm-groundwork-mcp`](https://www.npmjs.com/package/pm-groundwork-mcp). Earlier versions were never published, so `npx pm-groundwork-mcp init` — the install the README documented from v1 onward — returned a 404 for everyone who tried it. The MCP path works now.

A rewrite. Commands became skills, the GSD dependency was removed, and the product split into two parts.

### If you are upgrading

**Delete any files you copied into `.claude/commands/pm-*.md`.** Older install instructions told you to clone this repository and copy command files into your project. Those copies still work, still reference a planning framework this version no longer uses, and will now conflict with the plugin. Remove them:

```bash
rm .claude/commands/pm-setup.md .claude/commands/pm-start-session.md \
   .claude/commands/pm-end-session.md .claude/commands/pm-draft.md
```

Then install the plugin properly:

```
/plugin marketplace add zoiestar/pm-groundwork
/plugin install pm-groundwork
```

Run `setup` in your project. It detects your existing workspace and offers to migrate. **Migration copies and never moves** — your originals stay until you delete them, and memory and decision files are verified byte-for-byte identical before it reports success.

Your `.planning/` folder, if you have one, is left alone.

### Changed

- **Commands are now skills.** `setup`, `start-session`, `end-session`, and `pm-draft` are skills rather than slash commands, which is what lets them run in Claude Desktop and Claude Cowork as well as Claude Code. Invoke as `/pm-groundwork:setup` and so on.
- **Two-part structure.** `setup` now only builds the workspace. Choosing what kind of project you're running moved to the new `pm-project-start`.
- **Names.** Session-lifecycle skills dropped the `pm-` prefix; PM-specific ones kept it.
- **Setup asks permission first.** It lists every file it may create or overwrite and stops unless you explicitly agree. Nothing is read or written before that.
- **`end-session` commits and pushes by default** when a repository is configured, after a secret scan and one confirmation. Previously optional.

### Added

- **`checkpoint`** — a mid-session save that updates the plan and daily log without committing. Your assistant will also offer one when the conversation is getting long or a decision was just made.
- **`pm-project-start`** — pick documentation only, documentation plus a prototype, or full delivery. Builds `PLAN.md` and produces the document set for that track. Resumable: the plan is written before drafting begins, so an interrupted run picks up where it stopped.
- **`PLAN.md`** — a single delivery tracker at the project root. Phases, checklist items as exit criteria, four statuses, inline blockers. Replaces the `.planning/` directory.
- **GitHub setup in the interview** — bring your own repository or have one created, with the environment verified before anything is configured. Declining shows an explicit warning about what local-only storage means.
- **Model routing** — choose balanced, cost-first, quality-first, or unmanaged. Sets defaults and suggests switches; it does not and cannot force a model.
- **Surface detection** — GitHub backup is not offered in Cowork or Claude Desktop, where it cannot work, instead of failing partway through.
- **[no-ai-slop](https://github.com/petergyang/no-ai-slop)** by Peter Yang (MIT) is bundled and runs against every generated document.
- **`npm test`** — 20 protocol conformance checks against the MCP server, impersonating each supported client.

### Removed

- **The GSD (Get Shit Done) integration**, in full — the routing tables, the `/gsd:*` command references, the handoff that pre-filled GSD's interview, and the hard dependency in the plugin manifest. GSD is good software and still works on its own; PM Groundwork simply no longer couples to it. Credit to Lex Christopherson remains in the README.
- The stale `commands/` and `.claude/commands/` directories, which held two divergent copies of every workflow.
- The four hand-written MCP prompt generators, replaced by generation from `skills/`.

### Fixed

- **MCP clients could not see v2 or v3 workspaces at all.** The server only ever looked at flat root-level files, so anyone on Cursor, Codex, or Gemini CLI with a `.claude/`-based workspace got empty results from every tool and resource. It now detects the layout and resolves paths accordingly.
- **Claude Code users on the MCP path were served degraded prompts.** Client detection ran before the client identified itself, so every client resolved to "unknown" and received the simplified numbered-list instructions meant for tools without structured questions. There was no visible symptom. Detection is now lazy and reports the resolved client.
- **`end-session` would not have backed up new documents.** Staging used `git add -u`, which only picks up files git already tracks — every newly drafted document would have been silently omitted from the backup. New files are now staged by explicit path.
- **v3 workspaces were detected as v2** because layout detection used a CommonJS call inside an ES module, which threw on every invocation.
- Path traversal is now blocked in MCP file operations; a path escaping the workspace directory throws instead of reading or writing outside the project.

### Internal

`skills/` is the single source of truth for all workflow text. MCP prompts are generated from it, and `npm run check:parity` fails the build when they drift — wired into `prebuild` and `prepublishOnly`. Version 2 stalled for four months precisely because that parity was a manual step nobody performed.

## 2.0.0

Rewrote the commands to generate a `.claude/`-native workspace. The MCP server was never updated to match, leaving the two paths incompatible. Superseded by 3.0.0.

## 1.0.0

Initial release. Four slash commands, an MCP server for cross-tool support, and GSD integration.

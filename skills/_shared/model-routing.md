# Model routing

The goal is to keep token cost down without hurting the quality of anything that matters.

## What this can and cannot do

**Can:** set the project's default model in `.claude/settings.json`, and write a routing rule the agent follows — suggesting a model switch at the moments it matters, and choosing models for any subagent work it runs.

**Cannot:** force a session onto a particular model. The user is always in control with `/model`. This is guidance and a sensible default, not enforcement or a spend limit. Say so plainly if the user asks.

## The question setup asks

> How should I manage which model does what? Larger models reason better; smaller ones are faster and cheaper.

| Answer | Default model | Routing behavior |
|---|---|---|
| **Balanced** (default) | Sonnet | The map below |
| **Cost-first** | Haiku | Sonnet for drafting; suggest Opus only when the user asks for it |
| **Quality-first** | Sonnet | Suggest Opus before every document |
| **Don't manage it** | not set | No routing file written; the user drives `/model` themselves |

## The default map

| Model | Use it for |
|---|---|
| **Opus** | PRDs, product strategy, competitive analysis, risk analysis, and planning the engagement — work where reasoning quality shows up in the finished artifact |
| **Sonnet** | Most drafting, and the setup, start-session, and end-session workflows |
| **Haiku** | Deterministic work — file scans, status roll-ups, ticking items in PLAN.md, secret scans, appending to the daily log |
| **Fable** | Only when the user names it |

## How to apply it

- Write the chosen map to `.claude/rules/model-routing.md` in the user's workspace so it loads automatically each session.
- Set `"model"` in `.claude/settings.json` to the default for the chosen answer.

Skills ship with a `model:` in their frontmatter, which sets what they run on. Routing cannot override that mid-run — it can only suggest a switch before work starts. Say "switch to Opus for this" rather than implying it happens by itself.

- When about to start work that the map assigns to a different model than the current one, say so in one line and let the user decide — for example: *"This is a PRD — worth switching to Opus with `/model opus` before I start. Want to?"* Ask once. Do not nag, and do not ask again for the same document.
- Skip all of this when the user chose **Don't manage it**.

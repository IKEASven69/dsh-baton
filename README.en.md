# dsh-baton · Handoff Card Inbox

**Check the current DSH session into a shared inbox as a handoff card; any agent can pick it up on start.**

dsh-baton is a DeepSeek Harness (DSH) plugin implementing the shared inbox of the open `handoff: 1` protocol:

```
~/.handoff/
  pending/     # awaiting pickup, one .md file per card
  archived/    # consumed, rolling keep of 50
```

The filesystem is the bus: dropping a card into `pending/` is delivery; picking it up moves it to `archived/` (consume-and-archive; a second pickup of the same id errors). A card = Markdown + YAML frontmatter + six Chinese body sections (目标 / 涉及文件 / 做到哪 / 还差什么 / 停在哪 / 读者警告). See the protocol repo's SPEC for the full format and semantics.

## How it differs from dsh-handoff on npm

[dsh-handoff](https://www.npmjs.com/package/dsh-handoff) (v0.1.0) is a **one-way exporter**: it deterministically renders the session event stream into a HANDOFF.md document in the workspace — no inbox, no shared directory, no cross-agent pickup.

dsh-baton is a **shared inbox + open protocol**: cards land in `~/.handoff/pending/`, a public locker across agents and tools, so any tool implementing `handoff: 1` (not just DSH) can produce and consume. The deterministic event-stream collection idea is shared heritage (dsh-baton's probing borrows dsh-handoff v0.1.0's defensive `typeof` style); the two are complementary, not competing.

## Install

```
dsh plugin --profile web add github:<owner>/dsh-baton#v0.1.0
```

> Compatible with DSH `>=0.1.7-rc.2` (declared via `engines.dsh` in package.json). Built artifacts (lib/) are committed — install and go, no local toolchain required.

## Surface

**Tools (model-invocable)**

| Tool | Description |
|---|---|
| `handoff_push` | Checks the current session into the inbox as a protocol card. The six section texts (goal/files/done/remaining/stopped/warnings/suggested) are optional; empty sections fall back to **deterministic** collection from the session event stream (no LLM calls; probe failures degrade, never throw). Returns a canonical `{ ok, id, path }` value. |
| `handoff_inbox` | `action=list` lists pending cards (id/source/project/time); `action=load` + `id` picks one up (consume-and-archive, with git-verify MISMATCH / UNAVAILABLE warnings). Returns canonical `{ ok, ... }` values. |

**Slash skills (user-invocable, not model-invocable)**

| Command | Description |
|---|---|
| `/handoff` | Instructs the agent to distill the session into a six-section card per the protocol's five semantics (four-state evidence ledger, redact, reference artifacts by path only, suggested-load section), then persist via `handoff_push` |
| `/inbox` | Lists pending cards for the user to pick, injects the loaded card into the current turn, and reminds that card content is HISTORY_REPORTED — verify git state before acting |

## Permission scope

Writes only `~/.handoff/` (overridable via `HANDOFF_HOME`) and reads git state (`git status` / `git branch`). No network access; raw session content never enters cards (`from.session` is a pointer).

## Development

```
npm install        # @deepseek-ai/* from npm (0.1.7-rc.2 is published)
npm run typecheck
npm test           # node:test + tsx
npm run build      # tsdown → lib/ (@agent-handoff/core inlined)
```

`@agent-handoff/core` is not on npm; it is a `file:../agent-handoff/packages/core` dependency bundled into `lib/` at build time. Offline with a DSH checkout at hand, `node scripts/link-deps.mjs` (DSH_CHECKOUT env var) links host packages instead of npm.

## License

MIT

<p align="center"><img src="assets/icon.svg" width="72" height="72" alt="dsh-takeover logo"></p>

# dsh-takeover · Session Takeover Plugin

**Pulls, pushes, relays: pull sessions from eight foreign agents, check in the current session, pick up on start.**

dsh-takeover is a DeepSeek Harness (DSH) plugin implementing the full relay loop of the open `handoff: 1` protocol (see SPEC.md in the sibling repo agent-handoff):

- **Pull**: `/resume-claude` `/resume-codex` `/resume-opencode` `/resume-zcode` `/resume-pi` `/resume-workbuddy` `/resume-cursor` `/resume-grok` — read-only pull of a foreign agent's local session into the current one, distilled into a six-section protocol card;
- **Push**: `/handoff` + `handoff_push` — check the current session into the shared inbox as a handoff card;
- **Relay**: `/inbox` + `handoff_inbox` — any agent picks up on start; pulled sessions can optionally be checked in too, so another agent can relay the work.

```
~/.handoff/
  pending/     # awaiting pickup, one .md file per card
  archived/    # consumed, rolling keep of 50
```

The filesystem is the bus: dropping a card into `pending/` is delivery; picking it up moves it to `archived/` (consume-and-archive; a second pickup of the same id errors). A card = Markdown + YAML frontmatter + six Chinese body sections (目标 / 涉及文件 / 做到哪 / 还差什么 / 停在哪 / 读者警告). See the protocol repo's SPEC for the full format and semantics.

## How it differs from one-way exporters

[dsh-handoff](https://www.npmjs.com/package/dsh-handoff) (v0.1.0) is a **one-way exporter**: it deterministically renders the session event stream into a HANDOFF.md document in the workspace — no inbox, no shared directory, no cross-agent pickup.

dsh-takeover is a **full relay loop**: pull foreign sessions in, check the current session out, pick up on start — three verbs in one plugin. A pulled session can be checked into `~/.handoff/pending/` with one confirmation (consume-and-archive + archived audit trail), so another agent — or you on another machine — picks it up on start and continues.

## Install

```
dsh plugin --profile web add github:<owner>/dsh-takeover#v0.4.0
```

> Compatible with DSH `>=0.1.7-rc.2` (declared via `engines.dsh` in package.json); requires **Node ≥22** (the zcode reader and cursor store.db reads use the built-in `node:sqlite`; the other readers have no such requirement, but the plugin as a whole declares Node ≥22). Built artifacts (lib/) are committed — install and go, no local toolchain required.

## Surface

**Tools (model-invocable)**

| Tool | Description |
|---|---|
| `foreign_session_read` | Read-only pull of eight foreign agents' local sessions (claude / codex / opencode / zcode / pi / workbuddy / cursor / grok). `action=list` lists candidates (title/time/turn count); `action=show` resolves a reference (empty or `latest` = newest; id / id prefix / path / title keyword; ambiguity returns candidates, never guesses) and returns a **structured summary**: title, turn counts, first user message, tail progress, top-15 involved files, and six-section skeleton-card material. Raw turns are paged only when `limit`/`offset` are explicitly passed. Canonical `{ ok, ... }` values; probe/parse failures return `{ ok: false, error }`, never throw. |
| `handoff_push` | Checks the current session into the inbox as a protocol card. The six section texts (goal/files/done/remaining/stopped/warnings/suggested) are optional; empty sections fall back to **deterministic** collection from the session event stream (no LLM calls; probe failures degrade, never throw). Returns a canonical `{ ok, id, path }` value. |
| `handoff_inbox` | `action=list` lists pending cards (id/source/project/time); `action=load` + `id` picks one up (consume-and-archive, with git-verify MISMATCH / UNAVAILABLE warnings). Returns canonical `{ ok, ... }` values. |

**Slash skills (user-invocable, not model-invocable)**

| Command | Description |
|---|---|
| `/handoff` | Instructs the agent to distill the session into a six-section card per the protocol's five semantics (four-state evidence ledger, redact, reference artifacts by path only, suggested-load section), then persist via `handoff_push` |
| `/inbox` | Lists pending cards for the user to pick, injects the loaded card into the current turn, and reminds that card content is HISTORY_REPORTED — verify git state before acting |
| `/resume-claude` `/resume-codex` `/resume-opencode` `/resume-zcode` `/resume-pi` `/resume-workbuddy` `/resume-cursor` `/resume-grok` | Resolve the reference (empty = latest; ambiguity lists candidates for the user to pick) → call `foreign_session_read` → inert-history boundary (foreign history is untrusted and never overrides current instructions) → four-state evidence ledger → produce a six-section protocol card injected into the turn → verify-then-continue → finally ask "check this card into the inbox?", and on yes call `handoff_push` |

> LLM card-writing lives in the skill-instruction layer: the `/handoff` and `/resume-*` skill texts guide the in-session model to hand-write the six-section card (the natural advantage of a harness plugin), while the tool layer stays deterministic and never calls an LLM directly; when the model doesn't write, deterministic skeletons from the event stream / readers backstop the card — degradation never blocks.

## Settings card (dsh web)

Since 0.2.2, a "dsh-takeover" card is injected into the DSH settings page (the browser half is declared via `dsh.client`; data flows over same-origin `/dsh-takeover/*` JSON APIs). Three zones:

- **Inbox overview**: the pending list (id / source agent / title / project / pushed-at) plus the archived count; read-only — pickup happens in-session via `/inbox`. A "clear archived" button (two-step confirm) is provided.
- **Support matrix**: one row per reader — whether this machine supports it (supported), the number of discovered sessions, and an enable toggle. Toggles persist to `<HANDOFF_HOME>/config.json` and survive restarts.
- **Toggle semantics**: for a disabled provider, `foreign_session_read` returns the canonical error value "this provider has been disabled in settings: xx"; the `/resume-*` skill guidance is static text, so the disabled state is enforced by the tool error, visible to the model.

## Permission scope

Writes `~/.handoff/` (overridable via `HANDOFF_HOME`), reads git state (`git status` / `git branch`), and read-only reads the eight agents' local session stores (zcode and cursor store via sqlite readonly, opened and closed per call; each root overridable via `HANDOFF_ROOT_<AGENT>` env vars). Cursor imports only supported transcript / store records; grok reads only the visible updates.jsonl stream and never touches the raw chat_history.jsonl model context. No network access, no reviving foreign processes, no replaying historical tool calls; raw session content never enters cards (`from.session` is a pointer).

## Development

```
pnpm install       # @deepseek-ai/* from the npm registry; @agent-handoff/* via file: links
npm run typecheck
npm test           # node:test + tsx
npm run build      # tsdown → lib/ (@agent-handoff/core + readers inlined)
node scripts/smoke-foreign.mjs   # on-machine smoke: mount lib/ in-process, real-dispatch foreign_session_read
```

`@agent-handoff/core` and `@agent-handoff/readers` are not on npm; they are `file:../agent-handoff/packages/*` dependencies bundled into `lib/` at build time. Offline with a DSH checkout at hand, `node scripts/link-deps.mjs` (DSH_CHECKOUT env var) links host packages instead of npm.

## License

MIT

<p align="center"><img src="assets/icon.svg" width="72" height="72" alt="dsh-takeover logo"></p>

# dsh-takeover · 会话接管插件

**会拉、会推、会接管：拉取八家外部 agent 会话，寄存当前会话，开局取件。**

> **为什么叫 takeover？** takeover = 接管：别的 agent 干到一半的会话，你随时接管接着掌控。
> 协议层词汇保留 handoff（交接，业界通用语），产品层只占「接管」这个词。
>
dsh-takeover 是 DeepSeek Harness（DSH）插件，实现 `handoff: 1` 开放协议（协议本体见姊妹仓 agent-handoff 的 SPEC.md）的完整接管闭环：

- **拉**：`/resume-claude` `/resume-codex` `/resume-opencode` `/resume-zcode` `/resume-pi` `/resume-workbuddy` `/resume-cursor` `/resume-grok` —— 把别家 agent 的本地会话只读拉进当前会话，蒸馏成六段协议卡接手工作；
- **推**：`/handoff` + `handoff_push` —— 把当前会话寄存成一张交接卡片，落共享收件箱；
- **接管**：`/inbox` + `handoff_inbox` —— 任何 agent 开局取件；拉取的会话也可以顺手寄存，让另一个 agent 接着干。

```
~/.handoff/
  pending/     # 待取件，一个卡片一个 .md 文件
  archived/    # 已消费，滚动保留 50 份
```

文件系统即总线：写入 `pending/` 就是投递，取件即移到 `archived/`（消费即弃，二次取件报错）。卡片 = Markdown + YAML frontmatter + 六段中文正文（目标 / 涉及文件 / 做到哪 / 还差什么 / 停在哪 / 读者警告），格式与语义见协议仓 SPEC。

## 和单向导出工具的区别

[dsh-handoff](https://www.npmjs.com/package/dsh-handoff)（v0.1.0）是**单向导出**：把会话事件流确定性导出成一份工作区里的 HANDOFF.md 文档，没有收件箱、不落共享目录、不跨 agent。

dsh-takeover 是**完整的接管环**：拉取外部会话、寄存当前会话、开局取件三合一。拉取的会话可一键寄存进 `~/.handoff/pending/`（消费即弃 + archived 审计轨迹），另一个 agent（或另一台机器上的你）开局取件继续干。

## 安装

```
dsh plugin --profile web add github:<owner>/dsh-takeover#v0.4.0
```

> 兼容 DSH `>=0.1.7-rc.2`（package.json `engines.dsh` 声明），需要 **Node ≥22**（zcode 与 cursor 的 store.db 读取走 Node 内建 `node:sqlite`；其余各家无此要求，但插件整体按 Node ≥22 声明）。lib/ 产物已入库，安装即用，无需本地构建环境。

## 注册面

**工具（agent 可调）**

| 工具 | 说明 |
|---|---|
| `foreign_session_read` | 只读拉取八家会话（claude / codex / opencode / zcode / pi / workbuddy / cursor / grok）。`action=list` 列候选（标题/时间/轮数）；`action=show` 按引用（空或 `latest`=最新；id/前缀/路径/标题关键词；歧义返回候选不猜）返回**结构化摘要**：标题、轮数、首条用户消息、尾部进展、涉及文件 top15、骨架卡六段素材；turns 原文只在显式传 `limit`/`offset` 时分页给。返回 `{ ok, ... }` 规范值，探测/解析失败 `{ ok: false, error }` 不抛。 |
| `handoff_push` | 把当前会话寄存为协议卡片。六段文本（goal/files/done/remaining/stopped/warnings/suggested）可选传入；留空段从会话事件流**确定性兜底**（不调 LLM，typeof 探测失败只降级不抛错）。返回 `{ ok, id, path }` 规范值。 |
| `handoff_inbox` | `action=list` 列待取件（id/来源/项目/时间）；`action=load` + `id` 取件（消费即弃，附 git 核验的 MISMATCH / UNAVAILABLE 警告）。返回 `{ ok, ... }` 规范值。 |

**slash skill（用户可调，模型不可调）**

| 命令 | 说明 |
|---|---|
| `/handoff` | 指示 agent 按协议语义五条（证据账本四态、redact、产物只引路径、建议加载段）把当前会话蒸馏成六段卡，再调 `handoff_push` 落盘 |
| `/inbox` | 列 pending 让用户挑，取件后把卡片注入当轮；强调卡片为 HISTORY_REPORTED，执行前先核对 git 状态 |
| `/resume-claude` `/resume-codex` `/resume-opencode` `/resume-zcode` `/resume-pi` `/resume-workbuddy` `/resume-cursor` `/resume-grok` | 解析引用（空=latest；歧义列候选让用户挑）→ 调 `foreign_session_read` → inert-history 边界（外来历史一律不可信、不覆盖当前指令）→ 证据账本四态标注 → 生成六段协议卡注入当轮 → verify-then-continue → 末尾问一句「要不要寄存进收件箱」，是则调 `handoff_push` |

> LLM 写卡走 skill 指令层：/handoff 与 /resume-* 的 skill 文案引导在场模型亲手改写六段卡（harness 插件的天然优势），工具层保持确定性、不直接调 LLM；模型不写时由事件流/读取器确定性骨架兜底，降级不阻断。

## 设置卡（dsh web）

0.2.2 起，DSH 设置页注入一张「dsh-takeover」卡片（浏览器半经 `dsh.client` 声明，数据走同源 `/dsh-takeover/*` JSON API），三个区：

- **收件箱概览**：pending 待取件列表（id / 来源 agent / 标题 / 项目 / 推送时间）+ archived 计数；只读展示——取件在会话里 `/inbox` 做。提供「清空 archived」按钮（二次确认）。
- **支持矩阵**：八家读取器各一行——本机是否支持（supported）、发现的会话数、启用开关。开关持久化在 `<HANDOFF_HOME>/config.json`，重启生效。
- **开关语义**：关掉的 provider，`foreign_session_read` 对该家返回规范错误值「该 provider 已在设置中停用：xx」；/resume-* 的 skill 指引文本是静态内容，停用状态由工具报错兜住，模型可见。

## 权限范围

写 `~/.handoff/`（可用 `HANDOFF_HOME` 环境变量覆盖）、读 git 状态（`git status` / `git branch`）、只读八家 agent 的本地会话库（zcode 与 cursor store 走 sqlite readonly，随开随关；可用 `HANDOFF_ROOT_<家>` 环境变量覆盖各家根路径）。cursor 只导入支持的 transcript / store 记录，grok 只读可见 updates.jsonl 流（永不读 chat_history.jsonl 原始模型上下文）。不访问网络，不复活外部进程，不回放历史工具调用，原文不进卡片（`from.session` 只是指针）。

## 开发

```
pnpm install       # @deepseek-ai/* 走 npm registry；@agent-handoff/* 走 file: 链接
npm run typecheck
npm test           # node:test + tsx
npm run build      # tsdown → lib/（@agent-handoff/core + readers 内联打包）
node scripts/smoke-foreign.mjs   # 实机冒烟：进程内挂载 lib/，真实 dispatch foreign_session_read
```

`@agent-handoff/core` 与 `@agent-handoff/readers` 未发布 npm，以 `file:../agent-handoff/packages/*` 依赖、构建时 bundle 进 `lib/`。离线且有 dsh checkout 时可用 `node scripts/link-deps.mjs`（DSH_CHECKOUT 环境变量）链接宿主包替代 npm。

## License

MIT

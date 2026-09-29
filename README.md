# dsh-baton · 交接卡片收件箱

**把当前 DSH 会话寄存成一张交接卡片，任何 agent 开局可取件。**

dsh-baton 是 DeepSeek Harness（DSH）插件，实现了 `handoff: 1` 开放协议的共享收件箱（协议本体见姊妹仓 agent-handoff 的 SPEC.md）：

```
~/.handoff/
  pending/     # 待取件，一个卡片一个 .md 文件
  archived/    # 已消费，滚动保留 50 份
```

文件系统即总线：写入 `pending/` 就是投递，取件即移到 `archived/`（消费即弃，二次取件报错）。卡片 = Markdown + YAML frontmatter + 六段中文正文（目标 / 涉及文件 / 做到哪 / 还差什么 / 停在哪 / 读者警告），格式与语义见协议仓 SPEC。

## 和 npm 上的 dsh-handoff 有什么区别

[dsh-handoff](https://www.npmjs.com/package/dsh-handoff)（v0.1.0）是**单向导出**：把会话事件流确定性导出成一份工作区里的 HANDOFF.md 文档，没有收件箱、不落共享目录、不跨 agent。

dsh-baton 是**共享收件箱 + 开放协议**：卡片落 `~/.handoff/pending/` 这个跨 agent、跨工具的公共寄存柜，任何实现了 handoff: 1 协议的工具（不限 DSH）都能生产和消费。两者的确定性事件流收集思路同源（dsh-baton 的探测代码借道 dsh-handoff v0.1.0 的 typeof 防御写法），定位互补不冲突。

## 安装

```
dsh plugin --profile web add github:<owner>/dsh-baton#v0.1.0
```

> 兼容 DSH `>=0.1.7-rc.2`（package.json `engines.dsh` 声明）。dist（lib/）产物已入库，安装即用，无需本地构建环境。

## 注册面

**工具（agent 可调）**

| 工具 | 说明 |
|---|---|
| `handoff_push` | 把当前会话寄存为协议卡片。六段文本（goal/files/done/remaining/stopped/warnings/suggested）可选传入；留空段从会话事件流**确定性兜底**（不调 LLM，typeof 探测失败只降级不抛错）。返回 `{ ok, id, path }` 规范值。 |
| `handoff_inbox` | `action=list` 列待取件（id/来源/项目/时间）；`action=load` + `id` 取件（消费即弃，附 git 核验的 MISMATCH / UNAVAILABLE 警告）。返回 `{ ok, ... }` 规范值。 |

**slash skill（用户可调，模型不可调）**

| 命令 | 说明 |
|---|---|
| `/handoff` | 指示 agent 按协议语义五条（证据账本四态、redact、产物只引路径、建议加载段）把当前会话蒸馏成六段卡，再调 `handoff_push` 落盘 |
| `/inbox` | 列 pending 让用户挑，取件后把卡片注入当轮；强调卡片为 HISTORY_REPORTED，执行前先核对 git 状态 |

## 权限范围

只写 `~/.handoff/`（可用 `HANDOFF_HOME` 环境变量覆盖）与读 git 状态（`git status` / `git branch`）。不访问网络，不读会话原文进卡片（`from.session` 只是指针）。

## 开发

```
npm install        # @deepseek-ai/* 走 npm（0.1.7-rc.2 已发布）
npm run typecheck
npm test           # node:test + tsx
npm run build      # tsdown → lib/（@agent-handoff/core 内联打包）
```

`@agent-handoff/core` 未发布 npm，以 `file:../agent-handoff/packages/core` 依赖、构建时 bundle 进 `lib/`。离线且有 dsh checkout 时可用 `node scripts/link-deps.mjs`（DSH_CHECKOUT 环境变量）链接宿主包替代 npm。

## License

MIT

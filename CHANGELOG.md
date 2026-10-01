# Changelog

本插件遵循语义化版本。协议层（`handoff: 1`、`~/.handoff/` 目录、工具与命令名）的变更只会在主/次版本号体现，补丁版本仅含修正与打磨。

所有版本的卡片与收件箱相互兼容。

## [0.5.1] — 2026-10-01

### 修正
- README 安装命令引用了不存在的 git tag（`#v0.4.0`），照抄会安装失败——改为可用的无版本引用，本版本起提供 git tag
- README 支持矩阵「重启生效」与实现不符：开关改动即刻生效（每次调用现读 `config.json`），已更正
- `engines.dsh` 与 peerDependencies 兼容下限虚标 `0.1.7-rc.2`，如实抬到 `0.2.0-rc.2`（设置卡 i18n 依赖宿主 locale 服务）
- 移除遗留的 `pnpm-lock.yaml` / `pnpm-workspace.yaml`（开发流程为 npm，双 lockfile 易腐）
- `package.json` 补 `repository` / `homepage` / `bugs`；keywords 补 takeover / session-takeover / resume / multi-agent

### 新增
- git tag 发版起点（v0.5.1）

## [0.5.0] — 2026-10-01

### 变更
- **品牌定名 dsh-takeover（接管）**：插件名、设置卡路由（`/dsh-takeover/*`）、locale 命名空间、文档全量切换；协议层（`handoff: 1`、`handoff_push` / `handoff_inbox`、`~/.handoff/`）不变
- 收件箱列表重设计：去外框的列表行（hover / 展开浅底色）、行点击展开「目标」段预览、时间智能格式（当天只显时刻）

### 新增
- 品牌图标换接管意象（双箭头 » 进格 |，`assets/icon.svg` 与设置卡内联同步）
- dsh 宿主来源使用官方鲸尾标（取自宿主 web UI brandMark），`DeepSeek Harness` 规范标签
- README 双语「为什么叫 takeover」命名故事

### 修正
- 全仓审查：安装命令失效 tag、设置卡描述停留在三区、六家残留、双 lockfile、词典漏译无拦截（新增 `tests/locales.spec.ts`：zh/en 键集对齐 + zh 值必含中文）
- 展开态 preview 挤压标题的 flex 回归

## [0.4.x] — 2026-10-01

- **0.4.0** 仓库与插件改名 dsh-baton → dsh-takeover；版本对齐（远端此前已发至 0.3.3 同源）
- **0.4.1** 品牌图标接管意象（首版）；窄容器适配（≤430px 命令单列）；pending 行键盘可达（role/tabIndex/Enter+Space）；smoke 与 harness 测试脚本旧账校正
- **0.4.2** 界面词零英文：待取件 / 已消费 / 编号徽章进词典；术语规范成文（`locales.ts`：界面词全走词典、命令与工具名是标识符不译、品牌词不译）
- **0.4.3 / 0.4.4** 收件箱卡片首版重排；展开态 preview 挤压标题的 flex 回归修复

## [0.3.0] — 2026-10-01

- 设置卡接入宿主 i18n：zh / en 词典全量，文案经 `ctx.locale.bind` 取词，语言切换实时重渲染（宿主 locale 缺席回退静态 zh）
- pi 图标换官方 pi.dev 矢量（`logo-auto.svg` 三色几何标）

## [0.2.x] — 2026-09

- **0.2.0** `/handoff` `/inbox` slash 命令 + `foreign_session_read` 六家会话拉取（claude / codex / opencode / zcode / pi / workbuddy）
- **0.2.1** 增至八家（+cursor / +grok）
- **0.2.2** 设置卡：收件箱概览 + 八家支持矩阵 + provider 开关（持久化 `config.json`）
- **0.2.3** 品牌图标 + 设置卡视觉打磨

## [0.1.x] — 2026-09

- `handoff: 1` 协议落地：`handoff_push` 寄存、`handoff_inbox` 取件、`~/.handoff/` 文件系统总线；与单向导出工具 [dsh-handoff](https://www.npmjs.com/package/dsh-handoff) 并行，后者不并入本插件

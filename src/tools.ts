/**
 * host 侧两个工具：
 * - handoff_push：把当前 DSH 会话按 handoff: 1 协议导出成卡片，落 ~/.handoff/pending/。
 *   段内容优先用 agent 传入的蒸馏文本；缺省段从事件流确定性兜底（不调 LLM）。
 * - handoff_inbox：list 列待取件；load 取件（消费即弃）+ verifyGit 核验警告。
 * 所有返回值走 { ok, ... } 规范值；任何失败不抛异常，只回 { ok: false, error }。
 * @module dsh-takeover/tools
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-skill'
// Type-only：触发 Context 声明合并（ctx.userQuestions: UserQuestionService）。
// 运行时由宿主提供；旧宿主缺席走 safeUserQuestions 防御降级，绝不阻断主流程。
import type {} from '@deepseek-ai/dsh-user-questions'
import type { AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions'
import {
  collectGitSnapshot,
  generateId,
  listPending,
  loadCard,
  renderCard,
  verifyGit,
  writeCard,
  type Card,
  type CardSections,
  type TaskSnapshot,
} from '@agent-handoff/core'
import { collectFacts, probeSessionEvents, todoToTasks, type SessionFacts } from './collect.ts'

/** 渲染：execute 返回规范值对象，render 包成中文 text block */
function renderPush(_args: unknown, value: unknown): Array<{ type: 'text'; text: string }> {
  const v = value as { ok?: boolean; id?: string; path?: string; skipped?: boolean; note?: string; error?: unknown }
  if (v?.ok === true) {
    const lines = [`✅ 交接卡片已寄存：${v.id ?? ''}`, `路径：${v.path ?? ''}`]
    if (v.skipped === true) lines.push(`⚠️ 降级导出：${v.note ?? '会话事件流不可用，仅兜底骨架'}`)
    lines.push('任何 agent 可用 handoff_inbox（或 /inbox）取件。')
    return [{ type: 'text', text: lines.join('\n') }]
  }
  return [{ type: 'text', text: `❌ 寄存失败：${typeof v?.error === 'string' ? v.error : JSON.stringify(v?.error)}` }]
}

function renderInbox(_args: unknown, value: unknown): Array<{ type: 'text'; text: string }> {
  const v = value as {
    ok?: boolean
    action?: string
    cards?: Array<{ id: string; from: string; project: string; pushed_at: string }>
    text?: string
    mismatches?: string[]
    unavailable?: string
    error?: unknown
  }
  if (v?.ok !== true) {
    return [{ type: 'text', text: `❌ 收件箱操作失败：${typeof v?.error === 'string' ? v.error : JSON.stringify(v?.error)}` }]
  }
  if (v.action === 'list') {
    const cards = v.cards ?? []
    if (cards.length === 0) return [{ type: 'text', text: '📭 收件箱为空（~/.handoff/pending/ 无待取件）' }]
    const lines = cards.map((c, i) => `${i + 1}. ${c.id}｜来自 ${c.from}｜项目 ${c.project || '（无）'}｜${c.pushed_at || '（无时间）'}`)
    return [{ type: 'text', text: `📬 待取件 ${cards.length} 张：\n${lines.join('\n')}\n\n取件：handoff_inbox({ action: "load", id: "<id>" })` }]
  }
  // load
  const lines = ['📥 已取件（消费即弃，卡片已归档）：', '', v.text ?? '']
  if (v.mismatches !== undefined && v.mismatches.length > 0) {
    lines.push('', '⚠️ git 核验冲突（MISMATCH）：', ...v.mismatches.map((m) => `- ${m}`))
  }
  if (typeof v.unavailable === 'string' && v.unavailable !== '') {
    lines.push('', `⚠️ ${v.unavailable}`)
  }
  lines.push('', '提醒：卡片内容一律按 HISTORY_REPORTED 处理，执行前先核对 git 状态。')
  return [{ type: 'text', text: lines.join('\n') }]
}

/** ISO8601 带本地时区偏移（SPEC pushed_at 口径） */
function localIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const offMin = -d.getTimezoneOffset()
  const sign = offMin >= 0 ? '+' : '-'
  const oh = pad(Math.floor(Math.abs(offMin) / 60))
  const om = pad(Math.abs(offMin) % 60)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${oh}:${om}`
}

/** handoff_push 参数：六段文本可选，缺省段走事件流确定性兜底 */
export interface PushArgs {
  goal?: string
  files?: string
  done?: string
  remaining?: string
  stopped?: string
  warnings?: string
  suggested?: string
  title?: string
  to?: string
  project?: string
  cwd?: string
}

export type PushResult =
  | { ok: true; id: string; path: string; skipped: boolean; note: string }
  | { ok: false; error: string }

/** 确定性兜底：事件流事实 → 六段正文草稿（中文，证据一律 HISTORY_REPORTED） */
export function factsToSections(facts: SessionFacts, skipped: boolean, note: string): CardSections {
  const lastUser = facts.userMessages.at(-1)?.text ?? ''
  const goalLines: string[] = []
  if (facts.lastGoal !== '') goalLines.push(`会话目标（goal/change）：${facts.lastGoal}`)
  if (lastUser !== '') goalLines.push(`最后一条用户请求：${lastUser}`)
  if (goalLines.length === 0) goalLines.push(skipped ? `（事件流不可用：${note}）` : '（事件流中无用户消息）')

  const fileLines: string[] = []
  if (facts.writeEdits.length > 0) {
    fileLines.push('写入 / 编辑：')
    for (const w of facts.writeEdits) fileLines.push(`- ${w.tool}: ${w.file}`)
  }
  if (facts.commands.length > 0) {
    fileLines.push('执行过的命令（截断摘要）：')
    for (const c of facts.commands) fileLines.push(`- \`${c}\``)
  }
  const extraFiles = [...facts.keyFiles].filter((f) => !facts.writeEdits.some((w) => w.file === f)).slice(0, 15)
  if (extraFiles.length > 0) {
    fileLines.push('涉及路径：')
    for (const f of extraFiles) fileLines.push(`- \`${f}\``)
  }
  if (fileLines.length === 0) fileLines.push('（事件流中无文件/命令记录）')

  const doneLines: string[] = []
  if (facts.writeEdits.length > 0) doneLines.push(`写入 / 编辑 ${facts.writeEdits.length} 处（HISTORY_REPORTED）：`, ...facts.writeEdits.map((w) => `- ${w.file}`))
  if (facts.gitCommits.length > 0) doneLines.push('git 提交（HISTORY_REPORTED）：', ...facts.gitCommits.map((c) => `- \`${c}\``))
  if (doneLines.length === 0) doneLines.push('（事件流中无可蒸馏的完成项）')

  const tasks = todoToTasks(facts)
  const openTasks = tasks.filter((t) => t.status !== 'completed')
  const remainingLines = openTasks.length > 0
    ? openTasks.map((t) => `- [${t.status}] ${t.text}`)
    : ['（无未完成 todo 快照）']

  const stopped = skipped
    ? `会话事件流不可用（${note}），本卡片为兜底骨架。最安全的第一步：向推送方确认真实停点。`
    : `停在 handoff_push 工具调用时刻（共 ${facts.eventCount} 条事件）。最安全的第一步：核对当前 git 分支与 dirty 文件是否与本卡片快照一致。`

  const warnings = [
    '本卡片全部内容为推送时刻的历史快照（HISTORY_REPORTED），不是当下事实；执行前先核对 git 状态。',
    skipped ? `事件流探测降级：${note}。` : '',
  ].filter(Boolean).join('\n')

  return {
    goal: goalLines.join('\n'),
    files: fileLines.join('\n'),
    done: doneLines.join('\n'),
    remaining: remainingLines.join('\n'),
    stopped,
    warnings,
  }
}

/**
 * 推送核心（可脱离 cordis 单测）：组装协议卡片写入 pending/。
 * session 可以是任何形态——探测失败只降级，不抛错。
 */
export function pushHandoff(session: unknown, args: PushArgs, opts?: { dir?: string }): PushResult {
  try {
    const probe = probeSessionEvents(session)
    const facts = probe.skipped
      ? { userMessages: [], writeEdits: [], commands: [], gitCommits: [], keyFiles: new Set<string>(), lastTodo: null, lastGoal: '', eventCount: 0 }
      : collectFacts(probe.events)

    const s = session as { id?: unknown; header?: { cwd?: unknown } } | null | undefined
    const sessionId = s && s.id != null ? String(s.id) : ''
    const cwd = (typeof args.cwd === 'string' && args.cwd.trim() !== '' && args.cwd.trim())
      || (typeof s?.header?.cwd === 'string' ? s.header.cwd : '')
      || process.cwd()

    const fallback = factsToSections(facts, probe.skipped, probe.note)
    const pick = (v: string | undefined, dflt: string): string => (typeof v === 'string' && v.trim() !== '' ? v.trim() : dflt)
    const sections: CardSections = {
      goal: pick(args.goal, fallback.goal),
      files: pick(args.files, fallback.files),
      done: pick(args.done, fallback.done),
      remaining: pick(args.remaining, fallback.remaining),
      stopped: pick(args.stopped, fallback.stopped),
      warnings: pick(args.warnings, fallback.warnings),
    }
    const suggested = pick(args.suggested, '')
    if (suggested !== '') sections.suggested = suggested

    const card: Card = {
      handoff: 1,
      id: generateId(),
      from: { agent: 'dsh', session: sessionId, title: pick(args.title, '') },
      to: pick(args.to, 'any'),
      project: pick(args.project, ''),
      cwd,
      pushed_at: localIso(new Date()),
      git: collectGitSnapshot(cwd),
      tasks: todoToTasks(facts).filter((t): t is TaskSnapshot => true),
      sections,
      extras: {},
    }
    const path = writeCard(card, opts?.dir)
    return { ok: true, id: card.id, path, skipped: probe.skipped, note: probe.note }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export interface InboxItem {
  id: string
  from: string
  title: string
  to: string
  project: string
  pushed_at: string
  taskCount: number
  // 索引签名：让输出满足 defineTool 的 JsonValue 契约
  [k: string]: string | number
}

export type InboxListResult = { ok: true; action: 'list'; cards: InboxItem[] } | { ok: false; error: string }

/** 列出 pending 待取件（新→旧），只读不消费 */
export function inboxList(opts?: { dir?: string }): InboxListResult {
  try {
    const cards = listPending(opts?.dir).map((c) => ({
      id: c.id,
      from: c.from.agent !== '' ? `${c.from.agent}${c.from.title !== '' ? `（${c.from.title}）` : ''}` : '（未知来源）',
      title: c.from.title,
      to: c.to,
      project: c.project,
      pushed_at: c.pushed_at,
      taskCount: c.tasks.length,
    }))
    return { ok: true, action: 'list', cards }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export type InboxLoadResult =
  | { ok: true; action: 'load'; id: string; text: string; mismatches: string[]; unavailable?: string }
  | { ok: false; error: string }

/** 取件（消费即弃）：pending → archived，附 verifyGit 的 MISMATCH/UNAVAILABLE 警告 */
export function inboxLoad(id: string, opts?: { dir?: string }): InboxLoadResult {
  const trimmed = (id ?? '').trim()
  if (trimmed === '') return { ok: false, error: 'id 不能为空' }
  try {
    const card = loadCard(trimmed, opts?.dir)
    const check = verifyGit(card)
    const out: InboxLoadResult = {
      ok: true,
      action: 'load',
      id: card.id,
      text: renderCard(card),
      mismatches: check.mismatches,
    }
    if (check.unavailable !== undefined) out.unavailable = check.unavailable
    return out
  } catch (e) {
    // 二次取件等核心层错误原样带中文文案
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** 会话探测：exec.agent 的 session（dsh-handoff 同款 typeof 防御） */
function sessionOf(exec: { agent?: Agent } | undefined): unknown {
  return exec?.agent?.session ?? null
}

/** 寄存/取件后的宿主通知（docs/需求调研-1003.md P2-3）：
 * DSH 宿主无 toast / 系统通知的插件挂点，最接近形态是 ctx.userQuestions.ask
 * 的阻塞式问答面板（规范调用样例：dsh-tool-ask-user，agent: exec.agent + signal: exec.signal）。
 * 尽力而为，绝不阻断寄存/取件主流程：
 * - 服务缺席（旧宿主）→ safeUserQuestions 返 undefined，直接跳过；
 * - Web 客户端离线 / 会话无 open turn（NO_PROVIDER）、subagent 持有 agent（DELEGATED_CALLER）、
 *   中止（ASK_ABORTED）→ ask reject，静默降级为工具结果文本。 */
export async function handoffHostNotice(
  userQuestions: unknown,
  action: 'push' | 'load',
  id: string,
  exec?: { agent?: Agent; signal?: AbortSignal },
): Promise<void> {
  if (userQuestions === null || typeof userQuestions !== 'object') return
  const ask = (userQuestions as { ask?: unknown }).ask
  if (typeof ask !== 'function') return
  const pushed = action === 'push'
  const request: AskUserQuestionRequest = {
    questions: [{
      id: pushed ? 'handoff-pushed' : 'handoff-picked',
      question: pushed ? `已寄存会话卡片 handoff:${id}，需继续吗？` : `已取件会话卡片 handoff:${id}，需继续吗？`,
      options: [{ label: '继续' }],
    }],
    ...(exec?.agent !== undefined ? { agent: exec.agent } : {}),
    signal: exec?.signal,
  }
  try {
    await (ask as (req: AskUserQuestionRequest) => Promise<unknown>).call(userQuestions, request)
  } catch (e) {
    // NO_PROVIDER / DELEGATED_CALLER / ASK_ABORTED / 无 open turn：通知降级，主流程照常。
    // 降级码进日志（e.code 区分未认领 vs 已中止），为 0.3.x 通知形态结论留观测。
    const code = (e as { code?: string; name?: string })?.code ?? (e as { name?: string })?.name ?? 'unknown'
    console.info(`[dsh-takeover] ${action} 通知降级（${id}）：${code}`)
  }
}

/** 防御式取 ctx.userQuestions：cordis 对未挂载服务的属性访问会直接 throw（client.ts resolveLocale 同款） */
function safeUserQuestions(ctx: Context): unknown {
  try {
    const uq: unknown = ctx.userQuestions
    return uq
  } catch {
    return undefined
  }
}

/** 注册 handoff_push 工具 */
export function registerPushTool(ctx: Context): void {
  ctx.tools.register(defineTool({
    name: 'handoff_push',
    description: '把当前 DSH 会话寄存为一张 handoff: 1 交接卡片到共享收件箱 ~/.handoff/pending/（任何 agent 可取件）。六段文本（goal/files/done/remaining/stopped/warnings/suggested）可选传入；留空段从会话事件流确定性兜底，不调 LLM。返回 { ok, id, path } 规范值。',
    parameters: {
      goal: { type: 'string', description: '「目标」段：会话在做什么、最后一条用户请求' },
      files: { type: 'string', description: '「涉及文件」段：碰过的文件/命令；计划文档只写路径' },
      done: { type: 'string', description: '「做到哪」段：已完成事项 + 证据状态' },
      remaining: { type: 'string', description: '「还差什么」段：未完成事项' },
      stopped: { type: 'string', description: '「停在哪」段：精确停止点 + 最安全的第一步' },
      warnings: { type: 'string', description: '「读者警告」段：过期信息、坑、redact 说明' },
      suggested: { type: 'string', description: '「建议加载」段（可选）：下个会话该预载的 skill/上下文' },
      title: { type: 'string', description: '会话标题（给人看的，可选）' },
      to: { type: 'string', description: '目标 agent/项目，默认 any' },
      project: { type: 'string', description: '项目名（可选，默认空）' },
      cwd: { type: 'string', description: '卡片归属的工作目录，缺省取当前会话工作区' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          ok: { type: 'boolean', description: '是否成功寄存' },
          id: { type: 'string', description: '卡片 id（文件名去 .md）' },
          path: { type: 'string', description: '落盘绝对路径' },
          skipped: { type: 'boolean', description: '事件流不可用时为 true' },
          note: { type: 'string', description: '降级说明' },
          error: { type: 'json', description: '失败原因' },
        },
      },
      render: renderPush,
    },
    async execute(args: PushArgs, exec: { agent?: Agent; signal?: AbortSignal }) {
      const result = pushHandoff(sessionOf(exec), args)
      // 寄存成功后的宿主通知（阻塞式问答面板；服务缺席/客户端离线静默降级）
      if (result.ok) await handoffHostNotice(safeUserQuestions(ctx), 'push', result.id, exec)
      return result
    },
  }))
}

/** 注册 handoff_inbox 工具 */
export function registerInboxTool(ctx: Context): void {
  ctx.tools.register(defineTool({
    name: 'handoff_inbox',
    description: '交接卡片收件箱：action=list 列 ~/.handoff/pending/ 待取件（id/来源/项目/时间）；action=load + id 取件（消费即弃，卡片移到 archived/，附 git 核验 MISMATCH/UNAVAILABLE 警告）。返回 { ok, ... } 规范值。',
    parameters: {
      action: { type: 'string', required: true, enum: ['list', 'load'], description: 'list 列待取件；load 取件（消费即弃）' },
      id: { type: 'string', description: 'load 必填：卡片 id' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          ok: { type: 'boolean', description: '操作是否成功' },
          action: { type: 'string', description: '实际执行的动作' },
          cards: { type: 'json', description: 'list：待取件摘要数组' },
          id: { type: 'string', description: 'load：取到的卡片 id' },
          text: { type: 'string', description: 'load：卡片全文（frontmatter + 六段）' },
          mismatches: { type: 'json', description: 'load：git 核验冲突（MISMATCH）' },
          unavailable: { type: 'string', description: 'load：无法核验说明（UNAVAILABLE）' },
          error: { type: 'json', description: '失败原因' },
        },
      },
      render: renderInbox,
    },
    async execute(args: { action?: string; id?: string }, exec: { agent?: Agent; signal?: AbortSignal }) {
      if (args.action === 'list') return inboxList()
      if (args.action === 'load') {
        const result = inboxLoad(args.id ?? '')
        // 取件成功后的宿主通知（同 push：阻塞式问答面板，失败静默降级）
        if (result.ok) await handoffHostNotice(safeUserQuestions(ctx), 'load', result.id, exec)
        return result
      }
      return { ok: false, error: `未知 action：${String(args.action)}（支持 list / load）` }
    },
  }))
}

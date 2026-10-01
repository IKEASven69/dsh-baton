/**
 * 设置卡支撑层（host 半，可脱离 cordis 单测）：
 * - provider 开关：持久化在 <HANDOFF_HOME>/config.json（与 pending/archived 同屋，
 *   重启生效）；foreign_session_read 对停用家返回规范错误值「已停用」。
 * - buildState：设置卡 /dsh-takeover/state 的组装逻辑——收件箱概览 + 八家支持矩阵。
 * - clearArchived：清空 archived/ 全部 .md，返回清除份数。
 * 任何一步失败都回规范值 / 降级值，绝不抛出。
 * @module dsh-takeover/settings
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { archivedDir, listArchived, listPending, resolveHome } from '@agent-handoff/core'
import { FOREIGN_PROVIDERS, PROVIDER_TO_ADAPTER, type ForeignProvider, type ForeignReaders } from './foreign.ts'

// 停用规范错误值文案在 foreign.ts（disabledError），本模块只管开关存取与状态组装

/** 开关文件形态：只记停用名单（默认全开，未知条目载入时丢弃） */
export interface TakeoverSwitches {
  disabledProviders: string[]
}

/** config.json 路径（HANDOFF_HOME 优先，否则 ~/.handoff） */
export function switchesPath(dir?: string): string {
  return join(resolveHome(dir), 'config.json')
}

/** 读开关：文件缺失/损坏一律视为默认全开 */
export function loadSwitches(dir?: string): TakeoverSwitches {
  try {
    const p = switchesPath(dir)
    if (!existsSync(p)) return { disabledProviders: [] }
    const raw = JSON.parse(readFileSync(p, 'utf-8')) as { disabledProviders?: unknown }
    const list = Array.isArray(raw.disabledProviders) ? raw.disabledProviders : []
    return {
      disabledProviders: list.filter(
        (x): x is string => typeof x === 'string' && (FOREIGN_PROVIDERS as readonly string[]).includes(x),
      ),
    }
  } catch {
    return { disabledProviders: [] }
  }
}

/** 写开关（原子性从简：单文件直写，损坏风险由 loadSwitches 兜底） */
export function saveSwitches(switches: TakeoverSwitches, dir?: string): void {
  const home = resolveHome(dir)
  mkdirSync(home, { recursive: true })
  writeFileSync(switchesPath(dir), `${JSON.stringify(switches, null, 2)}\n`, 'utf-8')
}

/** 某家是否启用（默认启用；只认八家名单内的停用条目） */
export function isProviderEnabled(provider: string, dir?: string): boolean {
  return !loadSwitches(dir).disabledProviders.includes(provider)
}

/** 切某家开关并持久化；未知 provider 抛中文错（路由层转 400） */
export function setProviderEnabled(provider: string, enabled: boolean, dir?: string): TakeoverSwitches {
  if (!(FOREIGN_PROVIDERS as readonly string[]).includes(provider)) {
    throw new Error(`未知 provider：${provider}（支持：${FOREIGN_PROVIDERS.join(' / ')}）`)
  }
  const cur = loadSwitches(dir)
  const set = new Set(cur.disabledProviders)
  if (enabled) set.delete(provider)
  else set.add(provider)
  const next: TakeoverSwitches = { disabledProviders: [...set].sort() }
  saveSwitches(next, dir)
  return next
}

// ---------------------------------------------------------------------------
// /dsh-takeover/state 组装
// ---------------------------------------------------------------------------

/** 收件箱概览的待取件行 */
export interface PendingRow {
  id: string
  agent: string
  title: string
  project: string
  pushedAt: string
  /** 目标段（sections.goal）预览，截 240 字；空段回退 done 段 */
  preview: string
}

/** 预览截断长度（服务端截，避免长卡片把 state 撑大） */
const PREVIEW_MAX = 240

function previewOf(c: { sections: { goal: string; done: string } }): string {
  const raw = c.sections.goal !== '' ? c.sections.goal : c.sections.done
  return raw.length > PREVIEW_MAX ? `${raw.slice(0, PREVIEW_MAX)}…` : raw
}

/** 支持矩阵行：本机是否支持 / 发现的会话数 / 启用开关 */
export interface ProviderRow {
  name: ForeignProvider
  supported: boolean
  /** 发现的会话数；探测失败为 -1（前端显示「—」） */
  sessions: number
  enabled: boolean
  note: string
}

export interface TakeoverState {
  pending: PendingRow[]
  archivedCount: number
  providers: ProviderRow[]
}

/**
 * 组装设置卡状态（纯函数核心，读取层与目录都可注入）：
 * 单家探测失败只影响该行，不拖垮整体。
 */
export function buildState(readers: ForeignReaders, dir?: string): TakeoverState {
  const switches = loadSwitches(dir)

  const pending: PendingRow[] = listPending(dir).map((c) => ({
    id: c.id,
    agent: c.from.agent !== '' ? c.from.agent : '（未知来源）',
    title: c.from.title,
    project: c.project,
    pushedAt: c.pushed_at,
    preview: previewOf(c),
  }))

  const providers: ProviderRow[] = FOREIGN_PROVIDERS.map((name) => {
    const adapter = PROVIDER_TO_ADAPTER[name]
    let supported = false
    let note = ''
    let sessions = -1
    try {
      const n = readers.adapterNote(adapter)
      supported = n.supported
      note = n.note
    } catch (e) {
      note = e instanceof Error ? e.message : String(e)
    }
    if (supported) {
      try {
        sessions = readers.listSessions(adapter).length
      } catch {
        sessions = -1
      }
    }
    return { name, supported, sessions, enabled: !switches.disabledProviders.includes(name), note }
  })

  return { pending, archivedCount: listArchived(dir).length, providers }
}

/** 清空 archived/：删除全部 .md，返回清除份数（目录不存在=0，不视为错误） */
export function clearArchived(dir?: string): number {
  const ad = archivedDir(dir)
  if (!existsSync(ad)) return 0
  let cleared = 0
  for (const f of readdirSync(ad)) {
    if (!f.endsWith('.md')) continue
    rmSync(join(ad, f))
    cleared += 1
  }
  return cleared
}

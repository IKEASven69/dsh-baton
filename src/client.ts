/**
 * dsh-baton 浏览器半：设置页「dsh-baton」卡。
 * 三区：收件箱概览（pending 列表 + archived 计数 + 清空归档）/ 支持矩阵
 * （八家读取器：supported、会话数、启用开关）/ 开关语义说明。
 * 数据通路走同源 fetch 直连 host 路由 /dsh-baton/*（dsh-hippo 先例）。
 * 取件不在设置卡做——会话里 /inbox。
 * @module dsh-baton/client
 */

import { createElement, useEffect, useState } from 'react'
// 0.2.0：一方客户端插件直接收 cordis Context。
import type { Context } from '@deepseek-ai/cordis'
// Type-only: ctx.slots（SlotRegistry 服务）由 ui-renderer 的 cordis Context 合并提供。
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { BatonState, PendingRow, ProviderRow } from './settings.ts'

export const inject = ['slots']

// ---------------------------------------------------------------------------
// 样式：颜色尽量继承宿主令牌（--accent/--border/--muted），兜底值保证浅色可读
// ---------------------------------------------------------------------------

const CSS = `
.bt-panel { display: flex; flex-direction: column; gap: 14px; padding: 4px 0;
  --bt-a: var(--accent, #2563eb); --bt-ok: #15803d; --bt-warn: #b45309; --bt-err: #d93025;
  --bt-line: var(--border, rgba(127,127,127,.28)); --bt-mut: var(--muted, rgba(127,127,127,.92));
  --bt-card: var(--bg, rgba(127,127,127,.05)); }
.bt-card { background: var(--bt-card); border: 1px solid var(--bt-line); border-radius: 12px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.bt-head { display: flex; align-items: center; gap: 10px; }
.bt-logo { width: 34px; height: 34px; border-radius: 9px; flex: none; display: grid; place-items: center;
  background: linear-gradient(135deg, var(--bt-a), #7c3aed); color: #fff; font-weight: 800; font-size: 14px; }
.bt-title { font-weight: 700; font-size: 14px; }
.bt-sub { font-size: 12px; color: var(--bt-mut); }
.bt-spacer { flex: 1; }
.bt-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 999px;
  color: var(--bt-mut); border: 1px solid var(--bt-line); }
.bt-btn { cursor: pointer; border-radius: 9px; font-size: 12.5px; padding: 6px 14px;
  border: 1px solid var(--bt-line); background: transparent; color: inherit; white-space: nowrap; }
.bt-btn:disabled { opacity: .5; cursor: default; }
.bt-btn:not(:disabled):hover { border-color: var(--bt-a); color: var(--bt-a); }
.bt-btn-danger:not(:disabled):hover { border-color: var(--bt-err); color: var(--bt-err); }
.bt-btn-confirm { background: var(--bt-err); border-color: transparent; color: #fff; }
.bt-btn-confirm:not(:disabled):hover { color: #fff; }
.bt-banner { font-size: 12px; line-height: 1.6; border-radius: 9px; padding: 8px 12px; }
.bt-banner-info { color: var(--bt-mut); background: rgba(127,127,127,.08); }
.bt-banner-err { color: var(--bt-err); background: rgba(211,47,47,.08); }
.bt-rows { display: flex; flex-direction: column; gap: 6px; }
.bt-pending { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 2px 10px; align-items: baseline;
  border: 1px solid var(--bt-line); border-radius: 9px; padding: 8px 11px; font-size: 12.5px; }
.bt-pending-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-pending-meta { font-size: 11px; color: var(--bt-mut); grid-column: 1 / -1; display: flex; gap: 10px; flex-wrap: wrap; }
.bt-matrix { display: flex; flex-direction: column; }
.bt-mrow { display: grid; grid-template-columns: 110px 1fr auto auto; gap: 10px; align-items: center;
  padding: 7px 2px; font-size: 12.5px; border-bottom: 1px dashed var(--bt-line); }
.bt-mrow:last-child { border-bottom: none; }
.bt-mname { font-weight: 600; font-family: ui-monospace, monospace; font-size: 12px; }
.bt-mstat { font-size: 11.5px; color: var(--bt-mut); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-pill { font-size: 10.5px; font-weight: 600; padding: 1px 8px; border-radius: 999px; flex: none; }
.bt-pill-ok { color: var(--bt-ok); background: rgba(21,128,61,.1); border: 1px solid rgba(21,128,61,.35); }
.bt-pill-no { color: var(--bt-warn); background: rgba(180,83,9,.1); border: 1px solid rgba(180,83,9,.35); }
.bt-toggle { cursor: pointer; width: 36px; height: 20px; border-radius: 999px; border: 1px solid var(--bt-line);
  background: rgba(127,127,127,.18); position: relative; padding: 0; transition: background .15s ease, border-color .15s ease; }
.bt-toggle:disabled { opacity: .45; cursor: default; }
.bt-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
  border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: left .15s ease; }
.bt-toggle-on { background: var(--bt-a); border-color: transparent; }
.bt-toggle-on::after { left: 18px; }
.bt-note { font-size: 11.5px; color: var(--bt-mut); line-height: 1.6; border-left: 2px solid var(--bt-line);
  padding-left: 10px; }
`

// ---------------------------------------------------------------------------
// 数据获取
// ---------------------------------------------------------------------------

async function getState(): Promise<BatonState> {
  const res = await fetch('/dsh-baton/state', { cache: 'no-store' })
  const body = await res.json() as BatonState | { error: string }
  if (!res.ok || 'error' in body) throw new Error('error' in body ? body.error : `HTTP ${res.status}`)
  return body
}

async function post<T extends object>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json() as T | { error: string }
  if (!res.ok || 'error' in data) throw new Error('error' in data ? data.error : `HTTP ${res.status}`)
  return data
}

function fmtTime(iso: string): string {
  if (iso === '') return '（无时间）'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ---------------------------------------------------------------------------
// 展示件
// ---------------------------------------------------------------------------

function PendingList({ rows }: { rows: PendingRow[] }): ReturnType<typeof createElement> {
  if (rows.length === 0) {
    return createElement('div', { className: 'bt-banner bt-banner-info' },
      '📭 收件箱为空。取件不在此进行——在会话里用 /inbox 消费即取。')
  }
  return createElement('div', { className: 'bt-rows' },
    ...rows.map((p) =>
      createElement('div', { key: p.id, className: 'bt-pending', title: p.id },
        createElement('span', { className: 'bt-pending-title' }, p.title !== '' ? p.title : p.id),
        createElement('span', { className: 'bt-sub' }, fmtTime(p.pushedAt)),
        createElement('span', { className: 'bt-pending-meta' },
          createElement('span', null, `来源 ${p.agent}`),
          p.project !== '' ? createElement('span', null, `项目 ${p.project}`) : null,
          createElement('span', null, `id ${p.id}`),
        ),
      ),
    ),
  )
}

function ProviderMatrix({ rows, busy, onToggle }: {
  rows: ProviderRow[]
  busy: string | null
  onToggle: (name: string, enabled: boolean) => void
}): ReturnType<typeof createElement> {
  return createElement('div', { className: 'bt-matrix' },
    ...rows.map((r) =>
      createElement('div', { key: r.name, className: 'bt-mrow', title: r.note !== '' ? r.note : undefined },
        createElement('span', { className: 'bt-mname' }, r.name),
        createElement('span', { className: 'bt-mstat' },
          r.supported
            ? `${r.sessions >= 0 ? `${r.sessions} 个会话` : '会话数探测失败'}`
            : `本机不支持${r.note !== '' ? `：${r.note}` : ''}`),
        createElement('span', { className: `bt-pill ${r.supported ? 'bt-pill-ok' : 'bt-pill-no'}` },
          r.supported ? '支持' : '不可用'),
        createElement('button', {
          className: `bt-toggle${r.enabled ? ' bt-toggle-on' : ''}`,
          role: 'switch',
          'aria-checked': r.enabled,
          'aria-label': `${r.name} 读取开关`,
          disabled: busy !== null,
          title: r.enabled ? `点击停用 ${r.name}（foreign_session_read 将返回「已停用」）` : `点击启用 ${r.name}`,
          onClick: () => { onToggle(r.name, !r.enabled) },
        }),
      ),
    ),
  )
}

function Panel(): ReturnType<typeof createElement> {
  const [state, setState] = useState<BatonState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const reload = (): void => {
    void getState().then(
      (s) => { setState(s); setError(null) },
      (e: unknown) => { setError(e instanceof Error ? e.message : String(e)) },
    )
  }
  useEffect(reload, [])

  const toggle = (name: string, enabled: boolean): void => {
    setBusy(name)
    void post<{ ok: true; state: BatonState }>('/dsh-baton/provider', { provider: name, enabled })
      .then((r) => { setState(r.state); setError(null) })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : String(e)) })
      .finally(() => { setBusy(null) })
  }

  const clear = (): void => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => { setConfirmClear(false) }, 3000)
      return
    }
    setConfirmClear(false)
    setBusy('clear')
    void post<{ ok: true; cleared: number }>('/dsh-baton/clear-archived', {})
      .then(() => { reload() })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : String(e)) })
      .finally(() => { setBusy(null) })
  }

  const archivedCount = state?.archivedCount ?? 0

  return createElement('div', { className: 'bt-panel' },
    createElement('style', null, CSS),

    // 头卡：标识 + 刷新
    createElement('div', { className: 'bt-card' },
      createElement('div', { className: 'bt-head' },
        createElement('span', { className: 'bt-logo' }, '棒'),
        createElement('span', null,
          createElement('div', { className: 'bt-title' }, 'dsh-baton 会话接力'),
          createElement('div', { className: 'bt-sub' }, '交接卡片收件箱 + 八家外部 agent 会话读取器开关'),
        ),
        createElement('span', { className: 'bt-spacer' }),
        createElement('button', { className: 'bt-btn', onClick: reload, disabled: busy !== null }, '⟳ 刷新'),
      ),
      error !== null ? createElement('div', { className: 'bt-banner bt-banner-err' }, error) : null,
    ),

    // 收件箱概览
    createElement('div', { className: 'bt-card' },
      createElement('div', { className: 'bt-head' },
        createElement('span', { className: 'bt-title', style: { fontSize: 13 } }, '收件箱概览'),
        createElement('span', { className: 'bt-badge' }, `pending ${state?.pending.length ?? '…'}`),
        createElement('span', { className: 'bt-badge' }, `archived ${archivedCount}`),
        createElement('span', { className: 'bt-spacer' }),
        createElement('button', {
          className: `bt-btn bt-btn-danger${confirmClear ? ' bt-btn-confirm' : ''}`,
          disabled: busy !== null || archivedCount === 0,
          onClick: clear,
          title: '删除 archived/ 下全部已消费卡片（不可恢复）',
        }, confirmClear ? `确认清空 ${archivedCount} 张？` : '清空 archived'),
      ),
      state !== null ? createElement(PendingList, { rows: state.pending }) : createElement('div', { className: 'bt-sub' }, '加载中…'),
    ),

    // 支持矩阵
    createElement('div', { className: 'bt-card' },
      createElement('div', { className: 'bt-head' },
        createElement('span', { className: 'bt-title', style: { fontSize: 13 } }, '支持矩阵（八家读取器）'),
      ),
      state !== null
        ? createElement(ProviderMatrix, { rows: state.providers, busy, onToggle: toggle })
        : createElement('div', { className: 'bt-sub' }, '加载中…'),
      createElement('div', { className: 'bt-note' },
        '💡 关掉的 provider：foreign_session_read 对该家返回规范错误值「已停用」；' +
        '/resume-* 对应 skill 的指引文本为静态内容，停用状态由工具报错兜住，模型可见。'),
    ),
  )
}

export function apply(ctx: Context): void {
  // 防御：宿主若没有 slots 服务（SlotRegistry 形态不符）只告警降级，
  // 不把整个客户端插件树拖崩。
  const slots: unknown = ctx.slots
  if (
    slots === null || typeof slots !== 'object'
    || typeof (slots as { inject?: unknown }).inject !== 'function'
    || typeof (slots as { register?: unknown }).register !== 'function'
  ) {
    console.warn('[dsh-baton] 宿主未提供可用的 slots 服务（需要 @deepseek-ai/dsh-client-ui-renderer），设置卡跳过挂载')
    return
  }
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    { name: 'settings.section', id: 'dsh-baton', order: 42, label: 'dsh-baton' },
    () => createElement(Panel),
  ))
}

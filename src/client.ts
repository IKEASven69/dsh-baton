/**
 * dsh-baton 浏览器半：设置页「dsh-baton」卡。
 * 四区：命令速览（/handoff · /inbox · /resume-*，直接可见）/ 收件箱概览
 * （pending 列表可展开看目标段预览 + archived 计数 + 清空归档）/ 支持矩阵
 * （八家读取器：规范名+品牌图标、会话数、启用开关）/ 开关语义说明。
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
import { BRAND_FULL_SVG, BRAND_MARKS, PROVIDER_LABEL } from './brand-icons.ts'
import type { BrandMark } from './brand-icons.ts'
import type { BatonState, PendingRow, ProviderRow } from './settings.ts'

export const inject = ['slots']

// ---------------------------------------------------------------------------
// 品牌图标：assets/icon.svg 的内联副本（改图标时两边同步）。
// 圆角方底 + 45° 接力棒 + 中段交接条纹，渐变 #6366F1→#8B5CF6。
// 渐变 id 加 bt- 前缀避免与宿主页面里的 defs 撞名。
// ---------------------------------------------------------------------------

const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="dsh-baton">' +
  '<defs>' +
  '<linearGradient id="bt-bg" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#6366F1"/><stop offset="1" stop-color="#8B5CF6"/>' +
  '</linearGradient>' +
  '<linearGradient id="bt-sheen" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="#ffffff" stop-opacity=".26"/>' +
  '<stop offset=".55" stop-color="#ffffff" stop-opacity="0"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bt-bg)"/>' +
  '<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bt-sheen)"/>' +
  '<rect x="2.75" y="2.75" width="58.5" height="58.5" rx="14.25" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="1.5"/>' +
  '<g transform="rotate(-45 32 32)">' +
  '<rect x="12" y="28" width="40" height="11" rx="5.5" fill="#1e1b4b" opacity=".28"/>' +
  '<rect x="12" y="26.5" width="40" height="11" rx="5.5" fill="#ffffff"/>' +
  '<rect x="30" y="26.5" width="4" height="11" fill="#7c6cf8"/>' +
  '</g></svg>'

// ---------------------------------------------------------------------------
// Provider 图标：八家全部官方矢量（见 brand-icons.ts 的来源清单）。
// 常规形态 = 官方 tile 底色 + 官方 path（fill 逐 path 保真）；
// workbuddy = 官方完整 SVG 整体内嵌（自带渐变圆底）。
// 未知来源（如 dsh 自己）回退中性字母块——那不是品牌冒充，是兜底。
// ---------------------------------------------------------------------------

function providerMark(name: string): BrandMark | null {
  const m = BRAND_MARKS[name]
  return m ?? null
}

function ProviderIcon({ name, size = 20 }: { name: string; size?: number }): ReturnType<typeof createElement> {
  const full = BRAND_FULL_SVG[name]
  if (full !== undefined) {
    return createElement('span', {
      className: 'bt-icon bt-icon-full',
      style: { width: size, height: size },
      title: PROVIDER_LABEL[name] ?? name,
      dangerouslySetInnerHTML: { __html: full },
    })
  }
  const mark = providerMark(name)
  if (mark === null) {
    const letter = name.charAt(0).toUpperCase() || '?'
    return createElement('span', {
      className: 'bt-icon',
      style: { background: '#52525b', width: size, height: size },
      title: PROVIDER_LABEL[name] ?? name,
    }, createElement('span', { className: 'bt-icon-letter' }, letter))
  }
  return createElement('span', {
    className: 'bt-icon',
    style: { background: mark.tile, width: size, height: size },
    title: PROVIDER_LABEL[name] ?? name,
  }, createElement('svg', { viewBox: mark.viewBox, width: Math.round(size * 0.64), height: Math.round(size * 0.64), 'aria-hidden': true },
    ...mark.paths.map((p, i) => createElement('path', { key: i, d: p.d, fill: p.fill }))),
  )
}

// ---------------------------------------------------------------------------
// 样式：颜色尽量继承宿主令牌（--accent/--border/--muted），兜底值保证浅色可读；
// 深色模式下兜底值整体换轴（prefers-color-scheme），宿主令牌在场时天然跟随主题。
// ---------------------------------------------------------------------------

const CSS = `
.bt-panel { display: flex; flex-direction: column; gap: 14px; padding: 4px 0 8px;
  --bt-a: var(--accent, #2563eb); --bt-ok: #15803d; --bt-warn: #b45309; --bt-err: #d93025;
  --bt-line: var(--border, rgba(127,127,127,.28)); --bt-mut: var(--muted, rgba(127,127,127,.92));
  --bt-card: var(--bg, rgba(127,127,127,.05)); --bt-hover: rgba(127,127,127,.07); }
@media (prefers-color-scheme: dark) {
  .bt-panel { --bt-ok: #4ade80; --bt-warn: #fbbf24; --bt-err: #f87171;
    --bt-mut: var(--muted, rgba(255,255,255,.55)); }
}
.bt-card { background: var(--bt-card); border: 1px solid var(--bt-line); border-radius: 12px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.bt-head { display: flex; align-items: center; gap: 10px; }
.bt-logo { width: 36px; height: 36px; border-radius: 9px; flex: none; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.18); }
.bt-logo svg { display: block; }
.bt-title { font-weight: 700; font-size: 14px; }
.bt-sub { font-size: 12px; color: var(--bt-mut); }
.bt-spacer { flex: 1; }
.bt-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 999px;
  color: var(--bt-mut); background: rgba(127,127,127,.12); }
.bt-badge-hot { color: var(--bt-a); background: rgba(99,102,241,.12); }
.bt-btn { cursor: pointer; border-radius: 9px; font-size: 12.5px; padding: 6px 14px;
  border: 1px solid var(--bt-line); background: transparent; color: inherit; white-space: nowrap;
  transition: border-color .15s ease, color .15s ease, background .15s ease; }
.bt-btn:disabled { opacity: .5; cursor: default; }
.bt-btn:not(:disabled):hover { border-color: var(--bt-a); color: var(--bt-a); }
.bt-btn-danger:not(:disabled):hover { border-color: var(--bt-err); color: var(--bt-err); }
.bt-btn-confirm { background: var(--bt-err); border-color: transparent; color: #fff; }
.bt-btn-confirm:not(:disabled):hover { color: #fff; }
.bt-banner { font-size: 12px; line-height: 1.6; border-radius: 9px; padding: 8px 12px; }
.bt-banner-info { color: var(--bt-mut); background: rgba(127,127,127,.08); }
.bt-banner-err { color: var(--bt-err); background: rgba(211,47,47,.08); }
.bt-rows { display: flex; flex-direction: column; gap: 8px; }
.bt-pending { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 3px 10px; align-items: baseline;
  border: 1px solid var(--bt-line); border-radius: 9px; padding: 9px 12px; font-size: 12.5px;
  cursor: pointer; transition: border-color .15s ease, background .15s ease; }
.bt-pending:hover { border-color: var(--bt-a); background: var(--bt-hover); }
.bt-pending-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-pending-chev { font-size: 10px; color: var(--bt-mut); transition: transform .15s ease; justify-self: end; }
.bt-pending-open .bt-pending-chev { transform: rotate(90deg); }
.bt-pending-meta { font-size: 11px; color: var(--bt-mut); opacity: .85; grid-column: 1 / -1; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.bt-src { display: inline-flex; align-items: center; gap: 4px; }
.bt-preview { grid-column: 1 / -1; font-size: 12px; line-height: 1.65; color: inherit; opacity: .88;
  border-left: 2px solid var(--bt-a); padding: 2px 0 2px 10px; margin-top: 4px; white-space: pre-wrap;
  word-break: break-word; display: flex; flex-direction: column; gap: 4px; }
.bt-preview-hint { font-size: 10.5px; color: var(--bt-mut); }
.bt-cmds { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 10px; }
.bt-cmd { display: flex; align-items: center; gap: 8px; min-width: 0; border: 1px solid var(--bt-line);
  border-radius: 8px; padding: 6px 10px; font-size: 12px; background: transparent;
  transition: opacity .15s ease, border-color .15s ease; }
.bt-cmd-key { font-family: ui-monospace, monospace; font-size: 11.5px; font-weight: 600; flex: none; }
.bt-cmd-key-primary { color: var(--bt-a); }
.bt-cmd-desc { color: var(--bt-mut); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-cmd .bt-icon { width: 16px; height: 16px; flex: none; border-radius: 5px; }
.bt-cmd-off { opacity: .42; }
.bt-icon { display: inline-flex; align-items: center; justify-content: center; border-radius: 6px;
  flex: none; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(255,255,255,.14), 0 1px 2px rgba(0,0,0,.16); }
.bt-icon svg { display: block; }
.bt-icon-full { border-radius: 50%; }
.bt-icon-full svg { width: 100%; height: 100%; }
.bt-icon-letter { color: #fff; font-weight: 700; font-size: 11px; line-height: 1; letter-spacing: -.02em; user-select: none; }
.bt-matrix { display: flex; flex-direction: column; }
.bt-mrow { display: grid; grid-template-columns: minmax(170px, auto) 1fr auto auto; gap: 10px; align-items: center;
  padding: 7px 4px; font-size: 12.5px; border-bottom: 1px dashed var(--bt-line); border-radius: 6px;
  transition: opacity .15s ease, background .15s ease; }
.bt-mrow:hover { background: var(--bt-hover); }
.bt-mrow:last-child { border-bottom: none; }
.bt-mrow-idle { opacity: .48; }
.bt-mrow-idle:hover { opacity: .8; }
.bt-mname-wrap { display: flex; align-items: center; gap: 8px; min-width: 0; }
.bt-mname { font-weight: 600; font-size: 12.5px; white-space: nowrap; }
.bt-mid { font-family: ui-monospace, monospace; font-size: 10.5px; color: var(--bt-mut); opacity: .75; }
.bt-mstat { font-size: 11.5px; color: var(--bt-mut); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-pill { font-size: 10.5px; font-weight: 600; padding: 1px 8px; border-radius: 999px; flex: none;
  min-width: 34px; text-align: center; box-sizing: border-box; }
.bt-pill-ok { color: var(--bt-ok); background: rgba(21,128,61,.1); border: 1px solid rgba(21,128,61,.35); }
.bt-pill-no { color: var(--bt-warn); background: rgba(180,83,9,.1); border: 1px solid rgba(180,83,9,.35); }
.bt-toggle { cursor: pointer; width: 36px; height: 20px; border-radius: 999px; border: 1px solid var(--bt-line);
  background: rgba(127,127,127,.18); position: relative; padding: 0; justify-self: end;
  transition: background .15s ease, border-color .15s ease; }
.bt-toggle:disabled { opacity: .45; cursor: default; }
.bt-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
  border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: left .15s ease; }
.bt-toggle-on { background: var(--bt-a); border-color: transparent; }
.bt-toggle-on::after { left: 18px; }
.bt-note { font-size: 11.5px; color: var(--bt-mut); line-height: 1.6; border-left: 2px solid var(--bt-line);
  padding-left: 10px; }
.bt-note summary { cursor: pointer; user-select: none; list-style: none; display: flex; align-items: center; gap: 6px; }
.bt-note summary::-webkit-details-marker { display: none; }
.bt-note summary::before { content: '▸'; font-size: 10px; transition: transform .15s ease; }
.bt-note[open] summary::before { transform: rotate(90deg); }
.bt-note-body { margin-top: 6px; }
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
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const toggleOpen = (id: string): void => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  if (rows.length === 0) {
    return createElement('div', { className: 'bt-banner bt-banner-info' },
      '📭 收件箱为空。取件不在此进行——在会话里用 /inbox 消费即取。')
  }
  return createElement('div', { className: 'bt-rows' },
    ...rows.map((p) => {
      const open = openIds.has(p.id)
      return createElement('div', {
        key: p.id,
        className: `bt-pending${open ? ' bt-pending-open' : ''}`,
        title: p.id,
        onClick: () => { toggleOpen(p.id) },
      },
        createElement('span', { className: 'bt-pending-title' }, p.title !== '' ? p.title : p.id),
        createElement('span', { className: 'bt-pending-chev' }, '▶'),
        createElement('span', { className: 'bt-pending-meta' },
          createElement('span', { className: 'bt-src' },
            createElement(ProviderIcon, { name: p.agent, size: 14 }),
            `来源 ${PROVIDER_LABEL[p.agent] ?? p.agent}`,
          ),
          p.project !== '' ? createElement('span', null, `项目 ${p.project}`) : null,
          createElement('span', null, `id ${p.id}`),
        ),
        open ? createElement('div', { className: 'bt-preview', onClick: (e: Event) => e.stopPropagation() },
          createElement('span', null, p.preview !== '' ? p.preview : '（卡片正文为空）'),
          createElement('span', { className: 'bt-preview-hint' }, '—— 仅预览「目标」段；取件请回会话用 /inbox。'),
        ) : null,
      )
    }),
  )
}

function ProviderMatrix({ rows, busy, onToggle }: {
  rows: ProviderRow[]
  busy: string | null
  onToggle: (name: string, enabled: boolean) => void
}): ReturnType<typeof createElement> {
  return createElement('div', { className: 'bt-matrix' },
    ...rows.map((r) => {
      const label = PROVIDER_LABEL[r.name] ?? r.name
      return createElement('div', {
        key: r.name,
        className: `bt-mrow${!r.supported || r.sessions === 0 ? ' bt-mrow-idle' : ''}`,
        title: r.note !== '' ? r.note : undefined,
      },
        createElement('span', { className: 'bt-mname-wrap' },
          createElement(ProviderIcon, { name: r.name }),
          createElement('span', { className: 'bt-mname' }, label),
          createElement('span', { className: 'bt-mid' }, r.name),
        ),
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
          'aria-label': `${label}（${r.name}）读取开关`,
          disabled: busy !== null,
          title: r.enabled ? `点击停用 ${label}（foreign_session_read 将返回「已停用」）` : `点击启用 ${label}`,
          onClick: () => { onToggle(r.name, !r.enabled) },
        }),
      )
    }),
  )
}

// ---------------------------------------------------------------------------
// 命令速览：直接可见（不折叠）。provider 与 foreign.ts 的 FOREIGN_PROVIDERS
// 保持一致——不直接 import（值引入会把 host 半的 cordis/dsh-tools 拖进客户端包）。
// ---------------------------------------------------------------------------

const RESUME_PROVIDERS = ['claude', 'codex', 'opencode', 'zcode', 'pi', 'workbuddy', 'cursor', 'grok'] as const

function CommandsCard({ state }: { state: BatonState | null }): ReturnType<typeof createElement> {
  const disabled = new Set<string>(
    (state?.providers ?? []).filter((p) => !p.enabled).map((p) => p.name as string),
  )
  const chip = (cmd: string, desc: string, provider?: string, primary = false): ReturnType<typeof createElement> => {
    const off = provider !== undefined && disabled.has(provider)
    const label = provider !== undefined ? (PROVIDER_LABEL[provider] ?? provider) : undefined
    return createElement('div', {
      key: cmd,
      className: `bt-cmd${off ? ' bt-cmd-off' : ''}`,
      title: off ? `${label} 已在支持矩阵里停用，命令会返回「已停用」` : undefined,
    },
      provider !== undefined
        ? createElement(ProviderIcon, { name: provider })
        : createElement('span', { className: 'bt-icon', style: { width: 16, height: 16, background: 'var(--bt-a, #2563eb)' } },
            createElement('svg', { viewBox: '0 0 64 64', width: 10, height: 10, 'aria-hidden': true },
              createElement('rect', { x: 12, y: 26.5, width: 40, height: 11, rx: 5.5, fill: '#fff', transform: 'rotate(-45 32 32)' }))),
      createElement('span', { className: `bt-cmd-key${primary ? ' bt-cmd-key-primary' : ''}` }, cmd),
      createElement('span', { className: 'bt-cmd-desc' }, desc),
    )
  }
  return createElement('div', { className: 'bt-card' },
    createElement('div', { className: 'bt-head' },
      createElement('span', { className: 'bt-title', style: { fontSize: 13 } }, '命令速览'),
      createElement('span', { className: 'bt-badge' }, '会话里用，卡片只读'),
    ),
    createElement('div', { className: 'bt-cmds' },
      chip('/handoff', '寄存当前会话 → 收件箱', undefined, true),
      chip('/inbox', '开局取件（消费即弃）', undefined, true),
      ...RESUME_PROVIDERS.map((p) => chip(`/resume-${p}`, `拉取 ${PROVIDER_LABEL[p] ?? p} 会话`, p)),
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
        createElement('span', { className: 'bt-logo', dangerouslySetInnerHTML: { __html: ICON_SVG } }),
        createElement('span', null,
          createElement('div', { className: 'bt-title' }, 'dsh-baton 会话接力'),
          createElement('div', { className: 'bt-sub' }, '命令速览 · 交接卡片收件箱 · 八家外部 agent 会话读取器开关'),
        ),
        createElement('span', { className: 'bt-spacer' }),
        createElement('button', { className: 'bt-btn', onClick: reload, disabled: busy !== null }, '⟳ 刷新'),
      ),
      error !== null ? createElement('div', { className: 'bt-banner bt-banner-err' }, error) : null,
    ),

    // 命令速览（直接可见）
    createElement(CommandsCard, { state }),

    // 收件箱概览
    createElement('div', { className: 'bt-card' },
      createElement('div', { className: 'bt-head' },
        createElement('span', { className: 'bt-title', style: { fontSize: 13 } }, '收件箱概览'),
        createElement('span', { className: `bt-badge${(state?.pending.length ?? 0) > 0 ? ' bt-badge-hot' : ''}` }, `pending ${state?.pending.length ?? '…'}`),
        createElement('span', { className: `bt-badge${archivedCount > 0 ? ' bt-badge-hot' : ''}` }, `archived ${archivedCount}`),
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
      createElement('details', { className: 'bt-note' },
        createElement('summary', null, '💡 开关语义说明'),
        createElement('div', { className: 'bt-note-body' },
          '关掉的 provider：foreign_session_read 对该家返回规范错误值「已停用」；' +
          '/resume-* 对应 skill 的指引文本为静态内容，停用状态由工具报错兜住，模型可见。' +
          '会话数为 0 的灰色行表示该家本机未装或暂无会话，开关保留但无数据可读。')),
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

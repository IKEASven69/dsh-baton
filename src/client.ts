/**
 * dsh-takeover 浏览器半：设置页「dsh-takeover」卡。
 * 四区：命令速览（/handoff · /inbox · /resume-*，直接可见）/ 收件箱概览
 * （pending 列表可展开看目标段预览 + archived 计数 + 清空归档）/ 支持矩阵
 * （八家读取器：规范名+品牌图标、会话数、启用开关）/ 开关语义说明。
 * 文案走宿主 i18n：ctx.locale 注册本卡词典（zh/en）+ bind 出 t()，
 * 语言切换经 locale revision 驱动重渲染（宿主缺席时回退 zh 静态词典）。
 * 数据通路走同源 fetch 直连 host 路由 /dsh-takeover/*（dsh-hippo 先例）。
 * 取件不在设置卡做——会话里 /inbox。
 * @module dsh-takeover/client
 */

import { Component, createElement, useEffect, useState, useSyncExternalStore } from 'react'
// 0.2.0：一方客户端插件直接收 cordis Context。
import type { Context } from '@deepseek-ai/cordis'
// Type-only: ctx.slots（SlotRegistry 服务）由 ui-renderer 的 cordis Context 合并提供。
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: ctx.locale（LocaleRuntime）由 dsh-client-locale 的 Context 增强提供。
import type { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
// Type-only: Translate 形态（(key, params) => string，{name} 占位）。
import type { Translate } from '@deepseek-ai/dsh-client-ui-slots'
import { BRAND_FULL_SVG, BRAND_MARKS, PROVIDER_LABEL } from './brand-icons.ts'
import type { BrandMark } from './brand-icons.ts'
import { DICTS, NS, interpolate } from './locales.ts'
import type { TakeoverState, PendingRow, ProviderRow } from './settings.ts'

/** 卡片渲染语言（跟随宿主 active locale；未登记语言回退 zh） */
type Lang = 'zh' | 'en'

// ---------------------------------------------------------------------------
// i18n：注册本卡词典并绑定 t。宿主 locale 服务缺席（旧宿主/非浏览器）时
// 回退 zh 静态词典 + 本地插值，保证卡片永远可用。
// ---------------------------------------------------------------------------

const tCache = new WeakMap<object, Translate>()

/**
 * 防御式取宿主 locale 服务：cordis 对未挂载服务的属性访问会直接 throw
 * （locale 插件可能晚于本插件挂载），绝不能让异常从渲染工厂里逃出去。
 */
function resolveLocale(ctx: Context): LocaleRuntime | undefined {
  try {
    const l: unknown = (ctx as unknown as { locale?: unknown }).locale
    return l !== null && typeof l === 'object' ? (l as LocaleRuntime) : undefined
  } catch {
    return undefined
  }
}

function makeT(ctx: Context): Translate {
  const hit = tCache.get(ctx)
  if (hit !== undefined) return hit
  const locale = resolveLocale(ctx)
  let t: Translate
  if (locale !== undefined && typeof locale.register === 'function' && typeof locale.bind === 'function') {
    try {
      locale.register(NS, 'zh', DICTS.zh)
      locale.register(NS, 'en', DICTS.en)
      t = locale.bind(NS)
    } catch (e) {
      // 重复注册（HMR 重跑）/宿主词典约束变化：降级静态 zh，卡片不塌
      console.warn('[dsh-takeover] locale register/bind 失败，回退静态词典：', e)
      t = (key, params) => interpolate(DICTS.zh[String(key)] ?? String(key), params)
    }
  } else {
    t = (key, params) => interpolate(DICTS.zh[String(key)] ?? String(key), params)
  }
  tCache.set(ctx, t)
  return t
}

/** 宿主 active locale → 卡片渲染语言 */
function langOf(locale: LocaleRuntime | undefined): Lang {
  try {
    return locale?.getLocale().active === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

/**
 * 宿主主题探测：宿主主题是 CSS 模块字面色、不暴露 --muted 令牌，
 * prefers-color-scheme 又只跟系统不跟宿主；宿主切主题换的是背景（浅=白底，
 * 深=黑底），文字色恒定。所以按 body 背景色亮度判断明暗，给 muted /
 * 语义色选对轴。每次渲染现算（主题切换后任意交互即校正）。
 */
function themeVars(): Record<string, string> {
  let dark = true
  try {
    const m = getComputedStyle(document.body).backgroundColor.match(/\d+/g)
    if (m && m.length >= 3) {
      const [r = 0, g = 0, b = 0] = m.map(Number)
      dark = (0.299 * r + 0.587 * g + 0.114 * b) / 255 <= 0.5
    }
  } catch {
    /* 保底按深色 */
  }
  return dark
    ? { '--bt-mut': 'rgba(255,255,255,.55)', '--bt-ok': '#4ade80', '--bt-warn': '#fbbf24', '--bt-err': '#f87171' }
    : { '--bt-mut': 'rgba(30,41,59,.72)', '--bt-ok': '#15803d', '--bt-warn': '#b45309', '--bt-err': '#d93025' }
}

export const inject = ['slots', 'locale']

// ---------------------------------------------------------------------------
// 品牌图标：assets/icon.svg 的内联副本（改图标时两边同步）。
// 圆角方底 + 接管意象（双箭头 » 进格 |，读作"接管席位"），渐变 #6366F1→#8B5CF6。
// 渐变 id 加 bt- 前缀避免与宿主页面里的 defs 撞名。
// ---------------------------------------------------------------------------

const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="dsh-takeover">' +
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
  '<g fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M15 19 L27 32 L15 45"/>' +
  '<path d="M29 19 L41 32 L29 45"/>' +
  '</g>' +
  '<rect x="46.5" y="17" width="6" height="30" rx="3" fill="#ffffff" opacity=".9"/>' +
  '</svg>'

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
    // 未知来源（实践中只有 dsh 宿主自己）：用本插件品牌小标，不出字母块
    return createElement('span', {
      className: 'bt-icon',
      style: { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', width: size, height: size },
      title: PROVIDER_LABEL[name] ?? name,
      dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 64 64" width="100%" height="100%"><g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19 L27 32 L15 45"/><path d="M29 19 L41 32 L29 45"/></g></svg>' },
    })
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
  container-type: inline-size;
  --bt-a: var(--accent, #2563eb); --bt-ok: #15803d; --bt-warn: #b45309; --bt-err: #d93025;
  --bt-line: var(--border, rgba(127,127,127,.28)); --bt-mut: rgba(30,41,59,.72);
  --bt-card: var(--bg, rgba(127,127,127,.05)); --bt-hover: rgba(127,127,127,.07); }
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
.bt-rows { display: flex; flex-direction: column; gap: 2px; }
.bt-pending { display: flex; flex-wrap: wrap; gap: 2px 10px; align-items: flex-start;
  border-radius: 8px; padding: 8px 10px; font-size: 12.5px;
  cursor: pointer; transition: background .12s ease; }
.bt-pending:hover { background: var(--bt-hover); }
.bt-pending:focus-visible { outline: 2px solid var(--bt-a); outline-offset: -2px; }
.bt-pending-open { background: var(--bt-hover); }
.bt-pend-icon { flex: none; margin-top: 2px; }
.bt-pend-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.bt-pend-line1 { display: flex; align-items: baseline; gap: 8px; }
.bt-pending-title { flex: 1; min-width: 0; font-weight: 600; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-pend-time { flex: none; font-size: 11px; color: var(--bt-mut); }
.bt-pending-chev { flex: none; font-size: 10px; color: var(--bt-mut); align-self: center; transition: transform .15s ease; }
.bt-pending-open .bt-pending-chev { transform: rotate(90deg); }
.bt-pend-meta { display: flex; gap: 6px; align-items: baseline; font-size: 11px; color: var(--bt-mut);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-pend-src { font-weight: 500; }
.bt-pend-dot { opacity: .45; }
.bt-pend-id { font-family: ui-monospace, monospace; font-size: 10.5px; opacity: .68; }
.bt-preview { flex-basis: 100%; font-size: 12px; line-height: 1.65; color: inherit;
  background: var(--bt-card); border-left: 2px solid var(--bt-a); border-radius: 0 8px 8px 0;
  padding: 8px 12px; margin: 4px 0 2px 0; white-space: pre-wrap;
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
/* 窄容器（侧栏收窄）：命令单列、矩阵行收掉会话数列，避免挤压换行 */
@container (max-width: 430px) {
  .bt-cmds { grid-template-columns: 1fr; }
  .bt-mrow { grid-template-columns: minmax(0, auto) auto auto; }
  .bt-mstat { display: none; }
}
`

// ---------------------------------------------------------------------------
// 数据获取
// ---------------------------------------------------------------------------

async function getState(): Promise<TakeoverState> {
  const res = await fetch('/dsh-takeover/state', { cache: 'no-store' })
  const body = await res.json() as TakeoverState | { error: string }
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

function fmtTime(iso: string, lang: Lang): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number): string => String(n).padStart(2, '0')
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const now = new Date()
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  if (sameDay) return hm // 今天的只给时刻，别把行撑长
  return lang === 'en'
    ? `${d.getMonth() + 1}/${d.getDate()} ${hm}`
    : `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`
}

// ---------------------------------------------------------------------------
// 展示件
// ---------------------------------------------------------------------------

function PendingList({ rows, t, lang }: { rows: PendingRow[]; t: Translate; lang: Lang }): ReturnType<typeof createElement> {
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
    return createElement('div', { className: 'bt-banner bt-banner-info' }, t('emptyInbox'))
  }
  return createElement('div', { className: 'bt-rows' },
    ...rows.map((p) => {
      const open = openIds.has(p.id)
      return createElement('div', {
        key: p.id,
        className: `bt-pending${open ? ' bt-pending-open' : ''}`,
        title: p.id,
        role: 'button',
        tabIndex: 0,
        'aria-expanded': open,
        onClick: () => { toggleOpen(p.id) },
        onKeyDown: (e: { key: string; preventDefault(): void }) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(p.id) }
        },
      },
        createElement('span', { className: 'bt-pend-icon' }, createElement(ProviderIcon, { name: p.agent, size: 22 })),
        createElement('span', { className: 'bt-pend-main' },
          createElement('span', { className: 'bt-pend-line1' },
            createElement('span', { className: 'bt-pending-title' }, p.title !== '' ? p.title : p.id),
            createElement('span', { className: 'bt-pend-time' }, p.pushedAt === '' ? t('noTime') : fmtTime(p.pushedAt, lang)),
          ),
          createElement('span', {
            className: 'bt-pend-meta',
            title: `${t('from', { name: '' }).trim()} · ${t('project', { name: '' }).trim()} · ${t('idLabel', { id: '' }).trim()}`,
          },
            createElement('span', { className: 'bt-pend-src' }, PROVIDER_LABEL[p.agent] ?? p.agent),
            p.project !== '' ? createElement('span', { className: 'bt-pend-dot' }, '·') : null,
            p.project !== '' ? createElement('span', null, p.project) : null,
            createElement('span', { className: 'bt-pend-dot' }, '·'),
            createElement('span', { className: 'bt-pend-id' }, p.id),
          ),
        ),
        createElement('span', { className: 'bt-pending-chev', 'aria-hidden': true }, '▸'),
        open ? createElement('div', { className: 'bt-preview', onClick: (e: Event) => e.stopPropagation() },
          createElement('span', null, p.preview !== '' ? p.preview : t('previewEmpty')),
          createElement('span', { className: 'bt-preview-hint' }, t('previewHint')),
        ) : null,
      )
    }),
  )
}

function ProviderMatrix({ rows, busy, onToggle, t }: {
  rows: ProviderRow[]
  busy: string | null
  onToggle: (name: string, enabled: boolean) => void
  t: Translate
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
            ? (r.sessions >= 0 ? t('sessionsCount', { n: r.sessions }) : t('sessionsProbeFail'))
            : (r.note !== '' ? t('unsupportedNote', { note: r.note }) : t('unsupported'))),
        createElement('span', { className: `bt-pill ${r.supported ? 'bt-pill-ok' : 'bt-pill-no'}` },
          r.supported ? t('pillOk') : t('pillNo')),
        createElement('button', {
          className: `bt-toggle${r.enabled ? ' bt-toggle-on' : ''}`,
          role: 'switch',
          'aria-checked': r.enabled,
          'aria-label': t('toggleAria', { label, id: r.name }),
          disabled: busy !== null,
          title: r.enabled ? t('toggleDisable', { label }) : t('toggleEnable', { label }),
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

function CommandsCard({ state, t }: { state: TakeoverState | null; t: Translate }): ReturnType<typeof createElement> {
  const disabled = new Set<string>(
    (state?.providers ?? []).filter((p) => !p.enabled).map((p) => p.name as string),
  )
  const chip = (cmd: string, desc: string, provider?: string, primary = false): ReturnType<typeof createElement> => {
    const off = provider !== undefined && disabled.has(provider)
    const label = provider !== undefined ? (PROVIDER_LABEL[provider] ?? provider) : undefined
    return createElement('div', {
      key: cmd,
      className: `bt-cmd${off ? ' bt-cmd-off' : ''}`,
      title: off && label !== undefined ? t('cmdOffTitle', { label }) : undefined,
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
      createElement('span', { className: 'bt-title', style: { fontSize: 13 } }, t('cmdTitle')),
      createElement('span', { className: 'bt-badge' }, t('cmdBadge')),
    ),
    createElement('div', { className: 'bt-cmds' },
      chip('/handoff', t('cmdHandoffDesc'), undefined, true),
      chip('/inbox', t('cmdInboxDesc'), undefined, true),
      ...RESUME_PROVIDERS.map((p) => chip(`/resume-${p}`, t('cmdResumeDesc', { name: PROVIDER_LABEL[p] ?? p }), p)),
    ),
  )
}

// 渲染错误边界：任何渲染期异常直接显示在卡片里（宿主外壳会吞 React 报错，
// 静默空白最难排查——宁可把错误亮出来）。
type BoundaryState = { err: unknown }
class PanelBoundary extends Component<{ children: ReturnType<typeof createElement>; t: Translate }, BoundaryState> {
  override state: BoundaryState = { err: null }
  static getDerivedStateFromError(err: unknown): BoundaryState { return { err } }
  override render(): ReturnType<typeof createElement> {
    if (this.state.err !== null) {
      const e = this.state.err as { stack?: string; message?: string }
      return createElement('div', { className: 'bt-panel', style: themeVars() },
        createElement('style', null, CSS),
        createElement('div', { className: 'bt-card' },
          createElement('div', { className: 'bt-title' }, this.props.t('renderErrorTitle')),
          createElement('pre',
            { style: { fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.5 } },
            e.stack ?? e.message ?? String(this.state.err)),
        ),
      )
    }
    return this.props.children
  }
}

function Panel({ t, locale }: { t: Translate; locale: LocaleRuntime | undefined }): ReturnType<typeof createElement> {
  const [state, setState] = useState<TakeoverState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  // 语言切换实时重渲染：宿主 locale revision 变化即重画（bound t 在渲染时取词）
  useSyncExternalStore(
    (cb) => {
      try {
        return locale?.subscribe(cb) ?? (() => {})
      } catch {
        return (() => {}) as () => void
      }
    },
    () => {
      try {
        return locale?.getSnapshot().revision ?? 0
      } catch {
        return 0
      }
    },
  )
  const lang: Lang = langOf(locale)

  const reload = (): void => {
    void getState().then(
      (s) => { setState(s); setError(null) },
      (e: unknown) => { setError(e instanceof Error ? e.message : String(e)) },
    )
  }
  useEffect(reload, [])

  const toggle = (name: string, enabled: boolean): void => {
    setBusy(name)
    void post<{ ok: true; state: TakeoverState }>('/dsh-takeover/provider', { provider: name, enabled })
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
    void post<{ ok: true; cleared: number }>('/dsh-takeover/clear-archived', {})
      .then(() => { reload() })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : String(e)) })
      .finally(() => { setBusy(null) })
  }

  const archivedCount = state?.archivedCount ?? 0

  return createElement('div', { className: 'bt-panel', style: themeVars() },
    createElement('style', null, CSS),

    // 头卡：标识 + 刷新
    createElement('div', { className: 'bt-card' },
      createElement('div', { className: 'bt-head' },
        createElement('span', { className: 'bt-logo', dangerouslySetInnerHTML: { __html: ICON_SVG } }),
        createElement('span', null,
          createElement('div', { className: 'bt-title' }, t('appTitle')),
          createElement('div', { className: 'bt-sub' }, t('appSubtitle')),
        ),
        createElement('span', { className: 'bt-spacer' }),
        createElement('button', { className: 'bt-btn', onClick: reload, disabled: busy !== null }, t('refresh')),
      ),
      error !== null ? createElement('div', { className: 'bt-banner bt-banner-err' }, error) : null,
    ),

    // 命令速览（直接可见）
    createElement(CommandsCard, { state, t }),

    // 收件箱概览
    createElement('div', { className: 'bt-card' },
      createElement('div', { className: 'bt-head' },
        createElement('span', { className: 'bt-title', style: { fontSize: 13 } }, t('inboxTitle')),
        createElement('span', {
          className: `bt-badge${(state?.pending.length ?? 0) > 0 ? ' bt-badge-hot' : ''}`,
          title: t('pendingDirHint'),
        }, t('badgePending', { n: state?.pending.length ?? '…' })),
        createElement('span', {
          className: `bt-badge${archivedCount > 0 ? ' bt-badge-hot' : ''}`,
          title: t('archivedDirHint'),
        }, t('badgeArchived', { n: archivedCount })),
        createElement('span', { className: 'bt-spacer' }),
        createElement('button', {
          className: `bt-btn bt-btn-danger${confirmClear ? ' bt-btn-confirm' : ''}`,
          disabled: busy !== null || archivedCount === 0,
          onClick: clear,
          title: t('clearArchivedTitle'),
        }, confirmClear ? t('clearConfirm', { n: archivedCount }) : t('clearArchived')),
      ),
      state !== null
        ? createElement(PendingList, { rows: state.pending, t, lang })
        : createElement('div', { className: 'bt-sub' }, t('loading')),
    ),

    // 支持矩阵
    createElement('div', { className: 'bt-card' },
      createElement('div', { className: 'bt-head' },
        createElement('span', { className: 'bt-title', style: { fontSize: 13 } }, t('matrixTitle')),
      ),
      state !== null
        ? createElement(ProviderMatrix, { rows: state.providers, busy, onToggle: toggle, t })
        : createElement('div', { className: 'bt-sub' }, t('loading')),
      createElement('details', { className: 'bt-note' },
        createElement('summary', null, t('noteSummary')),
        createElement('div', { className: 'bt-note-body' }, t('noteBody'))),
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
    console.warn('[dsh-takeover] 宿主未提供可用的 slots 服务（需要 @deepseek-ai/dsh-client-ui-renderer），设置卡跳过挂载')
    return
  }
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    { name: 'settings.section', id: 'dsh-takeover', order: 42, label: 'dsh-takeover' },
    () => {
      const t = makeT(ctx)
      return createElement(PanelBoundary, {
        t,
        children: createElement(Panel, { t, locale: resolveLocale(ctx) }),
      })
    },
  ))
}

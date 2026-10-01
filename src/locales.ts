/**
 * 设置卡 i18n 词典（zh / en 全量对齐）。
 * 通过 ctx.locale.register(NS, locale, dict) 注册进宿主 locale 注册表
 * （非合并表命名空间，走单语言非类型化形态）；卡片文案一律经
 * ctx.locale.bind(NS) 出来的 t() 取词，语言切换由宿主 revision 驱动重渲染。
 * 占位符用 {name} 形态，与宿主 LocaleDict 约定一致。
 * @module dsh-takeover/locales
 */

/** 本卡命名空间（宿主 locale 注册表内唯一） */
export const NS = 'dsh-takeover'

export const zh: Record<string, string> = {
  appTitle: 'dsh-takeover 会话接管',
  appSubtitle: '命令速览 · 交接卡片收件箱 · 八家外部 agent 会话读取器开关',
  refresh: '⟳ 刷新',
  cmdTitle: '命令速览',
  cmdBadge: '会话里用，卡片只读',
  cmdHandoffDesc: '寄存当前会话 → 收件箱',
  cmdInboxDesc: '开局取件（消费即弃）',
  cmdResumeDesc: '拉取 {name} 会话',
  cmdOffTitle: '{label} 已在支持矩阵停用，命令会返回「已停用」',
  inboxTitle: '收件箱概览',
  clearArchived: '清空 archived',
  clearConfirm: '确认清空 {n} 张？',
  clearArchivedTitle: '删除 archived/ 下全部已消费卡片（不可恢复）',
  emptyInbox: '📭 收件箱为空。取件不在此进行——在会话里用 /inbox 消费即取。',
  from: '来源 {name}',
  project: '项目 {name}',
  previewEmpty: '（卡片正文为空）',
  previewHint: '—— 仅预览「目标」段；取件请回会话用 /inbox。',
  matrixTitle: '支持矩阵（八家读取器）',
  sessionsCount: '{n} 个会话',
  sessionsProbeFail: '会话数探测失败',
  unsupported: '本机不支持',
  unsupportedNote: '本机不支持：{note}',
  pillOk: '支持',
  pillNo: '不可用',
  toggleDisable: '点击停用 {label}（foreign_session_read 将返回「已停用」）',
  toggleEnable: '点击启用 {label}',
  toggleAria: '{label}（{id}）读取开关',
  noteSummary: '💡 开关语义说明',
  noteBody: '关掉的 provider：foreign_session_read 对该家返回规范错误值「已停用」；' +
    '/resume-* 对应 skill 的指引文本为静态内容，停用状态由工具报错兜住，模型可见。' +
    '会话数为 0 的灰色行表示该家本机未装或暂无会话，开关保留但无数据可读。',
  loading: '加载中…',
  noTime: '（无时间）',
}

export const en: Record<string, string> = {
  appTitle: 'dsh-takeover Session Takeover',
  appSubtitle: 'Commands · Handoff card inbox · Reader switches for 8 external agent CLIs',
  refresh: '⟳ Refresh',
  cmdTitle: 'Commands',
  cmdBadge: 'Run in sessions — this card is read-only',
  cmdHandoffDesc: 'Park this session → inbox',
  cmdInboxDesc: 'Pick up at start (consumed once)',
  cmdResumeDesc: 'Pull {name} sessions',
  cmdOffTitle: '{label} is off in the matrix; the command returns "disabled"',
  inboxTitle: 'Inbox overview',
  clearArchived: 'Clear archived',
  clearConfirm: 'Clear {n}?',
  clearArchivedTitle: 'Delete every consumed card under archived/ (irreversible)',
  emptyInbox: '📭 Inbox is empty. Pickup does not happen here — run /inbox in a session to consume.',
  from: 'from {name}',
  project: 'project {name}',
  previewEmpty: '(card body is empty)',
  previewHint: '— Goal section preview only; run /inbox in a session to claim.',
  matrixTitle: 'Support matrix (8 readers)',
  sessionsCount: '{n} sessions',
  sessionsProbeFail: 'session count probe failed',
  unsupported: 'not supported on this machine',
  unsupportedNote: 'not supported on this machine: {note}',
  pillOk: 'OK',
  pillNo: 'N/A',
  toggleDisable: 'Disable {label} (foreign_session_read will return "disabled")',
  toggleEnable: 'Enable {label}',
  toggleAria: '{label} ({id}) reader switch',
  noteSummary: '💡 Switch semantics',
  noteBody: 'Disabled providers: foreign_session_read returns the canonical "disabled" error for that ' +
    'vendor. The /resume-* skill guidance is static text; the disabled state is surfaced through the ' +
    'tool error, visible to the model. A greyed row with 0 sessions means the vendor is not installed ' +
    'locally (or has no sessions yet) — the switch stays but there is nothing to read.',
  loading: 'Loading…',
  noTime: '(no time)',
}

/** 全部内置语言词典（register 时逐一交宿主） */
export const DICTS: { zh: Record<string, string>; en: Record<string, string> } = { zh, en }

export type DictLocale = keyof typeof DICTS

/** 兜底插值：{name} 形态（与宿主 LocaleDict 约定一致），仅限 ctx.locale 缺席时使用 */
export function interpolate(template: string, params?: Record<string, unknown>): string {
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/g, (raw, key: string) => {
    const v = params[key]
    return v === undefined ? raw : String(v)
  })
}

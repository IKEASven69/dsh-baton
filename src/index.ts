/**
 * dsh-baton host 半：会话接力插件（拉取 + 寄存 + 取件）。
 * 注册面 = 工具 handoff_push / handoff_inbox / foreign_session_read
 *        + slash /handoff /inbox + /resume-<六家>。
 * 权限范围：写 ~/.handoff（可由 HANDOFF_HOME 覆盖）、读 git 状态、只读六家本地会话库。
 * @module dsh-baton
 */

import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the Context.skills merge（skills 服务声明由 dsh-skill 提供）。
import type {} from '@deepseek-ai/dsh-skill'
import { registerInboxTool, registerPushTool } from './tools.ts'
import { registerForeignTool } from './foreign.ts'
import { registerBatonRoutes } from './server.ts'
import { isProviderEnabled } from './settings.ts'
import { skillRegistrations } from '../skills/index.ts'

export const name = 'dsh-baton'
export const inject = ['tools', 'skills']

export function apply(ctx: Context): void {
  registerPushTool(ctx)
  registerInboxTool(ctx)
  // 设置卡停用闸：每次调用现读 config.json（开关改动即刻生效，无需重启）
  registerForeignTool(ctx, { isEnabled: (p) => isProviderEnabled(p) })
  registerBatonRoutes(ctx)
  for (const reg of skillRegistrations()) ctx.skills.register(reg)
  ctx.logger.info('dsh-baton: 会话接力已加载（工具 handoff_push / handoff_inbox / foreign_session_read + slash /handoff /inbox /resume-*×8 + 设置卡 API /dsh-baton/*）')
}

export { pushHandoff, inboxList, inboxLoad, factsToSections } from './tools.ts'
export type { PushArgs, PushResult, InboxItem, InboxListResult, InboxLoadResult } from './tools.ts'
export { probeSessionEvents, collectFacts, todoToTasks } from './collect.ts'
export type { ProbeResult, SessionFacts } from './collect.ts'
export { FOREIGN_PROVIDERS, PROVIDER_TO_ADAPTER, disabledError, foreignSessionRead, summarizeTurns, registerForeignTool, renderForeign } from './foreign.ts'
export type {
  ForeignProvider,
  ForeignReadArgs,
  ForeignReadResult,
  ForeignReaders,
  ForeignEnv,
  ForeignResolve,
  ForeignCandidate,
  ForeignSummary,
  ForeignSkeleton,
  ForeignTurn,
} from './foreign.ts'
export {
  buildState,
  clearArchived,
  isProviderEnabled,
  loadSwitches,
  saveSwitches,
  setProviderEnabled,
  switchesPath,
} from './settings.ts'
export type { BatonState, BatonSwitches, PendingRow, ProviderRow } from './settings.ts'
export { registerBatonRoutes } from './server.ts'
export {
  skillRegistrations,
  handoffSkillRegistration,
  inboxSkillRegistration,
  resumeSkillRegistrations,
  resumeSkillContent,
  RESUME_SKILL_SPECS,
} from '../skills/index.ts'
export type { ResumeSkillSpec } from '../skills/index.ts'

/**
 * dsh-baton host 半：交接卡片收件箱。
 * 注册面 = 工具 handoff_push / handoff_inbox + slash skill /handoff /inbox。
 * 权限范围：只写 ~/.handoff（可由 HANDOFF_HOME 覆盖）与读 git 状态。
 * @module dsh-baton
 */

import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the Context.skills merge（skills 服务声明由 dsh-skill 提供）。
import type {} from '@deepseek-ai/dsh-skill'
import { registerInboxTool, registerPushTool } from './tools.ts'
import { skillRegistrations } from '../skills/index.ts'

export const name = 'dsh-baton'
export const inject = ['tools', 'skills']

export function apply(ctx: Context): void {
  registerPushTool(ctx)
  registerInboxTool(ctx)
  for (const reg of skillRegistrations()) ctx.skills.register(reg)
  ctx.logger.info('dsh-baton: 交接卡片收件箱已加载（工具 handoff_push / handoff_inbox + slash /handoff /inbox）')
}

export { pushHandoff, inboxList, inboxLoad, factsToSections } from './tools.ts'
export type { PushArgs, PushResult, InboxItem, InboxListResult, InboxLoadResult } from './tools.ts'
export { probeSessionEvents, collectFacts, todoToTasks } from './collect.ts'
export type { ProbeResult, SessionFacts } from './collect.ts'
export { skillRegistrations, handoffSkillRegistration, inboxSkillRegistration } from '../skills/index.ts'

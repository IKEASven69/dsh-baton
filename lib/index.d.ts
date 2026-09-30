import { Context } from "@deepseek-ai/cordis";
import { SkillRegistration } from "@deepseek-ai/dsh-skill";
//#region node_modules/.pnpm/@agent-handoff+core@file+..+agent-handoff+packages+core/node_modules/@agent-handoff/core/dist/index.d.mts
/** 六段正文 + 可选「建议加载」段 */
interface CardSections {
  goal: string;
  files: string;
  done: string;
  remaining: string;
  stopped: string;
  warnings: string;
  suggested?: string;
}
//#endregion
//#region src/collect.d.ts
/**
 * 事件流确定性收集（不调 LLM、不读时钟之外的副作用）。
 * 借道 npm 包 dsh-handoff v0.1.0 的探测思路：全程 typeof 防御，
 * 任何结构偏差都不抛错——探测失败由调用方降级为规范值，绝不 throw。
 * @module dsh-baton/collect
 */
/** 探测结果：events 不可用/无法适配时 skipped=true 并附中文说明 */
interface ProbeResult {
  events: unknown[];
  skipped: boolean;
  note: string;
}
/** 收集到的会话事实（全部来自事件流的确定性蒸馏） */
interface SessionFacts {
  /** 直接用户消息（source.kind === 'user'），截 200 字 */
  userMessages: Array<{
    time: number;
    text: string;
  }>;
  /** 写过的文件/编辑清单 */
  writeEdits: Array<{
    tool: string;
    file: string;
  }>;
  /** 执行过的命令摘要（bash 系，截 120 字，最多 10 条） */
  commands: string[];
  /** bash 里的 git commit 命令 */
  gitCommits: string[];
  /** 工具调用参数里出现的工作区路径（去重） */
  keyFiles: Set<string>;
  /** 最近一次 todo/write 的快照（原样条目） */
  lastTodo: Array<Record<string, unknown>> | null;
  /** 最近一次 goal/change 的目标文本 */
  lastGoal: string;
  /** 事件总数（探测成功时） */
  eventCount: number;
}
/**
 * 探测会话事件流：优先 session.snapshotEvents()（dsh-session 正式 API），
 * 退回 session.events 数组（dsh-handoff 探测过的形态），再退回降级。
 */
export declare function probeSessionEvents(session: unknown): ProbeResult;
/** 遍历事件流收集会话事实；单条事件结构不符就跳过，绝不抛错 */
export declare function collectFacts(events: unknown[]): SessionFacts;
/** todo 条目 → 协议 tasks 快照（text + status 最小公分母，语义 4：迁快照不迁现场） */
export declare function todoToTasks(facts: SessionFacts): Array<{
  text: string;
  status: string;
  priority?: string;
}>;
//#endregion
//#region src/tools.d.ts
/** handoff_push 参数：六段文本可选，缺省段走事件流确定性兜底 */
interface PushArgs {
  goal?: string;
  files?: string;
  done?: string;
  remaining?: string;
  stopped?: string;
  warnings?: string;
  suggested?: string;
  title?: string;
  to?: string;
  project?: string;
  cwd?: string;
}
type PushResult = {
  ok: true;
  id: string;
  path: string;
  skipped: boolean;
  note: string;
} | {
  ok: false;
  error: string;
};
/** 确定性兜底：事件流事实 → 六段正文草稿（中文，证据一律 HISTORY_REPORTED） */
export declare function factsToSections(facts: SessionFacts, skipped: boolean, note: string): CardSections;
/**
 * 推送核心（可脱离 cordis 单测）：组装协议卡片写入 pending/。
 * session 可以是任何形态——探测失败只降级，不抛错。
 */
export declare function pushHandoff(session: unknown, args: PushArgs, opts?: {
  dir?: string;
}): PushResult;
interface InboxItem {
  id: string;
  from: string;
  title: string;
  to: string;
  project: string;
  pushed_at: string;
  taskCount: number;
  [k: string]: string | number;
}
type InboxListResult = {
  ok: true;
  action: 'list';
  cards: InboxItem[];
} | {
  ok: false;
  error: string;
};
/** 列出 pending 待取件（新→旧），只读不消费 */
export declare function inboxList(opts?: {
  dir?: string;
}): InboxListResult;
type InboxLoadResult = {
  ok: true;
  action: 'load';
  id: string;
  text: string;
  mismatches: string[];
  unavailable?: string;
} | {
  ok: false;
  error: string;
};
/** 取件（消费即弃）：pending → archived，附 verifyGit 的 MISMATCH/UNAVAILABLE 警告 */
export declare function inboxLoad(id: string, opts?: {
  dir?: string;
}): InboxLoadResult;
//#endregion
//#region skills/handoff.d.ts
/** /handoff 注册项 */
export declare function handoffSkillRegistration(): SkillRegistration;
//#endregion
//#region skills/inbox.d.ts
/** /inbox 注册项 */
export declare function inboxSkillRegistration(): SkillRegistration;
//#endregion
//#region skills/index.d.ts
/** 全部 bundled slash skill 注册项 */
export declare function skillRegistrations(): SkillRegistration[];
//#endregion
//#region src/index.d.ts
export declare const name = "dsh-baton";
export declare const inject: string[];
export declare function apply(ctx: Context): void;
//#endregion
export type { InboxItem, InboxListResult, InboxLoadResult, ProbeResult, PushArgs, PushResult, SessionFacts };
//# sourceMappingURL=index.d.ts.map
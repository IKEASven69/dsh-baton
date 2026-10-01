/**
 * dsh-takeover 测试：卡片渲染/落盘、消费即弃、事件流探测降级、规范错误值。
 * 落盘一律走 HANDOFF_HOME 指到临时目录，不碰真实 ~/.handoff。
 */
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCard, loadCard, listPending, listArchived } from '@agent-handoff/core'
import {
  collectFacts,
  inboxList,
  inboxLoad,
  probeSessionEvents,
  pushHandoff,
  todoToTasks,
} from '../src/index.ts'

/** 造一个独立 HANDOFF_HOME 临时目录 */
function tmpHome(): string {
  return mkdtempSync(join(tmpdir(), 'dsh-takeover-test-'))
}

/** 造一个仿真 session（snapshotEvents 形态，对齐 dsh-session API） */
function fakeSession(events: unknown[]): unknown {
  return {
    id: 'sess-test-1',
    header: { cwd: process.cwd() },
    snapshotEvents: () => events,
  }
}

const SAMPLE_EVENTS: unknown[] = [
  { type: 'user/message', time: 1, data: { source: { kind: 'user' }, content: [{ type: 'text', text: '帮我把收件箱做完' }] } },
  { type: 'tool/call', time: 2, data: { name: 'write', arguments: JSON.stringify({ file_path: 'src/tools.ts' }) } },
  { type: 'tool/call', time: 3, data: { name: 'edit', arguments: JSON.stringify({ file_path: 'src/index.ts' }) } },
  { type: 'tool/call', time: 4, data: { name: 'bash', arguments: JSON.stringify({ command: 'git commit -m "feat: inbox"' }) } },
  { type: 'tool/call', time: 5, data: { name: 'bash', arguments: JSON.stringify({ command: 'npm test' }) } },
  {
    type: 'todo/write', time: 6, data: {
      todos: [
        { content: '收件箱工具', status: 'completed', priority: 'high' },
        { content: '写测试', status: 'in_progress' },
        { text: '发版', status: 'pending' },
      ],
    },
  },
]

// ---------- 事件流探测降级 ----------

test('探测：null session 降级 skipped，不抛错', () => {
  const r = probeSessionEvents(null)
  assert.equal(r.skipped, true)
  assert.equal(r.events.length, 0)
  assert.match(r.note, /session 为空/)
})

test('探测：events 非数组降级 skipped', () => {
  const r = probeSessionEvents({ events: 42 })
  assert.equal(r.skipped, true)
  assert.match(r.note, /typeof=number/)
})

test('探测：snapshotEvents 优先，抛错时退回 events 字段', () => {
  const ok = probeSessionEvents(fakeSession(SAMPLE_EVENTS))
  assert.equal(ok.skipped, false)
  assert.equal(ok.events.length, SAMPLE_EVENTS.length)

  const fallback = probeSessionEvents({
    snapshotEvents: () => { throw new Error('boom') },
    events: SAMPLE_EVENTS,
  })
  assert.equal(fallback.skipped, false)
  assert.equal(fallback.events.length, SAMPLE_EVENTS.length)
})

test('收集：用户消息 / 写文件 / 命令 / todo 都被蒸馏', () => {
  const facts = collectFacts(SAMPLE_EVENTS)
  assert.equal(facts.userMessages.at(-1)?.text, '帮我把收件箱做完')
  assert.deepEqual(facts.writeEdits.map((w) => w.file), ['src/tools.ts', 'src/index.ts'])
  assert.ok(facts.commands.some((c) => c.includes('npm test')))
  assert.ok(facts.gitCommits.some((c) => c.includes('git commit')))
  const tasks = todoToTasks(facts)
  assert.deepEqual(tasks.map((t) => t.status), ['completed', 'in_progress', 'pending'])
  assert.equal(tasks[2]?.text, '发版') // text 字段兼容
  assert.equal(tasks[0]?.priority, 'high')
})

test('收集：垃圾事件逐条跳过，不抛错', () => {
  const facts = collectFacts([null, 42, 'x', { notype: 1 }, { type: 9 }, { type: 'unknown/x' }])
  assert.equal(facts.userMessages.length, 0)
  assert.equal(facts.eventCount, 6)
})

// ---------- 卡片渲染 / 落盘 ----------

test('push：六段参数优先，落盘后可解析回协议卡片', () => {
  const dir = tmpHome()
  try {
    const r = pushHandoff(fakeSession(SAMPLE_EVENTS), {
      goal: '做完收件箱',
      remaining: '写测试',
      title: 'takeover 开发',
      project: 'dsh-takeover',
    }, { dir })
    assert.equal(r.ok, true)
    if (!r.ok) return
    assert.match(r.id, /^ho-/)
    assert.ok(existsSync(r.path))

    const card = parseCard(readFileSync(r.path, 'utf-8'))
    assert.equal(card.handoff, 1)
    assert.equal(card.id, r.id)
    assert.equal(card.from.agent, 'dsh')
    assert.equal(card.from.session, 'sess-test-1')
    assert.equal(card.from.title, 'takeover 开发')
    assert.equal(card.project, 'dsh-takeover')
    assert.equal(card.sections.goal, '做完收件箱')
    assert.equal(card.sections.remaining, '写测试')
    // 未传段走事件流兜底
    assert.match(card.sections.files, /src\/tools\.ts/)
    // tasks 快照进 frontmatter
    assert.deepEqual(card.tasks.map((t) => t.status), ['completed', 'in_progress', 'pending'])
    // 六段中文标题齐全
    const text = readFileSync(r.path, 'utf-8')
    for (const h of ['## 目标', '## 涉及文件', '## 做到哪', '## 还差什么', '## 停在哪', '## 读者警告']) {
      assert.ok(text.includes(h), `缺段：${h}`)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('push：无会话环境降级兜底骨架，仍是规范 ok 值', () => {
  const dir = tmpHome()
  try {
    const r = pushHandoff(null, {}, { dir })
    assert.equal(r.ok, true)
    if (!r.ok) return
    assert.equal(r.skipped, true)
    assert.notEqual(r.note, '')
    const card = parseCard(readFileSync(r.path, 'utf-8'))
    assert.match(card.sections.warnings, /HISTORY_REPORTED/)
    assert.match(card.sections.warnings, /降级/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

// ---------- 收件箱 list / 消费即弃 ----------

test('inbox：list 只读不消费，load 消费即弃，二次取件报规范错误值', () => {
  const dir = tmpHome()
  try {
    const pushed = pushHandoff(fakeSession(SAMPLE_EVENTS), { goal: 'g' }, { dir })
    assert.equal(pushed.ok, true)
    if (!pushed.ok) return

    const before = inboxList({ dir })
    assert.equal(before.ok, true)
    if (!before.ok) return
    assert.equal(before.cards.length, 1)
    assert.equal(before.cards[0]?.id, pushed.id)
    // list 不消费：再列还在
    assert.equal((inboxList({ dir }) as { cards: unknown[] }).cards.length, 1)

    const loaded = inboxLoad(pushed.id, { dir })
    assert.equal(loaded.ok, true)
    if (!loaded.ok) return
    assert.equal(loaded.id, pushed.id)
    assert.match(loaded.text, /## 目标/)
    // cwd 是本仓库（git 仓库），核验要么无 mismatch 要么有具体说明，但不允许抛错
    assert.ok(Array.isArray(loaded.mismatches))

    // 消费即弃：pending 空、archived 有
    assert.equal(listPending(dir).length, 0)
    assert.equal(listArchived(dir).length, 1)

    // 二次取件：规范错误值，不抛异常
    const again = inboxLoad(pushed.id, { dir })
    assert.equal(again.ok, false)
    if (again.ok) return
    assert.match(again.error, /收件箱无此待取件/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('inbox：空 id 与未知 id 都是规范错误值', () => {
  const dir = tmpHome()
  try {
    const empty = inboxLoad('  ', { dir })
    assert.equal(empty.ok, false)
    if (!empty.ok) assert.match(empty.error, /id 不能为空/)

    const missing = inboxLoad('ho-nope-0000', { dir })
    assert.equal(missing.ok, false)
    if (!missing.ok) assert.match(missing.error, /收件箱无此待取件/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('核心层二次取件直接调用也报错（消费即弃协议语义）', () => {
  const dir = tmpHome()
  try {
    const pushed = pushHandoff(fakeSession(SAMPLE_EVENTS), {}, { dir })
    assert.equal(pushed.ok, true)
    if (!pushed.ok) return
    loadCard(pushed.id, dir)
    assert.throws(() => loadCard(pushed.id, dir), /收件箱无此待取件/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

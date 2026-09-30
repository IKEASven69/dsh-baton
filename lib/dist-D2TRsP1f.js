import { createRequire } from "node:module";
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
//#region node_modules/.pnpm/@agent-handoff+readers@file_4bf4d3bdf3c8dcd4c5a57556d6cf5739/node_modules/@agent-handoff/readers/dist/index.mjs
/** 路径形态判断：含分隔符或盘符即按路径匹配（文件系适配器的 id 就是绝对路径）。 */
function looksLikePath(reference) {
	return /[\\/]/.test(reference) || /^[A-Za-z]:/.test(reference);
}
const normPath = (p) => p.replace(/\//g, "\\").toLowerCase();
/**
* 在 refs 中解析 reference：
* - 'latest' / 空串 → 最新一条；
* - id 精确命中 → 直接返回；
* - 其余策略（id 前缀、路径、标题子串）合并候选，1 条解析、多条歧义、0 条 not-found。
*/
function resolveReference(reference, refs) {
	const sorted = [...refs].sort((a, b) => b.updatedAt - a.updatedAt);
	const q = reference.trim();
	if (q === "" || q.toLowerCase() === "latest") return sorted.length > 0 ? {
		kind: "resolved",
		ref: sorted[0]
	} : {
		kind: "not-found",
		reference
	};
	const exact = sorted.find((r) => r.id === q);
	if (exact !== void 0) return {
		kind: "resolved",
		ref: exact
	};
	const candidates = /* @__PURE__ */ new Map();
	const push = (r) => {
		candidates.set(r.id, r);
	};
	for (const r of sorted) if (r.id.startsWith(q) || r.kind === "file" && normPath(r.id).startsWith(normPath(q))) push(r);
	if (looksLikePath(q)) {
		const nq = normPath(q);
		for (const r of sorted) {
			if (r.kind !== "file") continue;
			const nid = normPath(r.id);
			if (nid === nq || nid.endsWith(nq)) push(r);
		}
	}
	const lq = q.toLowerCase();
	for (const r of sorted) if (r.title.toLowerCase().includes(lq)) push(r);
	const list = [...candidates.values()].sort((a, b) => b.updatedAt - a.updatedAt);
	if (list.length === 1) return {
		kind: "resolved",
		ref: list[0]
	};
	if (list.length > 1) return {
		kind: "ambiguous",
		candidates: list
	};
	return {
		kind: "not-found",
		reference
	};
}
function makeTurn(partial) {
	return {
		cwd: "",
		ts: "",
		toolName: "",
		toolFailed: false,
		model: "",
		...partial
	};
}
/** 逐行解析 transcript JSONL；非 JSON / 空行静默跳过（损坏记录不拖垮整会话） */
function* parseJsonl(text) {
	for (const raw of text.split("\n")) {
		const line = raw.trim();
		if (!line) continue;
		try {
			yield JSON.parse(line);
		} catch {
			continue;
		}
	}
}
/** 把 Claude message.content（字符串或 block 数组）压平为纯文本 */
function extractTextContent(content) {
	if (typeof content === "string") return content;
	if (Array.isArray(content)) return content.filter((b) => b && typeof b === "object" && b.type === "text").map((b) => typeof b.text === "string" ? b.text : "").join("\n");
	return "";
}
/** tool_use 的人类可读一行摘要 */
function summarizeToolCall(name, input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) return name;
	const inp = input;
	const cmd = inp.command;
	if (typeof cmd === "string") {
		const v = cmd.replace(/\s+/g, " ").trim();
		return v.slice(0, 100) + (v.length > 100 ? "…" : "");
	}
	for (const key of [
		"file_path",
		"path",
		"filePath"
	]) {
		const v = inp[key];
		if (typeof v === "string") return `${name}: ${v}`;
	}
	for (const v of Object.values(inp)) if (typeof v === "string") {
		const s = v.replace(/\s+/g, " ").trim();
		return `${name}: ${s.slice(0, 80)}` + (s.length > 80 ? "…" : "");
	}
	return name;
}
/** 把一行 Claude transcript JSON 拆成 Turn 列表 */
function entryToTurns(entry) {
	const turns = [];
	const etype = entry.type;
	const msg = entry.message ?? {};
	const cwd = typeof entry.cwd === "string" ? entry.cwd : "";
	const ts = typeof entry.timestamp === "string" ? entry.timestamp : "";
	const model = typeof msg.model === "string" ? msg.model : "";
	const content = msg.content;
	if (etype === "user" && msg.role === "user") {
		if (Array.isArray(content)) {
			const textParts = [];
			for (const block of content) {
				if (!block || typeof block !== "object") continue;
				if (block.type === "tool_result") {
					const rc = extractTextContent(block.content);
					turns.push(makeTurn({
						role: "tool",
						text: rc,
						cwd,
						ts,
						toolFailed: Boolean(block.is_error)
					}));
				} else if (block.type === "text") textParts.push(typeof block.text === "string" ? block.text : "");
			}
			const text = textParts.join("\n").trim();
			if (text) turns.push(makeTurn({
				role: "user",
				text,
				cwd,
				ts
			}));
		} else if (typeof content === "string") {
			const text = content.trim();
			if (text) turns.push(makeTurn({
				role: "user",
				text,
				cwd,
				ts
			}));
		}
		return turns;
	}
	if (etype === "assistant" && msg.role === "assistant") {
		if (typeof content === "string") turns.push(makeTurn({
			role: "assistant",
			text: content,
			cwd,
			ts,
			model
		}));
		else if (Array.isArray(content)) for (const block of content) {
			if (!block || typeof block !== "object") continue;
			const btype = block.type;
			if (btype === "text" && typeof block.text === "string" && block.text.trim()) turns.push(makeTurn({
				role: "assistant",
				text: block.text,
				cwd,
				ts,
				model
			}));
			else if (btype === "thinking" && typeof block.thinking === "string" && block.thinking.trim()) turns.push(makeTurn({
				role: "assistant",
				text: "[thinking] " + block.thinking,
				cwd,
				ts,
				model
			}));
			else if (btype === "tool_use") {
				const name = typeof block.name === "string" ? block.name : "";
				turns.push(makeTurn({
					role: "assistant",
					cwd,
					ts,
					model,
					text: summarizeToolCall(name, block.input),
					toolName: name
				}));
			}
		}
	}
	return turns;
}
/**
* Claude Code 适配器：~/.claude/projects 下递归的全部 .jsonl（引擎原生格式）。
* 移植自 dsh-hippo src/agents/claude.ts；root 可用 HANDOFF_ROOT_CLAUDE 覆盖（测试用）。
*/
const ROOT$4 = process.env["HANDOFF_ROOT_CLAUDE"] ?? join(homedir(), ".claude", "projects");
function* walkJsonl$1(dir) {
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const e of entries) {
		const p = join(dir, e.name);
		if (e.isDirectory()) yield* walkJsonl$1(p);
		else if (e.isFile() && e.name.endsWith(".jsonl")) yield p;
	}
}
/** 从转录头部几行取真实 cwd（用户条目带 cwd 字段）。
* 目录名解码有歧义（连字符 vs 路径分隔符），首行才是权威来源。 */
function realCwd(file, fallback) {
	try {
		const fd = openSync(file, "r");
		try {
			const buf = Buffer.alloc(8192);
			const n = readSync(fd, buf, 0, 8192, 0);
			const head = buf.toString("utf8", 0, n);
			const m = /"cwd"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(head);
			if (m) return JSON.parse(`"${m[1]}"`);
		} finally {
			closeSync(fd);
		}
	} catch {}
	return fallback;
}
const claudeAdapter = {
	name: "claude-code",
	root: ROOT$4,
	supported: true,
	discover() {
		const out = [];
		for (const file of walkJsonl$1(ROOT$4)) {
			let mtime = 0, size = 0;
			try {
				const st = statSync(file);
				mtime = st.mtimeMs;
				size = st.size;
			} catch {
				continue;
			}
			out.push({
				agent: this.name,
				id: file,
				title: basename(file, ".jsonl"),
				cwd: realCwd(file, basename(join(file, ".."))),
				updatedAt: mtime,
				fingerprint: `${Math.round(mtime)}:${size}`,
				kind: "file"
			});
		}
		return out.sort((a, b) => b.updatedAt - a.updatedAt);
	},
	parse(id) {
		let text;
		try {
			text = readFileSync(id, "utf8");
		} catch {
			return [];
		}
		const turns = [];
		for (const entry of parseJsonl(text)) turns.push(...entryToTurns(entry));
		return turns;
	}
};
/**
* Codex 适配器：~/.codex/sessions 下递归的 rollout-*.jsonl。
* session_meta 给 cwd；response_item 是权威消息流（event_msg 为 UI 事件，跳过避免重复）。
* 移植自 dsh-hippo src/agents/codex.ts；root 可用 HANDOFF_ROOT_CODEX 覆盖（测试用）。
*/
const ROOT$3 = process.env["HANDOFF_ROOT_CODEX"] ?? join(homedir(), ".codex", "sessions");
function* walkJsonl(dir) {
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const e of entries) {
		const p = join(dir, e.name);
		if (e.isDirectory()) yield* walkJsonl(p);
		else if (e.isFile() && e.name.endsWith(".jsonl")) yield p;
	}
}
function parseCodexText(text) {
	let cwd = "";
	const turns = [];
	for (const raw of text.split("\n")) {
		const line = raw.trim();
		if (line === "") continue;
		let obj;
		try {
			obj = JSON.parse(line);
		} catch {
			continue;
		}
		const ts = obj.timestamp ?? "";
		if (obj.type === "session_meta") {
			cwd = typeof obj.payload?.cwd === "string" ? obj.payload.cwd : "";
			continue;
		}
		if (obj.type !== "response_item" || obj.payload === void 0) continue;
		const p = obj.payload;
		if (p.type === "message") {
			const role = p.role === "user" ? "user" : p.role === "assistant" ? "assistant" : "";
			if (!role) continue;
			const body = (Array.isArray(p.content) ? p.content : []).map((c) => c && typeof c === "object" && typeof c.text === "string" ? c.text : "").filter(Boolean).join("\n");
			if (body) turns.push(makeTurn({
				role,
				text: body,
				cwd,
				ts,
				model: typeof p.model === "string" ? p.model : ""
			}));
		} else if (p.type === "function_call" || p.type === "custom_tool_call" || p.type === "local_shell_call") {
			const name = typeof p.name === "string" ? p.name : String(p.type);
			turns.push(makeTurn({
				role: "tool",
				text: name,
				cwd,
				ts,
				toolName: name
			}));
		} else if (p.type === "function_call_output" || p.type === "custom_tool_call_output") {
			const out = typeof p.output === "string" ? p.output : JSON.stringify(p.output ?? "");
			turns.push(makeTurn({
				role: "tool",
				text: out.slice(0, 2e3),
				cwd,
				ts,
				toolFailed: /\berror\b/i.test(out.slice(0, 400))
			}));
		}
	}
	return turns;
}
const codexAdapter = {
	name: "codex",
	root: ROOT$3,
	supported: true,
	discover() {
		const out = [];
		for (const file of walkJsonl(ROOT$3)) {
			let mtime = 0, size = 0;
			try {
				const st = statSync(file);
				mtime = st.mtimeMs;
				size = st.size;
			} catch {
				continue;
			}
			out.push({
				agent: this.name,
				id: file,
				title: basename(file, ".jsonl"),
				cwd: "",
				updatedAt: mtime,
				fingerprint: `${Math.round(mtime)}:${size}`,
				kind: "file"
			});
		}
		return out.sort((a, b) => b.updatedAt - a.updatedAt);
	},
	parse(id) {
		try {
			return parseCodexText(readFileSync(id, "utf8"));
		} catch {
			return [];
		}
	}
};
/**
* opencode 适配器：三层文件存储。
* session/<projectID>/ses_*.json（directory/title）→ message/<ses>/msg_*.json（role/time）
* → part/<msg>/prt_*.json（text/tool，state.status=error 是失败信号）。
* 移植自 dsh-hippo src/agents/opencode.ts；root 可用 HANDOFF_ROOT_OPENCODE 覆盖（测试用）。
*/
const ROOT$2 = process.env["HANDOFF_ROOT_OPENCODE"] ?? join(homedir(), ".local", "share", "opencode", "storage");
function parseJsonFile(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch {
		return null;
	}
}
function parseOpenCodeSession(sessionFile, storageRoot) {
	const session = parseJsonFile(sessionFile);
	if (!session?.id) return [];
	const cwd = session.directory ?? "";
	const msgDir = join(storageRoot, "message", session.id);
	let msgFiles;
	try {
		msgFiles = readdirSync(msgDir).filter((f) => f.endsWith(".json")).map((f) => join(msgDir, f));
	} catch {
		return [];
	}
	const msgs = msgFiles.map((f) => parseJsonFile(f)).filter((m) => m !== null && (m.role === "user" || m.role === "assistant") && typeof m.id === "string").sort((a, b) => (a.time?.created ?? 0) - (b.time?.created ?? 0));
	const turns = [];
	for (const m of msgs) {
		const partDir = join(storageRoot, "part", m.id);
		let partFiles;
		try {
			partFiles = readdirSync(partDir).filter((f) => f.endsWith(".json")).map((f) => join(partDir, f));
		} catch {
			partFiles = [];
		}
		const parts = partFiles.map((f) => parseJsonFile(f)).filter((p) => p !== null);
		const body = parts.filter((p) => p.type === "text" && p.text).map((p) => p.text).join("\n");
		const ts = m.time?.created ? new Date(m.time.created).toISOString() : "";
		if (body) turns.push(makeTurn({
			role: m.role === "user" ? "user" : "assistant",
			text: body,
			cwd,
			ts
		}));
		for (const p of parts) {
			if (p.type !== "tool") continue;
			turns.push(makeTurn({
				role: "tool",
				text: (p.text ?? "").slice(0, 2e3),
				cwd,
				ts,
				toolName: p.tool ?? "",
				toolFailed: p.state?.status === "error"
			}));
		}
	}
	return turns;
}
const opencodeAdapter = {
	name: "opencode",
	root: ROOT$2,
	supported: true,
	discover() {
		const out = [];
		const sessionRoot = join(ROOT$2, "session");
		let projects = [];
		try {
			projects = readdirSync(sessionRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(sessionRoot, d.name));
		} catch {
			return out;
		}
		for (const projDir of projects) {
			let names = [];
			try {
				names = readdirSync(projDir);
			} catch {
				continue;
			}
			for (const f of names) {
				if (!f.endsWith(".json")) continue;
				const file = join(projDir, f);
				const meta = parseJsonFile(file);
				let mtime = 0;
				try {
					mtime = statSync(file).mtimeMs;
				} catch {
					continue;
				}
				out.push({
					agent: this.name,
					id: file,
					title: meta?.title ?? basename(f, ".json"),
					cwd: meta?.directory ?? "",
					updatedAt: meta?.time?.updated ?? mtime,
					fingerprint: `${Math.round(mtime)}`,
					kind: "file"
				});
			}
		}
		return out.sort((a, b) => b.updatedAt - a.updatedAt);
	},
	parse(id) {
		return parseOpenCodeSession(id, ROOT$2);
	}
};
/**
* zcode 适配器：~/.zcode/cli/db/db.sqlite 的 session/message/part 三层表。
* 活库（当前会话在写）——一律 readonly 打开，随开随关。
* part 类型：text（正文）/ reasoning（思考，映射为 assistant 轮）/ tool（state.status=error
* 是失败信号）/ step-start（跳过）。
*
* 移植自 dsh-hippo src/agents/zcode.ts，依赖消除：better-sqlite3 → Node 内置
* node:sqlite（DatabaseSync，Node ≥22 自带；不支持则 supported=false 优雅降级，
* 不引入任何原生模块）。dbPath 可用 HANDOFF_ROOT_ZCODE 覆盖（测试用）。
*/
const DB_PATH = process.env["HANDOFF_ROOT_ZCODE"] ?? join(homedir(), ".zcode", "cli", "db", "db.sqlite");
/** node:sqlite 可用性：createRequire 同步加载内建模块，失败即不支持（不拖垮其他适配器）。 */
function loadSqlite() {
	try {
		return createRequire(import.meta.url)("node:sqlite").DatabaseSync;
	} catch {
		return null;
	}
}
const DatabaseSync = loadSqlite();
function openReadonly(dbPath = DB_PATH) {
	if (DatabaseSync === null || !existsSync(dbPath)) return null;
	try {
		return new DatabaseSync(dbPath, { readOnly: true });
	} catch {
		return null;
	}
}
/** dbPath 可注入（单测用临时库），缺省真实 ~/.zcode/cli/db/db.sqlite。 */
function parseZcodeSession(sessionId, dbPath = DB_PATH) {
	const db = openReadonly(dbPath);
	if (db === null) return [];
	try {
		const cwd = db.prepare("SELECT id, path FROM session WHERE id = ?").all(sessionId)[0]?.path ?? "";
		const messages = db.prepare("SELECT id, data FROM message WHERE session_id = ? ORDER BY sequence").all(sessionId);
		const turns = [];
		for (const m of messages) {
			let role = null;
			let created = 0;
			try {
				const d = JSON.parse(m.data);
				role = d.role === "user" ? "user" : d.role === "assistant" ? "assistant" : null;
				created = d.time?.created ?? 0;
			} catch {
				continue;
			}
			if (role === null) continue;
			const ts = created ? new Date(created).toISOString() : "";
			const parts = db.prepare("SELECT data FROM part WHERE message_id = ? ORDER BY sequence").all(m.id);
			for (const p of parts) {
				let pd;
				try {
					pd = JSON.parse(p.data);
				} catch {
					continue;
				}
				if (pd.type === "text" && pd.text) turns.push(makeTurn({
					role,
					text: pd.text,
					cwd,
					ts
				}));
				else if (pd.type === "reasoning" && pd.text) turns.push(makeTurn({
					role: "assistant",
					text: pd.text.slice(0, 4e3),
					cwd,
					ts
				}));
				else if (pd.type === "tool") {
					const failed = pd.state?.status === "error";
					const input = typeof pd.state?.input === "object" && pd.state?.input !== null ? JSON.stringify(pd.state.input).slice(0, 300) : "";
					const output = typeof pd.state?.output === "string" ? pd.state.output.slice(0, 2e3) : "";
					turns.push(makeTurn({
						role: "tool",
						text: (input + "\n" + output).trim(),
						cwd,
						ts,
						toolName: pd.tool ?? "",
						toolFailed: failed
					}));
				}
			}
		}
		return turns;
	} finally {
		db.close();
	}
}
const zcodeAdapter = {
	name: "zcode",
	root: DB_PATH,
	supported: DatabaseSync !== null,
	note: DatabaseSync === null ? "需要 Node ≥22（node:sqlite 内建模块）" : void 0,
	discover() {
		const db = openReadonly();
		if (db === null) return [];
		try {
			return db.prepare("SELECT id, path, title, time_created, time_updated FROM session").all().map((r) => ({
				agent: this.name,
				id: r.id,
				title: r.title ?? r.id.slice(0, 18),
				cwd: r.path ?? "",
				updatedAt: r.time_updated ?? r.time_created ?? 0,
				fingerprint: String(r.time_updated ?? r.time_created ?? 0),
				kind: "sqlite"
			})).sort((a, b) => b.updatedAt - a.updatedAt);
		} catch {
			return [];
		} finally {
			db.close();
		}
	},
	parse(id) {
		return parseZcodeSession(id);
	}
};
/**
* pi 适配器（badlogic/pi-mono）：~/.pi/agent/sessions/<路径转义>/时间戳_uuid.jsonl
* 事件流格式：type=session 给 cwd；type=message 的 message.content[] 是文本块。
* 标题取首条用户消息前 40 字（发现期限量读首 64KB，不整文件解析）。
* 移植自 dsh-hippo src/agents/pi.ts；root 可用 HANDOFF_ROOT_PI 覆盖（测试用）。
*/
const ROOT$1 = process.env["HANDOFF_ROOT_PI"] ?? join(homedir(), ".pi", "agent", "sessions");
/** 限量读文件头（标题/cwd 用，避免发现期整读大会话）。 */
function readHead(path, bytes = 65536) {
	try {
		const fd = openSync(path, "r");
		try {
			const buf = Buffer.alloc(bytes);
			const n = readSync(fd, buf, 0, bytes, 0);
			return buf.toString("utf8", 0, n);
		} finally {
			closeSync(fd);
		}
	} catch {
		return "";
	}
}
function cwdOf(headText) {
	for (const raw of headText.split("\n")) {
		if (raw.trim() === "") continue;
		try {
			const ev = JSON.parse(raw);
			if (ev.type === "session" && typeof ev.cwd === "string") return ev.cwd;
		} catch {
			continue;
		}
	}
	return "";
}
function titleOf(headText) {
	for (const raw of headText.split("\n")) {
		if (raw.trim() === "") continue;
		try {
			const ev = JSON.parse(raw);
			if (ev.type === "message" && ev.message?.role === "user") {
				const text = (ev.message.content ?? []).map((c) => c.text ?? "").join(" ").trim();
				if (text) return text.slice(0, 40);
			}
		} catch {
			continue;
		}
	}
	return "";
}
function parsePiText(text) {
	let cwd = "";
	const turns = [];
	for (const raw of text.split("\n")) {
		if (raw.trim() === "") continue;
		let ev;
		try {
			ev = JSON.parse(raw);
		} catch {
			continue;
		}
		if (ev.type === "session" && typeof ev.cwd === "string") {
			cwd = ev.cwd;
			continue;
		}
		if (ev.type !== "message" || !ev.message) continue;
		const role = ev.message.role === "user" ? "user" : ev.message.role === "assistant" ? "assistant" : "";
		if (!role) continue;
		const body = (ev.message.content ?? []).filter((c) => c.type === "text" && c.text).map((c) => c.text).join("\n");
		if (body) turns.push(makeTurn({
			role,
			text: body,
			cwd
		}));
	}
	return turns;
}
const piAdapter = {
	name: "pi",
	root: ROOT$1,
	supported: true,
	discover() {
		const out = [];
		let dirs = [];
		try {
			dirs = readdirSync(ROOT$1, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(ROOT$1, d.name));
		} catch {
			return out;
		}
		for (const dir of dirs) {
			let files = [];
			try {
				files = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
			} catch {
				continue;
			}
			for (const f of files) {
				const file = join(dir, f);
				let mtime = 0, size = 0;
				try {
					const st = statSync(file);
					mtime = st.mtimeMs;
					size = st.size;
				} catch {
					continue;
				}
				const head = readHead(file);
				out.push({
					agent: this.name,
					id: file,
					title: titleOf(head) || basename(f, ".jsonl"),
					cwd: cwdOf(head),
					updatedAt: mtime,
					fingerprint: `${Math.round(mtime)}:${size}`,
					kind: "file"
				});
			}
		}
		return out.sort((a, b) => b.updatedAt - a.updatedAt);
	},
	parse(id) {
		try {
			return parsePiText(readFileSync(id, "utf8"));
		} catch {
			return [];
		}
	}
};
/**
* WorkBuddy 适配器：~/.workbuddy/projects/<workspace-slug>/<uuid>.jsonl
* 一文件 = 一会话（单 sessionId）。记录类型（2026-09-01 实测真实会话）：
*
*   message(role=user|assistant) → 用户/助手轮。content 是块数组，取
*     input_text/output_text 块的 text 拼接；image_blob_ref 等其他块跳过。
*   reasoning → 思考行，跳过（与 function_call 交织密度高，并入会打乱轮次结构；
*     交接只要显式陈述，思考本就是过程自语）。
*   function_call → 工具调用轮：toolName=name，text=name+arguments 摘要。
*   function_call_result → 工具结果轮：text=output.text，status!=='completed' 即 toolFailed。
*   file-history-snapshot / ai-title / resend-fork-notice → 跳过
*     （ai-title 的标题在 discover 阶段取走作 SessionRef.title）。
*
* 移植自 dsh-hippo src/agents/workbuddy.ts；root 可用 HANDOFF_ROOT_WORKBUDDY 覆盖（测试用）。
*/
const ROOT = process.env["HANDOFF_ROOT_WORKBUDDY"] ?? join(homedir(), ".workbuddy", "projects");
/** 逐行读 JSONL（坏行跳过，与 claude 适配器同策略）。 */
function* readJsonl(file) {
	for (const line of readFileSync(file, "utf8").split("\n")) {
		const t = line.trim();
		if (t === "") continue;
		try {
			yield JSON.parse(t);
		} catch {}
	}
}
/** content 块数组 → 纯文本（取 *_text 块，其余块跳过）。 */
function blocksToText(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	const parts = [];
	for (const b of content) if (b !== null && typeof b === "object" && typeof b.type === "string") {
		const { type, text } = b;
		if (type.endsWith("_text") && typeof text === "string" && text !== "") parts.push(text);
	}
	return parts.join("\n").trim();
}
/** function_call_result 的 output：{type:'text',text} 对象或纯字符串。 */
function resultToText(output) {
	if (typeof output === "string") return output;
	if (output !== null && typeof output === "object") {
		const { text } = output;
		if (typeof text === "string") return text;
	}
	return "";
}
const AGENTS = [
	claudeAdapter,
	codexAdapter,
	opencodeAdapter,
	zcodeAdapter,
	piAdapter,
	{
		name: "workbuddy",
		root: ROOT,
		supported: true,
		discover() {
			const out = [];
			let projectDirs;
			try {
				projectDirs = readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name);
			} catch {
				return out;
			}
			for (const dir of projectDirs) {
				let files;
				try {
					files = readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(".jsonl"));
				} catch {
					continue;
				}
				for (const f of files) {
					const full = join(ROOT, dir, f);
					let mtime = 0;
					let size = 0;
					try {
						const st = statSync(full);
						mtime = st.mtimeMs;
						size = st.size;
					} catch {
						continue;
					}
					let title = basename(f, ".jsonl");
					let cwd = "";
					try {
						const fd = openSync(full, "r");
						const buf = Buffer.alloc(65536);
						const n = readSync(fd, buf, 0, buf.length, 0);
						closeSync(fd);
						const head = buf.slice(0, n).toString("utf8");
						const m = head.match(/"type":\s*"ai-title",[^}]*?"aiTitle":\s*"((?:[^"\\]|\\.)*)"/);
						if (m) try {
							title = JSON.parse(`"${m[1]}"`);
						} catch {
							title = m[1];
						}
						const cm = head.match(/"cwd":\s*"((?:[^"\\]|\\.)*)"/);
						if (cm) try {
							cwd = JSON.parse(`"${cm[1]}"`);
						} catch {
							cwd = cm[1];
						}
					} catch {}
					out.push({
						agent: this.name,
						id: full,
						title,
						cwd,
						updatedAt: mtime,
						fingerprint: `${Math.round(mtime)}:${size}`,
						kind: "file"
					});
				}
			}
			return out.sort((a, b) => b.updatedAt - a.updatedAt);
		},
		parse(id) {
			let entries;
			try {
				entries = [...readJsonl(id)];
			} catch {
				return [];
			}
			const turns = [];
			for (const e of entries) {
				const type = e.type;
				const cwd = typeof e.cwd === "string" ? e.cwd : "";
				const ts = typeof e.timestamp === "number" ? new Date(e.timestamp).toISOString() : "";
				if (type === "message") {
					const role = e.role === "user" ? "user" : e.role === "assistant" ? "assistant" : null;
					if (role === null) continue;
					const text = blocksToText(e.content);
					if (text === "") continue;
					turns.push(makeTurn({
						role,
						text,
						cwd,
						ts
					}));
				} else if (type === "function_call") {
					const name = typeof e.name === "string" ? e.name : "";
					if (name === "") continue;
					const args = typeof e.arguments === "string" ? e.arguments.slice(0, 400) : "";
					turns.push(makeTurn({
						role: "tool",
						text: args === "" ? name : `${name} ${args}`,
						cwd,
						ts,
						toolName: name
					}));
				} else if (type === "function_call_result") {
					const name = typeof e.name === "string" ? e.name : "";
					const status = typeof e.status === "string" ? e.status : "";
					const text = resultToText(e.output).slice(0, 2e3);
					turns.push(makeTurn({
						role: "tool",
						text: text === "" ? `(${name} 无输出)` : text,
						cwd,
						ts,
						toolName: name === "" ? "result" : name,
						toolFailed: status !== "" && status !== "completed"
					}));
				}
			}
			return turns;
		}
	}
];
const byName = new Map(AGENTS.map((a) => [a.name, a]));
/** 取适配器；未知名抛中文错（CLI 层转成用户可读信息）。 */
function adapterFor(agent) {
	const a = byName.get(agent);
	if (a === void 0) throw new Error(`未知 agent：${agent}（支持：${AGENTS.map((x) => x.name).join(" / ")}）`);
	return a;
}
/** 发现会话：给 agent 名只查该家；不给则查全部支持的家，单家失败不拖垮整体。 */
function listSessions(agent) {
	if (agent !== void 0) {
		const a = adapterFor(agent);
		if (!a.supported) return [];
		return a.discover().sort((x, y) => y.updatedAt - x.updatedAt);
	}
	const out = [];
	for (const a of AGENTS) {
		if (!a.supported) continue;
		try {
			out.push(...a.discover());
		} catch {}
	}
	return out.sort((x, y) => y.updatedAt - x.updatedAt);
}
/** 解析一个会话为 Turn 流；ref 可以是 SessionRef 或适配器 id 字符串。 */
function readSession(agent, ref) {
	const a = adapterFor(agent);
	if (!a.supported) return [];
	const id = typeof ref === "string" ? ref : ref.id;
	try {
		return a.parse(id);
	} catch {
		return [];
	}
}
/** 引用解析：先发现该 agent 的会话，再按 id/路径/标题规则匹配。 */
function resolveAgentReference(agent, reference) {
	return resolveReference(reference, listSessions(agent));
}
//#endregion
export { AGENTS, listSessions, readSession, resolveAgentReference };

//# sourceMappingURL=dist-D2TRsP1f.js.map
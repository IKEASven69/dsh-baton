window.__ModuleLoader__.load({
	id: "dsh-baton",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		"use strict";
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __export = (target, all) => {
		  for (var name in all)
		    __defProp(target, name, { get: all[name], enumerable: true });
		};
		var __copyProps = (to, from, except, desc) => {
		  if (from && typeof from === "object" || typeof from === "function") {
		    for (let key of __getOwnPropNames(from))
		      if (!__hasOwnProp.call(to, key) && key !== except)
		        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
		  }
		  return to;
		};
		var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
		
		// src/client.ts
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  inject: () => inject
		});
		module.exports = __toCommonJS(client_exports);
		var import_react = require("react");
		var inject = ["slots"];
		var ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="dsh-baton"><defs><linearGradient id="bt-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366F1"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient><linearGradient id="bt-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".26"/><stop offset=".55" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bt-bg)"/><rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bt-sheen)"/><rect x="2.75" y="2.75" width="58.5" height="58.5" rx="14.25" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="1.5"/><g transform="rotate(-45 32 32)"><rect x="12" y="28" width="40" height="11" rx="5.5" fill="#1e1b4b" opacity=".28"/><rect x="12" y="26.5" width="40" height="11" rx="5.5" fill="#ffffff"/><rect x="30" y="26.5" width="4" height="11" fill="#7c6cf8"/></g></svg>';
		var CSS = `
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
		  transition: border-color .15s ease, background .15s ease; }
		.bt-pending:hover { border-color: var(--bt-a); background: var(--bt-hover); }
		.bt-pending-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.bt-pending-meta { font-size: 11px; color: var(--bt-mut); opacity: .85; grid-column: 1 / -1; display: flex; gap: 10px; flex-wrap: wrap; }
		.bt-matrix { display: flex; flex-direction: column; }
		.bt-mrow { display: grid; grid-template-columns: 110px 1fr auto auto; gap: 10px; align-items: center;
		  padding: 7px 2px; font-size: 12.5px; border-bottom: 1px dashed var(--bt-line);
		  transition: opacity .15s ease; }
		.bt-mrow:last-child { border-bottom: none; }
		.bt-mrow-idle { opacity: .48; }
		.bt-mrow-idle:hover { opacity: .8; }
		.bt-mname { font-weight: 600; font-family: ui-monospace, monospace; font-size: 12px; }
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
		.bt-note summary::before { content: '\u25B8'; font-size: 10px; transition: transform .15s ease; }
		.bt-note[open] summary::before { transform: rotate(90deg); }
		.bt-note-body { margin-top: 6px; }
		`;
		async function getState() {
		  const res = await fetch("/dsh-baton/state", { cache: "no-store" });
		  const body = await res.json();
		  if (!res.ok || "error" in body) throw new Error("error" in body ? body.error : `HTTP ${res.status}`);
		  return body;
		}
		async function post(path, body) {
		  const res = await fetch(path, {
		    method: "POST",
		    headers: { "content-type": "application/json" },
		    body: JSON.stringify(body)
		  });
		  const data = await res.json();
		  if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : `HTTP ${res.status}`);
		  return data;
		}
		function fmtTime(iso) {
		  if (iso === "") return "\uFF08\u65E0\u65F6\u95F4\uFF09";
		  const d = new Date(iso);
		  if (Number.isNaN(d.getTime())) return iso;
		  const pad = (n) => String(n).padStart(2, "0");
		  return `${d.getMonth() + 1}\u6708${d.getDate()}\u65E5 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
		}
		function PendingList({ rows }) {
		  if (rows.length === 0) {
		    return (0, import_react.createElement)(
		      "div",
		      { className: "bt-banner bt-banner-info" },
		      "\u{1F4ED} \u6536\u4EF6\u7BB1\u4E3A\u7A7A\u3002\u53D6\u4EF6\u4E0D\u5728\u6B64\u8FDB\u884C\u2014\u2014\u5728\u4F1A\u8BDD\u91CC\u7528 /inbox \u6D88\u8D39\u5373\u53D6\u3002"
		    );
		  }
		  return (0, import_react.createElement)(
		    "div",
		    { className: "bt-rows" },
		    ...rows.map(
		      (p) => (0, import_react.createElement)(
		        "div",
		        { key: p.id, className: "bt-pending", title: p.id },
		        (0, import_react.createElement)("span", { className: "bt-pending-title" }, p.title !== "" ? p.title : p.id),
		        (0, import_react.createElement)("span", { className: "bt-sub" }, fmtTime(p.pushedAt)),
		        (0, import_react.createElement)(
		          "span",
		          { className: "bt-pending-meta" },
		          (0, import_react.createElement)("span", null, `\u6765\u6E90 ${p.agent}`),
		          p.project !== "" ? (0, import_react.createElement)("span", null, `\u9879\u76EE ${p.project}`) : null,
		          (0, import_react.createElement)("span", null, `id ${p.id}`)
		        )
		      )
		    )
		  );
		}
		function ProviderMatrix({ rows, busy, onToggle }) {
		  return (0, import_react.createElement)(
		    "div",
		    { className: "bt-matrix" },
		    ...rows.map(
		      (r) => (0, import_react.createElement)(
		        "div",
		        {
		          key: r.name,
		          className: `bt-mrow${!r.supported || r.sessions === 0 ? " bt-mrow-idle" : ""}`,
		          title: r.note !== "" ? r.note : void 0
		        },
		        (0, import_react.createElement)("span", { className: "bt-mname" }, r.name),
		        (0, import_react.createElement)(
		          "span",
		          { className: "bt-mstat" },
		          r.supported ? `${r.sessions >= 0 ? `${r.sessions} \u4E2A\u4F1A\u8BDD` : "\u4F1A\u8BDD\u6570\u63A2\u6D4B\u5931\u8D25"}` : `\u672C\u673A\u4E0D\u652F\u6301${r.note !== "" ? `\uFF1A${r.note}` : ""}`
		        ),
		        (0, import_react.createElement)(
		          "span",
		          { className: `bt-pill ${r.supported ? "bt-pill-ok" : "bt-pill-no"}` },
		          r.supported ? "\u652F\u6301" : "\u4E0D\u53EF\u7528"
		        ),
		        (0, import_react.createElement)("button", {
		          className: `bt-toggle${r.enabled ? " bt-toggle-on" : ""}`,
		          role: "switch",
		          "aria-checked": r.enabled,
		          "aria-label": `${r.name} \u8BFB\u53D6\u5F00\u5173`,
		          disabled: busy !== null,
		          title: r.enabled ? `\u70B9\u51FB\u505C\u7528 ${r.name}\uFF08foreign_session_read \u5C06\u8FD4\u56DE\u300C\u5DF2\u505C\u7528\u300D\uFF09` : `\u70B9\u51FB\u542F\u7528 ${r.name}`,
		          onClick: () => {
		            onToggle(r.name, !r.enabled);
		          }
		        })
		      )
		    )
		  );
		}
		function Panel() {
		  const [state, setState] = (0, import_react.useState)(null);
		  const [error, setError] = (0, import_react.useState)(null);
		  const [busy, setBusy] = (0, import_react.useState)(null);
		  const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
		  const reload = () => {
		    void getState().then(
		      (s) => {
		        setState(s);
		        setError(null);
		      },
		      (e) => {
		        setError(e instanceof Error ? e.message : String(e));
		      }
		    );
		  };
		  (0, import_react.useEffect)(reload, []);
		  const toggle = (name, enabled) => {
		    setBusy(name);
		    void post("/dsh-baton/provider", { provider: name, enabled }).then((r) => {
		      setState(r.state);
		      setError(null);
		    }).catch((e) => {
		      setError(e instanceof Error ? e.message : String(e));
		    }).finally(() => {
		      setBusy(null);
		    });
		  };
		  const clear = () => {
		    if (!confirmClear) {
		      setConfirmClear(true);
		      setTimeout(() => {
		        setConfirmClear(false);
		      }, 3e3);
		      return;
		    }
		    setConfirmClear(false);
		    setBusy("clear");
		    void post("/dsh-baton/clear-archived", {}).then(() => {
		      reload();
		    }).catch((e) => {
		      setError(e instanceof Error ? e.message : String(e));
		    }).finally(() => {
		      setBusy(null);
		    });
		  };
		  const archivedCount = state?.archivedCount ?? 0;
		  return (0, import_react.createElement)(
		    "div",
		    { className: "bt-panel" },
		    (0, import_react.createElement)("style", null, CSS),
		    // 头卡：标识 + 刷新
		    (0, import_react.createElement)(
		      "div",
		      { className: "bt-card" },
		      (0, import_react.createElement)(
		        "div",
		        { className: "bt-head" },
		        (0, import_react.createElement)("span", { className: "bt-logo", dangerouslySetInnerHTML: { __html: ICON_SVG } }),
		        (0, import_react.createElement)(
		          "span",
		          null,
		          (0, import_react.createElement)("div", { className: "bt-title" }, "dsh-baton \u4F1A\u8BDD\u63A5\u529B"),
		          (0, import_react.createElement)("div", { className: "bt-sub" }, "\u4EA4\u63A5\u5361\u7247\u6536\u4EF6\u7BB1 + \u516B\u5BB6\u5916\u90E8 agent \u4F1A\u8BDD\u8BFB\u53D6\u5668\u5F00\u5173")
		        ),
		        (0, import_react.createElement)("span", { className: "bt-spacer" }),
		        (0, import_react.createElement)("button", { className: "bt-btn", onClick: reload, disabled: busy !== null }, "\u27F3 \u5237\u65B0")
		      ),
		      error !== null ? (0, import_react.createElement)("div", { className: "bt-banner bt-banner-err" }, error) : null
		    ),
		    // 收件箱概览
		    (0, import_react.createElement)(
		      "div",
		      { className: "bt-card" },
		      (0, import_react.createElement)(
		        "div",
		        { className: "bt-head" },
		        (0, import_react.createElement)("span", { className: "bt-title", style: { fontSize: 13 } }, "\u6536\u4EF6\u7BB1\u6982\u89C8"),
		        (0, import_react.createElement)("span", { className: `bt-badge${(state?.pending.length ?? 0) > 0 ? " bt-badge-hot" : ""}` }, `pending ${state?.pending.length ?? "\u2026"}`),
		        (0, import_react.createElement)("span", { className: `bt-badge${archivedCount > 0 ? " bt-badge-hot" : ""}` }, `archived ${archivedCount}`),
		        (0, import_react.createElement)("span", { className: "bt-spacer" }),
		        (0, import_react.createElement)("button", {
		          className: `bt-btn bt-btn-danger${confirmClear ? " bt-btn-confirm" : ""}`,
		          disabled: busy !== null || archivedCount === 0,
		          onClick: clear,
		          title: "\u5220\u9664 archived/ \u4E0B\u5168\u90E8\u5DF2\u6D88\u8D39\u5361\u7247\uFF08\u4E0D\u53EF\u6062\u590D\uFF09"
		        }, confirmClear ? `\u786E\u8BA4\u6E05\u7A7A ${archivedCount} \u5F20\uFF1F` : "\u6E05\u7A7A archived")
		      ),
		      state !== null ? (0, import_react.createElement)(PendingList, { rows: state.pending }) : (0, import_react.createElement)("div", { className: "bt-sub" }, "\u52A0\u8F7D\u4E2D\u2026")
		    ),
		    // 支持矩阵
		    (0, import_react.createElement)(
		      "div",
		      { className: "bt-card" },
		      (0, import_react.createElement)(
		        "div",
		        { className: "bt-head" },
		        (0, import_react.createElement)("span", { className: "bt-title", style: { fontSize: 13 } }, "\u652F\u6301\u77E9\u9635\uFF08\u516B\u5BB6\u8BFB\u53D6\u5668\uFF09")
		      ),
		      state !== null ? (0, import_react.createElement)(ProviderMatrix, { rows: state.providers, busy, onToggle: toggle }) : (0, import_react.createElement)("div", { className: "bt-sub" }, "\u52A0\u8F7D\u4E2D\u2026"),
		      (0, import_react.createElement)(
		        "details",
		        { className: "bt-note" },
		        (0, import_react.createElement)("summary", null, "\u{1F4A1} \u5F00\u5173\u8BED\u4E49\u8BF4\u660E"),
		        (0, import_react.createElement)(
		          "div",
		          { className: "bt-note-body" },
		          "\u5173\u6389\u7684 provider\uFF1Aforeign_session_read \u5BF9\u8BE5\u5BB6\u8FD4\u56DE\u89C4\u8303\u9519\u8BEF\u503C\u300C\u5DF2\u505C\u7528\u300D\uFF1B/resume-* \u5BF9\u5E94 skill \u7684\u6307\u5F15\u6587\u672C\u4E3A\u9759\u6001\u5185\u5BB9\uFF0C\u505C\u7528\u72B6\u6001\u7531\u5DE5\u5177\u62A5\u9519\u515C\u4F4F\uFF0C\u6A21\u578B\u53EF\u89C1\u3002\u4F1A\u8BDD\u6570\u4E3A 0 \u7684\u7070\u8272\u884C\u8868\u793A\u8BE5\u5BB6\u672C\u673A\u672A\u88C5\u6216\u6682\u65E0\u4F1A\u8BDD\uFF0C\u5F00\u5173\u4FDD\u7559\u4F46\u65E0\u6570\u636E\u53EF\u8BFB\u3002"
		        )
		      )
		    )
		  );
		}
		function apply(ctx) {
		  const slots = ctx.slots;
		  if (slots === null || typeof slots !== "object" || typeof slots.inject !== "function" || typeof slots.register !== "function") {
		    console.warn("[dsh-baton] \u5BBF\u4E3B\u672A\u63D0\u4F9B\u53EF\u7528\u7684 slots \u670D\u52A1\uFF08\u9700\u8981 @deepseek-ai/dsh-client-ui-renderer\uFF09\uFF0C\u8BBE\u7F6E\u5361\u8DF3\u8FC7\u6302\u8F7D");
		    return;
		  }
		  ctx.slots.inject("settings.section", () => ctx.slots.register(
		    { name: "settings.section", id: "dsh-baton", order: 42, label: "dsh-baton" },
		    () => (0, import_react.createElement)(Panel)
		  ));
		}
		
		return module.exports;
	}
});

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
		var CSS = `
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
		        { key: r.name, className: "bt-mrow", title: r.note !== "" ? r.note : void 0 },
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
		        (0, import_react.createElement)("span", { className: "bt-logo" }, "\u68D2"),
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
		        (0, import_react.createElement)("span", { className: "bt-badge" }, `pending ${state?.pending.length ?? "\u2026"}`),
		        (0, import_react.createElement)("span", { className: "bt-badge" }, `archived ${archivedCount}`),
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
		        "div",
		        { className: "bt-note" },
		        "\u{1F4A1} \u5173\u6389\u7684 provider\uFF1Aforeign_session_read \u5BF9\u8BE5\u5BB6\u8FD4\u56DE\u89C4\u8303\u9519\u8BEF\u503C\u300C\u5DF2\u505C\u7528\u300D\uFF1B/resume-* \u5BF9\u5E94 skill \u7684\u6307\u5F15\u6587\u672C\u4E3A\u9759\u6001\u5185\u5BB9\uFF0C\u505C\u7528\u72B6\u6001\u7531\u5DE5\u5177\u62A5\u9519\u515C\u4F4F\uFF0C\u6A21\u578B\u53EF\u89C1\u3002"
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

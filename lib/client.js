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
		
		// src/brand-icons.ts
		var BRAND_PATHS = {
		  "claude": "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
		  "codex": "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
		  "cursor": "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
		};
		var BRAND_LETTERS = {
		  opencode: "OC",
		  zcode: "Z",
		  pi: "\u03C0",
		  workbuddy: "W",
		  grok: "G"
		};
		var BRAND_BG = {
		  claude: "#D97757",
		  codex: "#0f0f0f",
		  cursor: "#1a1a1a",
		  opencode: "#18181b",
		  zcode: "#4f46e5",
		  pi: "#0284c7",
		  workbuddy: "#b45309",
		  grok: "#111111"
		};
		var PROVIDER_LABEL = {
		  claude: "Claude Code",
		  codex: "Codex CLI",
		  opencode: "OpenCode",
		  zcode: "ZCode",
		  pi: "Pi",
		  workbuddy: "WorkBuddy",
		  cursor: "Cursor",
		  grok: "Grok CLI"
		};
		
		// src/client.ts
		var inject = ["slots"];
		var ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="dsh-baton"><defs><linearGradient id="bt-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366F1"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient><linearGradient id="bt-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".26"/><stop offset=".55" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bt-bg)"/><rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bt-sheen)"/><rect x="2.75" y="2.75" width="58.5" height="58.5" rx="14.25" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="1.5"/><g transform="rotate(-45 32 32)"><rect x="12" y="28" width="40" height="11" rx="5.5" fill="#1e1b4b" opacity=".28"/><rect x="12" y="26.5" width="40" height="11" rx="5.5" fill="#ffffff"/><rect x="30" y="26.5" width="4" height="11" fill="#7c6cf8"/></g></svg>';
		function ProviderIcon({ name, size = 20 }) {
		  const bg = BRAND_BG[name] ?? "#52525b";
		  const path = BRAND_PATHS[name];
		  const letter = BRAND_LETTERS[name] ?? (name.charAt(0).toUpperCase() || "?");
		  return (0, import_react.createElement)(
		    "span",
		    {
		      className: "bt-icon",
		      style: { background: bg, width: size, height: size },
		      title: PROVIDER_LABEL[name] ?? name
		    },
		    path ? (0, import_react.createElement)(
		      "svg",
		      { viewBox: "0 0 24 24", width: Math.round(size * 0.62), height: Math.round(size * 0.62), "aria-hidden": true },
		      (0, import_react.createElement)("path", { d: path, fill: "#fff" })
		    ) : (0, import_react.createElement)("span", { className: "bt-icon-letter", style: { fontSize: letter.length > 1 ? 8.5 : 11 } }, letter)
		  );
		}
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
		  flex: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.14), 0 1px 2px rgba(0,0,0,.16); }
		.bt-icon svg { display: block; }
		.bt-icon-letter { color: #fff; font-weight: 700; line-height: 1; letter-spacing: -.02em; user-select: none; }
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
		function PendingList({ rows }) {
		  const [openIds, setOpenIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
		  const toggleOpen = (id) => {
		    setOpenIds((prev) => {
		      const next = new Set(prev);
		      if (next.has(id)) next.delete(id);
		      else next.add(id);
		      return next;
		    });
		  };
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
		    ...rows.map((p) => {
		      const open = openIds.has(p.id);
		      return (0, import_react.createElement)(
		        "div",
		        {
		          key: p.id,
		          className: `bt-pending${open ? " bt-pending-open" : ""}`,
		          title: p.id,
		          onClick: () => {
		            toggleOpen(p.id);
		          }
		        },
		        (0, import_react.createElement)("span", { className: "bt-pending-title" }, p.title !== "" ? p.title : p.id),
		        (0, import_react.createElement)("span", { className: "bt-pending-chev" }, "\u25B6"),
		        (0, import_react.createElement)(
		          "span",
		          { className: "bt-pending-meta" },
		          (0, import_react.createElement)(
		            "span",
		            { className: "bt-src" },
		            (0, import_react.createElement)(ProviderIcon, { name: p.agent, size: 14 }),
		            `\u6765\u6E90 ${PROVIDER_LABEL[p.agent] ?? p.agent}`
		          ),
		          p.project !== "" ? (0, import_react.createElement)("span", null, `\u9879\u76EE ${p.project}`) : null,
		          (0, import_react.createElement)("span", null, `id ${p.id}`)
		        ),
		        open ? (0, import_react.createElement)(
		          "div",
		          { className: "bt-preview", onClick: (e) => e.stopPropagation() },
		          (0, import_react.createElement)("span", null, p.preview !== "" ? p.preview : "\uFF08\u5361\u7247\u6B63\u6587\u4E3A\u7A7A\uFF09"),
		          (0, import_react.createElement)("span", { className: "bt-preview-hint" }, "\u2014\u2014 \u4EC5\u9884\u89C8\u300C\u76EE\u6807\u300D\u6BB5\uFF1B\u53D6\u4EF6\u8BF7\u56DE\u4F1A\u8BDD\u7528 /inbox\u3002")
		        ) : null
		      );
		    })
		  );
		}
		function ProviderMatrix({ rows, busy, onToggle }) {
		  return (0, import_react.createElement)(
		    "div",
		    { className: "bt-matrix" },
		    ...rows.map((r) => {
		      const label = PROVIDER_LABEL[r.name] ?? r.name;
		      return (0, import_react.createElement)(
		        "div",
		        {
		          key: r.name,
		          className: `bt-mrow${!r.supported || r.sessions === 0 ? " bt-mrow-idle" : ""}`,
		          title: r.note !== "" ? r.note : void 0
		        },
		        (0, import_react.createElement)(
		          "span",
		          { className: "bt-mname-wrap" },
		          (0, import_react.createElement)(ProviderIcon, { name: r.name }),
		          (0, import_react.createElement)("span", { className: "bt-mname" }, label),
		          (0, import_react.createElement)("span", { className: "bt-mid" }, r.name)
		        ),
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
		          "aria-label": `${label}\uFF08${r.name}\uFF09\u8BFB\u53D6\u5F00\u5173`,
		          disabled: busy !== null,
		          title: r.enabled ? `\u70B9\u51FB\u505C\u7528 ${label}\uFF08foreign_session_read \u5C06\u8FD4\u56DE\u300C\u5DF2\u505C\u7528\u300D\uFF09` : `\u70B9\u51FB\u542F\u7528 ${label}`,
		          onClick: () => {
		            onToggle(r.name, !r.enabled);
		          }
		        })
		      );
		    })
		  );
		}
		var RESUME_PROVIDERS = ["claude", "codex", "opencode", "zcode", "pi", "workbuddy", "cursor", "grok"];
		function CommandsCard({ state }) {
		  const disabled = new Set(
		    (state?.providers ?? []).filter((p) => !p.enabled).map((p) => p.name)
		  );
		  const chip = (cmd, desc, provider, primary = false) => {
		    const off = provider !== void 0 && disabled.has(provider);
		    const label = provider !== void 0 ? PROVIDER_LABEL[provider] ?? provider : void 0;
		    return (0, import_react.createElement)(
		      "div",
		      {
		        key: cmd,
		        className: `bt-cmd${off ? " bt-cmd-off" : ""}`,
		        title: off ? `${label} \u5DF2\u5728\u652F\u6301\u77E9\u9635\u91CC\u505C\u7528\uFF0C\u547D\u4EE4\u4F1A\u8FD4\u56DE\u300C\u5DF2\u505C\u7528\u300D` : void 0
		      },
		      provider !== void 0 ? (0, import_react.createElement)(ProviderIcon, { name: provider }) : (0, import_react.createElement)(
		        "span",
		        { className: "bt-icon", style: { width: 16, height: 16, background: "var(--bt-a, #2563eb)" } },
		        (0, import_react.createElement)(
		          "svg",
		          { viewBox: "0 0 64 64", width: 10, height: 10, "aria-hidden": true },
		          (0, import_react.createElement)("rect", { x: 12, y: 26.5, width: 40, height: 11, rx: 5.5, fill: "#fff", transform: "rotate(-45 32 32)" })
		        )
		      ),
		      (0, import_react.createElement)("span", { className: `bt-cmd-key${primary ? " bt-cmd-key-primary" : ""}` }, cmd),
		      (0, import_react.createElement)("span", { className: "bt-cmd-desc" }, desc)
		    );
		  };
		  return (0, import_react.createElement)(
		    "div",
		    { className: "bt-card" },
		    (0, import_react.createElement)(
		      "div",
		      { className: "bt-head" },
		      (0, import_react.createElement)("span", { className: "bt-title", style: { fontSize: 13 } }, "\u547D\u4EE4\u901F\u89C8"),
		      (0, import_react.createElement)("span", { className: "bt-badge" }, "\u4F1A\u8BDD\u91CC\u7528\uFF0C\u5361\u7247\u53EA\u8BFB")
		    ),
		    (0, import_react.createElement)(
		      "div",
		      { className: "bt-cmds" },
		      chip("/handoff", "\u5BC4\u5B58\u5F53\u524D\u4F1A\u8BDD \u2192 \u6536\u4EF6\u7BB1", void 0, true),
		      chip("/inbox", "\u5F00\u5C40\u53D6\u4EF6\uFF08\u6D88\u8D39\u5373\u5F03\uFF09", void 0, true),
		      ...RESUME_PROVIDERS.map((p) => chip(`/resume-${p}`, `\u62C9\u53D6 ${PROVIDER_LABEL[p] ?? p} \u4F1A\u8BDD`, p))
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
		          (0, import_react.createElement)("div", { className: "bt-sub" }, "\u547D\u4EE4\u901F\u89C8 \xB7 \u4EA4\u63A5\u5361\u7247\u6536\u4EF6\u7BB1 \xB7 \u516B\u5BB6\u5916\u90E8 agent \u4F1A\u8BDD\u8BFB\u53D6\u5668\u5F00\u5173")
		        ),
		        (0, import_react.createElement)("span", { className: "bt-spacer" }),
		        (0, import_react.createElement)("button", { className: "bt-btn", onClick: reload, disabled: busy !== null }, "\u27F3 \u5237\u65B0")
		      ),
		      error !== null ? (0, import_react.createElement)("div", { className: "bt-banner bt-banner-err" }, error) : null
		    ),
		    // 命令速览（直接可见）
		    (0, import_react.createElement)(CommandsCard, { state }),
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

/**
 * host 侧 /dsh-takeover/ JSON API（dsh-hippo 同款 webServer 路由桥先例）：
 *   GET  /dsh-takeover/state           设置卡状态（收件箱概览 + 支持矩阵）
 *   POST /dsh-takeover/provider        切 provider 开关 {provider, enabled}
 *   POST /dsh-takeover/clear-archived  清空 archived/
 * POST 一律过同源守卫；响应 { ok, ... } 规范值，失败不抛异常。
 * @module dsh-takeover/server
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the Context.webServer merge（宿主由 web bundle 提供，不打进产物）。
import type {} from '@deepseek-ai/dsh-host-webserver'
import { defaultForeignReaders, type ForeignProvider } from './foreign.ts'
import { buildState, clearArchived, setProviderEnabled } from './settings.ts'

function sendJson(response: ServerResponse, code: number, body: unknown): void {
  response.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  response.end(JSON.stringify(body))
}

/** Host 头是否指向本机回环。面板只服务本机：DNS rebinding 下 Host 是攻击者域，
 * 与 Origin 同域比对无法识别——直接要求 Host 是回环（127.0.0.1/[::1]/localhost）。 */
function loopbackHost(host: string): boolean {
  const h = host.toLowerCase()
  const hostname = h.startsWith('[') ? h.slice(0, h.indexOf(']') + 1) : h.split(':')[0] ?? h
  return hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]' || hostname === 'localhost'
}

/** 同源守卫：带 Origin 的请求必须与 Host 一致，且 Host 必须回环（防跨站 POST 与 rebinding）。
 * 不再裸比 `new URL(origin).host === Host`——Host 头客户端完全可控，等价于没防。 */
function sameOrigin(request: { headers: { origin?: string; host?: string } }): boolean {
  const { origin, host } = request.headers
  if (origin === undefined || host === undefined) return false
  if (!loopbackHost(host)) return false
  try {
    const u = new URL(origin)
    return u.host === host.toLowerCase() && loopbackHost(u.host)
  } catch {
    return false
  }
}

/** 读守卫（GET state）：Host 回环之外，浏览器跨站 no-cors 请求带 Sec-Fetch-Site: cross-site
 * （forbidden header name，页面脚本改不了），非浏览器客户端（curl/CLI）不带该头放行——
 * 监听面在本机回环，Host 已验证。30s 轮询的面板自身 fetch 是 same-origin，不受影响。 */
function readGuard(request: { headers: { host?: string; 'sec-fetch-site'?: string } }): boolean {
  const host = request.headers.host
  if (host === undefined || !loopbackHost(host)) return false
  const site = request.headers['sec-fetch-site']
  return site === undefined || site === 'same-origin' || site === 'none'
}

/** 读取 JSON 请求体（上限 4 KiB，超限拒绝）。 */
function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 4096) {
        reject(new Error('body too large'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim()
        resolve(raw === '' ? {} : JSON.parse(raw) as Record<string, unknown>)
      } catch {
        reject(new Error('invalid JSON body'))
      }
    })
    request.on('error', reject)
  })
}

async function stateBody(): Promise<ReturnType<typeof buildState>> {
  return buildState(await defaultForeignReaders())
}

/**
 * 注册 /dsh-takeover/ 前缀路由。webServer 是宿主可选服务（CLI 形态没有），
 * 走 ctx.inject 缺席即跳过，不影响工具与 skill 注册面。
 */
export function registerTakeoverRoutes(ctx: Context): void {
  ctx.inject(['webServer'], (host) => {
    host.effect(() => host.webServer.register({
      kind: 'prefix',
      // 注意不能带尾斜杠：匹配规则是 pathname === prefix 或 startsWith(prefix + '/')，
      // '/dsh-takeover/' 会要求 '/dsh-takeover//' 才命中（dsh-hippo 的 '/dsh-hippo/app' 先例）。
      path: '/dsh-takeover',
      handler: (request, response) => {
        const sub = (request.url ?? '/').replace(/^\/dsh-takeover\/?/, '').split('?')[0] ?? ''

        if (sub === 'state') {
          if (request.method !== 'GET') {
            response.writeHead(405, { allow: 'GET' })
            response.end()
            return
          }
          // state 一直全裸（返回 HANDOFF_HOME 绝对路径与卡片预览，且每请求全量扫盘）——补读守卫
          if (!readGuard(request)) {
            sendJson(response, 403, { error: '仅接受本机同源读取' })
            return
          }
          void stateBody().then(
            (state) => { sendJson(response, 200, state) },
            (error: unknown) => { sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) }) },
          )
          return
        }

        if (sub === 'provider') {
          if (request.method !== 'POST') {
            response.writeHead(405, { allow: 'POST' })
            response.end()
            return
          }
          if (!sameOrigin(request)) {
            sendJson(response, 403, { error: '仅接受同源请求' })
            return
          }
          void readJsonBody(request).then(
            async (body) => {
              try {
                const provider = String(body['provider'] ?? '').trim().toLowerCase()
                const enabled = body['enabled'] === true
                setProviderEnabled(provider as ForeignProvider | string, enabled)
                sendJson(response, 200, { ok: true, state: await stateBody() })
              } catch (e) {
                sendJson(response, 400, { ok: false, error: e instanceof Error ? e.message : String(e) })
              }
            },
            (error: unknown) => { sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }) },
          )
          return
        }

        if (sub === 'clear-archived') {
          if (request.method !== 'POST') {
            response.writeHead(405, { allow: 'POST' })
            response.end()
            return
          }
          if (!sameOrigin(request)) {
            sendJson(response, 403, { error: '仅接受同源请求' })
            return
          }
          try {
            const cleared = clearArchived()
            sendJson(response, 200, { ok: true, cleared })
          } catch (e) {
            sendJson(response, 500, { ok: false, error: e instanceof Error ? e.message : String(e) })
          }
          return
        }

        sendJson(response, 404, { error: `未知路由：/dsh-takeover/${sub}（支持 state / provider / clear-archived）` })
      },
    }))
  })
}

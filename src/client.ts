import { VERSION } from './version.js'

const DEFAULT_BASE = 'https://www.teahose.com/api/mcp/v1'

function base(): string {
  return process.env.TEAHOSE_API_URL || DEFAULT_BASE
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    'user-agent': `teahose-mcp/${VERSION}`,
    accept: 'application/json',
  }
  const key = process.env.TEAHOSE_API_KEY
  if (key) h['x-teahose-key'] = key
  return h
}

async function handle(res: Response): Promise<unknown> {
  let body: Record<string, unknown> = {}
  try {
    body = (await res.json()) as Record<string, unknown>
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    const hint = typeof body.get_key_url === 'string' ? ` Get a free key: ${body.get_key_url}` : ''
    throw new Error(`${body.error ?? `Teahose API error (HTTP ${res.status})`}${hint}`)
  }
  return body
}

export async function apiGet(path: string, params?: Record<string, string | number | undefined>): Promise<unknown> {
  const url = new URL(base() + path)
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString(), { headers: headers() })
  return handle(res)
}

export async function apiPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(base() + path, {
    method: 'POST',
    headers: { ...headers(), 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handle(res)
}

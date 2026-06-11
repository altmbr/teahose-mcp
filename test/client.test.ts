import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const calls: Array<{ url: string; init: RequestInit }> = []

beforeEach(() => {
  calls.length = 0
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  }))
})
afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.TEAHOSE_API_KEY
  delete process.env.TEAHOSE_API_URL
})

describe('apiGet', () => {
  it('builds the URL, sends UA, omits key header when unset', async () => {
    const { apiGet } = await import('./helpers/fresh-client.js')
    await apiGet('/themes', { maturity: 'emerging' })
    expect(calls[0].url).toBe('https://www.teahose.com/api/mcp/v1/themes?maturity=emerging')
    const headers = calls[0].init.headers as Record<string, string>
    expect(headers['user-agent']).toMatch(/^teahose-mcp\//)
    expect(headers['x-teahose-key']).toBeUndefined()
  })

  it('sends x-teahose-key when TEAHOSE_API_KEY is set', async () => {
    process.env.TEAHOSE_API_KEY = 'th_' + 'a'.repeat(32)
    const { apiGet } = await import('./helpers/fresh-client.js')
    await apiGet('/themes')
    expect((calls[0].init.headers as Record<string, string>)['x-teahose-key']).toBe(process.env.TEAHOSE_API_KEY)
  })

  it('respects TEAHOSE_API_URL override', async () => {
    process.env.TEAHOSE_API_URL = 'http://localhost:3000/api/mcp/v1'
    const { apiGet } = await import('./helpers/fresh-client.js')
    await apiGet('/funding')
    expect(calls[0].url).toBe('http://localhost:3000/api/mcp/v1/funding')
  })

  it('surfaces API error messages', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ error: 'Rate limit exceeded', get_key_url: 'https://www.teahose.com/mcp' }), { status: 429 })
    ))
    const { apiGet } = await import('./helpers/fresh-client.js')
    await expect(apiGet('/funding')).rejects.toThrow(/Rate limit exceeded/)
  })
})

// Usage: npm run smoke            (prod)
//        TEAHOSE_API_URL=http://localhost:3000/api/mcp/v1 npm run smoke
const BASE = process.env.TEAHOSE_API_URL || 'https://www.teahose.com/api/mcp/v1'
const KEY = process.env.TEAHOSE_API_KEY
const headers = { 'user-agent': 'teahose-mcp/smoke', ...(KEY ? { 'x-teahose-key': KEY } : {}) }

const checks = [
  ['GET /themes', () => fetch(`${BASE}/themes`, { headers })],
  ['GET /funding?days=7', () => fetch(`${BASE}/funding?days=7`, { headers })],
  ['GET /company?name=Anthropic', () => fetch(`${BASE}/company?name=Anthropic`, { headers })],
  ['POST /find-companies', () =>
    fetch(`${BASE}/find-companies`, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'robot foundation models for manipulation' }),
    })],
  ['POST /check-companies', () =>
    fetch(`${BASE}/check-companies`, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ names: ['Anthropic', 'Figure'] }),
    })],
]

let failed = 0
for (const [name, run] of checks) {
  try {
    const res = await run()
    const body = await res.text()
    const ok = res.status === 200
    if (!ok) failed++
    console.log(`${ok ? '✓' : '✗'} ${name} → ${res.status} ${ok ? '' : body.slice(0, 200)}`)
  } catch (e) {
    failed++
    console.log(`✗ ${name} → ${e.message}`)
  }
}
process.exitCode = failed > 0 ? 1 : 0

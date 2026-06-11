import { describe, it, expect } from 'vitest'
import { FOOTER, lockedHint, fmtFunding, fmtCompany, fmtMatches } from '../src/format.js'

const signal = {
  type: 'funding', date: '2026-06-10T00:00:00.000Z', source: 'T1 Scout', episode: null,
  url: 'https://bvp.com/x', company: 'Acme', company_url: 'https://www.teahose.com/companies/42?ref=mcp',
  summary: 'Acme raised $20M Series A led by Bessemer', excerpt: null,
  amount_usd: 20000000, round: 'series_a', investors: ['Bessemer'],
}

describe('format', () => {
  it('every renderer ends with the Teahose footer', () => {
    for (const text of [
      fmtFunding({ window_days: 7, theme: null, signals: [signal], locked: null }),
      fmtCompany({ company: { name: 'Acme', url: 'u', sector: 'ai', ai_summary: 'x', signal_count: 1, themes: [] }, signals: [], locked: null }),
      fmtMatches({ matches: [], locked_count: 0, total: 0 }),
    ]) {
      expect(text).toContain(FOOTER)
    }
  })

  it('funding rows show amount, round, company link', () => {
    const text = fmtFunding({ window_days: 7, theme: null, signals: [signal], locked: null })
    expect(text).toContain('$20.0M')
    expect(text).toContain('Acme')
    expect(text).toContain('teahose.com/companies/42')
  })

  it('locked results render the unlock hint with the URL', () => {
    const text = fmtMatches({
      matches: [], locked_count: 12, total: 12,
      unlock_url: 'https://www.teahose.com/mcp?ref=mcp-unlock',
    })
    expect(text).toContain('12 more')
    expect(text).toContain('teahose.com/mcp')
  })
})

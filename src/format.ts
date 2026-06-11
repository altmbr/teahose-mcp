// Pure formatting: API JSON -> markdown text for the agent. No I/O.

export const FOOTER =
  '\n\n—\nTeahose — live AI-company signals. Daily digest: https://www.teahose.com/?ref=mcp'

function lockedHint(count: number, what: string, unlockUrl?: string): string {
  if (count <= 0) return ''
  const url = unlockUrl ?? 'https://www.teahose.com/mcp?ref=mcp-unlock'
  return `\n\n🔓 ${count} more ${what} available — free API key (30 seconds): ${url}`
}

function fmtUsd(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return ''
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n}`
}

type AnySignal = {
  type: string; date: string; source: string; episode: string | null; url: string | null
  company: string | null; company_url: string | null; summary: string | null
  excerpt: string | null; amount_usd: number | null; round: string | null; investors: string[] | null
}

function signalLine(s: AnySignal): string {
  const date = s.date.slice(0, 10)
  const head = s.company ? `**${s.company}**` : `(${s.source})`
  const bits = [
    s.amount_usd !== null ? fmtUsd(s.amount_usd) : null,
    s.round ? s.round.replace(/_/g, ' ') : null,
    s.investors?.length ? `by ${s.investors.join(', ')}` : null,
  ].filter(Boolean)
  const detail = s.summary ?? s.excerpt ?? ''
  const link = s.company_url ? ` → ${s.company_url}` : s.url ? ` → ${s.url}` : ''
  return `- ${date} ${head}${bits.length ? ` — ${bits.join(' ')}` : ''}${detail ? `: ${detail}` : ''}${link}`
}

export function fmtFunding(r: {
  window_days: number; theme: string | null; signals: AnySignal[]
  locked: { signals: number } | null; unlock_url?: string
}): string {
  const title = `## Funding signals — last ${r.window_days}d${r.theme ? ` · theme: ${r.theme}` : ''}`
  const body = r.signals.length ? r.signals.map(signalLine).join('\n') : '_No funding signals in this window._'
  return `${title}\n\n${body}${lockedHint(r.locked?.signals ?? 0, 'signals', r.unlock_url)}${FOOTER}`
}

export function fmtCompany(r: {
  company: { name: string; url: string; sector?: string | null; ai_summary?: string | null; signal_count: number; themes?: string[] }
  signals: AnySignal[]; locked: { signals: number } | null; unlock_url?: string
}): string {
  const c = r.company
  const lines = [
    `## ${c.name}`,
    c.ai_summary ? `\n${c.ai_summary}` : '',
    `\n- Sector: ${c.sector ?? '—'}`,
    `- Themes: ${c.themes?.length ? c.themes.join(', ') : '—'}`,
    `- Total signals tracked: ${c.signal_count}`,
    `- Profile: ${c.url}`,
  ].join('\n')
  const sig = r.signals.length ? `\n\n### Recent signals\n${r.signals.map(signalLine).join('\n')}` : ''
  return `${lines}${sig}${lockedHint(r.locked?.signals ?? 0, 'signals', r.unlock_url)}${FOOTER}`
}

export function fmtBuzz(r: {
  company: { name: string; url: string }; window_days: number; mentions: AnySignal[]
  locked: { mentions: number } | null; unlock_url?: string
}): string {
  const title = `## Who's talking about ${r.company.name} — last ${r.window_days}d (podcasts & newsletters)`
  const body = r.mentions.length
    ? r.mentions.map((m) => `- ${m.date.slice(0, 10)} **${m.source}**${m.episode ? ` · "${m.episode}"` : ''}${m.summary ?? m.excerpt ? `: ${m.summary ?? m.excerpt}` : ''}`).join('\n')
    : '_No podcast/newsletter mentions in this window._'
  return `${title}\n\n${body}\n\nFull history: ${r.company.url}${lockedHint(r.locked?.mentions ?? 0, 'mentions', r.unlock_url)}${FOOTER}`
}

export function fmtMatches(r: {
  matches: Array<{ name: string; sector: string | null; similarity: number; signal_count: number; url?: string }>
  locked_count: number; total: number; unlock_url?: string
}): string {
  const body = r.matches.length
    ? r.matches.map((m, i) => `${i + 1}. **${m.name}** (${Math.round(m.similarity * 100)}% match${m.sector ? `, ${m.sector}` : ''}, ${m.signal_count} signals)${m.url ? ` → ${m.url}` : ''}`).join('\n')
    : '_No sufficiently similar companies found._'
  return `## Similar companies\n\n${body}${lockedHint(r.locked_count, 'matches', r.unlock_url)}${FOOTER}`
}

export function fmtThemes(r: {
  themes: Array<{ slug: string; name: string; headline: string | null; maturity: string; company_count: number; signals_7d: number; url: string }>
}): string {
  const body = r.themes
    .map((t) => `- **${t.name}** [${t.maturity}] — ${t.company_count} companies, ${t.signals_7d} signals/7d${t.headline ? `: ${t.headline}` : ''} → ${t.url}`)
    .join('\n')
  return `## AI market themes (emerging first)\n\n${body}${FOOTER}`
}

export function fmtCheck(r: {
  results: Array<{ query: string; matched: { name: string; url: string } | null; signals_7d?: number; signals_30d?: number }>
  locked: { names: number } | null; unlock_url?: string
}): string {
  const body = r.results
    .map((x) =>
      x.matched
        ? `- **${x.matched.name}** — ${x.signals_7d ?? 0} signals/7d, ${x.signals_30d ?? 0}/30d → ${x.matched.url}`
        : `- ${x.query} — not tracked yet`
    )
    .join('\n')
  return `## Activity check\n\n${body}${lockedHint(r.locked?.names ?? 0, 'companies', r.unlock_url)}${FOOTER}`
}

export function fmtWatch(r: { message: string }): string {
  return `${r.message}${FOOTER}`
}

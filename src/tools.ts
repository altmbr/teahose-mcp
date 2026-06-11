import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { apiGet, apiPost } from './client.js'
import { fmtFunding, fmtCompany, fmtBuzz, fmtMatches, fmtThemes, fmtCheck, fmtWatch } from './format.js'

const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] })
function errText(e: unknown) {
  return text(e instanceof Error ? e.message : 'Teahose API request failed.')
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    'find_companies',
    {
      title: 'Find similar AI companies (lookalike / ICP search)',
      description:
        'Vector search over the Teahose AI-company intel graph. Pass a company website URL (competitor scan) OR a plain-text description like "seed-stage robot foundation model startups" (ICP / sourcing). Returns ranked similar companies with similarity scores.',
      inputSchema: { query: z.string().min(2).max(2000).describe('Company website URL or a text description of the kind of company to find') },
    },
    async ({ query }) => {
      try {
        return text(fmtMatches((await apiPost('/find-companies', { query })) as Parameters<typeof fmtMatches>[0]))
      } catch (e) {
        return errText(e)
      }
    }
  )

  server.registerTool(
    'who_is_talking_about',
    {
      title: 'Podcast & newsletter buzz about a company',
      description:
        'What operators, VCs, and newsletters are saying about an AI company — mention signals extracted from podcasts and newsletters, with source and episode. Unique editorial chatter you cannot get from filings or press releases.',
      inputSchema: {
        company: z.string().min(1).max(200).describe('Company name, e.g. "Physical Intelligence"'),
        days: z.number().int().min(1).max(90).optional().describe('Lookback window in days (default 30)'),
      },
    },
    async ({ company, days }) => {
      try {
        return text(fmtBuzz((await apiGet('/company-buzz', { name: company, days })) as Parameters<typeof fmtBuzz>[0]))
      } catch (e) {
        return errText(e)
      }
    }
  )

  server.registerTool(
    'latest_funding',
    {
      title: 'Latest AI funding signals',
      description:
        'Fresh funding rounds across the AI landscape — amount, round, investors, dated and sourced. Optionally filter by a Teahose theme slug (see emerging_themes for slugs). Answers "who raised this week?"',
      inputSchema: {
        days: z.number().int().min(1).max(30).optional().describe('Lookback window in days (default 7)'),
        theme: z.string().max(100).optional().describe('Theme slug filter, e.g. "humanoid-robots"'),
      },
    },
    async ({ days, theme }) => {
      try {
        return text(fmtFunding((await apiGet('/funding', { days, theme })) as Parameters<typeof fmtFunding>[0]))
      } catch (e) {
        return errText(e)
      }
    }
  )

  server.registerTool(
    'check_companies',
    {
      title: 'Batch-check companies for recent activity',
      description:
        'Pass a list of company names (portfolio, CRM accounts, watchlist) and get back which ones had signals in the last 7/30 days. Up to 10 names keyless, 50 with a free key.',
      inputSchema: { names: z.array(z.string().min(1).max(200)).min(1).max(50).describe('Company names to check') },
    },
    async ({ names }) => {
      try {
        return text(fmtCheck((await apiPost('/check-companies', { names })) as Parameters<typeof fmtCheck>[0]))
      } catch (e) {
        return errText(e)
      }
    }
  )

  server.registerTool(
    'emerging_themes',
    {
      title: 'Emerging AI market themes',
      description:
        'Machine-discovered AI market themes ranked emerging-first with 7-day signal volume — automated market-map discovery. Answers "what spaces are heating up right now?"',
      inputSchema: { maturity: z.enum(['emerging', 'established']).optional().describe('Filter by maturity (default: all, emerging first)') },
    },
    async ({ maturity }) => {
      try {
        return text(fmtThemes((await apiGet('/themes', { maturity })) as Parameters<typeof fmtThemes>[0]))
      } catch (e) {
        return errText(e)
      }
    }
  )

  server.registerTool(
    'get_company',
    {
      title: 'AI company profile + recent signals',
      description:
        'Profile of an AI company from the Teahose intel graph: what it does, sector, themes, and recent funding/product/hiring/mention signals.',
      inputSchema: { company: z.string().min(1).max(200).describe('Company name, e.g. "Anthropic"') },
    },
    async ({ company }) => {
      try {
        return text(fmtCompany((await apiGet('/company', { name: company })) as Parameters<typeof fmtCompany>[0]))
      } catch (e) {
        return errText(e)
      }
    }
  )

  server.registerTool(
    'watch_company',
    {
      title: 'Watch a company (daily email alerts)',
      description:
        'Subscribe to daily email alerts whenever a company has new signals (funding, product, hires, mentions). Requires a free Teahose API key (https://www.teahose.com/mcp) — the key holder\'s email receives the alerts.',
      inputSchema: { company: z.string().min(1).max(200).describe('Company name to watch') },
    },
    async ({ company }) => {
      try {
        return text(fmtWatch((await apiPost('/watch', { name: company })) as Parameters<typeof fmtWatch>[0]))
      } catch (e) {
        return errText(e)
      }
    }
  )
}

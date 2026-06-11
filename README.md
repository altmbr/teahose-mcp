# teahose-mcp

Live AI-company intelligence for Claude — funding signals, lookalike search, podcast/newsletter buzz, and emerging market themes, all drawn from the [Teahose](https://www.teahose.com) intel graph. No API key required to start; a free key unlocks higher rate limits and daily-email alerts.

```bash
claude mcp add teahose -- npx -y teahose-mcp
```

---

## Tools

| Tool | Description |
|------|-------------|
| `find_companies` | Vector search over the Teahose AI-company graph — pass a competitor URL or a plain-text description to find similar companies with similarity scores. |
| `who_is_talking_about` | What operators, VCs, and newsletters are saying about a company — mention signals from podcasts and newsletters, with source and episode. |
| `latest_funding` | Fresh funding rounds across the AI landscape — amount, round, investors, dated and sourced. Optionally filter by theme slug. |
| `check_companies` | Batch-check a list of company names (portfolio, CRM, watchlist) to see which had signals in the last 7 or 30 days. |
| `emerging_themes` | Machine-discovered AI market themes ranked emerging-first with 7-day signal volume. |
| `get_company` | Profile of an AI company: what it does, sector, themes, and recent funding/product/hiring/mention signals. |
| `watch_company` | Subscribe to daily email alerts whenever a company has new signals. Requires a free API key. |

---

## Security & Privacy

This server is a thin, read-only HTTP client. A security review should find:

- **Network access:** The only endpoint contacted is `https://www.teahose.com/api/mcp/v1/*`. No other outbound requests are made.
- **No filesystem or shell access:** The server does not read, write, or execute anything on the local filesystem.
- **No exec / child processes:** No `child_process`, `eval`, or dynamic code execution of any kind.
- **No telemetry:** The server emits no analytics, crash reports, or tracking beyond the API calls themselves. The API calls are subject to [Teahose's privacy policy](https://www.teahose.com).
- **Credential scope:** The only credential is the optional `TEAHOSE_API_KEY` environment variable. It is sent solely to `teahose.com` in an `x-teahose-key` request header.
- **Dependencies:** Exactly two runtime dependencies — `@modelcontextprotocol/sdk` and `zod`. No native addons.
- **No postinstall scripts:** `package.json` has no `install`, `postinstall`, or `prepare` hooks.
- **All tools are read-only** except `watch_company` (which writes a watch subscription on teahose.com) and requires a valid API key.

---

## Free Tier vs. Free Key

A free Teahose API key is available at **https://www.teahose.com/mcp**. Getting a key also subscribes you to the Teahose daily-digest email (unsubscribe any time).

| Limit | Keyless | Free key |
|-------|---------|----------|
| Requests / minute | 10 | 30 |
| Requests / day | 50 | 1,000 |
| Company signals returned | 5 | 25 |
| Buzz mentions returned | 5 | 25 |
| Funding rows returned | 15 (max 14-day window) | 50 (max 30-day window) |
| `check_companies` names | 10 | 50 |
| `find_companies` matches | 3 | 15 |

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `TEAHOSE_API_KEY` | No | Free key from https://www.teahose.com/mcp. Unlocks higher limits and `watch_company`. |
| `TEAHOSE_API_URL` | No | Override the API base URL (useful for local testing against a dev server). |

### Setting your key in Claude Code

Add an `env` block to your MCP server entry in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "teahose": {
      "command": "npx",
      "args": ["-y", "teahose-mcp@latest"],
      "env": {
        "TEAHOSE_API_KEY": "your-key-here"
      }
    }
  }
}
```

Or set `TEAHOSE_API_KEY` in your shell environment before starting Claude Code.

---

## Example Prompts

```
Who raised this week in humanoid robotics?
```
```
Find companies similar to https://physicalintelligence.company
```
```
Who's talking about Skild AI on podcasts and newsletters?
```
```
What AI themes are emerging right now?
```
```
Give me a quick profile of Covariant and its recent signals.
```
```
Check my portfolio: Covariant, Physical Intelligence, Skild AI, Figure, Apptronik
```

---

## License

MIT — see [LICENSE](./LICENSE).

[Homepage](https://www.teahose.com/mcp) · [npm](https://www.npmjs.com/package/teahose-mcp)

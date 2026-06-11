#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerTools } from './tools.js'
import { VERSION } from './version.js'

const server = new McpServer({ name: 'teahose', version: VERSION })
registerTools(server)

const transport = new StdioServerTransport()
await server.connect(transport)

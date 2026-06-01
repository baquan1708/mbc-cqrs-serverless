# @mbc-cqrs-serverless/mcp-server

MCP (Model Context Protocol) server exposing framework docs, codegen tools, and project analysis to AI clients.

## Depends on

- `@modelcontextprotocol/sdk` only (reads monorepo files at runtime)

## Used by

Cursor, Claude Code, and other MCP clients — not imported by CQRS feature packages.

## Framework root resolution

| Env | Behavior |
|-----|----------|
| `MBC_FRAMEWORK_ROOT` | Explicit path to monorepo or install root |
| (default) | Four levels above `dist/resources` → monorepo root in dev |

## Documentation resources

| URI | Source |
|-----|--------|
| `mbc://docs/overview` | `llms-full.txt` (index) |
| `mbc://docs/llms-short` | `llms.txt` |
| `mbc://docs/agents/readme` | `docs/agents/README.md` |
| `mbc://docs/agents/package-graph` | `docs/agents/package-graph.md` |
| `mbc://docs/agents/inventory` | `docs/agents/_generated/module-service-index.md` |
| `mbc://docs/agents/core` | `docs/agents/core/overview.md` |
| `mbc://docs/errors` | Error catalog |
| … | See `packages/mcp-server/README.md` |

**Contributor docs live in `docs/agents/`** — update MCP `documentation.ts` when adding new agent URIs.

## Tools (summary)

Codegen: `mbc_generate_*`. Analysis: `mbc_validate_cqrs`, `mbc_analyze_project`, `mbc_check_anti_patterns`, `mbc_health_check`, `mbc_explain_code`.

## How to change safely

```bash
npm run build --workspace=@mbc-cqrs-serverless/mcp-server
npm test --workspace=@mbc-cqrs-serverless/mcp-server
```

After adding resources, update README resource table and `src/__tests__/resources.spec.ts`.

## Related

- [docs/agents/README.md](../README.md)
- [packages/mcp-server/README.md](../../../packages/mcp-server/README.md)

# Contributor Agent Reference

Documentation for **maintainers and AI coding agents** working in the `mbc-cqrs-serverless` monorepo. This is not end-user application documentation (see [mbc-cqrs-serverless.mbc-net.com](https://mbc-cqrs-serverless.mbc-net.com/)).

## Audience

- Framework contributors changing packages under `packages/`
- Agents (Cursor, Claude Code, Copilot, MCP clients) implementing fixes or features in this repository

## Reading order

1. [package-graph.md](./package-graph.md) — which packages exist and how they depend on each other
2. [conventions.md](./conventions.md) — NestJS module registration, CQRS patterns, pitfalls
3. [core/overview.md](./core/overview.md) — foundation package (read before other feature packages)
4. Target package `overview.md` (e.g. [master/overview.md](./master/overview.md))
5. [_generated/module-service-index.md](./_generated/module-service-index.md) — machine-generated module/service inventory (regenerate after structural changes)

## Regenerating inventory

```bash
npm run docs:agents:gen      # update _generated/
npm run docs:agents:check    # fail if _generated/ is out of date (CI)
npm run test:scripts         # generator unit tests
```

## Related

- Design spec: [docs/superpowers/specs/2026-05-21-contributor-agent-framework-reference-design.md](../superpowers/specs/2026-05-21-contributor-agent-framework-reference-design.md)
- Human contributing guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Root agent pointers: [AGENTS.md](../../AGENTS.md)
- Architecture (AWS/CQRS flows): [docs/architecture/system-overview.md](../architecture/system-overview.md)
- MCP server package: [mcp-server/overview.md](./mcp-server/overview.md)

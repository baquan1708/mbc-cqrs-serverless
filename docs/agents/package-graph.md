# Package dependency graph

> **Used by** column is derived from `package.json` dependencies. Regenerate with `npm run docs:agents:gen` and refresh this table if package coupling changes.

## Diagram

```mermaid
flowchart TB
  core["@mbc-cqrs-serverless/core"]
  sequence["sequence"]
  task["task"]
  tenant["tenant"]
  ui["ui-setting"]
  import_pkg["import"]
  master["master"]
  directory["directory"]
  survey["survey-template"]
  cli["cli"]
  mcp["mcp-server"]

  sequence --> core
  task --> core
  tenant --> core
  ui --> core
  import_pkg --> core
  master --> core
  master --> sequence
  master --> task
  directory --> core
  directory --> master
  survey --> core
  survey --> master
  mcp -.->|"reads repo at MBC_FRAMEWORK_ROOT"| core
```

`cli` scaffolds consumer applications; it does not import feature packages at runtime.

## Package table

| Package | Purpose | Depends on | Used by |
|---------|---------|------------|---------|
| `core` | CQRS command/query, AWS integrations, app bootstrap | — | sequence, task, tenant, ui-setting, import, master, directory, survey-template |
| `sequence` | Time-rotating ID sequences | core | master |
| `task` | Long-running / Step Functions tasks | core | master |
| `tenant` | Multi-tenant CRUD and context | core | — |
| `ui-setting` | UI configuration entities | core | — |
| `import` | CSV / batch import pipelines | core | — |
| `master` | Master data and hierarchical settings | core, sequence, task | directory, survey-template |
| `directory` | Directory and file metadata | core, master | — |
| `survey-template` | Survey templates and answers | core, master | — |
| `cli` | Project scaffolding (`mbc new`, generate) | — | — |
| `mcp-server` | MCP resources/tools for AI clients | — | — (reads monorepo root) |

## Where to start changing code

| Change type | Start in |
|-------------|----------|
| Write path, DynamoDB command table, SNS publish | `core` → [core/services.md](./core/services.md) |
| New published npm feature module | New or existing package under `packages/`; depend on `core` only unless you need master/task |
| Async job / SFN orchestration | `task` + host app Step Functions |
| Master data / settings hierarchy | `master` |
| Agent/MCP documentation exposure | `mcp-server` + `docs/agents/` |

# Contributor Agent Framework Reference — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Do not create git commits** unless the repository owner explicitly asks.

**Goal:** Build contributor-facing agent documentation that catalogs all monorepo packages, NestJS modules, services, and their relationships, with CI-generated inventory to prevent drift.

**Architecture:** Hybrid docs under `docs/agents/` — generated `_generated/inventory.json` + `module-service-index.md` from TypeScript/package.json scanning; hand-written per-package markdown following a fixed template. Wire MCP resources and thin `llms-full.txt` index. Spec: `docs/superpowers/specs/2026-05-21-contributor-agent-framework-reference-design.md`.

**Tech Stack:** TypeScript (generator script), Node fs/glob, existing Jest, `@mbc-cqrs-serverless/mcp-server`, markdown, Mermaid in docs.

---

## File map (created/modified)

| Path | Responsibility |
|------|----------------|
| `scripts/generate-agent-inventory.ts` | Scan packages → write `_generated/*` |
| `scripts/generate-agent-inventory.spec.ts` | Generator smoke tests |
| `docs/agents/README.md` | Agent entry point |
| `docs/agents/package-graph.md` | Package dependency Mermaid + table |
| `docs/agents/conventions.md` | CQRS/module naming for contributors |
| `docs/agents/core/*.md` | Deep reference (template) |
| `docs/agents/{package}/overview.md` | Per-package narrative |
| `docs/agents/_generated/*` | CI-generated (git-tracked) |
| `package.json` (root) | `docs:agents:gen`, `docs:agents:check` scripts |
| `packages/mcp-server/src/resources/documentation.ts` | New MCP URIs |
| `AGENTS.md`, `llms-full.txt`, `llms.txt`, `CONTRIBUTING.md` | Pointers to `docs/agents/` |

---

## Task 1: Inventory generator (P0 foundation)

**Files:**
- Create: `scripts/generate-agent-inventory.ts`
- Create: `scripts/generate-agent-inventory.spec.ts`
- Create: `docs/agents/_generated/.gitkeep` (removed after first gen)
- Modify: `package.json` (root scripts)

- [ ] **Step 1: Write failing test for generator output schema**

```typescript
// scripts/generate-agent-inventory.spec.ts
import { buildInventory } from './generate-agent-inventory'

describe('buildInventory', () => {
  it('returns packages with name, path, dependencies, modules, services', () => {
    const inventory = buildInventory({ rootDir: process.cwd() })
    expect(inventory.packages.length).toBeGreaterThanOrEqual(10)
    const core = inventory.packages.find((p) => p.name === '@mbc-cqrs-serverless/core')
    expect(core).toBeDefined()
    expect(core!.modules.some((m) => m.className === 'CommandModule')).toBe(true)
    expect(core!.services.some((s) => s.className === 'CommandService')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect fail** (`npm test -- scripts/generate-agent-inventory.spec.ts`)

- [ ] **Step 3: Implement `buildInventory`**

Scan logic (minimal v1):

1. List `packages/*/package.json` (exclude private if any).
2. Parse `dependencies` / `peerDependencies` for `@mbc-cqrs-serverless/*`.
3. Glob `src/**/*.module.ts` — regex extract `export class (\w+Module)`.
4. Glob `src/**/*.service.ts` — extract `export class (\w+Service)` (skip schematics/templates paths).
5. Parse `src/index.ts` for `export * from` lines.
6. Write `docs/agents/_generated/inventory.json` and render `module-service-index.md`.

- [ ] **Step 4: Add CLI entry and npm scripts**

```json
"docs:agents:gen": "tsx scripts/generate-agent-inventory.ts",
"docs:agents:check": "npm run docs:agents:gen && git diff --exit-code docs/agents/_generated"
```

Use `tsx` if already in devDependencies; otherwise `ts-node` or compile script — match repo convention.

- [ ] **Step 5: Run test — expect pass**

- [ ] **Step 6: Run generator once** (`npm run docs:agents:gen`) and commit generated files in PR (user commits when ready).

---

## Task 2: Agent docs skeleton (P0)

**Files:**
- Create: `docs/agents/README.md`
- Create: `docs/agents/package-graph.md`
- Create: `docs/agents/conventions.md`

- [ ] **Step 1: `docs/agents/README.md`**

Include:

- Audience: monorepo contributors + coding agents
- Reading order: `package-graph.md` → `conventions.md` → `core/` → target package `overview.md`
- Link to `_generated/module-service-index.md` for raw inventory
- Link to spec and CONTRIBUTING

- [ ] **Step 2: `package-graph.md`**

Copy Mermaid graph from design spec; add table: Package | Purpose | Depends on | Used by (from generated JSON or hand-maintained with note “regenerate updates Used by”).

- [ ] **Step 3: `conventions.md`**

Document:

- `CommandModule.register({ tableName })` per entity table
- `TaskModule.register()` — **global, once per app**
- `AppModule.forRoot({ rootModule })` host wiring
- File layout for new feature modules in packages
- English-only public docs rule

- [ ] **Step 4: Verify internal links** (manual or add link-check in Task 6)

---

## Task 3: Core package deep reference (P1 — template quality)

**Files:**
- Create: `docs/agents/core/overview.md`
- Create: `docs/agents/core/modules.md`
- Create: `docs/agents/core/services.md`

- [ ] **Step 1: `core/overview.md`** — purpose, exports summary, dependency “none (base)”

- [ ] **Step 2: `core/modules.md`** — table from design §5.2; `AppModule.forRoot` router behavior (`/api`, `/event`)

- [ ] **Step 3: `core/services.md`** — CommandService vs DataService vs HistoryService vs Repository; publishAsync/publishSync note; link to `docs/architecture/cqrs-flow.md`

- [ ] **Step 4: Add typical flow diagram** (command write → event → read) in overview

- [ ] **Step 5: “How to change safely”** — `npm test --workspace=@mbc-cqrs-serverless/core`, integration specs under `packages/core/src/integration/`

- [ ] **Step 6: Maintainer review** — compare against source for `notification`, `queue`, `command-events` modules (user/reviewer)

---

## Task 4: High-coupling packages (P2)

**Files:**
- Create: `docs/agents/master/overview.md`
- Create: `docs/agents/task/overview.md`
- Create: `docs/agents/sequence/overview.md`

- [ ] **Step 1: `master/overview.md`**

Cover: imports `DataStoreModule`, `QueueModule`, registers `CommandModule`, optional `SequencesModule`, `CustomTaskModule`, controllers + Prisma requirement, `MasterSfnTaskEventHandler`, deps on `sequence` + `task`.

- [ ] **Step 2: `task/overview.md`**

Cover: global `TaskModule`, event handlers (`TaskQueueEventHandler`, `TaskSfnEventHandler`, etc.), `TaskService`, Step Functions integration, **register once** pitfall.

- [ ] **Step 3: `sequence/overview.md`**

Cover: `SequencesModule`, `SequencesService`, tenant-scoped IDs, deprecation note for removed APIs if documented in MCP migration guide.

- [ ] **Step 4: Cross-link** master ↔ task ↔ sequence in “Related” sections

---

## Task 5: Remaining packages (P3)

**Files:**
- Create: `docs/agents/{tenant,import,directory,ui-setting,survey-template,cli,mcp-server}/overview.md`

- [ ] **Step 1–8:** One overview per package using template (Purpose → Related). Pull “Depends on / Used by” from `_generated/inventory.json`.

**Package-specific notes to include:**

| Package | Must mention |
|---------|----------------|
| `tenant` | TenantService, tenant context |
| `import` | ImportModule, CSV/Step Functions batch |
| `directory` | Depends on master; file services |
| `ui-setting` | Setting services |
| `survey-template` | Depends on master |
| `cli` | Schematics, `mbc new`, not runtime dep of feature packages |
| `mcp-server` | Resources/tools; `MBC_FRAMEWORK_ROOT`; points back to `docs/agents/` |

---

## Task 6: MCP + root file integration (P3–P4)

**Files:**
- Modify: `packages/mcp-server/src/resources/documentation.ts`
- Modify: `packages/mcp-server/src/resources/index.ts` (if resource list centralized)
- Modify: `AGENTS.md`, `llms-full.txt`, `llms.txt`, `CONTRIBUTING.md`
- Optional: `scripts/check-agent-doc-links.ts`

- [ ] **Step 1: Add MCP resources**

| URI | File |
|-----|------|
| `mbc://docs/agents/readme` | `docs/agents/README.md` |
| `mbc://docs/agents/package-graph` | `docs/agents/package-graph.md` |
| `mbc://docs/agents/inventory` | `docs/agents/_generated/module-service-index.md` |
| `mbc://docs/agents/core` | `docs/agents/core/overview.md` |

- [ ] **Step 2: Update `packages/mcp-server/README.md` resource table**

- [ ] **Step 3: Thin `llms-full.txt`**

Replace long duplicate content with:

- 1-paragraph project summary
- Bulleted links to `docs/agents/README.md`, `package-graph.md`, `core/overview.md`
- “Full inventory: docs/agents/_generated/module-service-index.md”

- [ ] **Step 4: Update `AGENTS.md`** — first section points to `docs/agents/README.md`

- [ ] **Step 5: Update `CONTRIBUTING.md`** — “AI-assisted contributions” subsection

- [ ] **Step 6: Add link-check script or Jest test** that fails on broken relative links in `docs/agents/**/*.md`

- [ ] **Step 7: Run `npm run docs:agents:check` in CI** (add step to existing GitHub Actions workflow if present)

---

## Task 7: Verification

- [ ] Run `npm run docs:agents:gen` and `npm run docs:agents:check`
- [ ] Run `npm test` (root + mcp-server if touched)
- [ ] Build mcp-server: `npm run build --workspace=@mbc-cqrs-serverless/mcp-server`
- [ ] Manual: invoke MCP resource `mbc://docs/agents/package-graph` locally
- [ ] Spec self-review: no TBD, paths match design spec

---

## Suggested PR breakdown

| PR | Contents |
|----|----------|
| PR1 | Task 1–2 (generator + skeleton + CI script) |
| PR2 | Task 3 (core deep docs) |
| PR3 | Task 4–5 (remaining packages) |
| PR4 | Task 6–7 (MCP + llms + CI link check) |

---

## Estimated effort

| Phase | Effort |
|-------|--------|
| P0 Generator + skeleton | 0.5–1 day |
| P1 Core docs | 1 day |
| P2 master/task/sequence | 0.5 day |
| P3 Other packages | 1 day |
| P4 Integration + CI | 0.5 day |

**Total:** ~3–4 days for one engineer; agents can parallelize P2/P3 package docs after P1 template exists.

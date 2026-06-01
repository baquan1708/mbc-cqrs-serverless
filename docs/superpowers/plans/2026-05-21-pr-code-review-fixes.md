# PR Code Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Do not create git commits** unless the repository owner explicitly asks.

**Goal:** Address PR code review feedback: fix broken example README rendering, restore self-defending AppSync transport `sendMessage` behavior, make CDK Events API key output deterministic, and move the example client config to env vars.

**Architecture:** Must-fix items are documentation hygiene only. Recommended items add **defense-in-depth** early returns in built-in transports (bootstrap validation remains primary); skipped publishes log at **`warn`** so misconfiguration is visible in default CloudWatch/log levels. CDK stores an explicit `addApiKey` construct reference instead of indexing `apiKeys` by insertion order. The Next.js example reads `NEXT_PUBLIC_*` vars so secrets stay out of `page.tsx`.

**Tech stack:** Markdown, TypeScript, NestJS, AWS CDK (`aws-appsync` `EventApi`), Next.js 15, AWS Amplify v6, Jest.

**Out of scope:** Git commits unless requested.

---

## File map

| File | Change |
|------|--------|
| `examples/appsync-event-client/README.md` | Unwrap markdown; remove AI preamble; fix links; EOF newline |
| `.gitignore` (repo root) | Ensure final newline (fix `skills-lock.json` / `repomix-output.xml` line if needed) |
| `packages/core/src/notifications/appsync.service.ts` | Early return when endpoint not configured |
| `packages/core/src/notifications/appsync-events.service.ts` | Same guard for parity |
| `packages/core/src/notifications/appsync.service.spec.ts` | Expect skip (resolve), not throw |
| `packages/core/src/notifications/appsync-events.service.spec.ts` | Expect skip when endpoint missing |
| `packages/cli/templates/infra/libs/infra-stack.ts` | Deterministic API key via `addApiKey` |
| `examples/appsync-event-client/src/app/page.tsx` | Read `process.env.NEXT_PUBLIC_*` |
| `examples/appsync-event-client/.env.local.example` | **Create** — documented placeholders |
| `examples/appsync-event-client/.gitignore` | Ensure EOF newline |
| `examples/appsync-event-client/README.md` | Configuration section → env vars |

---

### Task 1: Fix `appsync-event-client` README (Must Fix)

**Files:**
- Modify: `examples/appsync-event-client/README.md`

- [ ] **Step 1: Delete lines 1–6** (AI meta sentence, `---`, and opening ` ```markdown `).

- [ ] **Step 2: Delete lines 99–101** (stray closing ` ``` ` and empty fence).

- [ ] **Step 3: Replace broken localhost links** — change Google-search wrapper URLs to plain markdown:

```markdown
Open [http://localhost:3000](http://localhost:3000) with your browser to use the AppSync Events Tester.
ブラウザで [http://localhost:3000](http://localhost:3000) を開き、AppSync イベントテスターを使用します。
```

- [ ] **Step 4: Fix endpoint placeholder in Configuration snippet** (remove malformed markdown link inside URL):

```typescript
endpoint: "https://<your-id>.appsync-api.<region>.amazonaws.com/event",
```

- [ ] **Step 5: Ensure file ends with a single newline** after the last channel-resolution bullet (no trailing code fence).

- [ ] **Step 6: Visual check** — open the file in GitHub preview mode or a markdown previewer; headings and lists must render (not as one giant code block).

---

### Task 2: Root `.gitignore` EOF newline (Must Fix)

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Fix the last line** — currently `skills-lock.jsonrepomix` is one concatenated line. Split into separate entries if both are intended:

```gitignore
skills-lock.json
repomix-output.xml
```

- [ ] **Step 2: Ensure the file ends with `\n`** after the final line.

---

### Task 3: `AppSyncService` — restore `sendMessage` guard (Recommended)

**Files:**
- Modify: `packages/core/src/notifications/appsync.service.ts`

- [ ] **Step 1: Add guard at top of `sendMessage`** (after line 52 opening brace):

```typescript
  async sendMessage(notification: INotification): Promise<void> {
    if (!this.endpoint?.trim() || !this.hostname) {
      this.logger.warn('APPSYNC_ENDPOINT is not set, skipping.')
      return
    }

    const headers = {
```

This matches constructor behavior (`hostname` / `signer` only set when `this.endpoint` is truthy) and avoids opaque `TypeError` in tests or custom DI setups.

---

### Task 4: `AppSyncEventsService` — same guard for parity (Recommended)

**Files:**
- Modify: `packages/core/src/notifications/appsync-events.service.ts`

- [ ] **Step 1: Add guard at top of `sendMessage`:**

```typescript
  async sendMessage(notification: INotification): Promise<void> {
    if (!this.url || !this.signer) {
      this.logger.warn('APPSYNC_EVENTS_ENDPOINT not set, skipping')
      return
    }

    const channel = this.resolveChannel(notification)
```

---

### Task 5: Update transport unit tests for skip behavior

**Files:**
- Modify: `packages/core/src/notifications/appsync.service.spec.ts`
- Modify: `packages/core/src/notifications/appsync-events.service.spec.ts`

- [ ] **Step 1: `appsync.service.spec.ts`** — replace `should reject when APPSYNC_ENDPOINT is not configured (IAM path)` with:

```typescript
    it('should skip publish when APPSYNC_ENDPOINT is not configured', async () => {
      const mockConfig = createMock<ConfigService>()
      mockConfig.get.mockImplementation(() => undefined)

      const module = await Test.createTestingModule({
        providers: [
          AppSyncService,
          { provide: ConfigService, useValue: mockConfig },
        ],
      }).compile()
      const svc = module.get<AppSyncService>(AppSyncService)

      await expect(svc.sendMessage(mockNotification)).resolves.toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })
```

- [ ] **Step 2: `appsync-events.service.spec.ts`** — replace `should reject when endpoint is not configured` with:

```typescript
    it('should skip publish when endpoint is not configured', async () => {
      const module = await Test.createTestingModule({
        providers: [
          AppSyncEventsService,
          {
            provide: ConfigService,
            useValue: makeConfigService({ APPSYNC_EVENTS_ENDPOINT: undefined }),
          },
        ],
      }).compile()
      const svc = module.get<AppSyncEventsService>(AppSyncEventsService)

      await expect(svc.sendMessage(mockNotification)).resolves.toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })
```

- [ ] **Step 3: Run tests**

```bash
cd /data/Workspace/msu/mbc-cqrs-serverless && npm test -- --testPathPattern='packages/core/src/notifications/(appsync\.service|appsync-events\.service)'
```

Expected: all tests **PASS**.

---

### Task 6: Deterministic CDK Events API key (Recommended)

**Files:**
- Modify: `packages/cli/templates/infra/libs/infra-stack.ts` (inside `if (props.config.appsyncEvents?.enabled)` block, after `EventApi` creation ~line 287)

- [ ] **Step 1: Create API key with explicit construct ID** immediately after `appSyncEventsApi` is constructed:

```typescript
      const eventsApiKey = appSyncEventsApi.addApiKey('events-api-key', {
        expires: cdk.Expiration.after(cdk.Duration.days(expireDays)),
      })
```

- [ ] **Step 2: Replace `AppSyncEventsApiKey` output** (~lines 315–322):

```typescript
      new cdk.CfnOutput(this, 'AppSyncEventsApiKey', {
        value: eventsApiKey.apiKey,
        description: 'AppSync Events API key — APPSYNC_EVENTS_API_KEY env var',
      })
```

Use `eventsApiKey.apiKey` (L2 `ApiKey` property). If TypeScript errors, use `eventsApiKey.key` or `(eventsApiKey.node.defaultChild as cdk.aws_appsync.CfnApiKey).attrApiKey` — pick the property the CDK version exposes and use it consistently.

- [ ] **Step 3: Verify synth** — from a project using this template (or infra test if present):

```bash
cd /data/Workspace/msu/mbc-cqrs-serverless/packages/cli/templates/infra && npm test 2>&1 | tail -20
```

Expected: no regression; snapshot update only if snapshot tests exist and output value shape unchanged aside from stable key reference.

**Note:** If `authorizationConfig.authProviders` `apiKeyConfig` auto-creates a second key, confirm `cdk synth` shows one intentional browser key. Remove redundant auto-key config only if CDK docs require it — do not break IAM/API_KEY auth modes.

---

### Task 7: Next.js example — env-based config (Minor)

**Files:**
- Create: `examples/appsync-event-client/.env.local.example`
- Modify: `examples/appsync-event-client/src/app/page.tsx`
- Modify: `examples/appsync-event-client/README.md` (Configuration section only)

- [ ] **Step 1: Create `.env.local.example`:**

```bash
# Copy to .env.local and fill in values from CDK outputs / AWS console
NEXT_PUBLIC_APPSYNC_EVENTS_ENDPOINT=https://<id>.appsync-api.<region>.amazonaws.com/event
NEXT_PUBLIC_APPSYNC_EVENTS_REGION=ap-northeast-1
NEXT_PUBLIC_APPSYNC_EVENTS_API_KEY=da2-xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APPSYNC_EVENTS_NAMESPACE=default
```

- [ ] **Step 2: Update `page.tsx` Amplify.configure block:**

```typescript
const eventsEndpoint = process.env.NEXT_PUBLIC_APPSYNC_EVENTS_ENDPOINT
const eventsApiKey = process.env.NEXT_PUBLIC_APPSYNC_EVENTS_API_KEY
const eventsRegion =
  process.env.NEXT_PUBLIC_APPSYNC_EVENTS_REGION ?? 'ap-northeast-1'

if (eventsEndpoint && eventsApiKey) {
  Amplify.configure({
    API: {
      Events: {
        endpoint: eventsEndpoint,
        region: eventsRegion,
        defaultAuthMode: 'apiKey',
        apiKey: eventsApiKey,
      },
    },
  })
}
```

Optional: set `error` state on mount when vars missing so the UI explains missing `.env.local` instead of failing silently on subscribe.

- [ ] **Step 3: Update README Configuration section** — instruct copy `.env.local.example` → `.env.local` instead of editing `page.tsx` secrets.

- [ ] **Step 4: Confirm `.gitignore`** already has `.env*` (it does); no real keys committed.

- [ ] **Step 5: Ensure `examples/appsync-event-client/.gitignore` ends with newline.**

---

### Task 8: Final verification

- [ ] **Step 1: Core notification tests**

```bash
cd /data/Workspace/msu/mbc-cqrs-serverless && npm test -- --testPathPattern='packages/core/src/(notifications/appsync|env.validation|notification-env)'
```

Expected: **PASS**.

- [ ] **Step 2: Spot-check README** in IDE or `npx markdownlint-cli2 examples/appsync-event-client/README.md` if available (optional).

---

## Self-review

| Review item | Task |
|-------------|------|
| README broken rendering | Task 1 |
| EOF newline README / .gitignore | Tasks 1, 2, 7 |
| AppSyncService guard | Task 3 |
| CDK api key order | Task 6 |
| page.tsx placeholder / env | Task 7 |
| AppSyncEvents parity | Task 4 |

No TBD placeholders. Commits omitted per owner preference.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-21-pr-code-review-fixes.md`.**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks.

**2. Inline Execution** — run in this session with **superpowers:executing-plans**.

**Which approach?**

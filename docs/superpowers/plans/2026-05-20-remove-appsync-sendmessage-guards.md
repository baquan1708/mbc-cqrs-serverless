# Remove AppSync `sendMessage` endpoint guards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Do not create git commits** unless the repository owner explicitly asks.

**Goal:** Remove the upfront `if` blocks at the start of `sendMessage` in `AppSyncService` and `AppSyncEventsService` so publish always proceeds; misconfiguration surfaces via natural runtime errors or upstream `getValidateConfig` (Phase 1 notification env validation).

**Architecture:** The two transport classes stay registered on `NotificationModule` regardless of `NOTIFICATION_TRANSPORTS`. `NotificationEventHandler` only invokes `sendMessage` on active transports; nest bootstrap validation (`validateBuiltinNotificationTransportEnv`) should ensure built-in endpoint env vars when those transports are enabled. Removing guards avoids duplicate policy inside services; callers without an endpoint may hit `TypeError`, invalid `fetch` URLs, or signer failures.

**Tech stack:** TypeScript, NestJS `ConfigService`, Jest, `@mbc-cqrs-serverless/core` package.

**Out of scope:** Git commits, `git add`, or other version-control steps. This plan covers **code, tests, and optional doc edits only**; you commit when and how you prefer.

---

## File map

| File | Responsibility |
|------|------------------|
| `packages/core/src/notifications/appsync.service.ts` | GraphQL mutation transport; strip guard before building request |
| `packages/core/src/notifications/appsync-events.service.ts` | Events HTTP publish transport; strip guard before channel publish |
| `packages/core/src/notifications/appsync.service.spec.ts` | Replace/remove test that asserts on explicit `APPSYNC_ENDPOINT` error |
| `packages/core/src/notifications/appsync-events.service.spec.ts` | Replace/remove test that asserts on explicit `APPSYNC_EVENTS_ENDPOINT` error |
| `docs/superpowers/specs/2026-05-20-notification-env-validation-design.md` | (Optional) Note that transports no longer no-op in `sendMessage` when endpoint missing |

---

### Task 1: `AppSyncService` — delete guard block

**Files:**
- Modify: `packages/core/src/notifications/appsync.service.ts` (top of `sendMessage`)

- [ ] **Step 1: Remove lines 52–57** (entire `if (!this.endpoint?.trim() || !this.hostname) { throw new Error(...) }` block).

Resulting `sendMessage` must start immediately with `const headers = {`:

```typescript
  async sendMessage(notification: INotification): Promise<void> {
    const headers = {
      'Content-Type': 'application/json',
      host: this.hostname,
    }
    // ... remainder unchanged
  }
```

---

### Task 2: `AppSyncEventsService` — delete guard block

**Files:**
- Modify: `packages/core/src/notifications/appsync-events.service.ts` (top of `sendMessage`)

- [ ] **Step 1: Remove lines 69–73** (entire `if (!this.url || !this.signer) { throw new Error(...) }` block).

Resulting `sendMessage` must go straight to `resolveChannel`:

```typescript
  async sendMessage(notification: INotification): Promise<void> {
    const channel = this.resolveChannel(notification)
    this.logger.debug(`sendMessage:: channel=${channel}`)

    await this.postToChannel(channel, notification)
  }
```

---

### Task 3: Update `AppSyncService` unit test (no explicit message)

**Files:**
- Modify: `packages/core/src/notifications/appsync.service.spec.ts`

- [ ] **Step 1: Replace** the test `should throw when APPSYNC_ENDPOINT is not configured` with a test where **both** `APPSYNC_ENDPOINT` and `APPSYNC_API_KEY` are unset so `sendMessage` takes the **IAM branch** and `this.signer` was never constructed → `rejects.toThrow()` (e.g. `TypeError`). Do **not** use only API key + empty URL: the mocked `fetch` may still resolve.

Replace the whole `it(...)` block with:

```typescript
    it('should reject when APPSYNC_ENDPOINT is not configured (IAM path)', async () => {
      const mockConfig = createMock<ConfigService>()
      mockConfig.get.mockImplementation(() => undefined)

      const module = await Test.createTestingModule({
        providers: [
          AppSyncService,
          { provide: ConfigService, useValue: mockConfig },
        ],
      }).compile()
      const svc = module.get<AppSyncService>(AppSyncService)

      await expect(svc.sendMessage(mockNotification)).rejects.toThrow()
      expect(mockFetch).not.toHaveBeenCalled()
    })
```

- [ ] **Step 2: Run tests**

Run:

```bash
cd /data/Workspace/msu/mbc-cqrs-serverless && npm test -- --testPathPattern=packages/core/src/notifications/appsync.service.spec
```

Expected: all tests **PASS**.

If the environment throws a different error string, broaden assertion to `rejects.toThrow()` only (already shown).

---

### Task 4: Update `AppSyncEventsService` unit test

**Files:**
- Modify: `packages/core/src/notifications/appsync-events.service.spec.ts`

- [ ] **Step 1: Replace** `should throw when endpoint is not configured` with `sendMessage` calling into `signRequest` / `postToChannel` where `this.url` and `this.signer` are undefined — that surfaces as **`TypeError`** (reading `hostname` of undefined or calling `sign` on undefined).

```typescript
    it('should reject when endpoint is not configured', async () => {
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

      await expect(svc.sendMessage(mockNotification)).rejects.toThrow(TypeError)
      expect(mockFetch).not.toHaveBeenCalled()
    })
```

- [ ] **Step 2: Run tests**

```bash
cd /data/Workspace/msu/mbc-cqrs-serverless && npm test -- --testPathPattern=packages/core/src/notifications/appsync-events.service.spec
```

Expected: all tests **PASS**.

If Jest reports a different error class (e.g. wrapped), use `rejects.toThrow()` without `TypeError`.

---

### Task 5: Regression — handler + env validation

**Files:** (read-only verification unless failures appear)

- [ ] **Step 1: Run focused suite**

```bash
cd /data/Workspace/msu/mbc-cqrs-serverless && npm test -- --testPathPattern='packages/core/src/(notifications/event/notification.event.handler|env.validation|notification-env)'
```

Expected: all **PASS**.

- [ ] **Step 2: (If any fail)** Fix only the failing test or mock — do not reintroduce guards unless product decision changes.

---

### Task 6: Optional doc note

- [ ] **Step 1:** In `docs/superpowers/specs/2026-05-20-notification-env-validation-design.md`, under transport services / non-goals, add one sentence: *Built-in AppSync transports no longer short-circuit in `sendMessage` when the endpoint is unset; misconfiguration should be caught at bootstrap when those transports are enabled, otherwise errors occur at publish time.*

---

## Self-review

**1. Spec coverage:** User asked to remove the exact blocks at `appsync.service.ts:53` and `appsync-events.service.ts:69-74` — Tasks 1–2 do that. Tests updated in Tasks 3–4.

**2. Placeholder scan:** No TBD/TODO in actionable steps; test code is concrete.

**3. Type consistency:** `sendMessage` return type unchanged (`Promise<void>` on interface; GraphQL still returns `data` at runtime — pre-existing quirk, out of scope).

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-20-remove-appsync-sendmessage-guards.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks.

**2. Inline Execution** — run tasks in this session with **superpowers:executing-plans** and checkpoints.

**Which approach?**

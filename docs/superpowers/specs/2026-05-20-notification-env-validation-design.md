# Notification transport environment validation

**Date:** 2026-05-20  
**Status:** Approved (brainstorming)  
**Package:** `@mbc-cqrs-serverless/core`

## Problem

When `NotificationEventHandler` runs but AppSync endpoint environment variables are missing, transports log at `debug` and return without publishing:

- `APPSYNC_EVENTS_ENDPOINT not set, skipping` (`AppSyncEventsService`)
- `APPSYNC_ENDPOINT is not set, skipping` (`AppSyncService`)

The SNS → SQS → Lambda pipeline succeeds, so operators see handler logs but no realtime messages on the frontend. `env.validation.ts` marks notification-related variables as optional with no cross-field rules, so NestJS bootstrap does not catch this misconfiguration.

## Goal

Fail fast when misconfigured:

1. **Config bootstrap** — built-in transports listed in `NOTIFICATION_TRANSPORTS` must have their known endpoint env vars.
2. **Module init** — every name in `NOTIFICATION_TRANSPORTS` must resolve to a registered `@NotificationTransport` provider (built-in or custom).

Behavior is **strict in all environments**, including `NODE_ENV=local`.

## Non-goals

- Changing CDK / infra templates (consumers still must inject correct env vars).
- Removing runtime skip guards in transport `sendMessage` (kept as defense in depth).
- Validating AppSync connectivity (HTTP/WebSocket reachability) at startup.
- Validating env vars for **custom** transports at `ConfigModule` time (no static registry of third-party env keys).
- Rejecting unknown transport **names** in `env.validation.ts` (custom names like `pusher` are valid via `@NotificationTransport`).

## Design

### Two-phase validation

The framework supports **custom transports** registered with `@NotificationTransport(name)` (see `notification-transport.decorator.ts`). Custom names are not known when `ConfigModule` validates plain env vars. Validation is therefore split:

```text
ConfigModule.forRoot (getValidateConfig)
  → parse NOTIFICATION_TRANSPORTS
  → for each BUILT-IN name only: require known endpoint env vars

NotificationEventHandler.onModuleInit
  → discover all @NotificationTransport providers (ExplorerService)
  → for each name in NOTIFICATION_TRANSPORTS: provider must exist
  → wire active transports (unchanged)
```

Custom transports (e.g. `pusher`) are **not** rejected in `env.validation.ts`. Their configuration is owned by the transport implementation (constructor / `sendMessage`). Typos in env still fail at **module init** if no matching provider is registered.

### Phase 1 — `env.validation.ts` (bootstrap)

Runs inside `getValidateConfig()` **after** `validateSync()` on `EnvironmentVariables` (or extended `envCls`).

#### Transport list parsing

Shared helper used by validation and `NotificationEventHandler`:

```typescript
parseNotificationTransports(raw: string | undefined): string[]
```

Rules (must match handler today):

1. Split `NOTIFICATION_TRANSPORTS` on `,`, trim, drop empty segments.
2. If the result is empty, default to `['appsync-graphql']`.
3. Do **not** filter or reject custom names at this stage.

#### Built-in env requirements only

Maintain a static map for **framework built-ins** only (`NotificationTransports` enum values):

| Transport name (`NotificationTransports`) | Required environment variable |
|-------------------------------------------|-------------------------------|
| `appsync-graphql`                         | `APPSYNC_ENDPOINT` (non-empty) |
| `appsync-event`                           | `APPSYNC_EVENTS_ENDPOINT` (non-empty) |

`APPSYNC_EVENTS_NAMESPACE` remains optional; runtime defaults to `default`.

For each name in `parseNotificationTransports()`:

- If name is in the built-in map → require the corresponding env var; throw if missing.
- If name is **not** in the map (custom transport) → **no** env check in phase 1.

#### Phase 1 error example

```text
Notification transport "appsync-event" is enabled (NOTIFICATION_TRANSPORTS) but APPSYNC_EVENTS_ENDPOINT is not set.
```

### Phase 2 — `NotificationEventHandler.onModuleInit`

After `ExplorerService.exploreNotificationTransports()`:

For each name in `activeTransportNames` (from `parseNotificationTransports`):

- If no provider class carries `@NotificationTransport(name)` → **throw** (typo in env or missing module import).

Example:

```text
Notification transport "appsync-grapql" is listed in NOTIFICATION_TRANSPORTS but no provider is registered. Register a class with @NotificationTransport('appsync-grapql') or fix the env value.
```

Custom transports pass phase 1 without framework env checks; they **must** pass phase 2 by being registered in the Nest DI graph.

Optional (v1): log at `debug` when a built-in provider exists but was not listed in `NOTIFICATION_TRANSPORTS` (already implicit today).

### Local and production behavior

**No environment-based leniency.** `NODE_ENV=local` uses the same throw semantics as `prod` / `dev` / `stg` in both phases.

### Handler alignment

`NotificationEventHandler`:

- Uses `parseNotificationTransports` in the constructor (shared with phase 1).
- Runs provider registration check at the start of `onModuleInit` before wiring transports.

### Transport services (runtime behavior)

`AppSyncService` and `AppSyncEventsService` no longer short-circuit in `sendMessage` when the endpoint env var is unset; a misconfigured process may hit `TypeError`, invalid URLs, or network errors at publish time. **Phase 1 bootstrap validation** should catch missing built-in endpoints when those transports are enabled. Custom transports follow their own patterns inside `sendMessage`.

## Implementation outline

1. Add `parseNotificationTransports`, `BUILTIN_NOTIFICATION_TRANSPORT_ENV` (or equivalent), and `validateBuiltinNotificationTransportEnv` in `env.validation.ts` (or `notification-env.validation.ts`).
2. Call built-in env validation at the end of `getValidateConfig()` before returning.
3. Refactor `NotificationEventHandler` to use `parseNotificationTransports`.
4. Add `assertNotificationTransportProvidersRegistered(activeNames, discoveredClasses)` in `onModuleInit` (throws if env name has no `@NotificationTransport` provider).
5. Extend `env.validation.spec.ts` (phase 1 only):
   - `appsync-event` without `APPSYNC_EVENTS_ENDPOINT` → throws
   - default / `appsync-graphql` without `APPSYNC_ENDPOINT` → throws
   - both built-ins with endpoints → passes
   - `NOTIFICATION_TRANSPORTS=pusher` without built-in endpoints → passes phase 1 (no built-in env rules)
6. Extend `notification.event.handler.spec.ts` (phase 2):
   - env lists `mock-transport` but provider not in module → throws on init
   - env typo for built-in name → throws on init
7. Update `createValidEnv` to include `APPSYNC_ENDPOINT` by default.
8. Update `.env.example` / docs: built-in env matrix + custom transports need `@NotificationTransport` registration.

## Breaking change

Applications that previously started without `APPSYNC_ENDPOINT` while using the default `appsync-graphql` transport will **fail at bootstrap**. This is intentional: silent skip at publish time is replaced by fail-fast at startup.

Mitigation for stacks without realtime notifications:

- Future option (out of scope for v1): `NOTIFICATION_TRANSPORTS=none` to disable validation and handler transports. Not in this spec.

Until `none` exists, consumers must set `APPSYNC_ENDPOINT` if the default graphql transport applies, or explicitly document that they do not use `NotificationModule` on that process.

## Testing

### Phase 1 (`env.validation`)

| Case | Expected |
|------|----------|
| Unset `NOTIFICATION_TRANSPORTS`, missing `APPSYNC_ENDPOINT` | Throw |
| `appsync-graphql`, valid endpoint | Pass |
| `appsync-event`, missing `APPSYNC_EVENTS_ENDPOINT` | Throw |
| `appsync-graphql,appsync-event`, both endpoints set | Pass |
| `appsync-graphql,appsync-event`, one endpoint missing | Throw |
| `NOTIFICATION_TRANSPORTS=pusher` only (custom), no AppSync endpoints | Pass phase 1 |
| `NODE_ENV=local`, missing endpoint for enabled **built-in** | Throw |

### Phase 2 (`NotificationEventHandler.onModuleInit`)

| Case | Expected |
|------|----------|
| `NOTIFICATION_TRANSPORTS=appsync-grapql` (typo), providers registered for real built-ins only | Throw (no provider) |
| `NOTIFICATION_TRANSPORTS=mock-transport`, `MockTransport` in module | Pass |
| `NOTIFICATION_TRANSPORTS=mock-transport`, provider not imported | Throw |

## References

- `packages/core/src/env.validation.ts`
- `packages/core/src/decorators/notification-transport.decorator.ts`
- `packages/core/src/notifications/event/notification.event.handler.ts`
- `packages/core/src/notifications/enums/notification-transport.enum.ts`
- `packages/core/src/services/explorer.service.ts`
- `packages/core/src/notifications/appsync-events.service.ts`
- `packages/core/src/notifications/appsync.service.ts`
- `packages/cli/templates/infra/libs/infra-stack.ts` (env injection when `appsyncEvents.enabled`)

## Spec self-review

- [x] No TBD / TODO placeholders
- [x] Consistent with handler default transport and CDK env injection
- [x] Custom `@NotificationTransport` names allowed; not rejected in phase 1
- [x] Typos / missing providers caught in phase 2
- [x] Scoped to core validation + handler init checks + tests
- [x] Ambiguity resolved: strict local = throw (option A)

# core — NestJS modules

| Module | Global | Role |
|--------|--------|------|
| `AppModule` | — | Host bootstrap via `forRoot()`; wires infra + `rootModule` |
| `DataStoreModule` | Yes | DynamoDB, S3, session |
| `CommandModule` | — | Per-table CQRS; `register({ tableName })` |
| `QueueModule` | — | SNS/SQS clients and services |
| `DataSyncModule` | — | Command-event → data sync pipeline |
| `EventModule` | — | HTTP `/event` ingestion when enabled |
| `NotificationModule` | — | Email, AppSync |
| `StepFunctionModule` | — | SFN start/resume |

## AppModule.forRoot

**File:** `packages/core/src/app.module.ts`

Imports by default: `NotificationModule`, `DataStoreModule`, `DataSyncModule`, `StepFunctionModule`, `QueueModule`.

Router:

| Path | Module |
|------|--------|
| `/api` | Host `rootModule` from options |
| `/event` | `EventModule` (if `EVENT_SOURCE_DISABLED !== 'true'`) |

Also registers global `ConfigModule` with env validation from `options.envCls`.

## CommandModule.register

**File:** `packages/core/src/commands/command.module.ts`

**Exports:** `CommandService`, `DataService`, `HistoryService`, `Repository`, `TtlService`, `CommandEventHandler`

Registers a dynamic `CommandEventHandler` token per table: `{tableName}_CommandEventHandler`.

Feature packages typically add:

```typescript
CommandModule.register({
  tableName: TABLE_NAME,
  dataSyncHandlers: options?.dataSyncHandlers,
})
```

inside their own `register()` imports array.

## DataStoreModule

**File:** `packages/core/src/data-store/data-store.module.ts`

`@Global()` — inject `DynamoDbService`, `S3Service`, `SessionService` without re-importing.

## QueueModule

**File:** `packages/core/src/queue/queue.module.ts`

Provides SNS/SQS factories and `SnsService` / `SqsService`. Required for event handlers that publish or poll messages.

## DataSyncModule

**File:** `packages/core/src/command-events/data-sync.module.ts`

Wires command-side events to data synchronization handlers (including Step Functions–driven DDS).

## EventModule

**File:** `packages/core/src/events/event.module.ts`

Event bus and HTTP event routes. Disabled when `EVENT_SOURCE_DISABLED=true`.

## NotificationModule

**File:** `packages/core/src/notifications/notification.module.ts`

Email (`EmailService`) and AppSync (`AppSyncService`, `AppSyncEventsService`). Env validation for notification transports is required when publishing (see notification env validation spec).

## StepFunctionModule

**File:** `packages/core/src/step-func/step-function.module.ts`

`StepFunctionService` — `startExecution`, `resumeExecution` (task token callback).

## Related

- [overview.md](./overview.md)
- [services.md](./services.md)

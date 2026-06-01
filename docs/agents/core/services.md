# core — Services

> Full file-level index: [_generated/module-service-index.md](../_generated/module-service-index.md)

## Write path

### CommandService

**File:** `packages/core/src/commands/command.service.ts`

Primary API for state-changing operations.

| Method | Use when |
|--------|----------|
| `publishAsync` | Normal async command + SNS event (preferred) |
| `publishSync` | Synchronous write; returns `null` on no-op (v1.2.0+) |

Removed in v1.1.0: `publish()`, `publishPartialUpdate()` — do not reintroduce or reference in new code.

### HistoryService

**File:** `packages/core/src/commands/history.service.ts`

Command/history table access for audit trails.

### TtlService

**File:** `packages/core/src/commands/ttl.service.ts`

TTL attribute management on command records.

### Repository

**File:** `packages/core/src/commands/repository.ts`

Read-your-writes / transactional patterns (v1.2.0+).

## Read path

### DataService

**File:** `packages/core/src/commands/data.service.ts`

Read model access (data table). Used by query handlers and controllers.

| Typical ops | `getItem`, `query`, pagination helpers |

Backed by `DynamoDbService` from `DataStoreModule`.

## Infrastructure services

| Service | Role |
|---------|------|
| `DynamoDbService` | Low-level DynamoDB document client |
| `S3Service` | Object storage |
| `SessionService` | Session / request-scoped store |
| `SnsService` / `SqsService` | Messaging |
| `StepFunctionService` | SFN executions |
| `EmailService` | SES email |
| `AppSyncService` / `AppSyncEventsService` | AppSync GraphQL / Events API |
| `EventBus` | In-process event dispatch (`events/event-bus.ts`) |
| `ExplorerService` | Handler discovery (internal) |

## Choosing CommandService vs DataService

| Operation | Service |
|-----------|---------|
| Create / update / delete with audit + events | `CommandService` |
| Read current state | `DataService` |
| Direct DynamoDB put to data table | **Avoid** — breaks CQRS (AP001) |

## How to change safely

- Mock DynamoDB/SNS in unit tests with `aws-sdk-client-mock`
- Run `npm test --workspace=@mbc-cqrs-serverless/core` before PR
- Document breaking changes in MCP `migration_guide` and CHANGELOG

## Related

- [docs/architecture/cqrs-flow.md](../../architecture/cqrs-flow.md)
- [modules.md](./modules.md)

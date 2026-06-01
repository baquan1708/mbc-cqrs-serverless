# @mbc-cqrs-serverless/task

Long-running and Step Functions–orchestrated work: parent tasks, subtasks, queue handlers, status tracking, alarms.

## Depends on

- `@mbc-cqrs-serverless/core` (`DataStoreModule`, `QueueModule`)

## Used by

- `@mbc-cqrs-serverless/master` (SFN master tasks)

## Modules

| Module | Notes |
|--------|-------|
| `TaskModule` | `register({ taskQueueEventFactory, enableController })` — **`global: true`** |

Import `DataStoreModule` and `QueueModule` internally.

## Services

| Service | Role |
|---------|------|
| `TaskService` | Create/update tasks and subtasks, status, alarms |

## Event handlers

| Handler | Trigger |
|---------|---------|
| `TaskEventHandler` | General task events |
| `TaskQueueEventHandler` | SQS queue; starts SFN when configured |
| `TaskSfnEventHandler` | Step Functions task steps |
| `SubTaskQueueEventHandler` | Subtask queue processing |

Host must provide `taskQueueEventFactory` implementation for domain-specific queue payloads.

## Critical pitfall

**Register `TaskModule` exactly once** in the host `AppModule`. It is a global module since v1.2.4 (AP015). Duplicate registration breaks DI and duplicate handlers.

## Typical flow

```
TaskQueueEvent → TaskQueueEventHandler → create subtasks → StepFunctionService.startExecution
→ TaskSfnEventHandler / SubTaskQueueEventHandler → update task status
```

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/task
```

SFN ARN and queue names come from host env — document changes in host infra, not only this package.

## Related

- [master/overview.md](../master/overview.md)
- [core/modules.md](../core/modules.md) (StepFunctionModule)
- [packages/task/README.md](../../../packages/task/README.md)

# Module & Service Index (generated)

> Generated at 2026-05-21T07:33:46.488Z. Do not edit by hand. Run `npm run docs:agents:gen`.

## @mbc-cqrs-serverless/cli

- **Directory:** `packages/cli`
- **Description:** a CLI to get started with MBC CQRS serverless framework
- **Depends on:** (none)
- **Used by:** (none)

## @mbc-cqrs-serverless/core

- **Directory:** `packages/core`
- **Description:** CQRS and event base core
- **Depends on:** (none)
- **Used by:** @mbc-cqrs-serverless/directory, @mbc-cqrs-serverless/import, @mbc-cqrs-serverless/master, @mbc-cqrs-serverless/sequence, @mbc-cqrs-serverless/survey-template, @mbc-cqrs-serverless/task, @mbc-cqrs-serverless/tenant, @mbc-cqrs-serverless/ui-setting

### Modules

| Class | File |
|-------|------|
| `AppModule` | `packages/core/src/app.module.ts` |
| `CommandModule` | `packages/core/src/commands/command.module.ts` |
| `DataStoreModule` | `packages/core/src/data-store/data-store.module.ts` |
| `DataSyncModule` | `packages/core/src/command-events/data-sync.module.ts` |
| `EventModule` | `packages/core/src/events/event.module.ts` |
| `NotificationModule` | `packages/core/src/notifications/notification.module.ts` |
| `QueueModule` | `packages/core/src/queue/queue.module.ts` |
| `StepFunctionModule` | `packages/core/src/step-func/step-function.module.ts` |

### Services

| Class | File |
|-------|------|
| `AppService` | `packages/core/src/app.service.ts` |
| `AppSyncEventsService` | `packages/core/src/notifications/appsync-events.service.ts` |
| `AppSyncService` | `packages/core/src/notifications/appsync.service.ts` |
| `CommandService` | `packages/core/src/commands/command.service.ts` |
| `DataService` | `packages/core/src/commands/data.service.ts` |
| `DynamoDbService` | `packages/core/src/data-store/dynamodb.service.ts` |
| `EmailService` | `packages/core/src/notifications/email.service.ts` |
| `ExplorerService` | `packages/core/src/services/explorer.service.ts` |
| `HistoryService` | `packages/core/src/commands/history.service.ts` |
| `OrderService` | `packages/core/src/commands/data.service.ts` |
| `S3Service` | `packages/core/src/data-store/s3.service.ts` |
| `SessionService` | `packages/core/src/data-store/session.service.ts` |
| `SnsService` | `packages/core/src/queue/sns.service.ts` |
| `SqsService` | `packages/core/src/queue/sqs.service.ts` |
| `StepFunctionService` | `packages/core/src/step-func/step-function.service.ts` |
| `TtlService` | `packages/core/src/commands/ttl.service.ts` |

### Public exports (`index.ts`)

- `./app.module`
- `./bootstrap`
- `./command-events`
- `./commands`
- `./constants`
- `./context`
- `./data-store`
- `./decorators`
- `./env.validation`
- `./events`
- `./exceptions`
- `./filters`
- `./guard`
- `./helpers`
- `./interfaces`
- `./notifications`
- `./pipe`
- `./queue`
- `./services`
- `./step-func`

## @mbc-cqrs-serverless/directory

- **Directory:** `packages/directory`
- **Description:** Directory module
- **Depends on:** @mbc-cqrs-serverless/core, @mbc-cqrs-serverless/master
- **Used by:** (none)

### Modules

| Class | File |
|-------|------|
| `DirectoryStorageModule` | `packages/directory/src/directory.module.ts` |

### Services

| Class | File |
|-------|------|
| `DirectoryFileService` | `packages/directory/src/directory-file.service.ts` |
| `DirectoryService` | `packages/directory/src/directory.service.ts` |
| `DynamoService` | `packages/directory/src/dynamodb.service.ts` |

### Public exports (`index.ts`)

- `./constant`
- `./directory.controller`
- `./directory.module`
- `./directory.module-definition`
- `./directory.service`
- `./directory-file.service`
- `./dto`
- `./dynamodb.service`
- `./entity`

## @mbc-cqrs-serverless/import

- **Directory:** `packages/import`
- **Description:** Import module
- **Depends on:** @mbc-cqrs-serverless/core
- **Used by:** (none)

### Modules

| Class | File |
|-------|------|
| `ImportModule` | `packages/import/src/import.module.ts` |

### Services

| Class | File |
|-------|------|
| `ImportService` | `packages/import/src/import.service.ts` |

### Public exports (`index.ts`)

- `./constant`
- `./dto`
- `./entity`
- `./enum`
- `./event`
- `./helpers`
- `./import.controller`
- `./import.module`
- `./import.module-definition`
- `./import.service`
- `./interface`

## @mbc-cqrs-serverless/master

- **Directory:** `packages/master`
- **Description:**  Master data management such as setting, sequence, etc.
- **Depends on:** @mbc-cqrs-serverless/core, @mbc-cqrs-serverless/sequence, @mbc-cqrs-serverless/task
- **Used by:** @mbc-cqrs-serverless/directory, @mbc-cqrs-serverless/survey-template

### Modules

| Class | File |
|-------|------|
| `CustomTaskModule` | `packages/master/src/custom-task/custom-task.module.ts` |
| `MasterModule` | `packages/master/src/master.module.ts` |

### Services

| Class | File |
|-------|------|
| `MasterDataService` | `packages/master/src/services/master-data.service.ts` |
| `MasterSettingService` | `packages/master/src/services/master-setting.service.ts` |
| `MyTaskService` | `packages/master/src/custom-task/my-task.service.ts` |

### Public exports (`index.ts`)

- `./controllers`
- `./custom-task/event/task-queue-event-factory`
- `./decorators`
- `./dto`
- `./master.module`
- `./services`

## @mbc-cqrs-serverless/mcp-server

- **Directory:** `packages/mcp-server`
- **Description:** MCP (Model Context Protocol) server for MBC CQRS Serverless framework - enables AI tools to interact with the framework
- **Depends on:** (none)
- **Used by:** (none)

## @mbc-cqrs-serverless/sequence

- **Directory:** `packages/sequence`
- **Description:** Generate increment sequence with time-rotation
- **Depends on:** @mbc-cqrs-serverless/core
- **Used by:** @mbc-cqrs-serverless/master

### Modules

| Class | File |
|-------|------|
| `SequencesModule` | `packages/sequence/src/sequence.module.ts` |

### Services

| Class | File |
|-------|------|
| `SequencesService` | `packages/sequence/src/sequences.service.ts` |

### Public exports (`index.ts`)

- `./dto`
- `./enums/rotate-by.enum`
- `./sequence.module`
- `./sequences.controller`
- `./sequences.service`

## @mbc-cqrs-serverless/survey-template

- **Directory:** `packages/survey-template`
- **Description:** Survey module
- **Depends on:** @mbc-cqrs-serverless/core, @mbc-cqrs-serverless/master
- **Used by:** (none)

### Modules

| Class | File |
|-------|------|
| `SurveyTemplateModule` | `packages/survey-template/src/survey-template.module.ts` |

### Services

| Class | File |
|-------|------|
| `SurveyAnswerService` | `packages/survey-template/src/survey-answer.service.ts` |
| `SurveyTemplateService` | `packages/survey-template/src/survey-template.service.ts` |

### Public exports (`index.ts`)

- `./dto`
- `./entity`
- `./handler`
- `./keys`
- `./survey-answer.controller`
- `./survey-answer.service`
- `./survey-template.controller`
- `./survey-template.module`
- `./survey-template.module-definition`
- `./survey-template.service`
- `./utils`

## @mbc-cqrs-serverless/task

- **Directory:** `packages/task`
- **Description:** long-running task
- **Depends on:** @mbc-cqrs-serverless/core
- **Used by:** @mbc-cqrs-serverless/master

### Modules

| Class | File |
|-------|------|
| `TaskModule` | `packages/task/src/task.module.ts` |

### Services

| Class | File |
|-------|------|
| `TaskService` | `packages/task/src/task.service.ts` |

### Public exports (`index.ts`)

- `./entity`
- `./enums`
- `./event`
- `./interfaces`
- `./task.controller`
- `./task.module`
- `./task.module-definition`
- `./task.service`

## @mbc-cqrs-serverless/tenant

- **Directory:** `packages/tenant`
- **Description:** Multiple tenant management
- **Depends on:** @mbc-cqrs-serverless/core
- **Used by:** (none)

### Modules

| Class | File |
|-------|------|
| `TenantModule` | `packages/tenant/src/tenant.module.ts` |

### Services

| Class | File |
|-------|------|
| `TenantService` | `packages/tenant/src/services/tenant.service.ts` |

### Public exports (`index.ts`)

- `./constants`
- `./controllers`
- `./services`
- `./tenant.module`

## @mbc-cqrs-serverless/ui-setting

- **Directory:** `packages/ui-setting`
- **Description:** Setting master data
- **Depends on:** @mbc-cqrs-serverless/core
- **Used by:** (none)

### Modules

| Class | File |
|-------|------|
| `SettingModule` | `packages/ui-setting/src/setting.module.ts` |

### Services

| Class | File |
|-------|------|
| `DataSettingService` | `packages/ui-setting/src/services/data-setting.service.ts` |
| `SettingService` | `packages/ui-setting/src/services/setting.service.ts` |

### Public exports (`index.ts`)

- `./controllers`
- `./dto`
- `./entities`
- `./helpers`
- `./services`
- `./setting.module`


# @mbc-cqrs-serverless/master

Master data entities, hierarchical settings (user/group/tenant/common), bulk operations, and RDS sync hooks.

## Depends on

- `@mbc-cqrs-serverless/core`
- `@mbc-cqrs-serverless/sequence`
- `@mbc-cqrs-serverless/task`

## Used by

- `@mbc-cqrs-serverless/directory`
- `@mbc-cqrs-serverless/survey-template`

## Modules

| Module | Notes |
|--------|-------|
| `MasterModule` | `register({ enableController, prismaService, dataSyncHandlers })` |
| `CustomTaskModule` | Custom task integration when controllers enabled |
| Nested `templates/master` | Template master submodule |

`MasterModule.register()` imports `DataStoreModule`, `QueueModule`, and registers `CommandModule` with `TABLE_NAME`. When `enableController: true`, requires `prismaService` and adds controllers + `MasterSfnTaskEventHandler`.

## Services

| Service | Role |
|---------|------|
| `MasterDataService` | Master entity CRUD via CQRS |
| `MasterSettingService` | Hierarchical settings resolution |

## Event handlers

- `MasterSfnTaskEventHandler` — Step Functions task steps for master workflows

## Typical flow

Host app registers `MasterModule` → commands go through `CommandService` (from nested `CommandModule`) → events may enqueue `task` jobs or SFN via `MasterSfnTaskEventHandler`.

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/master
```

Coordinate with `sequence` when changing ID generation and `task` when changing SFN task payloads.

## Related

- [task/overview.md](../task/overview.md)
- [sequence/overview.md](../sequence/overview.md)
- [core/overview.md](../core/overview.md)
- [packages/master/README.md](../../../packages/master/README.md)

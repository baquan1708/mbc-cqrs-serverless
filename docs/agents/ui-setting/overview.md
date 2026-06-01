# @mbc-cqrs-serverless/ui-setting

UI configuration and data settings stored via CQRS entities.

## Depends on

- `@mbc-cqrs-serverless/core`

## Used by

(None in monorepo.)

## Modules

| Module | Notes |
|--------|-------|
| `SettingModule` | UI setting module registration |

## Services

| Service | Role |
|---------|------|
| `SettingService` | UI settings CRUD |
| `DataSettingService` | Data-bound UI settings |

## Typical flow

Settings API → services → `CommandService` / `DataService` with tenant-scoped keys.

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/ui-setting
```

## Related

- [core/overview.md](../core/overview.md)
- [packages/ui-setting/README.md](../../../packages/ui-setting/README.md)

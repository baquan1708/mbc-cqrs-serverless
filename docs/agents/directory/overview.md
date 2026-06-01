# @mbc-cqrs-serverless/directory

Directory tree and file metadata, built on master data patterns.

## Depends on

- `@mbc-cqrs-serverless/core`
- `@mbc-cqrs-serverless/master`

## Used by

(None in monorepo.)

## Modules

| Module | Notes |
|--------|-------|
| `DirectoryModule` | `register()` with module options |

## Services

| Service | Role |
|---------|------|
| `DirectoryService` | Directory nodes |
| `DirectoryFileService` | File attachments |
| `DynamodbService` | Package-local DynamoDB helper (directory-specific) |

## Typical flow

Directory API → services → CQRS commands via `core` → may reference master entities for hierarchy.

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/directory
```

Changes to master keys or tenant layout may require coordinated updates here.

## Related

- [master/overview.md](../master/overview.md)
- [packages/directory/README.md](../../../packages/directory/README.md)

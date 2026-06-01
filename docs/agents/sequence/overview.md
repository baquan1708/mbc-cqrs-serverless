# @mbc-cqrs-serverless/sequence

Tenant-scoped, time-rotating sequence ID generation.

## Depends on

- `@mbc-cqrs-serverless/core`

## Used by

- `@mbc-cqrs-serverless/master`

## Modules

| Module | Notes |
|--------|-------|
| `SequencesModule` | Import or register in host; used by `MasterModule` when controllers enabled |

## Services

| Service | Role |
|---------|------|
| `SequencesService` | Generate next sequence values with configurable patterns |

## API note

`genNewSequence()` was **removed in v1.2.0** — use current `SequencesService` APIs only (AP014). See MCP `migration_guide` for upgrades.

## Typical flow

Handler needs new business key → `SequencesService` → DynamoDB sequence item for tenant + pattern → formatted ID returned to command entity.

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/sequence
```

Sequence key collisions are tenant-scoped — never hardcode tenant (see [conventions.md](../conventions.md)).

## Related

- [master/overview.md](../master/overview.md)
- [packages/sequence/README.md](../../../packages/sequence/README.md)

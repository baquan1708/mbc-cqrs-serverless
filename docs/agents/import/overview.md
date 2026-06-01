# @mbc-cqrs-serverless/import

CSV and batch import: queue processors, Step Functions batch architecture, parent/child job finalization.

## Depends on

- `@mbc-cqrs-serverless/core`

## Used by

(None in monorepo — host apps import this package.)

## Modules

| Module | Notes |
|--------|-------|
| `ImportModule` | `register()` with import options |

## Services

| Service | Role |
|---------|------|
| `ImportService` | Import job orchestration |

## Event handlers / processors

- Queue event handlers under `src/event/`
- `CsvBatchProcessor` and related processors (Smart Retry since v1.2.2)

## Typical flow

Upload → import job command → SQS batches → processors → Step Functions parent job → **`finalize_parent_job`** state required (v1.1.5+).

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/import
```

Batch/SFN changes must stay compatible with host Step Function definitions.

## Related

- [task/overview.md](../task/overview.md)
- [packages/import/README.md](../../../packages/import/README.md)

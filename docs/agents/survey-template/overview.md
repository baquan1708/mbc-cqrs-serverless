# @mbc-cqrs-serverless/survey-template

Survey templates and answers, integrated with master data.

## Depends on

- `@mbc-cqrs-serverless/core`
- `@mbc-cqrs-serverless/master`

## Used by

(None in monorepo.)

## Modules

| Module | Notes |
|--------|-------|
| `SurveyTemplateModule` | `register()` with configurable options |

## Services

| Service | Role |
|---------|------|
| `SurveyTemplateService` | Template CRUD |
| `SurveyAnswerService` | Answer submissions |

## Controllers

- `SurveyTemplateController`
- `SurveyAnswerController`

## Typical flow

Template definition (master-linked) → answers captured as CQRS entities → read via `DataService`.

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/survey-template
```

## Related

- [master/overview.md](../master/overview.md)
- [packages/survey-template/README.md](../../../packages/survey-template/README.md)

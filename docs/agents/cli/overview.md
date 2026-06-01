# @mbc-cqrs-serverless/cli

Command-line scaffolding: `mbc new`, `mbc generate`, infra templates. **Not** a runtime dependency of feature packages.

## Depends on

None on other `@mbc-cqrs-serverless/*` packages (generated apps depend on `core`).

## Used by

Developers and agents scaffolding new projects — not imported by `master`, `task`, etc.

## Structure

| Area | Path |
|------|------|
| CLI entry | `packages/cli/src` |
| Schematics | `packages/cli/schematics` |
| Project templates | `packages/cli/templates` |

## Commands (consumer)

```bash
mbc new PROJECT_NAME
mbc generate module NAME
mbc generate controller NAME
mbc generate service NAME
```

## Contributor notes

- Template changes must stay aligned with current `core` `AppModule.forRoot` and `CommandModule.register` patterns
- Updating templates does not require `docs:agents:gen` unless new packages/modules are added to the monorepo itself

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/cli
```

Manually verify generated project builds after template edits.

## Related

- [conventions.md](../conventions.md)
- [packages/cli/README.md](../../../packages/cli/README.md)

# Contributor conventions

Patterns agents and contributors must follow when changing this monorepo.

## NestJS module registration

### Host application (`core`)

```typescript
AppModule.forRoot({
  rootModule: AppFeatureModule,
  envCls: EnvVariables,
})
```

- Mounts host features under `/api`
- Registers `/event` when `EVENT_SOURCE_DISABLED !== 'true'`

### Per-entity command table (`core`)

```typescript
CommandModule.register({
  tableName: 'my-entity',
  dataSyncHandlers: [/* optional */],
})
```

One `CommandModule.register()` per DynamoDB command table name. Feature packages (e.g. `master`) call this inside their own `register()`.

### Long-running tasks (`task`)

```typescript
TaskModule.register({
  taskQueueEventFactory: MyTaskQueueEventFactory,
  enableController: false,
})
```

**Global module** — register **once** in the host `AppModule`. Duplicate registration causes subtle DI and handler bugs (anti-pattern AP015).

### Data store and queues (`core`)

- `DataStoreModule` — `@Global()`; provides `DynamoDbService`, `S3Service`, `SessionService`
- `QueueModule` — SNS/SQS; import where publishing/consuming messages

## Package layout for new features

Prefer adding to an existing package when the domain matches (`master`, `task`, etc.). New package checklist:

1. `packages/<name>/package.json` with `@mbc-cqrs-serverless/<name>`
2. `src/index.ts` public exports
3. `<name>.module.ts` with `ConfigurableModuleBuilder` + `register()` if options needed
4. README.md for npm consumers
5. `docs/agents/<name>/overview.md` for contributors
6. Run `npm run docs:agents:gen`

## CQRS naming

| Kind | Pattern |
|------|---------|
| Command | `CreateXCommand`, `UpdateXCommand` |
| Handler | `CreateXHandler` |
| Event | `XCreatedEvent` |
| DTO | `CreateXDto` |
| Entity | `XEntity` |

## Documentation language

- Public docs and agent docs in this tree: **English**
- Commit messages: **English**

## Testing expectations

- Unit tests: Jest + `aws-sdk-client-mock` for AWS
- Package-scoped: `npm test --workspace=@mbc-cqrs-serverless/<package>`
- After changing `core` integration behavior: `packages/core/src/integration/`

## Common pitfalls

| Issue | Guidance |
|-------|----------|
| Direct DynamoDB writes bypassing `CommandService` | Use `publishAsync` / `publishSync` (AP001) |
| Hardcoded tenant | Use request context / `#common` lowercase tenant key (AP005, AP012) |
| `publishSync` no-op | Return value can be `null` since v1.2.0 — check before use (AP013) |
| Removed APIs | `publish()`, `publishPartialUpdate()`, `genNewSequence()` — see MCP `migration_guide` |

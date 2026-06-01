# @mbc-cqrs-serverless/tenant

Tenant CRUD, tenant groups, and tenant-scoped context for multi-tenant SaaS.

## Depends on

- `@mbc-cqrs-serverless/core`

## Used by

(None in monorepo — consumed by host applications.)

## Modules

| Module | Notes |
|--------|-------|
| `TenantModule` | Registers controllers and services |

## Services

| Service | Role |
|---------|------|
| `TenantService` | Tenant lifecycle and queries |

## Typical flow

Admin API → `TenantController` → `TenantService` → `CommandService` / `DataService` with tenant-scoped keys.

## How to change safely

```bash
npm test --workspace=@mbc-cqrs-serverless/tenant
```

Tenant isolation must align with `getUserContext()` / JWT claims in `core` (AP005, AP006).

## Related

- [core/services.md](../core/services.md)
- [conventions.md](../conventions.md)
- [packages/tenant/README.md](../../../packages/tenant/README.md)

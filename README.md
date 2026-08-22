# ZAdmin

ZAdmin is a pnpm workspace for SvelteKit applications, reusable libraries, and full-stack plugins.

## Workspace

```text
apps/
  admin/     Administration application
  etl/       ETL application
  docs/      Component and development documentation

packages/
  core/      Dependency injection, plugin runtime, artifacts, and installer
  sveltekit/ SvelteKit host and client plugin runtime
  auth/      Authentication foundation
  postgres/  PostgreSQL foundation
  redis/     Redis foundation
  oss/       Object storage foundation
  zui/       Reusable Svelte component library
  drizzle/   Reusable Drizzle enhancements

plugins/
  approval/  Approval workflow plugin
  erp/       ERP plugin
  crm/       CRM plugin
```

## Development

```sh
pnpm install
pnpm dev:admin
pnpm dev:etl
pnpm dev:docs
```

`pnpm dev:admin` starts Admin together with the Approval, ERP, and CRM artifact watchers.

## Validation

```sh
pnpm check
pnpm lint
pnpm test
pnpm build
```

## Documentation

- [Next implementation blueprint](./apps/docs/content/implementation-blueprint.md)
- [Device handoff and development recovery](./apps/docs/content/handoff.md)
- [Architecture](./apps/docs/content/architecture.md)
- [Plugin development](./apps/docs/content/plugin-development.md)
- [Plugin lifecycle](./apps/docs/content/plugin-lifecycle.md)
- [Development HMR](./apps/docs/content/development-hmr.md)
- [Testing](./apps/docs/content/testing.md)
- [Engineering preferences](./apps/docs/content/engineering-preferences.md)

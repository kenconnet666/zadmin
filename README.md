# ZAdmin

ZAdmin is a pnpm workspace for SvelteKit applications, reusable libraries, and full-stack plugins.

## Workspace

```text
apps/
  admin/     Administration application
  etl/       ETL application
  docs/      Component and development documentation

packages/
  core/      Plugin runtime and shared application foundation
  zui/       Reusable Svelte component library
  drizzle/   Reusable Drizzle enhancements

plugins/
  sveltekit/ SvelteKit integration plugin
  postgres/  PostgreSQL plugin
  redis/     Redis plugin
  oss/       Object storage plugin
  auth/      Authentication and authorization plugin
  etl/       ETL plugin
```

## Development

```sh
pnpm install
pnpm dev:admin
pnpm dev:etl
pnpm dev:docs
```

## Validation

```sh
pnpm check
pnpm lint
pnpm test
pnpm build
```

## Documentation

- [Architecture](./apps/docs/content/architecture.md)
- [Plugin development](./apps/docs/content/plugin-development.md)
- [Plugin lifecycle](./apps/docs/content/plugin-lifecycle.md)
- [Development HMR](./apps/docs/content/development-hmr.md)
- [Testing](./apps/docs/content/testing.md)
- [Engineering preferences](./apps/docs/content/engineering-preferences.md)

# Workspace dependency upgrade audit（2026-09-08）

## 结论边界

本审计是2026-09-08升级前的 workspace 依赖声明、已安装状态及registry `latest`/peer/engine 元数据快照。首轮只读审计没有安装或更新依赖；此后的实际修改单独记在文末“实施记录”，不覆盖初始快照。

“目标”只表示 registry 当前 `latest` 或明确的迁移目标，不表示可直接升级。所有候选都必须经过对应 workspace 的 lock 更新、类型/构建、浏览器/SSR 和发布边界验证后才能记为验收完成。

官方来源：

- npm registry package metadata：[registry.npmjs.org](https://registry.npmjs.org/)
- Node.js 官方版本状态：[Node.js Releases](https://nodejs.org/en/about/previous-releases)（页面显示 Node 24 为 LTS，Node 26 为 Current；生产应用应使用 Active/Maintenance LTS）
- pnpm registry metadata：[pnpm package](https://registry.npmjs.org/pnpm)

当前 CI 基线为 Node `24`、pnpm `11.22.0`（见 `.github/workflows/ci.yml` / `release.yml`）。Node 官方页面当前显示 Node 24 为 LTS；因此 Node 24 是当前 CI 与生产验证应对齐的基线。Node 26 可作为后续 CI 扩展矩阵候选，不应在本批直接替换 CI 24。

## Named catalogs

| Package                    | 当前 catalog / lock policy   | registry latest | 分类              | 例外 / peer-engine 结论                         | 验证要求                       |
| -------------------------- | ---------------------------- | --------------- | ----------------- | ----------------------------------------------- | ------------------------------ |
| `@sveltejs/adapter-static` | `catalog:desktop` = `3.0.10` | `3.0.10`        | SvelteKit adapter | peer `@sveltejs/kit ^2.0.0`，已对齐             | 无版本动作；desktop 构建 smoke |
| `miniprogram-api-typings`  | `catalog:wechat` = `5.2.3`   | `5.2.3`         | WeChat typings    | 已对齐；不要以 npm 普通升级替代目标平台类型验证 | WeChat 类型/编译门禁           |

## Catalog 外部直接依赖（53 packages）

下表逐项枚举 `pnpm-workspace.yaml` `catalog` 中的全部外部包。当前版本列表示 catalog policy；实际锁定版本以 pnpm lockfile 为准。

| Package                         | 当前 catalog       | registry latest / target              | 分类                | 例外 /兼容性                                                                                         | 验证要求                         |
| ------------------------------- | ------------------ | ------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| `@aws-sdk/client-s3`            | `^3.1115.0`        | `3.1127.0`                            | Cloud SDK           | 范围允许 minor 更新                                                                                  | OSS/签名/上传回归                |
| `@aws-sdk/s3-request-presigner` | `^3.1115.0`        | `3.1127.0`                            | Cloud SDK           | 与 client-s3 成对                                                                                    | presign/download 回归            |
| `@axe-core/playwright`          | `^4.13.0`          | `4.13.0`                              | A11y test           | peer `playwright-core >=1`                                                                           | 不需动作                         |
| `@changesets/cli`               | `^3.0.1`           | `3.0.2`                               | Release tooling     | latest engine Node `^22.11 或 ^24 或 >=26`，CI 24 满足                                               | release self-test                |
| `@dnd-kit/dom`                  | `^0.5.0`           | `0.5.0`                               | Drag/drop           | 当前 latest                                                                                          | 无版本动作；拖拽 smoke           |
| `@dnd-kit/state`                | `^0.5.0`           | `0.5.0`                               | Drag/drop           | 当前 latest                                                                                          | 无版本动作                       |
| `@dnd-kit/svelte`               | `^0.5.0`           | `0.5.0`                               | Drag/drop           | peer Svelte `^5.29.0`，当前 Svelte 5.56 满足                                                         | 无版本动作；Svelte drag smoke    |
| `@eslint/js`                    | `^10.0.1`          | `10.0.1`                              | Lint                | peer ESLint `^10.0.0`                                                                                | 已对齐                           |
| `@floating-ui/dom`              | `^1.8.0`           | `1.8.0`                               | Positioning         | 当前 latest                                                                                          | Overlay/browser smoke            |
| `@fontsource/fira-mono`         | `^5.2.7`           | `5.3.0`                               | Docs font           | lock 已为 5.3.0；catalog policy 可收紧但不必要                                                       | Docs visual/font smoke           |
| `@internationalized/date`       | `^3.12.3`          | `3.12.4`                              | Date/time           | **patch 更新候选**                                                                                   | 日期/时区/SSR 回归               |
| `@lucide/svelte`                | `>=1.37.0 <1.42.0` | `1.42.0`                              | Icons               | **保留上限**：1.42 已知发布包含 unresolved `@lucide/shared/types`；1.41.0 是当前范围内的健康升级候选 | 图标 package/bundle 检查         |
| `@neoconfetti/svelte`           | `^2.2.2`           | `2.2.2`                               | UI effect           | peer 支持 Svelte 3/4/5                                                                               | 无版本动作                       |
| `@playwright/test`              | `^1.62.1`          | `1.63.0`                              | E2E                 | Node `>=20`，CI 24 满足；与 `playwright` 成对                                                        | Chromium/Firefox/WebKit 定向矩阵 |
| `@standard-schema/spec`         | `^1.1.0`           | `1.1.0`                               | Form contract       | 当前 latest                                                                                          | 无版本动作                       |
| `@sveltejs/adapter-node`        | `^5.5.7`           | `5.5.7`                               | SvelteKit adapter   | peer Kit `^2.4.0`                                                                                    | 无版本动作                       |
| `@sveltejs/kit`                 | `^2.70.3`          | `2.70.3`                              | SvelteKit           | peer Vite 5–8、Svelte 4/5、TS 5.3/6、plugin 3–7；当前闭合；TS 7 不在 peer 范围                       | SSR/build/route/browser          |
| `@sveltejs/package`             | `^2.5.8`           | `2.5.8`                               | Package tooling     | peer Svelte 3/4/5                                                                                    | 无版本动作                       |
| `@sveltejs/vite-plugin-svelte`  | `^7.3.0`           | `7.3.0`                               | Svelte compiler     | peer Vite `^8`、Svelte `^5.46.4`；当前闭合                                                           | Svelte build/check               |
| `@types/estree`                 | `^1.0.9`           | `1.0.9`                               | Types               | 当前 latest                                                                                          | 无版本动作                       |
| `@types/node`                   | `^26.2.0`          | `26.5.0`                              | Types               | 与 CI Node 24 类型基线存在 Node 26 API前视差异；升级需类型回归                                       | TS/check/build                   |
| `@types/stylis`                 | `^4.2.7`           | `4.2.7`                               | Types               | 当前 latest                                                                                          | 无版本动作                       |
| `@vitest/browser-playwright`    | `^4.1.11`          | `5.0.0`                               | Test browser        | latest peer 要求 Vitest 5；当前 4.1.11 与现有栈一致                                                  | **后续独立 Vitest 5 migration**  |
| `@vitest/coverage-v8`           | `^4.1.11`          | `5.0.0`                               | Coverage            | latest peer 要求 Vitest 5                                                                            | 与 Vitest/browser 成组迁移       |
| `csstype`                       | `^3.2.3`           | `3.2.3`                               | Types               | 当前 latest                                                                                          | 无版本动作                       |
| `drizzle-kit`                   | `1.0.0-rc.4`       | stable `0.31.10`; rc tag `1.0.0-rc.4` | DB tooling          | **保留 RC 轨道**；不要切回 stable                                                                    | Drizzle schema/migration 回归    |
| `drizzle-orm`                   | `1.0.0-rc.4`       | stable `0.45.2`; rc tag `1.0.0-rc.4`  | DB runtime          | `packages/drizzle` peer 精确要求 RC；不要盲切 stable                                                 | DB package contract              |
| `eslint`                        | `^10.9.0`          | `10.10.0`                             | Lint                | minor 更新候选；Node engine支持 CI 24                                                                | 全 workspace lint                |
| `eslint-config-prettier`        | `^10.1.8`          | `10.1.8`                              | Lint                | 当前 latest                                                                                          | 无版本动作                       |
| `eslint-plugin-svelte`          | `^3.23.0`          | `3.23.0`                              | Lint                | peer ESLint 8/9/10、Svelte 3/4/5                                                                     | 无版本动作                       |
| `estree-walker`                 | `^3.0.3`           | `3.0.3`                               | Compiler            | 当前 latest                                                                                          | 无版本动作                       |
| `fast-check`                    | `^4.9.0`           | `4.9.0`                               | Test                | 当前 latest                                                                                          | 无版本动作                       |
| `globals`                       | `^17.11.0`         | `17.12.0`                             | Lint                | minor 更新候选                                                                                       | Lint                             |
| `magic-string`                  | `^1.2.2`           | `1.2.3`                               | Compiler            | patch 更新候选                                                                                       | Compiler self-test               |
| `playwright`                    | `^1.62.1`          | `1.63.0`                              | E2E runtime         | 与 @playwright/test 成对；Node `>=20`                                                                | 三浏览器定向                     |
| `postgres`                      | `^3.4.9`           | `3.4.9`                               | DB client           | 当前 latest                                                                                          | DB integration                   |
| `prettier`                      | `^3.9.6`           | `3.9.6`                               | Formatting          | 当前 latest                                                                                          | 无版本动作                       |
| `prettier-plugin-svelte`        | `^4.1.1`           | `4.1.1`                               | Formatting          | peer Prettier 3、Svelte 5                                                                            | 无版本动作                       |
| `redis`                         | `^6.2.1`           | `6.2.1`                               | DB client           | 当前 latest                                                                                          | Redis integration                |
| `runed`                         | `^0.37.1`          | `0.37.1`                              | Svelte utilities    | peers Svelte `^5.7`; Kit/zod peers optional；当前闭合                                                | 使用处专项回归                   |
| `semver`                        | `^7.8.5`           | `7.8.5`                               | Runtime utility     | 当前 latest                                                                                          | 无版本动作                       |
| `shiki`                         | `^4.4.3`           | `4.4.3`                               | Docs code           | 当前 latest；ZUI peer optional                                                                       | Docs code highlighting           |
| `stylis`                        | `^4.4.0`           | `4.4.0`                               | CSS runtime         | 当前 latest                                                                                          | ICSS/browser                     |
| `svelte`                        | `^5.56.10`         | `5.57.0`                              | Svelte runtime      | **minor 更新候选**；常规 Svelte/Kit/plugin peers 可接受；Miniapp 固定 compiler 需独立验证            | Svelte check/build/SSR/browser   |
| `svelte-check`                  | `^4.7.6`           | `4.7.6`                               | Type/check          | peer Svelte 4/5、TS 5/6                                                                              | 全 workspace check               |
| `tabbable`                      | `^6.5.0`           | `6.5.0`                               | A11y runtime        | 当前 latest                                                                                          | Focus/overlay                    |
| `tar`                           | `^7.5.22`          | `7.5.22`                              | Packaging           | 当前 latest                                                                                          | Pack/artifact                    |
| `tsx`                           | `^4.23.12`         | `4.23.13`                             | Tool runtime        | Vite optional peer `^4.8.1`已满足                                                                    | Scripts                          |
| `typescript`                    | `^6.0.3`           | `7.0.2`                               | Type system         | **暂缓**：Kit 2.70.3 peer仅 `^5.3.3 或 ^6.0.0`；typescript-eslint 8.70 peer `<6.1.0`                 | 后续 TS7/ESLint/Kit 联合迁移     |
| `typescript-eslint`             | `^8.67.0`          | `8.70.0`                              | Lint types          | latest仍要求 TS `<6.1`                                                                               | 可作为 TS6 内 minor 候选         |
| `vite`                          | `^8.2.2`           | `8.2.2`                               | Build               | 当前 latest；Node engine `^20.19 或 >=22.12`                                                         | Build/SSR/browser                |
| `vitest`                        | `^4.1.11`          | `5.0.0`                               | Test runner         | **后续独立迁移**：browser/coverage peers必须一并到5                                                  | 不混入本批修复                   |
| `vitest-browser-svelte`         | `^3.0.0`           | `3.1.0`                               | Svelte browser test | peer支持 Vitest 4/5                                                                                  | 可单独评估 minor                 |

### Catalog lock snapshot

以下是升级前 workspace `pnpm list -r --depth=0` 可观察到的实际解析版本；`未解析` 表示 catalog 中有声明但当前 workspace 没有直接安装者，不能伪造为已锁定版本。普通catalog共53项、named catalogs共2项；`runed`和`@neoconfetti/svelte`应先复核是否还需要声明，不为没有消费点的包执行升级。

| Package                         | 当前实际解析                          |
| ------------------------------- | ------------------------------------- |
| `@aws-sdk/client-s3`            | `3.1115.0`                            |
| `@aws-sdk/s3-request-presigner` | `3.1115.0`                            |
| `@axe-core/playwright`          | `4.13.0`                              |
| `@changesets/cli`               | `3.0.1`                               |
| `@dnd-kit/dom`                  | `0.5.0`                               |
| `@dnd-kit/state`                | `0.5.0`                               |
| `@dnd-kit/svelte`               | `0.5.0`                               |
| `@eslint/js`                    | `10.0.1`                              |
| `@floating-ui/dom`              | `1.8.0`                               |
| `@fontsource/fira-mono`         | `5.3.0`                               |
| `@internationalized/date`       | `3.12.3`                              |
| `@lucide/svelte`                | `1.37.0`                              |
| `@neoconfetti/svelte`           | 未解析（当前无 workspace 直接安装者） |
| `@playwright/test`              | `1.62.1`                              |
| `@standard-schema/spec`         | `1.1.0`                               |
| `@sveltejs/adapter-node`        | `5.5.7`                               |
| `@sveltejs/kit`                 | `2.70.3`                              |
| `@sveltejs/package`             | `2.5.8`                               |
| `@sveltejs/vite-plugin-svelte`  | `7.3.0`                               |
| `@types/estree`                 | `1.0.9`                               |
| `@types/node`                   | `26.2.0`                              |
| `@types/stylis`                 | `4.2.7`                               |
| `@vitest/browser-playwright`    | `4.1.11`                              |
| `@vitest/coverage-v8`           | `4.1.11`                              |
| `csstype`                       | `3.2.3`                               |
| `drizzle-kit`                   | `1.0.0-rc.4`                          |
| `drizzle-orm`                   | `1.0.0-rc.4`                          |
| `eslint`                        | `10.9.0`                              |
| `eslint-config-prettier`        | `10.1.8`                              |
| `eslint-plugin-svelte`          | `3.23.0`                              |
| `estree-walker`                 | `3.0.3`                               |
| `fast-check`                    | `4.9.0`                               |
| `globals`                       | `17.11.0`                             |
| `magic-string`                  | `1.2.2`                               |
| `playwright`                    | `1.62.1`                              |
| `postgres`                      | `3.4.9`                               |
| `prettier`                      | `3.9.6`                               |
| `prettier-plugin-svelte`        | `4.1.1`                               |
| `redis`                         | `6.2.1`                               |
| `runed`                         | 未解析（当前无 workspace 直接安装者） |
| `semver`                        | `7.8.5`                               |
| `shiki`                         | `4.4.3`                               |
| `stylis`                        | `4.4.0`                               |
| `svelte`                        | `5.56.10`                             |
| `svelte-check`                  | `4.7.6`                               |
| `tabbable`                      | `6.5.0`                               |
| `tar`                           | `7.5.22`                              |
| `tsx`                           | `4.23.12`                             |
| `typescript`                    | `6.0.3`                               |
| `typescript-eslint`             | `8.67.0`                              |
| `vite`                          | `8.2.2`                               |
| `vitest`                        | `4.1.11`                              |
| `vitest-browser-svelte`         | `3.0.0`                               |

## 非 catalog 直接依赖与 peer 约束（19 audited rows）

这些包没有通过普通 catalog 条目统一管理，不能只看上表 catalog 就算完成审计；本表共 19 行（含 peer 与 target compiler 例外）。

| Workspace          | Package                | 当前声明/锁定                            | registry target           | 分类            | 例外 / 验证                                      |
| ------------------ | ---------------------- | ---------------------------------------- | ------------------------- | --------------- | ------------------------------------------------ |
| `packages/core`    | `@types/semver`        | `^7.7.1`                                 | `7.8.0`                   | Types           | minor 候选；配合 TS6 check                       |
| `ui/miniapp`       | `esbuild`              | `0.28.2`                                 | `0.28.2`                  | Build           | 当前 latest；Miniapp build                       |
| `packages/auth`    | `@sveltejs/kit` peer   | `^2.0.0`                                 | 2.70.3                    | Peer            | 与 catalog Kit 闭合                              |
| `packages/auth`    | `svelte` peer          | `^5.0.0`                                 | 5.57.0                    | Peer            | 与 catalog Svelte 闭合                           |
| `packages/core`    | `typescript` peer      | `>=5.0.0`                                | 6.0.3 当前 CI             | Peer            | 不应单凭宽范围推进 TS7                           |
| `packages/core`    | `vite` peer            | `^8.0.0`                                 | 8.2.2                     | Peer            | 与 catalog 闭合                                  |
| `packages/drizzle` | `drizzle-orm` peer     | `1.0.0-rc.4`                             | rc tag `1.0.0-rc.4`       | Peer            | 精确 RC 合同，不能换 stable                      |
| `ui/miniapp`       | `svelte` peer          | `5.56.10`                                | 5.57.0                    | Peer            | 固定目标平台版本；先验证 Miniapp compiler        |
| `ui/miniapp`       | `svelte` devDependency | Svelte compiler URL `pkg.svelte.dev/...` | 无 registry latest 等价物 | Target compiler | 保持特殊 compiler 来源，不机械替换               |
| `apps/wechat`      | `svelte` devDependency | Svelte compiler URL `pkg.svelte.dev/...` | 无 registry latest 等价物 | Target compiler | 保持特殊 compiler 来源                           |
| `ui/zui`           | `@lucide/svelte` peer  | `>=1.37.0 <1.42.0`                       | latest `1.42.0`           | Peer exception  | 1.42 已知坏包；1.41.0 是范围内健康候选，保留上限 |
| `ui/zui`           | `shiki` peer           | `^4.4.3`                                 | 4.4.3                     | Peer            | 当前闭合                                         |
| `ui/zui`           | `svelte` peer          | `>=5.56.0 <6`                            | 5.57.0                    | Peer            | 当前 CI/Kit/plugin闭合                           |
| `ui/webview`       | `svelte` peer          | `>=5.56.0 <6`                            | 5.57.0                    | Peer            | 当前 CI/Kit/plugin闭合                           |
| `ui/sveltekit`     | `@sveltejs/kit` peer   | `^2.0.0`                                 | 2.70.3                    | Peer            | 当前闭合                                         |
| `ui/sveltekit`     | `svelte` peer          | `^5.0.0`                                 | 5.57.0                    | Peer            | 当前闭合                                         |
| `plugins/approval` | `svelte` peer          | `^5.0.0`                                 | 5.57.0                    | Peer            | 当前闭合                                         |
| `plugins/crm`      | `svelte` peer          | `^5.0.0`                                 | 5.57.0                    | Peer            | 当前闭合                                         |
| `plugins/erp`      | `svelte` peer          | `^5.0.0`                                 | 5.57.0                    | Peer            | 当前闭合                                         |

Workspace packages such as `@zadmin/*` with `workspace:^` are deliberately excluded from external registry upgrades; they are internal package graph edges, not third-party dependency candidates.

## pnpm and Node policy

- Current CI pins pnpm `11.22.0`; npm registry latest pnpm is `12.3.4` and its engine is Node `>=18.*`.
- pnpm 12 is a separate workspace/tooling migration candidate. It must not be mixed into the current dependency repair because it can alter lockfile semantics, lifecycle approvals and workspace resolution behavior.
- Node official status page currently lists Node 24 as LTS and Node 26 as Current. CI Node 24 is therefore the correct support baseline. Do not align type packages to Node 26 APIs merely because `@types/node` latest is 26.5.0; treat that as a separate type/runtime matrix decision.

## Planned candidate groups

### Low-risk candidates requiring normal acceptance

AWS SDK `3.1127.0`, Playwright `1.63.0`, `@types/node 26.5.0`, ESLint `10.10.0`, globals `17.12.0`, magic-string `1.2.3`, tsx `4.23.13`, TypeScript-eslint `8.70.0`, Svelte `5.57.0`, and `vitest-browser-svelte 3.1.0` are version candidates only. Each still needs lock update, package-specific checks and CI evidence; “semver-compatible” alone is not acceptance.

### Deferred migrations

- Vitest 5: upgrade `vitest`, `@vitest/browser-playwright`, and `@vitest/coverage-v8` together; rerun unit/browser/coverage and inspect reporter/project behavior.
- pnpm 12: separate package-manager migration with frozen-lockfile, workspace/catalog, lifecycle and CI validation.
- TypeScript 7: blocked by current Kit 2.70.3 peer range and typescript-eslint `<6.1` peer; requires a coordinated toolchain migration.
- Drizzle stable: separate RC-to-stable migration, not a latest-version cleanup.
- Lucide 1.42: blocked by the known unresolved `@lucide/shared/types` package defect；`1.41.0` 是当前范围内的健康候选，仍需 package/bundle 验证。

This document is an audit snapshot and upgrade planning input; it does not mean any dependency upgrade has passed acceptance.

## 实施记录

### Windows宿主依赖补充审计

三个`.csproj`均以.NET 10为目标；Core与Core.Tests没有直接`PackageReference`。Windows宿主目标为`net10.0-windows10.0.26100.0`，最低平台版本`10.0.19041.0`。

| 依赖                    | 当前        | 最新稳定候选（2026-09-08） | 决策                                              |
| ----------------------- | ----------- | -------------------------- | ------------------------------------------------- |
| Microsoft.WindowsAppSDK | 2.4.0       | 2.4.0                      | 已对齐，无升级动作                                |
| Microsoft.Web.WebView2  | 1.0.4129.50 | 1.0.4191.47                | 单独升级候选，需Windows构建、初始化和bridge smoke |

来源：[WindowsAppSDK官方NuGet元数据](https://api.nuget.org/v3-flatcontainer/microsoft.windowsappsdk/index.json)、[WebView2官方NuGet元数据](https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/index.json)。.NET 10处于Active LTS，生命周期本身不是阻断；参见[Microsoft支持策略](https://dotnet.microsoft.com/en-us/platform/support/policy)。这次没有NuGet restore、build或版本修改，不能把元数据查询算作宿主验收。

### 2026-09-08：Lucide健康新版本

- Transfer修复与Lucide损坏版本的peer上限已提交`1d7bf25`；其全新外部项目自动解析1.41.0并通过严格类型、构建、SSR/CSP及ZCode探测，没有手动修改消费端。
- 随后执行`pnpm update -r @lucide/svelte --no-save --depth 0`，workspace lock由1.37.0提升到1.41.0，仅更改该包的catalog解析、两个importer及完整性快照。支持范围仍是`>=1.37.0 <1.42.0`，保留必要的消费兼容范围，不要求消费者强制同一patch。
- 移除已无消费的`@lucide/svelte@1.37.0`发布等待例外，未添加新的等待例外；在线`pnpm install --frozen-lockfile --ignore-scripts`通过供应链检查。首次离线检查因本机缺少`@clack/prompts`元数据失败，不记为通过，也未关闭安全策略。
- 同步安装指南和README。升级后的workspace类型与图标消费者定向结果见[执行计划](./production-execution-plan-2026-09-08.md)；完整三浏览器、bundle和桌面矩阵仍以新SHA CI为准。

### 下一批分组

P06先行的日期/编译器补丁组已安装：`@internationalized/date`3.12.4、`magic-string`1.2.3，catalog最低支持patch和lock同步更新。官方[MagicString变更记录](https://github.com/Rich-Harris/magic-string/blob/master/CHANGELOG.md)列出了1.2.3的替换/索引等修复；日期包以[官方发布包元数据](https://registry.npmjs.org/@internationalized%2fdate/3.12.4)核对依赖/入口。现有六文件50项编译器与日期unit通过，ZUI/Docs类型通过；不以semver兼容代替完整CI。第三方仍锁定的MagicString 1.2.2 transitive副本未用全局override强改。

1. 日期/编译补丁组已先行，余下`@types/semver`、Changesets等按实际消费点分别验收；AWS SDK client/presigner一起升级。
2. Svelte运行时与测试渲染器：先检查Miniapp精确peer及特殊compiler来源，保留平台边界，不只改普通catalog。
3. Vitest 5与Playwright：按[官方迁移说明](https://vitest.dev/guide/migration/)核实配置API、sequential、测试产物路径及自定义reporter/command；按实际import owner处理async render，不机械修改所有同名函数。不得把升级当作已证明的浏览器断连修复。
4. pnpm 12独立迁移；TypeScript 7等待Kit、svelte-check和typescript-eslint等真实支持。`@types/node`先对齐承诺的运行时能力与CI基线，不能仅因registry latest属于26就无条件使用Node 26 API。

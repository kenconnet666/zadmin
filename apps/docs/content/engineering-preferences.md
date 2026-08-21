# 工程倾向与决策原则

本文件记录本项目的长期倾向，架构讨论和代码评审默认遵守。它们不是不可改变的教条，但修改时必须有具体收益和验证证据。

## 目录

- 根业务目录保持 `apps/`、`packages/`、`plugins/` 三层。
- `apps/admin`、`apps/etl`、`apps/docs` 是最终应用。
- `packages/core`、`packages/zui`、`packages/drizzle` 是基础库。
- `plugins/sveltekit`、`postgres`、`redis`、`oss`、`auth`、`etl` 是插件。
- 不因为理论上可能复用就增加 `tooling/`、`config/` 或多层 package目录。

## 插件形态

- 一个插件默认一个 package，同时承载 Svelte页面和服务端能力。
- 不默认拆 frontend/backend package。
- 不默认创建独立 API包。
- 插件之间可以直接 package依赖，并通过 Runtime注入的对象 API直接调用。
- 禁止插件通过 HTTP/RPC调用同进程插件。
- 禁止导入其他插件的内部源码和模块级 singleton。
- 只有出现多个独立 provider、广泛外部消费者或独立版本需求时才抽公共能力包。

## SvelteKit

- 应用和插件统一采用 SvelteKit/Svelte 5模式。
- 客户端/服务端子路径只是 bundle安全边界，不是拆成两个产品。
- 动态服务端路由归属插件生命周期。
- Svelte页面通过插件 client子路径贡献并参与 Vite HMR。

## 依赖

- 优先使用最新或较新的稳定依赖。
- “最新”必须经过 peer dependency、类型、测试和生产构建验证。
- 最新主版本不兼容时使用最近兼容版本，并记录原因；当前 TypeScript因此使用 6.0.3而不是 7.0.2。
- pnpm catalog统一框架版本。
- 不同时保留两套解决同一问题的核心依赖。
- provider依赖由 provider插件持有，不塞进 Core。

## 代码

- 优先简洁、低冗余、可维护的直接实现。
- 抽象必须解决已经存在的问题，不为遥远假设提前造层。
- 使用不可变定义、显式依赖、可逆 Effect和可观察状态。
- 生命周期资源不能在模块顶层隐式创建。
- 不用注释重复代码；注释解释约束、原因和非显然行为。

## 热重载

- 开发时插件源码、插件页面和 Core插件系统都必须可实时更新。
- 插件更新优先局部重载插件及其下游，不全量重启 Runtime。
- Core更新必须清理旧 Runtime后重建，不能继续运行旧类实例。
- HMR行为必须有自动化测试和真实 dev server验证。

## Git与验证

- 实施过程中使用阶段性 Git提交。
- 每个里程碑提交应保持可构建、可测试。
- 不把无关重构混入当前提交。
- 最终交付前执行 peer、lint、check、test、build和工作树检查。
- 文档和实现放在同一仓库、同一变更链中维护。

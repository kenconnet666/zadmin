# 工作区与架构

## 目标

ZAdmin 是以 SvelteKit 为宿主、pnpm 为包管理器的同进程全栈插件系统。插件之间通过 TypeScript对象直接调用，不使用内部 HTTP、RPC或微服务发现。浏览器到服务端仍然经过正常的 Web传输边界，但服务端插件之间没有网络边界。

## 工作区

```text
apps/
  admin/       后台管理应用
  etl/         ETL应用
  docs/        文档、Storybook和演示

packages/
  core/        插件定义、Runtime、生命周期、HMR
  zui/         可独立发布的 Svelte组件库
  drizzle/     可独立发布的 Drizzle增强库

plugins/
  sveltekit/   SvelteKit路由和页面桥
  postgres/    PostgreSQL插件
  redis/       Redis插件
  oss/         S3兼容对象存储插件
  auth/        鉴权插件和 /auth 页面
  etl/         ETL插件和 /etl 页面
```

应用是插件组合根。`apps/admin` 安装 SvelteKit、PostgreSQL、Redis、OSS和 Auth；`apps/etl` 安装 SvelteKit、PostgreSQL、Redis、OSS和 ETL。

## 依赖方向

```text
apps → packages + plugins
plugins → core + 其他插件的公开入口
core → 不依赖任何具体插件
zui → 不依赖 core 或业务插件
drizzle → 不依赖 core 或业务插件
```

禁止插件导入其他插件的内部 `src` 路径。跨插件依赖必须使用 package根公开入口，并在 `definePlugin({ dependencies })` 中声明。

## 插件定义与直接调用

插件用对象声明依赖：

```ts
export const authPlugin = definePlugin({
	id: 'auth',
	dependencies: {
		sveltekit: sveltekitPlugin,
		postgres: postgresPlugin,
		redis: redisPlugin
	},
	setup(context, dependencies) {
		return {
			database: dependencies.postgres.driver,
			cache: dependencies.redis.driver
		};
	}
});
```

`setup()` 返回值就是插件公开 API。下游插件获得的是完整 TypeScript类型，运行时调用是普通 JavaScript对象方法调用。

## 全栈 SvelteKit插件

一个插件只有一个 package，但可使用不同子路径控制浏览器和服务端依赖边界：

```text
@zadmin/auth          服务端插件定义和直接 API
@zadmin/auth/client   Svelte页面贡献
```

这不是前后端拆包。它们共享一个版本、一个发布制品和一个插件生命周期，只是避免浏览器 bundle引入服务端实现。

## 路由

服务端动态路由由 `@zadmin/sveltekit` 的 `PluginRouteRegistry` 管理。注册路由时传入插件 Context，路由自动成为该插件的 Effect；插件停止或重载时路由自动撤销。

客户端页面由 `PluginPageDefinition` 描述，应用中的 `[...pluginPath]` SvelteKit catch-all 页面使用 `PluginPageOutlet` 加载插件组件。

当前验证路由：

```text
/auth                Auth Svelte页面
/auth/api/status     Auth服务端生命周期路由
/etl                 ETL Svelte页面
/etl/api/status      ETL服务端生命周期路由
/__zadmin/runtime    Runtime诊断快照
```

## 当前边界

当前基础设施已经实现插件生命周期、依赖、直接 API、配置实例、动态路由和 HMR。PostgreSQL、Redis、OSS、Auth和 ETL包目前只提供可运行骨架，没有提前实现真实数据库连接或业务模型。

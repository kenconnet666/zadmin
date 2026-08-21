# 插件开发

## 目录

普通插件保持一个 package：

```text
plugins/example/
  src/lib/index.ts
  src/lib/client.ts       可选
  src/lib/ExamplePage.svelte
  src/svelte.d.ts         有 Svelte入口时使用
  package.json
  svelte.config.js
  tsconfig.json
```

不要默认创建独立 API、server和client package。只有真实存在独立发布、多个 provider或大量外部消费者时才拆包。

## 定义插件

```ts
import { definePlugin } from '@zadmin/core';
import { postgresPlugin } from '@zadmin/postgres';

export const examplePlugin = definePlugin({
	id: 'example',
	dependencies: {
		postgres: postgresPlugin
	},
	config: {
		enabled: true
	},
	setup(context, { postgres }, config) {
		context.onDispose(() => {
			// 清理插件持有的资源
		});

		return {
			query() {
				return postgres.driver;
			},
			enabled: config.enabled
		};
	}
});
```

TypeScript从 `setup()` 返回值推断插件 API，从 `dependencies` 推断依赖 API，从 `config` 推断配置类型。

## Effect与资源

所有具有生命周期的资源都必须归属插件 Context：

```ts
await context.effect(async () => {
	const connection = await connect();
	return () => connection.close();
});
```

也可以注册清理函数：

```ts
context.onDispose(() => subscription.unsubscribe());
```

清理顺序与注册顺序相反，并且按顺序等待异步清理完成。插件停止时 `context.signal` 会先进入 aborted状态。

禁止在模块顶层创建数据库连接、定时器、全局监听器或进程级可变单例。这些对象无法被 Runtime可靠追踪和回收。

## 注册服务端路由

依赖 `sveltekitPlugin` 后直接注册：

```ts
sveltekit.routes.register(context, {
	method: 'GET',
	path: '/example/api/status',
	handler: () => Response.json({ status: 'active' })
});
```

支持静态路径、`:parameter` 和末尾 `*wildcard`。静态路由优先于参数路由，参数路由优先于 wildcard。

## 注册 Svelte页面

```ts
import { definePluginPage } from '@zadmin/sveltekit/client';
import ExamplePage from './ExamplePage.svelte';

export const examplePages = [
	definePluginPage({
		path: '/example',
		load: async () => ({ default: ExamplePage })
	})
];
```

应用的 catch-all 页面把对应 pages传给 `PluginPageOutlet`。

## 安装到应用

先加入应用 package依赖：

```json
{
	"dependencies": {
		"@zadmin/example": "workspace:^"
	}
}
```

再加入组合：

```ts
export const app = defineApp({
	id: 'admin',
	plugins: [sveltekitPlugin, postgresPlugin, examplePlugin]
});
```

应用不需要手写启动顺序。Runtime根据依赖图按拓扑顺序启动，并在卸载时反向停止。

## 必需验证

插件变更至少运行：

```sh
pnpm check
pnpm test
pnpm build
```

涉及页面时还应在 dev server中确认浏览器 HMR；涉及生命周期资源时必须有停止、重载和失败清理测试。

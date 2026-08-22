# 插件开发

## 新插件目录

```text
plugins/example/
  src/server/index.ts
  src/client/index.ts
  src/client/ExamplePage.svelte
  tests/lifecycle.spec.ts
  package.json
  svelte.config.js
  tsconfig.json
  vite.config.ts
  zadmin.plugin.json
```

只创建真实需要的文件。一个插件同时包含服务端和客户端入口，但仍是一个 package、一个版本和一个安装制品。

## 服务端定义

```ts
import { definePlugin, inject, type PluginContext } from '@zadmin/core/plugin';

interface Web {
	readonly routes: {
		register(context: PluginContext, route: { path: string; handler: () => Response }): void;
	};
}

export default definePlugin({
	id: '@vendor/example',
	dependencies: {
		web: inject<Web>('@zadmin/sveltekit')
	},
	setup(context, { web }) {
		web.routes.register(context, {
			path: '/example/api/status',
			handler: () => Response.json({ status: 'active' })
		});
		return { ping: () => 'pong' as const };
	}
});
```

Consumer 从容器取得 `setup()` 返回值并直接调用。类型由 Consumer 自己声明，Core 不维护全局 API表。

## 生命周期资源

```ts
await context.effect(async () => {
	const resource = await openResource();
	return () => resource.close();
});
```

禁止在模块顶层建立连接、定时器和全局监听器。每个运行时资源必须由 `PluginScope` 拥有。

## 客户端入口

```ts
import { mount, unmount } from 'svelte';
import type { ClientPluginContext } from '@zadmin/sveltekit/client';
import ExamplePage from './ExamplePage.svelte';

export function activate(context: ClientPluginContext) {
	return context.pages.register({
		path: '/example',
		mount(target) {
			const component = mount(ExamplePage, { target });
			return () => unmount(component);
		}
	});
}
```

Client revision 被替换时，Host 先调用旧 disposer，再 activate新入口；失败时重新 activate旧模块。

## Manifest

`zadmin.plugin.json` 必须与 `package.json` 的 name/version 一致：

```json
{
	"protocol": 1,
	"id": "@vendor/example",
	"version": "0.0.0",
	"displayName": "Example",
	"requiredTrust": "trusted",
	"entries": {
		"server": "./server/index.js",
		"client": "./client/index.js"
	},
	"requiresHost": {
		"@zadmin/core": "0.0.0",
		"@zadmin/sveltekit": "0.0.0"
	},
	"requires": {
		"@zadmin/sveltekit": "0.0.0"
	},
	"optional": {}
}
```

代码中的 required/optional Injection 必须在对应 Manifest 字段出现；多余或缺失声明会阻止加载。

## 命令

仓库内开发：

```powershell
pnpm dev:admin
```

该命令同时运行 Admin 和三个 Plugin build watcher。插件成功构建后复制 Manifest作为 revision ready标记，Workspace Provider 再加载完整产物。

单包检查和构建：

```powershell
pnpm --filter @zadmin/approval check
pnpm --filter @zadmin/approval test
pnpm --filter @zadmin/approval build
```

生成安装制品：

```powershell
pnpm --filter @zadmin/approval pack:plugin
```

输出位于插件 `artifacts/`，该目录不会进入 Git。外部仓库安装已发布的 `@zadmin/core` 后，可直接使用：

```text
zadmin-plugin pack dist artifacts/example.zplugin
```

## 安装 API

开发态可直接上传原始 `.zplugin` 请求体：

```text
POST /__zadmin/plugins/install
```

启停和版本切换：

```json
POST /__zadmin/plugins/action
{ "id": "@vendor/example", "action": "disable" }
```

支持 `enable`、`disable`、`activate` 和 `uninstall`。生产态必须携带 `Authorization: Bearer <ZADMIN_PLUGIN_ADMIN_TOKEN>`。

## 必需验证

插件变更至少运行 check、test、build。涉及 Runtime、客户端入口或 watcher 时，还必须启动真实 `pnpm dev:admin`，保持浏览器打开验证服务端响应和 DOM 都更新，并还原临时文案。

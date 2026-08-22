# 插件开发

## 插件 package同时承担三个角色

一个动态插件是：

1. 正常的 TypeScript/pnpm package，向下游插件提供 `.d.ts`；
2. 默认导出 `PluginDefinition`的服务端模块；
3. 可以打包为 `.zplugin`并由 Host动态安装的 Artifact。

不创建独立 API package。

## 推荐目录

```text
my-plugin/
  src/
    client/
      MyPage.svelte
      index.ts
    server/
      contract.ts
      service.ts
      index.ts
  tests/
    lifecycle.spec.ts
  package.json
  svelte.config.js
  tsconfig.json
  tsconfig.build.json
  vite.config.ts
  zadmin.plugin.json
```

`src/`下面全部是职责文件夹；`server/`和`client/`下面全部是代码文件。Package根的构建配置和Manifest属于目录规则的例外。

## package.json

下面以一个依赖 Approval的外部插件为例：

```json
{
	"name": "@example/workflow-report",
	"version": "1.0.0",
	"type": "module",
	"exports": {
		".": {
			"types": "./src/server/index.ts",
			"import": "./dist/server/index.js"
		},
		"./client": {
			"types": "./src/client/index.ts",
			"import": "./dist/client/index.js"
		}
	},
	"files": ["dist", "zadmin.plugin.json"],
	"publishConfig": {
		"exports": {
			".": {
				"types": "./dist/types/index.d.ts",
				"import": "./dist/server/index.js"
			},
			"./client": {
				"import": "./dist/client/index.js"
			}
		}
	},
	"peerDependencies": {
		"@zadmin/core": "^1.0.0",
		"@zadmin/approval": "^1.0.0",
		"@zadmin/sveltekit": "^1.0.0",
		"svelte": "^5.0.0"
	},
	"devDependencies": {
		"@zadmin/core": "^1.0.0",
		"@zadmin/approval": "^1.0.0",
		"@zadmin/sveltekit": "^1.0.0",
		"@sveltejs/vite-plugin-svelte": "^7.0.0",
		"svelte": "^5.0.0",
		"svelte-check": "^4.0.0",
		"typescript": "^6.0.0",
		"vite": "^8.0.0",
		"vitest": "^4.0.0"
	}
}
```

运行时通过 Host提供上游插件实例，所以使用 `peerDependencies`；本地独立开发还需要对应 `devDependencies`以读取真实 `.d.ts`。在本仓库用 `workspace:^`，发布时 pnpm会转换为正常 SemVer范围。

## 公开 Contract

`contract.ts`只描述该插件愿意稳定提供给下游的粗粒度能力：

```ts
export interface WorkflowReportApi {
	create(input: ReportInput): Promise<Report>;
}
```

内部 Repository、Indexer、缓存结构和实现 class不从 `index.ts`导出。公开 API引用上游类型时，生成的 `.d.ts`会自然继续引用上游 package；类型可以向更下游传播。

## Plugin定义

```ts
// service.ts
import type { ApprovalPlugin } from '@zadmin/approval';
import { injectOptionalPlugin, provideFactory, token } from '@zadmin/core/plugin';

export const REPORT_ID = '@example/workflow-report' as const;
export const REPORT = token<WorkflowReportApi>(REPORT_ID);

export const reportProvider = provideFactory({
	token: REPORT,
	dependencies: {
		approval: injectOptionalPlugin<ApprovalPlugin>('@zadmin/approval')
	},
	create(context, services) {
		return createWorkflowReport(services.approval, context.signal);
	}
});
```

```ts
// index.ts
import { definePlugin } from '@zadmin/core/plugin';
import { REPORT, REPORT_ID, reportProvider } from './service.ts';

export type { WorkflowReportApi } from './contract.ts';

export const workflowReportPlugin = definePlugin({
	id: REPORT_ID,
	primary: REPORT,
	providers: [reportProvider]
});

export type WorkflowReportPlugin = typeof workflowReportPlugin;
export default workflowReportPlugin;
```

ID常量保留 literal type，使下游的：

```ts
injectPlugin<WorkflowReportPlugin>('@example/workflow-report');
```

能够在编译期检查字符串。

## Class Provider与装饰器

需要 class时：

```ts
const dependencies = {
	database: inject<PostgresService>('@zadmin/postgres')
} as const;

@service({ token: REPORT, dependencies })
class WorkflowReportService implements WorkflowReportApi {
	constructor(
		private readonly services: ResolveInjections<typeof dependencies>,
		context: ServiceContext
	) {}
}

const reportProvider = provideClass(WorkflowReportService);
```

不使用 `@inject()`构造器参数或属性注入。

## 跨插件 import规则

允许：

```ts
import type { ApprovalPlugin, ApprovalRecord } from '@zadmin/approval';
```

禁止：

```ts
import approvalPlugin from '@zadmin/approval';
import { ApprovalService } from '@zadmin/approval';
```

后者会绕开 owner、generation、SemVer、dependent重建、禁用和dispose。`zadminPlugin()`把 Manifest中的 dependency标为 external，并检查最终 chunk import；实际 runtime import会让构建失败。

## Manifest Protocol v2

```json
{
	"protocol": 2,
	"id": "@example/workflow-report",
	"version": "1.0.0",
	"displayName": "Workflow Report",
	"requiredTrust": "trusted",
	"entries": {
		"server": "./server/index.js",
		"client": "./client/index.js"
	},
	"requiresHost": {
		"@zadmin/core": "^1.0.0"
	},
	"requires": {
		"@zadmin/sveltekit": "^1.0.0"
	},
	"optional": {
		"@zadmin/approval": "^1.0.0"
	}
}
```

- `requiresHost`：插件协议/运行平台兼容范围。
- `requires`：required Injection。
- `optional`：optional Injection。
  -同一依赖不能同时出现在 required和optional。
- package name/version必须等于 Manifest id/version。
  -所有 ZAdmin Manifest依赖必须出现在 peerDependencies，范围必须一致；多余 ZAdmin peer也会失败。

## Vite配置

```ts
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { zadminPlugin } from '@zadmin/core/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [...zadminPlugin(), svelte()],
	build: {
		emptyOutDir: true,
		lib: {
			entry: {
				'client/index': 'src/client/index.ts',
				'server/index': 'src/server/index.ts'
			},
			formats: ['es'],
			fileName: (_format, name) => `${name}.js`
		},
		outDir: 'dist',
		sourcemap: true,
		target: 'es2024'
	}
});
```

`zadminPlugin()`：

-监听并校验 Manifest；
-复制 Manifest作为完整 revision ready标记；

- externalize运行时能力依赖；
  -拒绝跨插件 runtime import；
  -转换现代标准装饰器；
  -自动使用最终 Vite outDir。

## 服务端路由

路由必须通过注入的 `SvelteKitHost`和当前 `ServiceContext`注册：

```ts
services.web.routes.register(context, {
	path: '/workflow-report/api/status',
	handler: () => Response.json({ status: 'active' })
});
```

注册会在prepare期完成语法、冲突和reservation检查，但只有 generation activate后才真正对外发布；deactivate自动撤销，回滚可以重新发布旧路由。

## 浏览器入口

```ts
import { mount, unmount } from 'svelte';
import type { ClientPluginContext } from '@zadmin/sveltekit/client';
import Page from './Page.svelte';

export function activate(context: ClientPluginContext) {
	return context.pages.register({
		path: '/workflow-report',
		mount(target) {
			const component = mount(Page, { target });
			return () => unmount(component);
		}
	});
}
```

Client Runtime会跟踪 activate期间的所有 page registration；即使 activate中途抛错，已经注册的页面也会清理。

## 本地、开发和生产配置

环境选择由 App Host负责，不由插件在模块顶层读取后创建全局实例：

-本仓库静态组合可使用 `plugin.configure(config)`；

- Provider从 `ServiceContext.config`读取当前 generation配置；
  -敏感值使用 Host环境变量或外部 Secret，不写入 Plugin artifact和Manifest；
  -修改静态 Host配置需要重启 Host；
  -动态 Plugin配置变化应作为新 Module registration参与reconcile，使 Plugin及dependents重建。

当前 Admin示例对已安装插件使用 `defaultConfig`，没有实现业务配置 UI；业务插件在增加配置前应同时提供运行时schema验证和存储方案。

## 命令

```powershell
pnpm check
pnpm test
pnpm build
node ../../packages/core/src/cli.ts validate dist
pnpm pack:plugin
```

`build`已经包含 `validate dist`。`pack`会再次验证后生成 `.zplugin`，避免绕过构建策略打包无效产物。

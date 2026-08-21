# 开发态热重载

## 目标

开发时修改 app、插件、Core或 Svelte页面都不需要手工重启 dev server。

HMR分三层：

```text
Svelte组件变化     → Svelte/Vite组件 HMR
普通插件定义变化   → 复用 Runtime，局部 reconcile
Core插件系统变化   → dispose旧 Runtime，创建新 Runtime
```

## Vite配置

所有 app必须包含：

```ts
export default defineConfig({
	resolve: {
		dedupe: ['svelte']
	},
	ssr: {
		noExternal: [/^@zadmin\//]
	}
});
```

`ssr.noExternal` 很关键：如果 ZAdmin workspace包被外部化，Node会直接加载源码，Vite不会跟踪插件模块，也不会触发插件 HMR。`dedupe` 保证 workspace内只使用一个 Svelte运行时。

## Runtime保持

`runApp()` 把 Runtime保存在：

```text
globalThis[Symbol.for('@zadmin/core/runtimes')]
```

键是 app ID。这样即使 app组合模块重新求值，仍能取得同一 Runtime。

每个 Core模块实例带一个 `CORE_HMR_TOKEN`：

- 插件模块变化时 token不变，Runtime保持，调用 `reconcile()`。
- Core模块变化时 token变化，旧 Runtime完整 dispose，新 Runtime重新创建。
- app模块被 Vite prune 时调用 `disposeApp(appId)`。
- 生产 adapter-node触发 `sveltekit:shutdown` 时完整 dispose Runtime。

## 插件更新算法

1. Vite检测插件源码变化并使 app组合模块成为 HMR边界。
2. 新插件模块产生新的 definition对象。
3. `runApp()`取回现有 Runtime。
4. Runtime比较旧/新 definition和配置。
5. 计算变化插件的传递 dependents。
6. 反向拓扑停止受影响插件。
7. 替换 definition。
8. 正向拓扑重新启动。
9. 无关插件、Runtime instance ID保持不变。

## 已验证行为

真实 admin dev server验证结果：

- 修改 `plugins/auth/src/lib/index.ts` 后 `/auth/api/status` 即时更新。
- Runtime instance ID保持不变。
- auth revision从 0变为 1。
- 修改 `packages/core/src/runtime.ts` 后 Runtime instance ID变化，全部插件重新进入 active。
- 浏览器保持 `/auth` 页面打开时修改 `AuthPage.svelte`，标题从 `Authentication` 即时变为 `Authentication hot`，没有刷新浏览器或重启 Vite。

## 调试

```sh
pnpm dev:admin
pnpm dev:etl
```

查看诊断：

```text
GET http://localhost:5173/__zadmin/runtime
GET http://localhost:5173/auth/api/status
```

如果插件没有更新，依次检查：

1. app Vite配置是否包含 `ssr.noExternal`。
2. 插件是否通过 package公开入口被 app依赖。
3. app组合模块是否包含 `import.meta.hot.accept()`。
4. definition对象是否真的来自发生变化的模块。
5. 插件是否在模块顶层保存了无法回收的资源。

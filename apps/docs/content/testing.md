# 测试与验收

## 自动化覆盖

Core测试覆盖：

- 类型化依赖 API注入。
- 依赖拓扑启动顺序。
- Effect LIFO回收和 AbortSignal。
- 缺失依赖进入 waiting。
- 重复 ID和循环依赖拒绝。
- setup失败后的 Effect清理。
- 下游先于 provider停止。
- 局部插件重载，不影响无关插件。
- 生命周期事件。
- 显式 reload。
- 配置变化重载。
- missing provider后续安装自愈。
- 插件 HMR复用 Runtime。
- Core token变化替换 Runtime。
- app Runtime显式销毁。

SvelteKit插件测试覆盖：

- 静态、参数和 wildcard路由。
- 路由优先级。
- trailing slash规范化。
- HEAD复用 GET处理器。
- Scope销毁后路由自动移除。
- 重复和非法路由拒绝。

应用集成测试覆盖：

- Admin所有配置插件进入 active。
- ETL所有配置插件进入 active。
- Auth服务端路由可用。
- ETL服务端路由可用。

Docs保留原有 Svelte、浏览器、Storybook测试。

## 提交前命令

```sh
pnpm peers check
pnpm lint
pnpm check
pnpm test
pnpm build
```

## HMR验收

HMR不能只靠单元测试。涉及 Runtime、Vite配置或插件入口的变更，还需要：

1. 启动 admin dev server。
2. 请求 `/__zadmin/runtime` 保存 instance ID。
3. 修改 auth插件定义，确认 status更新且 instance ID不变、revision增加。
4. 修改 Core Runtime源码，确认 instance ID变化且所有插件重新 active。
5. 保持浏览器打开修改 Auth Svelte页面，确认 DOM即时更新。
6. 恢复临时源码，确保工作树只包含预期变更。

## 已知非错误警告

尚未包含 `.svelte` 文件的 ZUI、PostgreSQL、Redis和OSS骨架包会由 `svelte-check` 输出“No svelte input files”警告。它不影响类型检查或构建；首个真实组件加入后自然消失，不应为了消除警告添加无意义组件。

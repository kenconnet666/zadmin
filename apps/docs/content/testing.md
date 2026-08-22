# 测试与验收

## 自动化覆盖

Core 覆盖：

- `inject<T>` 和 optional类型推断；
- Host与Plugin Provider；
- 依赖顺序、缺失、重复和循环；
- Effect LIFO和 AbortSignal；
- required/optional Provider动态变化；
- Provider重载和 dependent重启计数；
- Manifest安全路径和信任级别；
- Artifact动态 import和失败回滚；
- Workspace扫描和内容 revision；
- `.zplugin` pack/install/disable/enable/upgrade/activate/uninstall；
- tar路径穿越拒绝。

SvelteKit 覆盖：

- 静态、参数、wildcard和 HEAD路由；
- Plugin Scope和静态 Package disposer；
- Client页面所有权；
- Client revision替换和失败回滚。

应用和插件覆盖：

- Admin静态 Providers和 Auth路由；
- ETL原生状态接口；
- Approval路由随生命周期撤销；
- ERP/CRM可在无 Approval时启动；
- Approval出现时 ERP重新注入并调用。

## 全量命令

```powershell
pnpm check
pnpm test
pnpm build
pnpm lint
git diff --check
```

当前唯一预期警告是空 ZUI骨架没有 `.svelte` 输入。

## 真实开发 HMR

Runtime、Artifact Provider、Vite watcher或客户端 Runtime变化后必须：

1. `pnpm dev:admin`；
2. 请求 Runtime和三个状态接口；
3. 浏览器打开 `/approval`；
4. 临时修改 Approval server和 Svelte文案；
5. 确认 Runtime instance不变、artifact hash变化；
6. 确认浏览器 DOM自动更新且没有 page reload；
7. 还原文案并再次确认；
8. 停止 dev树并确认无残留 watcher错误。

## 生产安装冒烟

1. `pnpm --filter @zadmin/approval pack:plugin`；
2. 在隔离临时数据目录用 `PluginInstaller` 安装；
3. 构建 Admin；
4. 设置绝对 `ZADMIN_DATA_DIR` 并启动 adapter-node；
5. 确认只加载 installed/enabled插件；
6. 确认服务端路由和客户端清单；
7. 确认未配置管理 token时 mutation返回 503；
8. 停止服务并精确清理临时目录和 artifact。

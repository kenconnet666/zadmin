# WeChat Fast Refresh

`pnpm dev:wechat` 现在直接运行 `@zadmin/miniapp` 的 `miniapp dev`。它不再启动 Taro、额外 TypeScript watcher 或组件打包 watcher；一个进程同时监听应用源码和 workspace 内 Miniapp 源码，并串行合并短时间内重复的文件事件。

## 变化与重建

| 变化                                       | 行为                                            |
| ------------------------------------------ | ----------------------------------------------- |
| `apps/wechat/src/**`                       | 重新编译应用、页面、Worker 与配置               |
| `ui/miniapp/src/**`                        | 重新构建当前 workspace Miniapp 包后再编译宿主   |
| `package.json`、lockfile 或 workspace 配置 | 不在运行中的 watcher 内安装依赖；开发者重启命令 |

watcher 的约束：

- 首次构建完成后才开始监听，避免把初始产物写入识别为源码变化；
- 任意时刻最多有一次构建；构建期间收到的变化合并为下一轮，不并发覆盖 `dist/wechat`；
- 失败只报告诊断并继续监听，下一次有效修改可恢复；
- `Ctrl+C`、`SIGINT` 或 `SIGTERM` 会关闭文件 watcher，不留下子进程或锁文件；
- 生产命令始终先清理目标目录，再写出完整原生产物。

## Build identity

每次成功的开发构建都会生成新的 build ID，并同时写入：

- bundle 中的 `globalThis.__ZADMIN_BUILD_ID__`；
- 微信开发期 storage key `__zadmin_build_id__`。

失败构建不会替换上一次成功 ID。生产构建不包含这两个标记。微信开发者工具通常会自动发现 `dist/wechat` 变化；自动刷新是否发生必须以模拟器实际 build ID 为准，不能只以 watcher 日志为准。

## 当前验证边界

2026-08-29 已验证实际宿主直编成功，输出 15 个 WXML、WXSS、JS、JSON 与 sourcemap 文件，且生产源码和产物不含 `@tarojs`。本地还验证了 watcher 的串行重建和 build-ID 写入代码路径。

微信开发者工具的本轮授权仍由外部 CLI 流程控制；在授权完成并重新跑模拟器前，直编 target 只标记为 build/test-verified，不把旧 Taro 模拟器或真机截图继承为新 runtime 的证据。

旧 Taro supervisor 在 2026-08-25 的 1.5–12.2 秒数据属于迁移前历史基线，不再是当前 HMR 合同。新 watcher 的端到端编辑到模拟器耗时需在直编 target 获得 DevTools 会话后重新记录。

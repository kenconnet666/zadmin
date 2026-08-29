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

失败构建不会替换上一次成功 ID。生产构建不包含这两个标记。build ID只证明新模块已加载，不能证明保留中的旧Page实例已经重新mount。

当前Svelte custom renderer不使用DevTools的实例保留：`project.private.config`固定`compileHotReLoad: false`和`skylineRenderEnable: false`。配置`ZADMIN_WECHATIDE_CLIENT`后，每次成功build会等待文件稳定、清理项目compile cache、等待清理落地，再调用一次`simulator_refresh`，从而完整remount当前Page：

```powershell
$env:ZADMIN_WECHATIDE_CLIENT = 'codex'
pnpm dev:wechat
```

未配置或未授权wechatide client时，watcher仍持续直编并报告refresh unavailable，不让IDE集成失败杀死源码watcher。

## 当前验证边界

2026-08-29 已验证实际宿主直编成功，输出 15 个WXML、WXSS、JS、JSON与sourcemap文件，且生产源码和产物不含`@tarojs`。微信开发者工具fullMode中WebView页面真实渲染；console只有系统info；`#counter`点击后`#status`从count 0变为count 1。

通用WXML renderer不能递归调用同名template；v1改为0–24层有限展开。真实console中的recursive-template warning消失，`#status`可被inspectee读取。

开发验收把文案从`runtime ready`改为`runtime hot ready`再恢复。配置绝对projectRoot、compile-cache清理和2秒清理稳定窗后，两次自动完整remount都显示正确新文案，临时源码已恢复；退出watcher后没有遗留子进程。

旧Taro supervisor在2026-08-25的1.5–12.2秒数据属于迁移前历史基线，不再是当前HMR合同。当前链优先保证正确remount；尚未建立精确端到端耗时基准，不能从人工25秒观察窗推断真实刷新耗时。

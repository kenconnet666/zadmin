# Svelte Miniapp direct WeChat target acceptance

验收日期：2026-08-29。当前发布候选是 `@zadmin/miniapp` 自包含的微信 target：业务使用 Svelte 5 和 `M*` 组件，构建直接生成 WXML、WXSS、JavaScript、JSON 与 sourcemap，不经过 ZUI、Taro 或其他跨端 runtime。

## 已通过门禁

- `@zadmin/miniapp` 与 `apps/wechat` 的 TypeScript/Svelte check 通过；
- Miniapp 13 个测试文件、41 项测试通过，覆盖 compiler、renderer、Svelte conformance、组件、平台、模块和诊断；
- 微信宿主 4 项 Node 测试与 4 项 TypeScript 安全探针测试通过；
- 实际宿主生成 15 个原生文件，构建后验证 Worker 声明与文件存在；
- 8 个独立移动组件可用：`MProvider`、`MBox`、`MStack`、`MText`、`MIcon`、`MButton`、`MInput`、`MImage`；
- 独立 Theme、`mcss()`、WXSS 属性白名单和 `rpx()` 不依赖浏览器 ZUI；
- App/Page mount、unmount、事件 ID 分发、微任务 `setData` 合并、平台 scope 和资源释放有自动化覆盖；
- package 生产依赖只有构建器与官方微信 API 类型，源码和宿主依赖图不含 `@tarojs`；
- 开发 watcher 同时跟踪宿主与 workspace Miniapp 源码，串行合并重建，并为成功开发构建写入 build ID。

## 明确边界

- v1 使用通用递归 WXML 模板承载 Svelte custom-renderer 节点快照；这是一条已允许的第一阶段直编路径，不等同于完成逐节点静态 WXML lowering。后续优化必须保持现有 compiler/renderer 合同和基准可替换性；
- 当前只支持蓝图声明的 Svelte 子集和微信原生元素白名单，不承诺浏览器 DOM、任意 action、完整 CSS selector 或所有 Svelte 语法；不支持内容会产生带文件位置和替代建议的稳定诊断；
- 微信开发者工具直编WebView target已完成模拟器验收：真实页面截图、页面栈、`#counter`事件、count响应式更新和空error console通过；真机仍只保留迁移前平台API语义证据，不能冒充新runtime真机验收；
- Skyline、支付宝 target、上传、审核、支付、手机号兑换、订阅、权限弹窗、云写、商户流程和真实硬件操作均不在本阶段无人值守范围；
- package tarball 的空目录安装由云端 CI 执行，本地只保留类型、单元、宿主构建和产物边界检查以缩短迭代。

WXML运行时使用0–24层有限template展开；微信禁止同名template递归，超过当前深度的树不属于v1支持范围。开发刷新采用自动完整Page remount，不承诺保留页面状态。

## 当前复核命令

```powershell
pnpm --filter @zadmin/miniapp check
pnpm --filter @zadmin/miniapp exec vitest --run tests
pnpm --filter @zadmin/miniapp build
pnpm --filter @zadmin/wechat-app check
pnpm --filter @zadmin/wechat-app test
pnpm --filter @zadmin/wechat-app build
```

完整能力等级见[微信能力报告](./wechat-capability-report.md)，开发更新链见[微信 Fast Refresh](./wechat-fast-refresh.md)，账号与真机安全门禁见[微信人工真机/账号验收](./wechat-manual-acceptance.md)。

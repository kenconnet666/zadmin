# Badge 动画时长与动态偏好审计

基线：`3b4536f`。范围是 Badge 的计数变化动画，不改变公开 size、tone、count 或布局合同。

## 发现与修复

1. `ZBadge` 原先把 `theme.duration.fast` 直接传给 Web Animations API。Theme 已允许数字毫秒、`1500ms` 和 `1.5s`，但 WAAPI 的 duration 不接受 CSS 时间字符串。现在调用现有纯函数 `durationMilliseconds`，与 Spinner、Progress 和 Skeleton 的时长处理一致。
2. 动画 action 原先先检查计数 key 是否相同，导致计数不变时切换 `motion="reduced"` 被提前返回，进行中的动画继续播放。现在先处理 reduced 状态并取消 Animation，同时记住最新计数 key；恢复完整动画只影响后续变化，不重播旧数量。
3. 计数动画原先写死 `ease-out`，绕过 Theme easing。现在消费 `theme.easing.enter`，让计数强调动画与主题进入曲线保持一致；回归用例注入 `linear` marker 并读取实际 Animation timing。

## 验证范围

- 现有 `BadgeProductionFixture` 增加可注入 Theme 时长和动态 motion 开关。
- 现有浏览器用例增加数字、毫秒字符串、秒字符串三种时长的 `getComputedTiming().duration` 断言；增加无计数变化时取消动画、reduced 期间数量变化、恢复偏好不重播以及后续新计数重新动画的断言。
- WebStorm 对组件、fixture、浏览器 spec 和 Docs `doc.ts` 四个受影响文件的 errors-only 诊断均为零错误；两次初始超时已逐文件重查，最终结果无超时。`git diff --check` 通过。
- 本地未运行 svelte-check、Vitest、Playwright 或 build。浏览器用例已编写，执行结果由该改动提交后的 CI 给出，不能视为本地已经通过。
- Docs 的动态示例说明同步记录偏好切换的行为。

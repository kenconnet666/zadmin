# Alert、Spinner 与 LoadingBar 生产架构

## 范围与所有权

本批次收口三个相邻但不可互相吞并的反馈原语：

- `ZAlert` 是页面内持久、非阻塞的信息块。调用方拥有何时插入、是否移除和业务动作；组件只拥有 tone、title/body/action/dismiss 分区与 live-region 语义。
- `ZSpinner` 是不确定等待的行内指示器。调用方容器拥有 `aria-busy`、占位布局、遮罩、延迟展示、任务取消和内容切换；组件不生成 overlay。
- `ZLoadingBar` 是轻量线性任务反馈。调用方拥有请求、Promise、路由、重试和错误文案；组件拥有 local/page 布局、确定/不确定进度、短暂收尾与 owner-realm 资源。

`ZProgress` 继续承担持久、内容级、可格式化的 line/circle 进度展示；`ZToast` 继续承担短暂队列通知；`ZAlertDialog` 继续承担需要中断与获取决定的危险流程。本批次不把这些责任重新塞入三个原语。

## 成熟库取舍

### Alert

- 采用 [WAI-ARIA Alert Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) 的核心约束：动态重要消息可公告，但不移动焦点；需要中断的确认升级为 AlertDialog。
- 采用 [Ant Design Alert](https://ant.design/components/alert/) 的 title/description/action/closable 语义分区，以及 [MUI Alert](https://mui.com/material-ui/react-alert/) 的 severity + icon 非颜色提示。
- 不照搬 filled/outlined/banner、全局 icon mapping、ErrorBoundary 或内部自动卸载。ZUI 保留一个稳定外观、四个现有 tone、显式 `live="off|polite|assertive"` 和调用方持有的 `onDismiss`。
- 默认 tone 图标来自 `@lucide/svelte` 子路径，wrapper 与 SVG 都是 decorative；`icon` snippet 可覆盖，`null` 可隐藏。关闭名称继续来自 typed `localePack.feedback.dismissAlert`。

### Spinner

- 采用 [Ant Design Spin](https://ant.design/components/spin/) 的 small/medium/large 使用尺度和 [MUI Progress](https://mui.com/material-ui/react-progress/) 的 inherit 色彩组合经验。
- 不采用 fullscreen/container overlay、determinate percent、任意像素尺寸或全局默认 indicator。需要 overlay 的页面或业务容器自行组合 Layer/布局；已知比例改用 LoadingBar/Progress。
- `tone` 限定为 `primary | muted | inherit`。这覆盖独立、低强调和已有颜色 owner 三类实际需求，不把加载状态误表述为 success/warning/error。
- 独立 Spinner 是具名 `role=status`；被 Button 等 owner 以 `aria-hidden` 组合时，同时移除 role 与 label，避免嵌套 live region。

### LoadingBar

- 采用 [WAI-ARIA range practices](https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/)：值已知时输出 `aria-valuenow`，不确定时省略。
- 采用 MUI LinearProgress 的 determinate/indeterminate 区分、Ant Progress 的 success/error 状态色，以及 Naive UI `useLoadingBar` 的 `start/finish/error` 服务体验。
- 不采用全局 Provider 注入或离散单例。每个 `ZLoadingBar` 暴露自己的 bindable controller；离开组件生命周期后 controller binding 归零，owner Window timer 被清理。
- 不采用 buffer、分段、circle/dashboard、估算 Promise 或网络拦截。复杂持久进度属于 `ZProgress`，请求/Promise/路由属于应用。

## LoadingBar 状态机

| 输入                             | active  | state     | value               | 收尾                                      |
| -------------------------------- | ------- | --------- | ------------------- | ----------------------------------------- |
| 初始直接渲染                     | `true`  | `loading` | prop 或 `undefined` | 无                                        |
| `start()`                        | `true`  | `loading` | `undefined`         | 取消旧 timer                              |
| `start(value)` / `update(value)` | `true`  | `loading` | clamp 到 0–100      | 取消旧 timer                              |
| `finish()`                       | `true`  | `success` | `100`               | owner Window 默认 200ms 后 `active=false` |
| `error()`                        | `true`  | `error`   | 保留                | 默认持久，显式 `hideAfter` 可隐藏         |
| `reset()`                        | `false` | `idle`    | `undefined`         | 清理 timer                                |

`active/state/value/controller` 都是 bindable。调用方既可以使用纯受控状态，也可以使用作用域 controller；两条路径操作同一组状态，不维护平行状态机。

## Owner realm、可见性与动画

- Spinner 和 LoadingBar 都从真实根节点的 `ownerDocument.defaultView` 取得 WAAPI、media query 和 timer 语义，不读取错误 iframe/弹窗之外的全局 realm。
- Spinner 的 LoaderCircle 使用 `Theme.duration.spinnerSpin`；LoadingBar 不确定动画使用 `Theme.duration.loadingBarIndeterminate`。effect cleanup 始终取消 Animation。
- Provider `motion="reduced"` 或 owner Window `prefers-reduced-motion` 时不启动 WAAPI。Spinner 保留静态 LoaderCircle；LoadingBar 用完整静态指示条表达仍在进行。
- LoadingBar 监听 owner Document `visibilitychange`。页面隐藏时取消不确定动画，恢复可见后 effect 重新建立；卸载时移除 listener 和 timer。
- RTL 使用逻辑 inset，并反转不确定动画位移。page 模式固定到逻辑视口顶部，不创建 Portal 或跨应用单例。

## SSR 与可访问性

- 三组件 SSR 不访问 `window`/`document`，只输出稳定语义与 data state；owner realm 连接仅在 `onMount`。
- Alert 的 `live=off` 不输出 live role；polite 为 `status`，assertive 为 `alert`，两者 atomic。静态首屏说明应显式使用 off。
- Spinner 内部 Lucide SVG 永远 `aria-hidden`。长任务还必须提供邻近持久文本和可取消路径。
- LoadingBar 的默认范围是 0–100；不确定状态没有 `aria-valuenow`。`hidden` 的 idle/inactive 根退出视觉和可访问树，但保留组件/controller 生命周期。

## 验收边界

- 专属 browser fixture 验证 Alert 分区/live/dismiss、Spinner tone/hidden/WAAPI/reduced，以及 LoadingBar controller、owner timer、状态色、RTL/reduced 与卸载清理。
- 专属 SSR fixture 验证无浏览器全局依赖、稳定 role/value/data state 与 decorative icon。
- 专属类型文件验证有限 union、bindable controller 和边界拒绝。
- 本地只执行 Prettier、WebStorm errors-only 与快速静态审计；完整 browser/SSR/type 执行交给 CI/CD。

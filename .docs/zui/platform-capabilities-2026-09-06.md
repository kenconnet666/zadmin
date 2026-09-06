# ZUI 平台能力研究与采用台账（2026-09-06）

本文是截至 2026-09-06 的平台能力研究记录，不代表已经改变运行时承诺。记录分为：

- **直接采用**：当前目标浏览器和仓库边界足够稳定，可以进入公共组件或生成器的默认路径。
- **渐进增强**：必须保留现有 CSS/JS fallback；能力存在时改善交互或布局。
- **待验证**：规范或实现仍在快速变化，先用独立 fixture 和 CI 多浏览器证据验证。
- **保留 fallback**：当前不应把能力作为公共 API 或最低运行时要求。

## 现场边界

| 项目         | 当前事实                                                                                        | 影响                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| TypeScript   | workspace catalog `^6.0.3`                                                                      | 生成器直接调用 TypeScript Program/Compiler API，升级需要 API 兼容验证 |
| 编译目标     | 根 `tsconfig.json` 为 `ES2024`；部分构建仍显式使用 `ES2022`                                     | 不能因为 Node 24 或浏览器已支持就把源码语法/API默认为 ES2025+         |
| Node engine  | `@zadmin/zui`、WeChat app 为 `>=22.0.0`                                                         | 公共 Node 路径必须兼容 Node 22；不能只按 CI 版本设计                  |
| CI           | `.github/workflows/ci.yml`、release workflows 使用 `NODE_VERSION: '24'`、pnpm `11.22.0`         | CI 是 Node 24 证据；Node 22 仍是 package engine 下界                  |
| 已有布局方向 | ZUI ICSS 已有 typed media/container query、`container-type`/`container-name` token 和 Grid 方向 | 继续完善 typed API 与 Grid；不另起平行响应式抽象                      |
| 目标环境     | browser ZUI、SvelteKit/WebView；Miniapp 有独立编译和运行时                                      | 浏览器能力不能无条件投射到 Miniapp；每项 CSS/DOM API 都要有目标边界   |

## CSS：优先级和采用结论

| 能力                                                                   | 截至日期的支持证据                                                                                                                                                                                         | 适合 ZUI 的组件/用法                                         | 决策                                                       | fallback / 边界                                                                                                                                        |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container queries（`container-type`、`@container`、cq units）          | [MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)；[web.dev guide](https://web.dev/learn/css/container-queries/)                              | `ZContainer`、卡片、表单行、Docs 侧栏和可嵌套布局            | **直接采用**；把已有 typed container query/Grid 作为主路线 | 组件默认样式仍要可在无 `@container` 时工作；用 viewport/media 或单列布局兜底。size container 会引入 containment，避免依赖内容反向撑开容器              |
| Subgrid                                                                | [MDN Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid) 标为 Widely available，自 2023-09 起跨浏览器可用                                                                | 表单 label/control/help 对齐、数据卡片、Docs 示例网格        | **直接采用**，优先用于同一外层 Grid 的跨组件对齐           | 无 subgrid 时使用独立 Grid/flex 对齐；不能依赖隐式轨道承载超出父 subgrid 的项目                                                                        |
| `@starting-style`                                                      | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) 标为 Baseline 2024                                                                                              | Popover/Dialog/Toast 首次出现的 opacity/transform            | **渐进增强**                                               | 保留现有初始态和无动画路径；与 `display`/`overlay` 离散过渡配套，不能只添加 starting style                                                             |
| `transition-behavior: allow-discrete`                                  | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior)；Popover 动画组合说明见 [MDN Popover](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) | Overlay top-layer 离场、`display`/`overlay` 和可访问状态切换 | **渐进增强**                                               | 不支持时继续使用旧的 JS 等待/立即隐藏路径；动画测试要允许 reduced-motion 和无该属性的浏览器                                                            |
| `interpolate-size`                                                     | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size)；[Chrome guidance](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)                          | Accordion、可折叠面板、输入建议区域从固定尺寸到 `auto`       | **渐进增强**                                               | 传统 max-height/测量动画作为 fallback；不要把 `height:auto` 插值作为可访问性或布局正确性的必要条件                                                     |
| `calc-size()`                                                          | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size)；Chrome 文档给出 Chrome/Edge 129 起的实现路径                                                                           | 只有确实需要对 intrinsic size 做数学运算的复杂折叠/弹出布局  | **待验证**                                                 | 普通尺寸动画优先 `interpolate-size`；`@supports (height: calc-size(auto, size))` 后再启用，提供显式尺寸或无动画 fallback                               |
| CSS Anchor Positioning（`anchor()`、`position-area`、try fallbacks）   | [MDN guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning)；[Chrome CSS/UI](https://developer.chrome.com/docs/css-ui/)                                                        | Tooltip、Popover、Context menu、Tour 的相对定位和翻转        | **渐进增强，先做 fixture**                                 | 现有 Floating UI/JS 测量与 portal 路径继续作为基线；不能把 anchor positioning 当作跨浏览器最低要求，尤其要覆盖 ShadowRoot、滚动容器、溢出翻转          |
| Popover API（`popover`、invoker、top layer、`:popover-open`）          | [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 标为 Baseline 2025；[MDN using](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using)                        | ZPopover、非模态菜单、轻量提示和 top-layer 语义              | **渐进增强**；语义/可访问性可作为研究方向                  | 现有 ZUI overlay ownership、focus scope、portal 和 Dialog 逻辑必须保留；不能仅凭 `popover` 替换 modal/focus 管理，也要处理默认 margin/inset 与动画时序 |
| `scrollend`                                                            | [MDN Element.scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)                                                                                                          | 虚拟列表滚动停止后的测量、Tour/锚点完成、分页或滚动状态事件  | **渐进增强**                                               | 用现有 scroll listener + debounce/RAF；只在 `"onscrollend" in element` 或事件能力检测后接入，避免把滚动停止误判为稳定布局                              |
| Scroll-driven animations（`scroll()`、`view()`、`animation-timeline`） | [MDN guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)；[web.dev collection](https://developer.chrome.com/docs/css-ui/)                                             | Docs 进度指示、非关键装饰、视口进入提示                      | **渐进增强**                                               | 默认时间动画或静态样式；尊重 `prefers-reduced-motion`；不能用它驱动焦点、加载、数据提交等功能性状态                                                    |
| `field-sizing: content`                                                | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing)                                                                                                                  | 自适应 textarea、TagsInput、搜索框和表单控件                 | **渐进增强**                                               | 保留 `min-inline-size`/`max-inline-size`、手工 resize 和 JS fallback；输入控件仍须有稳定的最小尺寸和可见 focus 状态                                    |
| `content-visibility`                                                   | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility)                                                                                                            | Docs 长列表、折叠的非关键内容、离屏示例区                    | **渐进增强，需性能 fixture**                               | 配合 `contain-intrinsic-size`；不能隐藏需要立即测量、查找、打印、辅助技术读取或参与焦点顺序的内容                                                      |

### CSS 采用顺序

1. 继续使用 typed container queries 与 Grid；补齐组件级 `@container` 示例和无支持 fallback。
2. 用 Subgrid 整理 label/control、卡片和 Docs layout 的共同轨道，先覆盖已有 Grid 组件。
3. 在 overlay fixture 中分别验证 `@starting-style`、`transition-behavior`、Popover top layer 与现有 focus/portal ownership；通过后才考虑公共默认样式。
4. Anchor positioning、intrinsic-size animation、scroll-driven animation、`field-sizing`、`content-visibility` 均先作为显式 progressive enhancement，不改变最低支持矩阵。

## JavaScript 运行时能力

| 能力                                                               | 证据与运行时边界                                                                                                                                                                                                                                                   | ZUI/工具链用途                                       | 决策                                                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Set 新增集合运算（`union`、`intersection`、`difference` 等）       | [MDN Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)；属于较新的 ECMAScript 能力，而仓库 target 仍为 ES2024                                                                                                             | collection selection、插件依赖集合、去重             | **待验证/暂不改公共实现**；继续使用已有 `Set` 基础 API 或本地小工具，等 target/lib 和 Node 22/浏览器矩阵确认后再采用                         |
| Iterator helpers（`Iterator.from`、`map`、`filter`、`toArray` 等） | [MDN Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)；新运行时能力，不能从 TypeScript 语法可编译推断目标运行时存在                                                                                            | 大型 collection 管线和生成器                         | **保留 fallback**；使用数组/生成器函数和显式循环，避免让 Miniapp 或 Node 22 依赖新原型                                                       |
| `RegExp.escape()`                                                  | [MDN RegExp.escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape)；新 ECMAScript API                                                                                                                             | Docs 搜索、selector/token 名称过滤、用户输入正则构造 | **渐进增强/可封装**；先提供本地安全 escape helper，运行时检测原生实现后再切换，不能直接把它写成 ES2024 必有 API                              |
| Temporal                                                           | [MDN Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) 仍需按目标运行时兼容性核对                                                                                                                               | 日期/时区/范围模型                                   | **待验证；暂不采用**。继续使用当前 `@internationalized/date` 和既有日期模型；不能因 Node 24 或 TS 类型存在就把 Temporal 发到 browser/Miniapp |
| `using` / `await using` 与 `Symbol.dispose`                        | [MDN resource management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management)；Node fs 文档记录 `Symbol.dispose`/`Symbol.asyncDispose` 在 Node 22.1、24.1 等版本的 API 历史，但 package 下界是 Node 22 且 browser/Miniapp 不是 Node | Node 构建脚本、临时文件/句柄生命周期                 | **待验证；生产公共代码保留 try/finally**。Node-only 工具可做单独 fixture；不能让 browser bundle 或 Miniapp 依赖显式资源管理语法              |

## TypeScript 与 Node

| 项目                         | 当前证据                                                                                                                                                                                                                                           | 采用结论                                                                                                                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript 6.0               | workspace 已声明 `^6.0.3`；[TS 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) 说明它是面向 TS7 native port 的过渡版本，保留 TS5.9 API 兼容，同时改变默认 strict/module/target 等行为并弃用选项 | **保持当前版本，先治理显式配置**。仓库已有显式 target；生成器继续使用 Program API，但要避免依赖类型 ID/声明排序等未承诺内部细节。TS6 的 `stableTypeOrdering` 可用于生成 declaration 稳定性评估，不能在未验证前改生成产物 |
| TypeScript 7 native compiler | TS6 官方说明 TS7 是 native port，TS6 已提示未来移除的 deprecated options                                                                                                                                                                           | **待验证，本阶段不升级**。采用前重新核实 TS7 实际发布状态、Program API 迁移说明和生成器兼容性；现有 TS6 说明不能单独证明 TS7 当前是否已正式发布                                                                          |
| Node 22/24                   | [Node release schedule](https://nodejs.org/en/about/previous-releases) 截至本日列 v22、v24 为 LTS，v26 为 Current；CI 固定 Node 24，package engine 最低 Node 22                                                                                    | **维持 Node 22 engine + Node 24 CI**。不要仅为新 API 上调 engine；升级时分别验证 Node 22 与 CI Node 24，生产优先使用 LTS                                                                                                 |

## 不改变的边界

- 本台账不修改 `package.json`、`pnpm-workspace.yaml`、lockfile、tsconfig、生产组件或浏览器最低支持矩阵。
- CSS 直接采用只限 container queries、Subgrid 以及已经有类型/生成器承载的 Grid 方向；其余能力默认是 progressive enhancement 或待验证。
- JavaScript 新 API 的“能在某个 Node 版本运行”不等于“能发到 ZUI browser/Miniapp”；公共路径必须按实际 target 和 CI 浏览器矩阵验收。
- 下一步若要落地，应为每项能力建立最小 fixture：CSS feature detection、Chromium/Firefox/WebKit 结果、reduced-motion、ShadowRoot/portal、SSR/hydration 和无支持 fallback；研究文档本身不替代这些证据。

## 研究来源（访问日期：2026-09-06）

- [MDN CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [MDN Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid)
- [MDN `@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style)
- [MDN transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior)
- [MDN interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size)
- [MDN calc-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size)
- [MDN CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning)
- [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN Element scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)
- [MDN field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing)
- [MDN content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility)
- [MDN scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [MDN Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), [MDN Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator), [MDN RegExp.escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape)
- [MDN Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal), [MDN resource management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management)
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases), [Node.js fs disposal APIs](https://nodejs.org/api/fs.html)
- [web.dev container queries](https://web.dev/learn/css/container-queries/)
- [Chrome CSS/UI](https://developer.chrome.com/docs/css-ui/), [Chrome intrinsic-size animation](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)

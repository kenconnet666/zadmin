# E7：ZAffix 与 ZBackTop 执行合同

日期：2026-09-06。该批新增页面滚动辅助能力，当前均为 experimental；滚动 owner、Theme、motion 和原生行为复用现有基础设施，不引入第二套滚动动画控制器。

## ZAffix

`ZAffix` 默认不接管滚动事件，内容使用原生 `position: sticky`。`offsetTop` 默认 0；提供 `offsetBottom` 时使用底边约束，两者不能同时显式提供。root 是接收原生 div 属性、class/style/ICSS 与 ref 的真实布局占位，children 位于内部 content。

显式 `scrollContainer: Window | HTMLElement | null` 才启用 JS fixed 投影；这是 Ant `target()` 在 Svelte API 中的直接值映射，并与现有 `ZAnchor.scrollContainer` 命名一致。null 表示 fixed 模式尚无可连接 owner，undefined 才表示 native sticky。

Fixed 模式按 owner viewport 和 scrollTop 计算阈值，保留 root 的真实 border-box 高度与 content 宽度。`boundary` 默认 root.parentElement，并在 top/bottom 方向夹紧 content。跨 realm owner/boundary/portal target 被拒绝。Reference root与显式scrollContainer的完整overflow ancestor由现有`@floating-ui/dom getOverflowAncestors`发现，Set去重后订阅scroll/resize，覆盖嵌套滚动、owner Window和ShadowRoot路径；元素尺寸继续由ResizeObserver处理。所有listener、observer和RAF都有组件级清理，`onAffixChange`只在真实状态变化时调用。

跨阈值后 content 通过现有 `portal/resolvePortalTarget` 移到同 owner `portalTarget`；默认优先 Provider portalContainer，否则使用当前 Document/ShadowRoot，避免 transform ancestor 把 CSS fixed 变成局部 containing block。未固定或 native sticky 时 content 留在原 DOM。几何变量按所有者拆分：root只持有placeholder height，真实content自己持有left/top/width并直接使用`applyIcssRootStyle`；调用方ICSS carrier同时投影到两者。Affix不覆盖调用方排版：sticky/unaffixed继续正常inherit；fixed前从原root捕获color、font family/size/weight、line-height与letter-spacing的有限presentation快照，并写入content自身变量。现有几何刷新、Affix class/style或ZUI Theme变化会更新该快照，不复制整棵computed style，也不改变affixed状态或伪造onAffixChange。root继续保存调用方原生属性和布局位置。

## ZBackTop

`ZBackTop` 监听 `scrollContainer`；null/undefined 使用组件 owner Window。`visibilityHeight` 默认 400，未达到前 SSR 和客户端都不伪造 button。显示/退出复用 Presence、PresenceEntryMotion、Theme fast duration 与 ReducedMotionState；positioner 通过 Portal 逃逸并使用显式 `dir` 优先、Provider direction 后备，`placement=start/end` 使用逻辑 inline 边支持 RTL。退出开始即设置 inert/aria-hidden；若 button 正持有焦点，只把焦点移交到实际 scroll owner，并临时补/恢复其 tabindex，不扫描页面。

真实操作元素复用 ZButton。`label` 默认 `localePack.common.backToTop`，children 默认 Lucide ArrowUp；size/tone/variant/shape按实例值 → componentDefaults.backTop → Button defaults → 内建值解析，disabled、原生属性、class/style与ref继续遵循 Button。`insetBlockEnd` 与 `insetInline` 使用 `ZLayoutSpacing`，默认 large，可传Theme档位或非负number像素。

点击先调用原生 onclick；preventDefault 或 disabled 阻止滚动。接受后只调用共享 scroll-target helper 的原生 `Window/HTMLElement.scrollTo({ top: 0 })`，保留当前横向scroll位置。behavior 支持 auto/smooth/instant，reduced motion强制instant，不实现duration、RAF tween或第二套滚动动画引擎。

## 与现有基础的共享边界

- `ZAnchor` 与两组件都以公开 `ScrollContainer = Window | HTMLElement` 作为真实 scroll owner，并共享owner校验和scroll element解析；E7同样使用 `scrollContainer` 直接值。
- `ZScrollArea` 继续拥有其 controller 和原始 scroll 事件；BackTop只把它的真实HTMLElement作为scrollContainer，不读取或复制controller。
- `navigation-anchor.ts` 继续拥有章节目标、scroll margin/padding和history；E7的 `scroll-target.ts` 只共享 owner校验、viewport、scrollTop和scrollTo-top，不承接Anchor业务。
- Affix只在显式scrollContainer下测量和投影；原生sticky不启动observer或Portal。

## Authored evidence 与验证边界

新增 `AffixBackTopFixture.svelte`、SSR、types和browser合同，覆盖native sticky、top/bottom校验、HTMLElement target、transform逃逸、placeholder尺寸、boundary、onAffixChange、显示阈值、onclick取消、reduced instant、logical RTL placement、五档Button几何及卸载清理。

根任务统一处理exports、metadata registry、catalog、component defaults、locale新增和generated API；本批不修改这些共享文件。本地只执行直接 Node Prettier 与WebStorm受影响文件诊断，没有运行Vitest、浏览器suite、Svelte/TypeScript gate、build、CI或Chrome，因此测试均为已写待执行合同。

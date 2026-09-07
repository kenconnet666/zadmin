# dnd-kit Svelte 适配边界（2026-09-07）

## 结论

`@dnd-kit/svelte@0.5.0` 可以作为 ZUI W4 拖放交互内核，但只能通过一个窄适配层使用。可以采用 manager、Svelte attachment、Pointer/Keyboard sensor、collision、AutoScroller 和基础 reactive state；必须适配 class-only 模式下的 engine geometry、Sortable plugins、ZUI 数据 owner、locale announcement、Theme motion 与 CSP nonce。不能让 FormList、Transfer、Tree 或 DataTable 直接依赖 dnd-kit，也不能照搬官方示例在 `onDragOver` 中持续写业务值。

| 结论     | 能力                                                                                           | 原因                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 可采用   | `DragDropProvider`、`createDraggable`、`createDroppable`、`createSortable` attachment 生命周期 | 官方 Svelte 5 实现负责实例注册、effect cleanup、manager 销毁和 renderer/tick 握手                                                  |
| 可采用   | Pointer/Keyboard sensors、collision、AutoScroller                                              | 已经是 framework-agnostic DOM 能力，Provider 和 entity 均可配置；无需在 ZUI 重写 sensor 状态机                                     |
| 需要适配 | Sortable plugins                                                                               | Svelte 无配置默认会排除 `OptimisticSortingPlugin`，但函数式自定义可能把 DOM 默认插件重新带回                                       |
| 需要适配 | disabled、data、group、index、sensors、modifiers                                               | 应由 ZUI typed key、容器 identity 和 disabled/readonly owner 生成 reactive getters，不公开底层实例作为业务 API                     |
| 需要适配 | Feedback、sortable transition、reduced motion                                                  | 默认时间和 easing 不来自 ZUI Theme；dnd-kit 只读取系统 `prefers-reduced-motion`，不能完整表达 ZUI 的 `auto                         | full | reduced` |
| 需要适配 | Accessibility                                                                                  | 默认英文公告直接使用裸 ID，并由插件创建带 inline style 的隐藏节点；ZUI 需要 locale pack、业务 label、拒绝原因和稳定 ID             |
| 需要适配 | class-only engine geometry                                                                     | Feedback 是0.5.0中唯一初始化并持续更新 `dragOperation.shape` 的默认插件；排除后必须以无DOM写入的bridge补回shape                    |
| 需要适配 | StyleInjector nonce/ShadowRoot                                                                 | nonce 只处理 Document 中动态 `<style>`；当前 ZUI context/runtime 没有可读取的 `cspNonce`，ShadowRoot 则使用 constructed stylesheet |
| 不宜直用 | DOM `Sortable` 或 `OptimisticSortingPlugin`                                                    | 插件直接移动 DOM，会与 Svelte 5 keyed reconciliation 冲突；官方 changelog 与 Svelte 发布代码均明确排除                             |
| 不宜直用 | 官方 `onDragOver -> move(items)` 作为 FormList owner                                           | 会在每次 hover 时写 canonical Form values、dirty/errors/validation，并绕过 FormArray 已有的接受/拒绝事务                           |
| 不宜直用 | 严格 class-only 模式下的默认 Feedback/Accessibility                                            | 发布代码会写 element style/CSS variables、复制 style 到 placeholder，并创建 inline-styled live region                              |

## 核验的发布物

本检查直接下载并解包 npm registry 发布 tarball，没有以网页示例代替发布代码：

- `@dnd-kit/svelte@0.5.0`，MIT，npm shasum `62702767d0e6246eb46fafb3546372b0a7cb8f7d`，integrity `sha512-Ca/0dfmwG5hOj9f+xD+Xr9OIBFs8cpx+AVs2jutDOP7MdAd84LUPHEBMxQUr5gFQVoSFNdjxrmDf7hZE+H5lCg==`。
- `@dnd-kit/dom@0.5.0`，MIT，npm shasum `9a33e5a01e197b55a5039a6cd57c1f806df477c0`，integrity `sha512-f2xFJp5SYQ8EW/Fbtaa8iBb66hpkWc7qa8vU826KW11/tb44sH+AisZnGtwOOTWTQ0GraqBDr5ixTErww+eKXw==`。
- `@dnd-kit/abstract@0.5.0` 用于核对 drag-end suspension 和事件 shape，MIT，npm shasum `37a2e65fab20f073c400ffd5e38f0031a6bc6d42`。
- Svelte 包 peer dependency 是 `svelte ^5.29.0`；本仓 catalog 是 `5.56.10`，版本范围相容。
- Svelte 包直接依赖 `@dnd-kit/dom ^0.5.0`、`@dnd-kit/state ^0.5.0`、`@dnd-kit/abstract ^0.5.0` 与 `tslib ^2.6.2`。W4 若采用，应只把 `@dnd-kit/svelte` 作为 ZUI 直接依赖；只有适配层确实需要 `Feedback`、`StyleInjector`、plugin constructors 或事件类型时，再显式声明 DOM/abstract 直接依赖，不能依赖传递依赖可见性。

发布包中的实际核对路径：

- `@dnd-kit/svelte/dist/core/context/DragDropProvider.svelte`
- `@dnd-kit/svelte/dist/core/context/renderer.svelte.js`
- `@dnd-kit/svelte/dist/core/hooks/createInstance.svelte.js`
- `@dnd-kit/svelte/dist/core/draggable/createDraggable.svelte.js`
- `@dnd-kit/svelte/dist/core/droppable/createDroppable.svelte.js`
- `@dnd-kit/svelte/dist/sortable/createSortable.svelte.js`
- `@dnd-kit/dom/index.js`，内含发布 sourcemap 标注的 `src/core/plugins/accessibility/*`、`feedback/*`、`StyleInjector.ts`、`AutoScroller.ts`、manager 与 sensors 实现
- `@dnd-kit/dom/sortable.js`，内含 `SortableKeyboardPlugin`、`OptimisticSortingPlugin` 与 Sortable transition
- `@dnd-kit/abstract/index.d.ts` 和 `index.js`，内含 `DragOperationSnapshot`、`DragDropEventMap.dragend` 与 `suspend()` 实现

第三方文档已按项目要求先由 Context7 resolve 到官方 dnd-kit 文档，再以发布包校对。官方入口包括 [Svelte createSortable](https://dndkit.com/svelte/primitives/create-sortable/)、[StyleInjector](https://dndkit.com/extend/plugins/style-injector/)、[Feedback](https://dndkit.com/extend/plugins/feedback/) 和 [changelog](https://dndkit.com/changelog/)。

## Svelte 生命周期与 passthrough

### Provider

发布的 `DragDropProvider.svelte` 有以下行为：

1. `managerProp ?? new DragDropManager({})` 只创建一次 manager，并设置 Svelte renderer。
2. `plugins`、`sensors`、`modifiers` 通过 `$effect` 和 `resolveCustomizable` 响应式同步。数组替换默认值，函数接收默认值后返回新数组。
3. 事件监听在另一个 `$effect` 注册并返回全部 unsubscribe。
4. Provider 自己创建的 manager 在 `onDestroy` 中 `destroy()`；外部传入 manager 时不越权销毁。
5. `beforedragstart`、`dragover`、`dragmove`、`dragend` 使用 renderer 的 `trackRendering()` 包裹；callback 后等待 Svelte `tick()`，供 Feedback 在 DOM reconciliation 后重新测量。

因此 Provider 可以薄包装，但 `manager` prop 应标为 initialization-only，避免上层误以为运行中替换会切换 manager。

### Entity 与 attachment

`createInstance.svelte.js` 在 `$effect` 中设置 manager、调用 `instance.register()`，cleanup 时 unregister。`createDraggable`、`createDroppable` 和 `createSortable` 返回的 `attach*` 均返回 cleanup，适合 Svelte `{@attach}`。

`createSortable` 额外具备以下真实行为：

- `id`、`disabled`、`alignment`、`plugins`、`modifiers`、`sensors`、`accept`、`type`、`collisionPriority`、`collisionDetector`、`transition` 和 truthy `data` 都在 `$effect` 中同步。
- `group` 与 `index` 在 `$effect.pre` 中 batch 更新；idle 且允许 idle transition 时重新测量 shape。
- `disabled` 支持 boolean 或 `{ draggable?, droppable? }`，可以表达“不可拖但仍可作落点”和“可拖但不可作落点”。ZUI 的整体 `disabled` 必须同时禁两侧；readonly 应禁止 source 激活，但是否允许成为 target 要由具体组件合同决定，不能直接等同一个底层 boolean。
- `sensors` 可在 Provider 全局配置，也可在 sortable/draggable entity 上覆盖。
- 官方要求每个 sortable item 是独立、按 typed key keyed 的 Svelte 组件，并以 getter 传 reactive `id/index`；不能在 `{#each}` 内用 `{@const createSortable(...)}` 每次重建实例。[官方说明](https://dndkit.com/svelte/primitives/create-sortable/)

ZUI wrapper 应始终传入一个 frozen、完整的 `data` 对象，至少包含 `key`、`containerKey`、`kind` 和必要业务引用。发布代码只在 `if (input.data)` 时回写底层 data，因此不要用 `undefined` 表示清除旧 drag data。

## OptimisticSortingPlugin 的精确边界

DOM Sortable 的默认 entity plugins 是：

```ts
[SortableKeyboardPlugin, OptimisticSortingPlugin];
```

`OptimisticSortingPlugin` 的发布实现调用 `insertAdjacentElement()`，直接改变真实 DOM 顺序。官方 changelog 的 v0.4.0 明确记录“Svelte: Removed OptimisticSortingPlugin from defaults to prevent conflicts with Svelte 5 reconciliation”。

Svelte `createSortable.svelte.js` 的实际实现是：

```ts
const withoutOptimisticSorting = (defaults) =>
	defaults.filter((plugin) => plugin !== OptimisticSortingPlugin);

new Sortable({
	...input,
	plugins: input.plugins ?? withoutOptimisticSorting
});
```

这只保证 `plugins` 未提供时安全。以下函数式扩展会重新收到 DOM Sortable 的原始 defaults，并把 `OptimisticSortingPlugin` 带回来：

```ts
plugins: (defaults) => [...defaults, CustomPlugin];
```

ZUI 适配层不能原样透传 sortable 的函数式 plugins。应先规范为显式安全数组，保留 `SortableKeyboardPlugin`，拒绝或过滤 `OptimisticSortingPlugin`，再追加允许的 per-entity descriptors。Provider 的 manager-level plugins 是另一层，可以使用函数式配置；不能把两种 plugins 混为一个 API。

## CSP、class-only 与 ShadowRoot

### StyleInjector 能解决的部分

DOM manager 无论外部 plugins 如何配置，都会注册 core `ScrollListener`、`Scroller`、`StyleInjector`。默认 manager plugins 另有 `Accessibility`、`AutoScroller`、`Cursor`、`Feedback` 和 `PreventSelection`；默认 sensors 是 `PointerSensor` 与 `KeyboardSensor`。

StyleInjector：

- 对 Document 创建 `<style>`，设置可选 `nonce`，prepend 到 `head`，并用 MutationObserver 防止活动拖动期间被移除。
- 对 ShadowRoot 创建 `CSSStyleSheet()`、调用 `replaceSync()` 并加入 `adoptedStyleSheets`；不创建影响 `:first-child`/`:nth-child` 的额外元素。
- 按 source root、target root 和显式 `addRoot()` 跟踪跨 root 操作，并以 ref count 清理。

这部分适合保留。`adoptedStyleSheets` 是已广泛可用的标准能力，但 constructed sheet 必须来自相同 parent Document；参见 [MDN ShadowRoot.adoptedStyleSheets](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets)。跨 Document/iframe 时仍须按实际 owner realm 建 manager/roots 资产验证。

当前 ZUI 的 CSP nonce 由 SvelteKit request handle 写入 ICSS critical style，客户端 `BrowserStyleSheet` 可从 `style[data-icss][nonce]` 或 `meta[name="icss-nonce"]` 发现，但 `ZuiContext`/`IcssRuntime` 没有公开可读的 `cspNonce`。首版 drag-drop provider 应接受显式 `nonce?: string` 并配置 `StyleInjector.configure({ nonce })`；不要读取 ICSS 私有 registry。若多个 runtime consumer 都需要 nonce，再把它提升为共享 Provider/runtime contract。

hash-only CSP 不能直接复用 ZUI 当前 critical-style hash：dnd-kit 样式在用户开始拖动时才注入，ZUI request registry 不包含这些规则。可预先把固定 dnd-kit CSS hash 加入应用 CSP，但会绑定依赖版本和发布 CSS；不建议把它作为 ZUI 默认路径。

### nonce 不能证明 class-only

发布的 Feedback 实现仍会：

- 通过 `Styles.set()` 对 feedback element 写入 `--dnd-width/height/top/left/translate/transform/transition/scale/transform-origin`；
- 复制原元素 style properties 到 placeholder；
- 对 table cells 写入和恢复 `style.width`；
- 通过动态属性和 StyleInjector CSS 将元素提升到 fixed/top-layer feedback。

默认 Accessibility 也创建 HiddenText/LiveRegion，并通过 `element.style.setProperty()` 写 display、position、width、height、margin、clip 等隐藏规则。

浏览器 CSP 需要精确区分：`style-src-attr` 会阻止 HTML style attribute、`setAttribute('style', ...)` 和 `cssText`；MDN 当前说明逐属性的 `element.style.property` 修改不由该指令阻止。[MDN style-src-attr](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr) 因此 dnd-kit 的 `setProperty()` 不一定产生浏览器 CSP violation，但它仍会产生 inline style 状态，违反本仓 `dynamicValues: 'class-rules'` 的更严格审计与可预测 class-only 合同。两者不能混写成“nonce 已兼容严格 CSP”。

以下是待实现阶段权衡的两个候选，不是已冻结的公开 API。现有 ZUI 严格 class-only 合同应作为默认方向；只有远程 CSP、ShadowRoot、动画和清理资产通过后，才考虑增加显式 opt-in 的增强反馈：

1. 默认 class-only 候选：从 manager defaults 排除 Feedback、Accessibility、Cursor、PreventSelection；由 ZUI 自己用 ICSS classes/data-state 渲染 source/target/placeholder 状态、`ZVisuallyHidden` live region、provider root 的 cursor/user-select class。排除 Feedback 也会移除它对 `dragOperation.shape` 的初始化和持续更新，因此必须用 geometry-only bridge 从 source DOMRectangle 和 operation transform 维护 engine shape，collision、AutoScroller 与 SortableKeyboardPlugin 才能继续工作。该 bridge 只写 engine state，不写 DOM style，也不另造 collision。Pointer drag 首版不显示任意坐标跟随指针的 ghost；不可暗中退回 inline CSS variables。
2. 待验证的 enhanced 候选：显式允许 dnd-kit Feedback 的动态 style properties；要求 Document style element nonce，映射 ZUI motion，并完成 ShadowRoot/iframe 与清理验证。没有这些证据前不应作为默认值或承诺的公开 profile。

默认 class-only 路径仍应提供可见“上移/下移/移至”按钮或菜单，作为 keyboard、触摸和不能使用拖动手势时的稳定操作入口。

geometry-only bridge 的 shape ownership 不能依赖“刚赋值的对象就是 `ValueHistory.current`”。dnd-kit 的 `DragOperation` 使用 `Shape.equals()` 作为 ValueHistory equality；相同 left/top/width/height 的新 Rectangle 会被忽略并保留旧对象。bridge 必须记录 setter 后 engine 实际接受的 current，并且只有该对象已由 bridge 发布时，idle/dispose 才能清空它。滚动时 source `getBoundingClientRect()` 会变化，但 drag operation position/transform 与 collision shape 都使用 viewport engine 坐标；bridge 保留 drag-start DOMRectangle，以 operation transform 平移，不能把 scroll 后的 source rect 再叠加一次。ScrollListener 继续只负责请求 collision observer 刷新，AutoScroller 继续根据同一个 operation position 与 shape 工作。

## Theme motion 与动态 reduced motion

dnd-kit 的默认 Feedback keyboard transition、drop animation 和 Sortable swap transition 均约为 250ms；发布代码直接调用 `prefersReducedMotion(window)`，系统 reduce 时把时长置零。它不读取 ZUI 的 `motion: auto | full | reduced`，也不读取 Theme duration/easing。

适配层应使用已有 `ReducedMotionState` 和 `durationMilliseconds()`：

- `reduced`：`Feedback.configure({ dropAnimation: null, keyboardTransition: null })`，每项 `transition: null`。
- `auto`：动态观察 owner Window；允许动画时用 `theme.duration.normal` 与 `theme.easing.standard/exit` 配置，系统 reduce 后切到 null。
- `full`：配置 Theme transition，但要明确 dnd-kit 内部仍会在系统 reduce 时强制 duration 0。若 ZUI 必须保证 `full` 覆盖系统偏好，就需要上游提供 reduced-motion resolver，或维护极薄 patch/custom Feedback；0.5.0 没有该注入点。

不要在活动 drag session 中销毁并重建 manager。`ReducedMotionState.current` 从 false 变为 true 时必须立即生效：先取消当前 Web Animations、drop/keyboard transition 和 preview animation，再把 transition 配置切到 null。若 0.5.0 无法在活动 operation 中安全更新 Feedback/plugin descriptors，adapter 应立即以 canceled 结束当前 drag、清除 preview、恢复焦点并应用 reduced 配置；不能把 reduced 延迟到 drop 结束。普通 Theme/easing 变化可以在不破坏活动 operation 的前提下更新，否则留到下一次 session。

Sortable 的交换动画使用 `Element.animate()`，而不是要求 ZUI 枚举每个像素位移 class；这是标准 Web Animations API。[MDN Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) 但 class-only profile 是否允许 Web Animations 仍应写入平台台账并由实际 CSP header 验证，不能仅凭没有显式 `style=` 字符串判定。

## FormList 接入与 owner 拒绝

官方 Svelte Sortable 示例在 `onDragOver` 中移动数组，以 state reconciliation 提供实时排序；`onDragEnd` 只在 canceled 时恢复快照。[官方 createSortable 示例](https://dndkit.com/svelte/primitives/create-sortable/) 这不符合 FormList 的业务 owner：

- `ZFormList.operations.move(from, to)` 已返回 boolean。
- 它调用 `FormArrayController.move()`；controller 先保留 row IDs 和 registry mutation，只有 `model.setField(..., acceptedWrite)` 接受后才 commit。
- owner 拒绝时 controller 恢复 previous IDs/keys 并返回 false。
- `ZFormList.mutate()` 还负责 keyed DOM 变化后的 focus 与文本 selection 恢复。

因此 adapter 的正确序列是：

1. drag start 记录 source row 的稳定 `row.id`、source container identity 和原 index；不能只记录会随外部更新漂移的 index。
2. drag over 只更新 adapter preview/drop target，不调用 `operations.move()`，也不创建第二份 Form business value。
3. 外部 Form values、rows identity、disabled/readonly 或容器 owner 在拖动中改变时取消 session；不要把旧 index 套到新数组。
4. drag end 先检查 `event.canceled`、source/target 和当前 rows 中的稳定 ID，再计算最终 `from/to`。
5. 在调用 owner 前使用 `const pending = event.suspend()`。只调用一次 `operations.move(from, to)`：返回 true 时 `pending.resume()`；返回 false 或抛出且未 commit 时 `pending.abort()`，清 preview，恢复 handle focus，并发布本地化“移动未接受”公告。

`@dnd-kit/abstract@0.5.0` 的发布实现确认：dragend event 含 `{ operation, canceled, suspend }`；`suspend()` 返回 `{ resume, abort }`。resume 后 manager 等待 Svelte renderer/tick 再进入 dropped/cleanup；abort 直接 reset drag operation，适合 owner rejection。

默认 Accessibility 会在 dragend dispatch 时立刻按 `event.canceled` 公告，而 owner rejection 是 handler 内才知道。若保留默认插件，它可能先说“已放下”，随后 adapter 才 abort。ZUI 因此必须拥有最终 success/rejection announcement，不能只覆盖默认英文字符串。默认 class-only 路径应直接替换默认 Accessibility；未来若验证并采用 enhanced 路径，也应关闭其 dragend announcement或整体替换，保证公告与 owner 最终结果一致。

对于以后可能异步接受的 Transfer/Tree owner，同一个 `event.suspend()` 可以等待 Promise；必须设置过期 generation/AbortSignal，并在卸载、owner 改变或新 session 开始时 abort。FormList 当前是同步 boolean，不应人为异步化。

## 建议的首批落地形状

依赖只出现在内部 `runtime/drag-drop` 与私有 item attachment，不泄漏 dnd-kit class 到公开组件 props：

```ts
interface CollectionMoveRequest<TKey, TContainerKey> {
	readonly source: { containerKey: TContainerKey; key: TKey; index: number };
	readonly destination: {
		containerKey: TContainerKey;
		key?: TKey;
		index: number;
		position: 'before' | 'after' | 'inside';
	};
	readonly keys: readonly TKey[];
	readonly sourceType: 'keyboard' | 'pointer' | 'touch';
}
```

首批实现建议：

1. `ZDragDropProvider` 私有/实验性薄层：统一 safe plugins、locale announcements、nonce、motion profile、session cancel。
2. 独立 `SortableItem` 私有组件：每个 typed key 一个稳定 `createSortable` 实例，getter 传 id/index/group/disabled/data。
3. `ZFormList` 作为第一个单容器消费者：只在 drag end 调现有 `operations.move`，并保留可见移动按钮。
4. 再接 Transfer 的跨容器 identity，最后接 Tree 的 `before/after/inside` 与 descendant preflight。

在 package API 冻结前必须有以下远程执行资产：pointer、touch、keyboard、RTL、Escape/pointercancel、unmount、owner rejection、活动中外部 rows 更新、focus restoration、locale announcement、reduced 动态变化、nonce Document、ShadowRoot、class-only DOM 无 style attribute，以及明确证明 Sortable registry 中不存在 `OptimisticSortingPlugin`。

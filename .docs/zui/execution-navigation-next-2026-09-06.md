# ZUI 下一导航阶段规划（2026-09-06）

本文件是下一有界阶段的执行规划，不修改生产实现。它基于 [完整能力路线图](./full-capability-roadmap-2026-09-06.md)、[企业组件矩阵](./benchmark-enterprise-components-2026-09-06.md)、[菜单族架构](./menu-family-architecture.md) 与 [逻辑集合架构](./logical-collection-architecture.md)。目标是收敛重复状态与焦点实现，再交付一个可消费的 Toolbar/ToggleGroup 纵向切片，为 NavigationMenu/Menubar 和 Splitter 留出清晰边界。

## 当前判断

- `ZMenu` 是命令菜单，已经拥有真实 button/anchor item、typeahead、checkbox/radio、submenu、Popover layer 和 RTL 方向键；它不能继续承担站点 NavigationMenu。
- `ZDropdownMenu`、`ZContextMenu`、`ZMenuSub` 应继续复用 `ZPopover`、Floating、dismiss、Presence 和 focus restore；不再新增第二套 overlay 或 outside/Escape 生命周期。
- `roving-focus.svelte.ts` 仍依赖旧 `CollectionStore`，而逻辑集合架构已经把 `LogicalCollection`、`CollectionNavigation`、`MountedElements`、`SelectionModel` 定为目标分层。下一阶段应先做内部 adapter，迁移一个真实消费者后再删除旧实现。
- `ZCommand`/`ZCommandPalette` 已有垂直方向导航和 `loop`；`ZSegmented` 与 `ZRadioGroup` 当前都已经使用 `LogicalCollection`、`CollectionNavigation`、`MountedElements` 和 `SelectionModel`，不是旧 `CollectionStore`/`RovingFocus` 消费者。下一步应审查两者重复的 wiring，再抽小型 adapter，而不是声称需要从旧 store 迁移。
- `ZOverflowList` 已能提供真实 item、隐藏项、`pinnedKeys`、`suspended` 和可操作 overflow 入口；Toolbar/NavigationMenu 的溢出应复用它，不维护第二个宽度测量器。
- Splitter/ResizablePanels 仍是独立布局职责，不能把 panel sizes 或 pointer capture 塞入 Toolbar/NavigationMenu 的状态模型。

## 直接执行的下一阶段：N3-A Toolbar 与 ToggleGroup vertical slice

### 1. 先合并内部基础，不扩公共 runtime

新增一个内部 roving adapter，消费目标接口而不是 DOM 查询：

```ts
interface RovingCollectionAdapter<TKey extends SelectionKey> {
	currentKey: TKey | undefined;
	set(key: TKey | undefined, reason: NavigationReason): boolean;
	move(intent: 'first' | 'last' | 'next' | 'previous'): TKey | undefined;
	tabIndex(key: TKey): 0 | -1;
}
```

- 复用 `ui/zui/src/runtime/collection/list-navigation.ts` 的 `navigationIntent`/`moveIndex`，继续由 Provider direction 决定水平左右键。
- 复用 `MountedElements`/现有 collection registration；active、selected、disabled、DOM focus 分开保存。
- `ZMenu`、`ZTabs`、`ZSegmented` 不在这一阶段重写全部 public API；先让 adapter 支持其现有行为，记录迁移点，再删除旧 `RovingFocus`/`CollectionStore` 只在全部消费者迁移后进行。
- pointer move 只更新 active，不夺取输入焦点；press/activation 才改变 selection 或执行 action。

### 2. `ZToolbar`：只拥有 composite focus

建议 API：

```ts
<ZToolbar orientation="horizontal" loop aria-label="编辑工具">
  {#snippet children()}{/snippet}
</ZToolbar>
```

- `orientation: 'horizontal' | 'vertical'`，`loop` 默认 true，保留 `Home`/`End`。
- 根是一个明确名称的 `div[role=toolbar]`，只拥有一个 Tab stop；Toolbar 不拥有业务 selection/value。
- 子 Button、ToggleGroup、Menu trigger、真实 Link 保留各自语义和 click/submit 行为；禁止嵌套 button。
- `size` 复用 `controlSizeStyles` 五档；`tone` 只由子控件或明确的 Toolbar surface token 消费；Toolbar 不把 tone 隐式传播成业务状态。
- `motion`/reduced motion 只影响 Toolbar 内部的 indicator/overflow presence；不重复实现 Popover 生命周期。
- 当宽度不足时，Toolbar 使用已实现的 `ZOverflowList`；overflow 入口必须是唯一可聚焦按钮，隐藏 actions 通过真实 Popover/Menu 访问。

### 3. `ZToggleGroup`：把选择与 Toolbar focus 分开

建议 API：

```ts
<ZToggleGroup type="single" value={value} onValueChange={...} orientation="horizontal">
  {#snippet item(option, index)}{/snippet}
</ZToggleGroup>
```

- `type: 'single' | 'multiple'`、`value/defaultValue`、`onValueChange`、`disabled`、`orientation`、`loop`、`roving`。
- single/multiple 使用现有 `SelectionModel`；focus active key 不等于 selected keys。
- 使用真实 button 与 `aria-pressed`；不把 ToggleGroup 伪装成 RadioGroup，也不让 Button defaults 覆盖 explicit size/tone。
- `ZSegmented` 保留为单选视觉/表单便利入口，内部可复用 N3 adapter；但它当前输出 `role="radiogroup"` + `role="radio"`/`aria-checked`，不能直接改成 ToggleGroup 的 `aria-pressed`。RadioGroup 继续保留原生 `input[type=radio]`、name/FormData、required 和 compound children 语义；两者共享导航/selection wiring，不合并渲染语义。
- `ZToggleButton` 作为单项低层入口保留；Toolbar 不新增 `ToolbarButton` 别名。

## 后续紧接阶段，不在 N3-A 混入

### N3-B NavigationMenu 与 Menubar

- `ZNavigationMenu` 拥有站点导航 `href/currentKey/openKeys`、inline/vertical/horizontal、group/nested、collapsed 和 overflow；它的 item 是真实 Link，导航取消与 Menu action 取消分开。
- `ZNavLink` 承担 label/description/leading/trailing/expand；不把这些便利 props 塞进 `ZMenuItem`。
- `ZMenubar` 是桌面命令菜单协调器：多个 Dropdown/Menu 共享 open root、方向键跨 trigger 移动和 restore focus；它不是 NavigationMenu 的别名。
- 两者复用 N3-A 的 focus adapter、ZMenu item/action、ZPopover/Floating/Presence；不复制 submenu、typeahead 或 dismiss。

### N2-B Splitter/ResizablePanels

- `ZResizable` 负责一个 axis/handle 的 pointer + keyboard resize、min/max、step、start/change/end、cancel。
- `ZSplitter` 负责 panels、sizes/defaultSizes、onSizesChange、collapsible/restore、nested 与持久化边界；业务保存由调用方拥有。
- 分隔条使用 `role=separator`、`aria-orientation`、`aria-valuenow/min/max`，键盘步进遵循 RTL 和 orientation；pointer capture、owner Window、ResizeObserver 与极小边界独立验证。
- 不复用 Toolbar 的 roving focus；Splitter handle 是独立调整焦点模型。

## 统一视觉与主题规则

- 五档 size 通过现有 `controlSizeStyles`/`controlSizeMetrics`；Toolbar 行高、Toggle item、NavLink 触发器只消费同一档，不复制像素表。
- tone/selected/danger/disabled 是不同语义轴；Toolbar surface、NavigationMenu current、Toggle selected 不共享一个模糊 tone。
- animation 只消费现有 Presence/Motion/Theme easing；进入/退出、reduced、forced-colors 和用户中断必须保持一致。
- responsive 只应用于 orientation、gap、collapsed/overflow 和布局尺寸，不把 selection/current value 做成 breakpoint 对象。

## CSS 能力采用边界

- [CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning)：NavigationMenu/Menubar 面板可做 `@supports` 渐进增强，但当前继续使用 Floating 的测量、collision、ShadowRoot/iframe owner Window fallback；不改变最低支持矩阵。
- [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) 与 [`transition-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior)：可用于 Toolbar overflow/Menu 面板首次出现和离散 display 过渡，但必须挂在现有 `PresenceEntryMotion` 之后；当前 Popover opacity 仍有 WebKit 回归证据，先修稳定性再推广默认样式。
- [`interpolate-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size) / [`calc-size()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size)：不作为 NavigationMenu/Toolbar 的必要布局机制；面板尺寸先使用显式尺寸、Floating 结果和现有 Presence，待 Chromium/Firefox/WebKit fixture 证明后再作为无功能依赖的增强。

## 交付顺序与验收

1. 写 adapter contract 和迁移表；列出 `ZMenu`、`ZTabs`、`ZSegmented` 当前重复代码与保留的 public props。
2. 实现 `ZToolbar` + `ZToggleGroup` vertical slice，完成 LTR/RTL、horizontal/vertical、Home/End、loop=false、disabled、pointer 不夺焦点、SSR、ShadowRoot/iframe owner 文档。
3. 接入 `ZOverflowList`，验证窄宽度、真实 overflow action、focus 转移和 reduced motion。
4. WebStorm errors-only、静态审计和目标 Docs；完整 keyboard/RTL/SSR/浏览器套件交 CI。
5. 只有真实消费者迁移并通过回归后，才删除旧 `RovingFocus`/重复 selection 分支；不以新增组件文件数量作为完成标准。

## 资料

- [Radix Primitives Toolbar](https://www.radix-ui.com/primitives/docs/components/toolbar)
- [Radix Primitives Navigation Menu](https://www.radix-ui.com/primitives/docs/components/navigation-menu)
- [Radix RovingFocus source](https://github.com/radix-ui/primitives/blob/main/packages/react/roving-focus/src/roving-focus-group.tsx)
- [Radix Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
- [WAI-ARIA Menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [MDN CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning)
- [MDN `@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style)
- [MDN transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior)
- [MDN interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size)
- [MDN calc-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size)

Context7 2026-09-06：`/radix-ui/primitives` 官方资料确认 Toolbar/NavigationMenu 的 compound 方向，以及 RovingFocus 的 orientation、loop、Home/End、RTL focus movement；该资料用于行为对齐，不改变 Svelte API 形态。

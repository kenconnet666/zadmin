# ZScrollArea execution record — 2026-09-06

本记录对应 `ui/zui/src/components/layout/ZScrollArea.svelte` 的 Docs 接入，不修改组件实现、exports、catalog、generated 文件或测试。

## 已实现的文档范围

- `apps/docs/src/content/components/layout/scroll-area/doc.ts`
- `BasicDemo.svelte`：单真实div的纵向原生滚动、默认键盘可聚焦和 `aria-label`
- `AxesDemo.svelte`：`axis="x"` 横向内容与 `axis="both"` 二维内容
- `ResponsiveHeightDemo.svelte`：响应式 `minHeight` / `maxHeight` 与内容超限后的原生滚动
- `ControllerDemo.svelte`：绑定 `ZScrollAreaController`，演示 `scrollBy`、`scrollTo`、位置回调和 Provider `motion` 切换
- `RtlDemo.svelte`：RTL 横向内容，直接展示 DOM `scrollLeft`，保留可能的负值语义

## 文档依据的实际 API

- 组件只有一个真实滚动 `HTMLDivElement`；`ref`、`controller.element`、原生 `onscroll` / `onscrollend` 都对应同一节点。
- `axis` 只控制 `overflow-x` / `overflow-y` 的 `auto` 与 `hidden`，没有自定义 thumb 或拖动滚动条脚本。
- `height`、`minHeight`、`maxHeight` 使用 `ResponsiveValue<number | string>` 与 `query` 生成 ICSS。
- `scrollbarWidth`、`scrollbarGutter`、`scrollbarStyle` 只映射标准 CSS 滚动条能力；`scrollbarStyle="themed"` 使用主题颜色，forced colors 或 high contrast 时恢复 `auto`。
- `overscroll` 映射原生 `overscroll-behavior`。
- `onScrollPositionChange` 报告原始 `scrollLeft` / `scrollTop`，RTL 下的 `left` 不被转换为伪造的 LTR 坐标。
- `controller.scrollTo` / `scrollBy` 由组件根据 `scrollBehavior` 和 `ReducedMotionState` 选择 smooth 或 instant。

## 边界

- 文档没有把标准 CSS scrollbar 样式描述为完整的自定义滚动条组件。
- 文档没有把 `scrollend` 当作唯一事件来源；原生 `onscroll` 和位置回调仍是基础路径。
- 文档没有把 `scrollLeft` 当作统一非负逻辑坐标，RTL 例子直接显示 DOM 值。
- `scrollbarWidth="none"` 只作为显式能力演示，不作为默认无障碍建议。

## 资料依据

- [MDN overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow)
- [MDN scrollbar-width](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width)
- [MDN scrollbar-color](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-color)
- [MDN scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter)
- [MDN Element scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)
- [MDN Element scrollLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft)
- [MDN scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior)

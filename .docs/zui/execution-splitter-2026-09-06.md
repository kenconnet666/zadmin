# ZSplitter 执行说明（2026-09-06）

## 1. 交付范围

本切片实现 `ZSplitter` 和可供后续 `ZResizable` 消费的纯几何基础，不包含持久化、路由状态、应用布局策略或通用拖拽框架。

- `ui/zui/src/components/layout/ZSplitter.svelte`：数据驱动面板、真实几何、受控尺寸、折叠恢复、pointer/键盘、ARIA 和完整调整生命周期。
- `ui/zui/src/runtime/resize.ts`：`number/%/px/rem` 解析、容器分配、单位保持、相邻面板边界及位移。
- `ui/zui/tests/SplitterFixture.svelte`：混合单位、嵌套、RTL、受控更新和事件观察 fixture。
- `ui/zui/tests/splitter-geometry.spec.ts`：纯几何 CI 合同。
- `ui/zui/tests/splitter-production.spec.ts`：SSR、身份和非法合同。
- `ui/zui/tests/splitter-production.browser.spec.ts`：实际 CSS 几何、键盘、pointer cancel、嵌套和 RTL CI 合同。
- `ui/zui/tests/splitter-production-types.ts`：泛型 key、尺寸单位和只读事件的类型合同。

公共导出、catalog、生成元数据和 Docs 页面由集成批次统一处理。

## 2. 研究依据

本实现以项目总纲的 L18/L19 边界为准，并核对以下当前官方资料：

- [WAI-ARIA APG Window Splitter Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)：focusable `separator`、`aria-controls`、`aria-valuenow/min/max`、方向键、Home/End 和 Enter 折叠/恢复。
- [Mantine Splitter](https://mantine.dev/core/splitter/) 与 [use-splitter](https://mantine.dev/hooks/use-splitter/)：混合弹性/固定单位、多面板、嵌套、受控尺寸、Shift 步进和 Pointer Events。
- [Ant Design Splitter](https://ant.design/components/splitter/)：min/max、collapsible、受控 size，以及 resize start/change/end 产品生命周期。

Context7 在实施时先 resolve 后查询了 Mantine 和 Ant Design 当前文档。第三方 API 只用于验证行为维度，没有逐字段照搬。

## 3. 公共 API 决策

`ZSplitter<TKey>` 使用一个泛型：稳定面板 key。内容由根级 `panel` snippet 统一渲染：

```ts
interface ZSplitterPanel<TKey extends SelectionKey> {
	readonly key: TKey;
	readonly label: string;
	readonly min?: ZSplitterSize;
	readonly max?: ZSplitterSize;
	readonly collapsible?: boolean;
	readonly collapsedSize?: ZSplitterSize;
	readonly resizable?: boolean;
}

type ZSplitterSize = number | `${number}%` | `${number}px` | `${number}rem`;
```

根组件提供：

- `panels`、`panel`；
- `sizes` / `defaultSizes` / `onSizesChange`；
- `orientation`、五档 `size`、`step`、`shiftStep`、`disabled`；
- `onResizeStart`、`onResize`、`onResizeEnd`、`onResizeCancel`；
- `reset()`、`collapse(key)`、`expand(key)`、`focusHandle(index)`。

`key` 必须是唯一稳定的 string/number。`label` 必须非空，同时命名 panel region 和控制它的 separator。动态 reorder 以 key 保留非受控尺寸身份；显式 `sizes` 始终按当前 `panels` 顺序解释。

## 4. 尺寸与分配模型

尺寸单位不是统一的 px 别名：

| 输入                 | 分配语义                                       | 用户调整后的回传 |
| -------------------- | ---------------------------------------------- | ---------------- |
| `number`             | 容器可用面板空间的弹性百分比权重               | `number`         |
| `` `${number}%` ``   | 容器可用面板空间的弹性百分比权重               | `%` string       |
| `` `${number}px` ``  | 固定尺寸；容器不足时与其他固定尺寸一起安全收缩 | `px` string      |
| `` `${number}rem` `` | 相对 owner Document 根字号的固定尺寸           | `rem` string     |

“可用面板空间”是 Splitter content box 的排列轴尺寸减去所有真实 handle border-box 尺寸。`min`、`max` 和 `collapsedSize` 每次都按当前 content box 与 owner Document 根字号解析。回调额外提供冻结的 `pixels` 和 `percentages` 快照，便于日志、显示和跨单位业务判断；可直接回传给 `sizes` 的数组仍保持每项原声明单位。

分配器先保留 fixed 尺寸，再把剩余空间按 flexible 权重分配，并在 min/max 上迭代收敛。容器小于全部 min 之和时按 min 比例退化，设置 `data-constrained=true`，不会产生负尺寸或抛出仅由 viewport 缩小造成的错误。单项 `min > max` 属于非法 owner 数据，直接抛错，也不会调用回调修正受控值。

SSR 没有读取浏览器几何。它只把 fixed 值作为原 CSS basis、flexible 值作为 flex 权重输出，不用抽象轴伪造物理百分比、跨单位约束、折叠或 constrained 结论。未测量的 separator 保留稳定结构、名称、方向和 controls 关系，但 `tabindex=-1`，不输出 `aria-valuenow/min/max`；panel 也不会因声明尺寸为零而提前变成 `inert`。挂载后由 owner Window 的 `ResizeObserver` 取得真实 content box、handle 尺寸和根字号，随后才启用调整及几何 ARIA。相同 props 的 SSR 输出确定一致。

## 5. 交互与生命周期

Pointer 调整只改变 handle 两侧的面板，其他面板保持不动。horizontal RTL 把物理 X 位移转换成逻辑相邻位移；vertical 不受文字方向影响。handle 使用 Pointer Events、`touch-action:none`、pointer capture 和所属 Window 的 move/up/cancel 监听，不依赖进程全局 window。

一次 pointer 交互顺序为：

1. `onResizeStart`；
2. 每个实际几何变化调用 `onSizesChange` 和 `onResize`；
3. `pointerup` 调用 `onResizeEnd`；
4. `pointercancel` 或 `lostpointercapture` 恢复开始快照，再调用 `onResizeCancel`；
5. 外部 sizes、panel/约束/reorder、owner Window 或 content geometry 在拖动中变化时取消当前 session，不覆盖新的 owner 数据。

取消原因是显式 union：`external-update`、`geometry-change`、`lost-capture`、`owner-change`、`pointer-cancel`、`unmount`。所有 detail、sizes、pixels 和 percentages 都在运行时冻结，回调收到只读快照。

方向键的普通步长和 Shift 步长是可用轴的百分比点，默认 1 和 10。Home/End 到达前一面板的最小/最大相邻边界；可折叠面板允许边界到 `collapsedSize`。Enter 优先折叠/恢复 separator 控制的前一主面板，否则使用后一面板。恢复值按稳定 key 保存；如果没有历史值，恢复到 min 与相邻空间 25% 中较大者。

## 6. 可访问性

- 每个 panel 是保留 DOM 和内部状态的命名 `region`；折叠不销毁内容。
- 每个 handle 是 `tabindex=0` 的 `role=separator`，禁用时退出 Tab 序列并设置 `aria-disabled`。
- horizontal 面板排列产生 vertical separator，使用 Left/Right；vertical 排列产生 horizontal separator，使用 Up/Down。
- `aria-controls` 指向 separator 前一主面板的稳定 id。
- 真实测量后，`aria-valuenow/min/max` 使用整个可用面板轴的 0–100 位置；collapsible 相邻项把 collapsedSize 纳入可达范围。SSR 和零尺寸隐藏容器不发布这些数值。
- panel 和 handle 的 DOM 顺序保持数据顺序；RTL 只改变实际 CSS inline 几何。

## 7. 视觉与 Theme

handle 的五档尺寸复用现有 `indicatorSize` control token，线宽复用 `borderWidth.hairline`，颜色复用 `color.border`、`color.primary`、`color.surface` 和 `color.focus`。没有新增未建模 ICSS keyword，也没有为一个消费者增加专用 Theme schema。handle、line、grip 都是独立 part，后续可在 slots 配置中覆盖。

## 8. 验证边界

按本轮约束，本地只执行 Prettier、逐文件 WebStorm diagnostics 和 `git diff --check`；Vitest browser、SSR suite、Svelte typecheck、Playwright、全量构建和 bundle gate 只作为远端 CI 合同提交，不在本地运行。Svelte MCP 在当前会话没有暴露，因此无法执行要求的 `list-sections` / `svelte-autofixer`；实现使用当前仓库 Svelte 5.56 语法，并以 WebStorm 的 Svelte/TypeScript 诊断替代本轮静态检查。

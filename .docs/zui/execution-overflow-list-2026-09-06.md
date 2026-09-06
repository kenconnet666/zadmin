# ZOverflowList execution record — 2026-09-06

本记录对应 `ui/zui/src/components/layout/ZOverflowList.svelte`、`overflow-layout.ts`、`overflow-measure.ts` 及其 Docs、导出与 CI 合同。本阶段保持 experimental/unreleased，完整稳定性验收仍由远程流程执行。

## 文档演示

- `ResizeDemo.svelte`：提供 320px/640px 宽度按钮和可拖动宽度，item 与 overflow 中的项目都是可切换状态的真实按钮。
- `RowsDemo.svelte`：`maxRows={2}` 与 `maxVisibleItems={7}` 同时生效；Popover 打开时绑定 `suspended`。
- `PinnedRtlDemo.svelte`：`ZProvider direction="rtl"`、`as="ol"`、`collapseFrom="start"`、`pinnedKeys` 和真实 Popover 链接；数据顺序不因 RTL 重排。
- `DynamicLabelsDemo.svelte`：使用稳定对象 key 动态改变标签长度、显式调用绑定 instance 的 `refresh()`，item 与 overflow 项均为可操作按钮，并在 Popover 打开时暂停测量。

## API 边界

- `items` 与稳定 `itemKey` 由调用方拥有；snippet 直接接收 item/index 或完整 state，不创建 Snippet 工厂。
- 每个 item 只挂载一个 wrapper；折叠状态使用 `inert`、`aria-hidden` 和绝对定位保留真实 DOM 测量，不复制第二套交互组件。
- SSR 初始不伪造几何测量；未测量时完整显示 items，客户端测量完成后再发布 `OverflowListState`。
- `overflow` snippet 收到完整 `overflowItems`，默认文档使用真实按钮 + Popover 展示隐藏 actions，不丢弃访问入口。
- `collapseFrom` 依据数据逻辑顺序；RTL 只改变视觉方向。
- `pinnedKeys` 优先保留固定项目；固定项目令约束无法满足时，state 仍会报告 `fits=false`，文档不把它描述成强制成功布局。
- `collapse=false` 是停止测量并完整显示；`suspended=true` 是保留现有拆分，关闭后恢复测量，两者语义不同。
- `measured` 只由真实测量建立；关闭再开启 collapse 不把禁用期间的人工全显布局当成测量结果。
- 溢出入口宽度变化后优先使用当前真实尺寸重新拆分；只有自定义入口产生反复布局时才保守保留已观察到的最大入口宽度，避免非单调内容无限振荡。
- `gap`、`rowGap`、`query` 使用现有 ResponsiveValue/ICSS 路径；没有新增 CSS getter 或未验证的 token。

## 当前检查证据

WebStorm 对组件、测量基础和受影响合同文件执行了窄范围诊断，未报告错误；使用其语义重命名把测量 helper `number` 改为 `parseCssPixels`，同步 7 处引用。

真实 Chrome Docs 检查确认：390px 页面没有横向溢出；容器由 640px 缩至 240px 时，焦点从被隐藏的“归档”移到溢出入口，展开后恢复首项；source item 数始终为 7。RTL 使用 Provider context 形成真实 `dir=rtl`。类型、SSR、可变入口宽度、暂停/恢复、焦点和多行合同已编写，未在本地运行测试套件。

## 资料与实现依据

- Mantine 官方 OverflowList 的 API 参考：`data`、`renderItem`、`renderOverflow`、`maxRows`、`maxVisibleItems`、`collapseFrom`、`getItemKey`。[官方文档](https://mantine.dev/core/overflow-list/)
- Mantine 官方源码展示了测量阶段和 overflow indicator 尺寸参与布局计算，但没有为 SSR、复杂交互焦点恢复或 ShadowRoot 提供 ZUI 可直接继承的契约。[官方源码](https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/core/src/components/OverflowList/OverflowList.tsx)
- ZUI 当前实现明确使用唯一 item DOM、隐藏项 `inert`/`aria-hidden`、owner Window ResizeObserver、字体加载事件、祖先尺寸/样式观察、`refresh()` 和焦点恢复逻辑；演示和文案按这些事实书写。

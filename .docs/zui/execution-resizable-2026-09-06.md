# E6 ZResizable 执行记录

日期：2026-09-06。实现对象为 `ui/zui/src/components/layout/ZResizable.svelte`，复用 `runtime/resize.ts` 的 `ResizableLength` 解析、像素解析和单位回写能力。没有修改 `ZSplitter`，也没有引入第三方 resize engine 或新的拖拽 runtime。

## 组件边界

`ZResizable` 调整一个真实元素的 width/height。它不分配多面板空间，也不承担 Splitter 的相邻面板守恒、collapse 或 panel identity。owner 是根元素的物理父元素；百分比、约束、键盘步长和 pointer 坐标都以 owner content box 为几何基准。直接位于 ShadowRoot 时使用 host 作为 owner。

`axis` 为 `inline | block | both`。handle 使用逻辑位置：inline-start/end、block-start/end，以及四个 block + inline corner。省略 `handles` 时，inline 和 block 分别生成对应 end handle；both 生成 inline-end、block-end 和 block-end-inline-end。显式 handle 必须唯一且与 axis 相容。

width、height、defaultWidth/defaultHeight、min/maxWidth/Height 全部使用既有 `ResizableLength`：number 和 `%` 相对 owner，`px` 和 `rem` 固定。交互回写保持各维度原声明单位。number 的含义继续是百分比，不新增数字像素语义。实现曾在真实 Chrome 暴露显式 `%` 被序列化为 `percent` 后缀的问题；当前 number-percent 和 string-percent 均统一输出合法 `%`，SSR 与真实 400px owner 几何合同覆盖该分支。

`step` 和 `shiftStep` 明确使用像素，默认 8px 和 32px。这与 `ZSplitter` 的百分比点 step 不同：单元素 handle 直接追随 pointer/键盘的物理距离，多面板 Splitter 则按容器比例调整相邻分配。

## 状态与生命周期

width 和 height 可分别 bind；`onSizeChange` 以一个冻结 `{ width, height }` 快照原子通知，避免两个维度的 corner 操作暴露半更新状态。外部 owner 写入和 owner 几何同步不通知。公开 `reset()` 恢复初始 defaultWidth/defaultHeight，并像 Splitter reset 一样只发一次 size change，不伪造 resize start/end。

Pointer 序列在 pointerdown 通过真实 handle focus 并尝试 pointer capture，同时在 handle 所属 Window 注册 move/up/cancel。一次连续操作发一个 start、零到多个实际 resize、一个 end。pointercancel 和 lost capture 恢复开始尺寸；外部受控更新、owner content-box 变化、物理 owner/realm/handle 配置变化会取消当前序列并保留已经明确发生的新状态；活动拖动随组件卸载报告 unmount。所有 detail 和 size 快照冻结。

键盘 handle 尊重 `defaultPrevented`、composition、Ctrl/Meta/Alt 和 disabled。Arrow 沿 handle 控制的物理方向调整；RTL 把物理水平键映射回逻辑 inline 方向；Shift 使用 shiftStep；Home/End 到对应维度的 min/max。边 handle 使用带 aria-orientation/value 的 separator；同时控制两个值的 corner 使用真实 button，因为单个 ARIA separator 无法诚实表达二维 value。owner 尚未测量时 handle 退出 Tab 序列，SSR 不伪造 aria-valuenow/min/max 或 disabled 状态。

`handleLabel` 可按 handle 覆盖名称。默认名称来自 localePack common 的 resizeHandle formatter 和四个逻辑边短语；corner 组合 block 与 inline 短语。`handle` snippet 只替换 handle 内部 grip，获得冻结的 axis、handle、disabled、resizing context，真实控制元素、ARIA、pointer capture 和键盘行为仍由组件拥有。

## 样式

组件使用 ICSS slot recipe，callback 统一命名 `s`。root 通过 `--zui-resizable-width`、`--zui-resizable-height` 和 `--zui-resizable-handle-size` 更新真实几何；handle touch target 使用五档 control-size indicator token。实现只使用已存在的 `_border`、`_small`、`_focus`、`_inner`、`_medium` token和已注册 CSS keyword，没有假设 `.full`、`.regular` 等未核实成员。

## Authored CI 覆盖

- SSR：逻辑 handle 数量、edge/corner 原生元素、未测量 ARIA、合法 `%` 序列化，以及 axis、handle、length、constraint、step 的惰性 body 校验。
- 类型：完整 props、readonly lifecycle/value、逻辑 axis/handle、五档 size 和 ResizableLength 负例。
- Browser：真实 owner content box、px/rem/% 单位、min/max、inline/block/both、RTL、Home/End、step/shiftStep、disabled、五档 handle 几何、可访问名称和可用 handle snippet。
- Pointer：capture/release、owner Window、pointerup、pointercancel、lostpointercapture、external update、geometry change、owner change 和 unmount cancel reason。
- Reset：恢复默认尺寸，发一次 atomic size change，不增加 resize lifecycle 次数。

本地只执行 Prettier、WebStorm 受影响文件诊断和 `git diff --check`。按阶段约束没有运行 Vitest、Playwright、typecheck、`svelte-check`、build、bundle、Chrome 或 CI；行为验证由远端 authored CI 和 root 的实际浏览器复核承担。

# Previous CI remediation — ScrollArea and AppShell (2026-09-06)

本记录对应 CI run `34029475777` 的两个已确认问题，范围只涉及 `ZScrollArea`、`ZAppShell` 和相应 authored tests。

本批同时修复下述Toolbar/ToggleGroup静态与交互反馈；上一run已完成且failure，构建与外部包检查通过。此记录不声称修复后的远程测试已通过。

## Toolbar 与 ToggleGroup

- ToggleGroup runtime key断言后保留已声明的泛型key域，Toolbar的DOM parent明确为Element/null；测试数组与状态使用相同key域，包括number 1/string '1'。
- ToggleGroup保留按钮roving入口，删除非交互group根的tabindex与不支持的aria-invalid，视觉无效状态仍在data-invalid。
- Toolbar先同步更新active key，再通过MountedElements已有队列把焦点交给更新后的按钮。RTL改变方向键意义，初始入口仍是DOM第一项；嵌套Toolbar分别拥有焦点。
- 将不存在的Set.toHaveSize matcher替换为size断言；Overflow all-fit场景使用确实容纳全部项目的640px，保持入口隐藏和焦点转移断言。
- Portal测试显式initialFocus到组的真实按钮；其焦点独立于外层Toolbar。共享Popover恢复目标快照问题另在NavigationMenu实际Tab路径定位并修复。

## ScrollArea

- reduced-motion 失败：fixture 在同一次 click 中先切换 Provider motion，再调用 controller 的 smooth command；controller 读取的 `ReducedMotionState` 可能还未完成 reactive settle，导致命令继续使用 smooth。`ZScrollArea` 的 controller behavior 现在同时检查即时的 `zui.motion === 'reduced'` 与连接后的 `ReducedMotionState`，确保该命令直接使用 `instant`。
- RTL 失败：Chromium 在 RTL scroll container + classic scrollbar gutter 下，初始 `scrollLeft` 可以是负值（本次为 `-15`）。测试原先固定要求 `0`，与产品保留浏览器原始 DOM `scrollLeft` 语义的合同冲突。测试现在允许初始值 `<= 0`，仍要求后续 `scrollTo({ left: -100 })` 得到 `-100`，没有把负值转成正值。

## AppShell

上一轮 Chromium axe 失败为 `scrollable-region-focusable`，impact `serious`，节点包括：

- `div[data-region="main"][data-slot="main"]`，`scroll="main"`
- AppShell root，`data-scroll="root"` 的 alternative fixture

修正：

- `scroll="main"` 时 main scroll owner 默认 `tabindex="0"`。
- `scroll="root"` 时 AppShell root 默认 `tabindex="0"`。
- navbar/aside 作为独立 `overflow:auto` region 提供 `tabindex="0"`。
- root 显式传入的原生 `tabindex` 优先于默认 scroll-owner tabindex，例如调用方传 `tabindex={-1}` 时保留 `-1`。
- 现有 navbar/aside label API 保持不变；没有新增复杂滚动 API。

已补 SSR/browser authored assertions，覆盖 main/root/navbar/aside scroll owner 的 tabindex，以及 root 显式 tabindex 覆盖。只做了目标文件格式和 diff 检查，未运行本地 tests/build/typecheck、CI 或 Chrome。

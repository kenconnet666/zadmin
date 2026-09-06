# E6：ZMenubar 执行合同

日期：2026-09-06。本批新增桌面命令 Menubar 的根级协调层，当前为 experimental；已有 ZMenu 继续拥有命令、checkbox/radio、typeahead 与 nested submenu。

## 组件与状态边界

- `ZMenubar` 输出有名称的 `role="menubar"`，公开 bindable `value?: SelectionKey | null`、`defaultValue`、`onValueChange`、`disabled/loop/gap/size/ref`。value 只表示唯一打开的根菜单，trigger active focus 是另一状态。
- `ZMenubarMenu value disabled` 是无 DOM owner，内部受控复用 `ZDropdownMenu`；一个 Menu 组合一个 Trigger 与 Content。
- `ZMenubarTrigger` 复用 Dropdown/Popover 的真实 Button、`aria-haspopup="menu"`、expanded/controls 和五档 Button 主题，强制根级 `role="menuitem"`，并向 Menubar 注册真实 ref、key、disabled 与 label。
- `ZMenubarContent` 复用 `ZDropdownMenuContent` 和 bare `ZMenu`；调用方直接放置现有 `ZMenuItem`、`ZMenuCheckboxItem`、`ZMenuRadioGroup/Item`、`ZMenuSub/Trigger/Content`、Group、Label 与 Separator。没有新增 action、selection、typeahead、submenu 或 floating runtime。

## 键盘、指针与焦点

根 menubar 只有一个 Tab stop。初次进入使用第一个可用 DOM trigger，后续 active key 独立保持。Left/Right 按真实 LTR/RTL 移动，Home/End 使用 DOM 首末项；Down/Up 交给已有 Dropdown 分别准备首项/末项，Enter/Space 使用原生 button 打开。

菜单打开时，根 Content 中的 Left/Right 切换相邻根菜单并聚焦新菜单首项。Nested submenu trigger 已消费进入方向键，且 SubContent 位于独立 Portal，不能误触 Menubar 根切换。指针在已打开状态跨过另一个 trigger 时切换唯一根菜单。

每个 Content 把本地 Dropdown 的 `prepareOpen` 和 Popover 最新 restore target 注册给根。跨 trigger 前，旧 Content 的恢复目标改为新 trigger，避免旧 FocusScope 抢回焦点；Escape 和已接受 command 使用 Popover 恢复当前 trigger。Tab/Shift+Tab 显式选择 menubar 后/前的真实 tabbable，设置为 restore target 后关闭并离开。Focus/pointer outside 保留实际外部焦点；root disabled 或开放 Menu 动态 disabled/removed 时选择仍可用 trigger或外部目标。

## 对标依据

行为参考 [WAI-ARIA APG Menu and Menubar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) 的 persistent menubar、单 Tab 入口、根左右导航、菜单上下导航、Tab 离开与 Escape 恢复要求，并核对 [Radix Menubar](https://www.radix-ui.com/primitives/docs/components/menubar) 的 Root/Menu/Trigger/Content/Sub 组合。ZUI 沿用自己的 SelectionKey、ControllableState、MenuActionEvent、Theme 与 Layer 边界，没有复制 React `asChild`、Portal/floating 参数或独立菜单项家族。

## 根整合与验证边界

新增源码位于 `components/compound/menubar/`：`ZMenubar.svelte`、`ZMenubarMenu.svelte`、`ZMenubarTrigger.svelte`、`ZMenubarContent.svelte` 与私有 `context.svelte.ts`。根任务统一处理 exports、metadata registry、catalog、component defaults、generated API 和 Docs 页面，本批不修改这些共享文件。

Authored evidence 包括 `MenubarFixture.svelte`、SSR、browser 和 type 合同，覆盖单开、真实 ARIA、LTR/RTL、Home/End、Down/Up、Escape、Tab 双向离开、指针跨 trigger、动态 disabled/removal、nested submenu 隔离、checkbox/radio/action 复用以及五档真实 trigger 几何。

本地只执行直接 Node Prettier 与 WebStorm 受影响文件诊断；没有运行 Vitest、浏览器 suite、Svelte/TypeScript gate、build、CI 或 Chrome。因此测试仅为已写待远端执行的合同，不能描述为已通过。当前会话没有暴露项目 AGENTS.md 所列 Svelte MCP 工具，无法运行 svelte-autofixer。

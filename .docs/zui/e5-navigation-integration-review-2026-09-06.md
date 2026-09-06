# E5 NavigationMenu 集成只读审查

日期：2026-09-06。对象为本轮未提交的 `ZNavigationMenu.svelte`、`NavigationRow/Node/List/InlinePanel.svelte`、`context.ts`、`runtime/collection/navigation-menu.ts` 与 `ZNavLink.svelte` 三分支接口。本记录是根修复前的只读快照；没有修改被审实现，没有运行 suite、typecheck 或 build。

## 修复复核

本轮实现复核已关闭以下审查项：single 模式现在同时删除被关闭 sibling branch 及其全部开放后代；href + branch 的 disclosure 由 NavigationMenu 在 capture 阶段消费方向键，ZNavLink 尊重 `defaultPrevented`；Popover Content 已正式支持 `region` 并使用 `ariaLabelledBy`；面板末项 Tab 会跳到面板外真实 tabbable 目标；custom panel root 自动固定在 Overflow source，More 的递归菜单不再复制 consumer `item/start/end`；More 继续继承外层 expansion policy 和真实方向；导航关闭使用稳定的外层 disclosure，而不是即将卸载的 panel leaf。

面板 Tab 的实际 Chrome 复核还暴露出一个共享 Popover 根因：`ZPopover` 原先把私有 `restoreTarget` 声明为 `$state`。`ZPopoverContent` 创建 FocusScope 的 effect cleanup 捕获了该次 effect 的旧响应式快照，因此 NavigationMenu 在同一个 Tab 事件内先调用 `setRestoreTarget(next)` 再关闭 Popover 时，cleanup 仍恢复到旧 trigger。`restoreTarget` 现为普通 imperative `let`，Popover context getter 在 cleanup 时读取最后一次赋值；NavigationMenu 的 panel Tab 因而能在 Portal 卸载后稳定保留外部模式按钮焦点。

对应 authored browser 回归位于 `navigation-menu-production.browser.spec.ts` 的 panel 末项 Tab 用例：它验证 More wrapper 处于 inert、Tab 同一事件关闭面板，并在受控 panel 已从 DOM 移除且下一次 Svelte flush 完成后，仍由外部真实按钮持有焦点而不是 disclosure trigger。该断言覆盖共享 Popover restore lifecycle，不为私有 context 增加测试 API。

原审查中的 disabled 导致已开放 panel 被动关闭时如何选择可用恢复目标，仍保留为独立后续边界；本次复核没有把它误标为已验证。

## 可定位问题

### P1：single 打开兄弟分支时遗留被关闭兄弟的后代 key

`ZNavigationMenu.svelte:setExpanded` 的 single 过滤只删除 `other.parentBranch === record.parentBranch` 的同层 key。若 A 与 B 同层且 A1 是 A 的开放后代，打开 B 时 A 被删除，但 A1 的 `parentBranch` 是 A，因与 B 的 `parentBranch` 不同而保留。A1 暂时因祖先 A 不在 expanded 集合而不可见，之后重开 A 会意外恢复 A1。

过滤需要先确定本次关闭的同层 sibling branches，再同时删除这些 branches 和 `branches` 链包含它们的所有后代。实际关闭的 floating panel 还应把现有 Popover restore target 指到新触发器，避免旧 sibling FocusScope 与新面板争抢焦点。

### P1：href + branch 的 disclosure 左右键有两个 owner

`ZNavLink.handleDisclosureKeydown` 自己处理 ArrowLeft/ArrowRight；`ZNavigationMenu.register` 又给同一个兄弟 disclosure button 注册 `keydown` 并调用 `menu.keydown`。ZNavLink 的 disclosure handler 没有先检查 `event.defaultPrevented`。

这会造成同一次按键重复请求 openKeys。若 ZNavLink 先消费，Menu 所需的 `edge=first/last` 会丢失，水平 ArrowUp 打开面板时无法把初始焦点放到末项。该键必须只有一条可取消状态路径：Menu 在 NavLink 内建处理之前携带 edge 消费，NavLink 尊重已取消事件；不能由两边分别改 openKeys。

### P1：NavigationRow 使用了 ZPopoverContent 不支持的公开属性

Floating `NavigationRow` 传入 `role="region"` 和原生形式 `aria-labelledby`。当前 `ZPopoverContentProps` 的 role 仅允许 `dialog | listbox | presentation`，并把名称覆盖公开为 `ariaLabelledBy`，同时从原生属性中 Omit `aria-labelledby`。

当前名称在运行时恰好由相同 `triggerId` 默认值得到，掩盖了错误 prop；role 仍超出真实类型合同。应使用现有支持的 role，并通过 `ariaLabelledBy` 传 ID。

### P1：面板末端 Tab 可能指向隐藏 More，或被默认恢复回 trigger

`panelKeydown` 在末项得到 `scope.next(last) === last` 后无条件优先 `moreTrigger`。Horizontal 使用 ZOverflowList 时，即使没有任何 overflow，More wrapper 仍挂载但为 `aria-hidden/inert`，所以 `moreTrigger` 非 null 并不表示可聚焦；代码会 preventDefault 后尝试聚焦隐藏按钮。

Vertical 没有 moreTrigger 时则放行默认 Tab，但非 modal Popover 因 focus outside 关闭后，默认 FocusScope restore 会把焦点恢复到 disclosure，用户仍不能稳定离开末项。应检查真实 overflow 可见性/可聚焦性，并让 panelKeydown 与 FocusScope 共用一个面板外 restore target，不能各自恢复。

### P1：Overflow 保留原节点同时递归创建第二份消费者内容

`ZOverflowList` 对折叠 item 只设置 absolute、visibility hidden、aria-hidden 与 inert，原 `NavigationNode` 仍挂载。Overflow snippet 又把 `snapshot.overflowItems` 交给一个新的递归 `NavigationMenu`，因此相同 entry 的 `item/start/end/panel` snippet、表单控件、局部状态和副作用出现两份。

两个 NavigationMenu 自己生成的 `idBase` 是不同的，不会直接撞内建 menu ID；问题是消费者 snippet 或 panel 内的固定 ID 和业务所有权被执行两次。实现需要避免完整递归 Menu 复制消费者 DOM，或采用明确不会重复消费者 ID、状态和 panel 的 overflow 呈现路径。

### P1：Overflow 递归实例绕过外层 single 策略

More 内的递归 `NavigationMenu` 没有传 `mode` 或解析后的 `expandMode`，因此默认 inline + multiple。外层 horizontal/vertical 默认 single 时，在 More 中依次打开 A、B 会把多个 key 写回同一个父 openState，绕过外层 `setExpanded` 的 single sibling 过滤。

递归呈现即使采用 inline 视觉，也必须消费外层已经解析的 expansion policy。

### P2：显式 dir 没有传入 Portal 内的递归 Menu

外层 nav 支持独立 `dir` 并从真实 ref 读取方向；More 内的新 NavigationMenu 未收到该解析方向，Portal 中会回退到 Provider direction。外层 `dir="rtl"`、Provider 为 ltr 时，More 列表的方向键与子 flyout placement 会变回 ltr。

递归实例应使用外层真实解析方向，而不是省略或只转发可能为 undefined 的原始 prop。

### P2：closeAll 把即将卸载的面板叶子广播为 restore target

导航请求的 `request.close` 和默认接受路径都调用 `closeAll(focusTarget(key))`。当 key 是 floating panel 内的链接时，该 target 位于将退出的 panel 中；`closeAll` 又把它写给所有 panel 的 Popover restore target。FocusScope cleanup 与 inert/Presence 更新顺序将决定它是回退到旧 trigger，还是短暂聚焦随后卸载的叶子，存在落到 body 的风险。

关闭全部层级应让每层恢复到自己的稳定 disclosure，或使用明确位于所有关闭 panel 外的目标，不能广播正在关闭的后代节点。

### P2：disabled 令受控 open 表达式变 false，但没有可用焦点恢复目标

`isOpen` 在 root 或 ancestor disabled 时直接返回 false，受控 Popover 随即关闭，但这条路径没有经过 `setExpanded/closeAll`。原 disclosure 同时变为 disabled，FocusScope 无法将焦点恢复到它；之前的焦点又位于退出 panel，最终可能落到 body。

disabled 导致开放 panel 关闭时，应通过现有 MountedElements/FocusScope 选最近仍可用的主导航项，并保留 openKeys 是否需要继续存在的业务决策；不能只让 open 表达式变 false。

## 已核对且不是问题的边界

- `active` 只由 `currentKey` 产生，`expanded` 只由 open state 产生，NavigationRow 没有把祖先 current 当成 `aria-current`。
- Floating 分支的 `contentId` 来自当前 Popover context，`disclosureId` 与 `triggerId` 使用同一 menu ID；href + branch 的 primary anchor 和 sibling button 使用不同内建 ID。
- 无 href + branch 的单 button 同时绑定 primary/disclosure refs，并按 ZNavLink 合同使用 disclosure ID 优先级。
- 修改键、非同源链接、非 HTTP(S) 目标和非 `_self` target 在 `navigate` 中保留浏览器原生行为；`onNavigateRequest.preventDefault()` 通过原始 MouseEvent 取消导航和自动关闭。
- Model 使用全树 typed key 去重与对象祖先集合检测循环；overflow 子 Menu 的 `$props.id()` 产生独立 idBase，因此内建 ID 风险不同于消费者 snippet 被重复实例化的问题。

## 验证边界

本次只读取源码和现有 FocusScope、Popover、OverflowList、MountedElements 合同，并执行 WebStorm 只读受影响文件诊断作为辅助；IDE 没有报告错误不构成对上述跨组件生命周期问题的否定。没有控制浏览器，没有运行 Vitest、Svelte/TypeScript gate、build 或 CI。

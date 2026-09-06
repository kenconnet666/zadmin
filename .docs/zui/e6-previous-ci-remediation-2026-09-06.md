# E6 Previous CI remediation — Toolbar and ScrollArea

日期：2026-09-06。证据来自 GitHub Actions run `34034413308` 的 workspace test job `101489766879` 与 coverage job `101489766871`。本记录只覆盖 Toolbar、OverflowList focus handoff、ScrollArea 和同轮 ZSplitter 静态 warning。

## Toolbar

RTL 和 nested Toolbar 的共同根因在 `CompoundLogicalCollectionRegistry`。多个 child registration effect 在同一次 Svelte flush 中用各自可见的 `$state` 数组快照执行展开或 filter 写回，后一个 registration 会覆盖先前 sibling。真实 Chrome 诊断同时显示 `MountedElements.size === 2`，但 `collection.full` 只剩 `rtl-last`；因此 focused first 已经不在逻辑 view，activeKey/tabindex 转到 last 后，keydown 无法得到与事件 path 对应的 current item，也不会进入 focus 调度。

Registry 现在使用普通 token Map 保存生命周期真相，reactive revision 只负责通知 collection 重建。revision 由非响应式 counter 递增后赋值，register/cleanup 不读取 revision，避免把 registry signal 捕获进调用方 registration effect。ToolbarItem 在 attachment construction 时若节点已经聚焦，使用 `untrack(handleFocus)`，避免 attachment effect 订阅 Toolbar physical view。真实 Chrome 已验证 RTL First 按 ArrowRight 后焦点到 RTL Last，同时 first/last tabindex 为 -1/0。

Authored browser 合同继续要求 RTL 与 inner Toolbar 各自保留两个逻辑/物理 sibling、唯一 roving Tab stop 和正确 DOM focus。Toolbar Docs Basic demo 增加同构 RTL 两项和 nested Toolbar，可直接点击 first 后用 ArrowRight 做真实浏览器复核。实际 Chrome 已验证 RTL First → RTL Last、Inner First → Inner Last、Outer First → Outer Last，且每层 first/last tabindex 与焦点同步。

Overflow handoff 还有一个独立根因：布局由有 overflow 变为完全可见时，More 会在 handoff 期间短暂 hold；Toolbar 已把 source roving items 暂时设为 `tabindex=-1`，因此只查 `tabbable()` 找不到目标并退回 OverflowList root。`focusInside` 现在保持 tabbable 优先，再用 `focusable()` 选择允许程序聚焦的可见 roving item；disabled、inert 和 hidden 仍由同一库排除。真实 Chrome 已验证 More → Escape → owner used width 640px 后 More hidden、无隐藏 source item、焦点落保存按钮，保存/其余/More tabindex 分别为 0/-1/-1。测试保留相同严格几何、hidden、focus 和 tabstop 断言，没有增加固定等待或替换节点引用。

## ScrollArea

失败 fixture 在同一个 click stack 中先修改父 Provider 的 motion prop，再立即调用子 ScrollArea controller。Svelte 尚未完成父到子 context flush，controller 无法观察尚未传播的 policy。Fixture 现在在事件内等待一次 `tick()`，确认 Provider context 可见后再发 smooth 请求；产品仍同步检查 `zui.motion` 与已连接的 ReducedMotionState。测试等待可观察的 CSS behavior、DOM scrollTop、controller snapshot 和原生 scroll event状态全部到位。

Firefox 对 RTL 原生 `scrollLeft = -100` 返回 `-99.550003...`，属于 CSS pixel/device pixel 舍入。合同使用文件中已有的半 CSS pixel 判定，同时继续验证负方向原生语义，没有转换成正数或扩大到不可解释容差。

## 静态合同

`ZSplitter` 的 focusable `role="separator"` 是真实 pointer 和键盘 resize control。对应元素添加局部 `a11y_no_noninteractive_tabindex` ignore，并保留 `tabindex=0`、ARIA value和键盘入口；没有关闭全局检查或删除可访问操作能力。

本地仅执行 Prettier、WebStorm 受影响文件诊断和 diff whitespace 检查；没有运行 Vitest、Playwright、typecheck、Svelte gate、build、Chrome 或 CI。最终多浏览器通过状态由下一次远端 CI确认。

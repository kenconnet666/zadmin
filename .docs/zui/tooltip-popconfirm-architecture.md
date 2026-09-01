# ZUI Tooltip与Popconfirm生产架构

## 目标与边界

本批只补两个现有Overlay的生产缺口：

- `ZPopconfirm`：短、就地、非modal确认的最小异步生命周期；
- `ZTooltip`：非交互说明的作用域warmup/cooldown与多实例协调。

定位、Portal、Floating、Presence、outside/Escape和焦点恢复继续由现有Layer/Popover内核拥有。Popconfirm不成为请求框架；Tooltip不成为HoverCard。

## 成熟实现参考与取舍

- [WAI-ARIA APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)要求focus/hover触发、Escape关闭、焦点保留在Trigger、`role=tooltip`与`aria-describedby`。APG仍标记该模式为work in progress，因此ZUI同时固定实际浏览器合同。
- [Radix Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)提供Provider级 `delayDuration/skipDelayDuration` 和唯一active协调；ZUI采纳作用域Group，但timer来自真实owner Window，不使用global window。
- [React Spectrum Tooltip](https://react-spectrum.adobe.com/Tooltip)采用focus即时打开、hover warmup、已打开后的cooldown即时切换，并强调Trigger必须可聚焦。ZUI采用相同输入差异。
- [MUI Tooltip](https://mui.com/material-ui/react-tooltip/)明确原生disabled按钮需要wrapper才能提供pointer事件。ZUI采用非Tab inline wrapper，但不伪造disabled按钮的键盘焦点；键盘用户必须同时获得常驻原因文本或帮助入口。
- [Ant Design Popconfirm](https://ant.design/components/popconfirm/)展示Promise异步关闭。ZUI采纳resolve关闭/reject保留，但增加generation隔离、安全错误和受控open边界。
- [Naive UI Popconfirm/Dialog callback合同](https://github.com/tusen-ai/naive-ui)验证Promise回调与loading的实际价值。ZUI不采纳返回boolean的多义关闭协议，仍以Action原生 `preventDefault()` 处理同步前置校验。
- MUI没有独立Popconfirm；其Popover/Dialog分界再次支持ZUI的选择：短确认用非modal Popover，复杂不可逆流程用AlertDialog。

## Popconfirm所有权

```text
ZPopconfirm
  ├─ ControllableState<boolean>       open唯一owner
  ├─ generation                       迟到结果隔离
  ├─ pending                          当前confirm Promise
  ├─ errorMessage                     当前generation安全错误
  └─ ZPopover                         定位/dismiss/focus restore
       └─ ZPopconfirmContent
            ├─ Title + Description    dialog名称/后果
            ├─ Cancel                 允许关闭并使generation失效
            ├─ Action                 busy + 防重复
            └─ error status           polite live + describedby
```

确认序列：

1. Action先转发原生 `onclick`；`preventDefault()` 可阻止进入confirm。
2. 根递增generation、清除旧错误、设置pending。
3. `onConfirm(event)` 可返回void或Promise。
4. 当前generation resolve：清pending并请求关闭。
5. 当前generation reject：保持打开，格式化安全文案，polite公告并恢复Action可用。
6. Cancel、outside、Escape、外部受控关闭或组件销毁：递增generation并清UI状态；业务Promise仍由调用方拥有，但settle不能再写当前UI。

`formatConfirmError`默认使用Provider `feedback.confirmFailed`，不直接显示 `Error.message`，避免泄漏内部路径、transport detail或敏感payload。

受控owner必须让`open=false`至少提交一个Svelte flush，或通过key重新挂载，才能表达“关闭旧实例并立即打开新实例”。同一同步批次内的`false → true`会被Svelte折叠为最终`true`，对子组件而言从未发生关闭，因而仍属于同一确认实例；组件不会为不可观察的中间赋值增加第二个epoch prop。

## Tooltip Group所有权

`ZTooltipGroup`只提供Svelte上下文，不创建DOM：

- `delay`：首次pointer hover warmup；
- `closeDelay`：Trigger/Content离开后的关闭缓冲；
- `skipDelayDuration`：关闭后继续保持warm状态的cooldown；
- coordinator：同组唯一active；新Tooltip进入后关闭旧Tooltip；若旧Tooltip仍由键盘焦点拥有，pointer Tooltip关闭后立即恢复它；
- cooldown timer：始终用关闭Tooltip Trigger的owner Window；Group销毁清理。

根Tooltip仍拥有自己的open与短期开/关timer。每个timer带generation；disabled、外部关闭、Trigger owner切换和destroy都会使旧回调失效。Group只回答当前hover是否跳过warmup并协调active，避免把每个Tooltip的controlled状态提升成全局状态。

输入合同：

- keyboard focus：立即打开；
- pointer hover：首次使用delay，cooldown内即时；
- focus和hover同时存在：任一来源仍active就不关闭；
- Trigger click：立即关闭；
- Escape：顶层Tooltip立即关闭且焦点不移动；
- pointer进入hoverable Content：取消关闭；离开后仅在Trigger未聚焦时关闭。

## Disabled control策略

原生disabled button不可聚焦且部分浏览器不可靠地派发pointer事件。`ZTooltipTrigger disabled`因此：

- 保留真实disabled button；
- 外层渲染非Tab、`inline-flex` wrapper作为Floating anchor与pointer入口；
- wrapper不获得button role、tabindex或click；
- wrapper的pointer listener由节点action安装并在destroy释放，避免伪造ARIA role；公开button pointer回调仍转发给真实button；
- `aria-describedby`仍投射到真实button；
- 文档必须同时展示常驻不可用原因，保证键盘用户不依赖不可达Tooltip。

不采用把disabled改成`aria-disabled`的通用做法，因为那会改变原生form与激活语义。需要可聚焦的不可用命令时，应由Toolbar/Menu等上层模式明确拥有。

## 非交互与hoverable不是HoverCard

Tooltip Content允许pointer停留只为满足hover/focus内容可停留要求。运行时守卫继续拒绝：

- anchor、button、input、select、textarea；
- interactive ARIA role；
- contenteditable；
- 可Tab后代；
- interactive media/embed。

守卫在打开时先同步检查，并用owner Window的`MutationObserver`持续检查子树与关键交互属性；动态插入的交互后代不会绕过边界，关闭或销毁时Observer立即释放。

需要链接、按钮、复制或复杂说明时使用 `ZPopover`；需要补充帮助入口时采用页面内说明、Alert或未来ContextualHelp，不扩张Tooltip状态机。

## 明确不做

- 不实现touch long-press；阈值、滚动、文本选择与取消需要真实移动产品需求。
- Popconfirm不内置fetch、abort、retry、Toast或错误对象DSL。
- Popconfirm不替代AlertDialog，也不增加mask/modal选项。
- TooltipGroup不挂到global document或全局静态service。
- 不增加follow-cursor、交互Tooltip或任意`asChild`克隆。

## 验收边界

专属Fixture/spec源码固定：pending防重复、resolve关闭、reject错误、Cancel迟到generation、controlled open、focus restore、Group首次delay/cooldown即时切换、唯一active、disabled wrapper、hoverable非交互Content与iframe owner realm。SSR固定closed Portal内容不渲染、稳定ID和无浏览器global访问。完整行为执行交CI/CD，本地只运行WebStorm errorsOnly、Prettier和diff检查。

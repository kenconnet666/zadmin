# E7 PasswordInput 与 NativeSelect 执行记录

日期：2026-09-06。实现对象为 `ZPasswordInput`、`ZNativeSelect` 和私有 `input-control.ts`。设计前通过 Context7 阅读 Mantine 当前 PasswordInput 与 NativeSelect 文档，采用其成熟的独立 visibility、可访问 toggle、数据 option/group、视觉 size 与原生行数分名等边界；状态和组合方式按 Svelte、ZField 与原生表单合同重新实现，没有复制 React wrapper。

## 共享输入基础

ZInput 原有边框、颜色、focus-visible、disabled、invalid、readonly、motion 和五档 control-size recipe 已机械提取到 `input-control.ts`。ZInput 保留自己特有的 `appearance:none`，NativeSelect 使用同一 chrome 但保留浏览器原生 select appearance。PasswordInput 直接渲染 ZInput，因此没有第二份文本值、Field、FormData 或 reset 状态机。

## PasswordInput

PasswordInput 的唯一新增状态是 visible/defaultVisible。visible 为 bindable，onVisibleChange 只报告真实用户切换；外部同步和 form reset 不通知。内部始终保留同一个 ZInput DOM，只在 password/text 之间更新原生 type。

PasswordInput 作为 InputGroup 的直接业务 control 时读取同一 Group 上下文，解析顺序为实例、InputGroup、Field、passwordInput 默认、input 默认、density。内层唯一 ZInput 继续负责 Group 注册、值、Field 和表单；wrapper 不会注册第二个 control。Group 与 Password 通过 `input-control.ts` 的同一组合规则去除内层重复边框和 focus ring，Group 禁用时也只由 Group 根应用一次透明度。

可见性控制复用真实 ZButton 和 Eye/EyeOff ZIcon。toggleLabel 提供显式可访问名称覆盖，默认使用 locale pack 的 showPassword/hidePassword。toggle snippet 只替换 button 内容，获得冻结 visible/disabled/readonly context；button、ARIA、键盘和禁用行为仍由组件拥有。

Pointer 按下 toggle 时，如果 input 正在聚焦，则阻止 button 抢焦点。真实 Chrome 观察到同一 input 在 click 和 Svelte `tick()` 后仍保留 selection，但浏览器会在事件完成后、下一 animation frame 前把 password/text 类型切换后的 selection 清为 `[0,0]`。组件因此在唯一下一 owner frame 恢复 click 时记录的 selectionStart、selectionEnd 和 selectionDirection，并用 generation、同一 input、isConnected、activeElement 仍为 input、非 disabled 五个条件防止覆盖新焦点或卸载状态。键盘聚焦 toggle 后 Space/Enter 不安排 input 恢复，保持原生 button focus。readonly 阻止密码文本编辑但允许查看和隐藏；disabled 同时禁用 input 与 toggle。

value/defaultValue/name/form/autocomplete/required/invalid/size/onValueChange/ref 等全部交给唯一 ZInput。ZInput 的 onFormReset 在原生 reset default action 后恢复 value；PasswordInput 同一回调只恢复 defaultVisible，再调用消费者 onFormReset。显式 resetOnForm=false 可把文本 reset 交给外部 owner，但 visibility 仍回到安全默认。

## NativeSelect

NativeSelect 渲染真实 select、option 和 optgroup，不模拟 listbox。数据源必须在 items 与 children snippet 中二选一：items 提供受校验的结构和全局唯一 string value；children 是调用方直接提供原生 option/optgroup 的 escape hatch。

选择模式是清晰的类型 union：single 使用 string，multiple 使用 readonly string[]，onValueChange 与 defaultValue 同步收窄。multiple 数组按 selectedOptions DOM 顺序冻结，原生 FormData 自动生成重复同名条目。undefined 不被自动改写为空字符串：未提供 value/defaultValue 时，single select 保留浏览器首项或 children 中 selected 的原生默认。

placeholder 只属于 single 模式，生成首个空字符串 option；required 时该 option disabled。`size` 保留为五档视觉 control size，`nativeSize` 映射 HTML select 的可见行数，避免与视觉 API 冲突。

组件复用 ZInput 的 Field/InputGroup name、controlId、describedBy、required、disabled、invalid、readonly 与 size 优先级。disabled 使用原生属性并退出 FormData。原生 select 没有 readonly 属性，因此 readonly 保持 select 可聚焦和 FormData 值，通过 aria-readonly、pointer/keyboard取消和 change回滚阻止用户写入。

oninput/onchange 保留原始原生事件；内部从真实 selectedOptions 读取一次状态，ControllableState 去重确保 onValueChange 每个用户选择只调用一次。FormResetSignal 在浏览器完成原生 reset 后恢复 defaultValue，不伪造 change 通知。

## Authored CI

- SSR：PasswordInput 唯一 input/button、password/text类型、visibility label；NativeSelect 原生 select/option/optgroup、single/multiple selected状态、视觉与native size，以及所有运行时负例均读取 `.body`。
- 类型：Password visibility/toggle、NativeSelect single/multiple、items/children排他、placeholder模式、string option值、nativeSize与视觉size精确负例。
- Browser：真实 fill、pointer toggle、键盘Space、caret/focus身份、Field ARIA、FormData/reset、readonly/disabled、custom toggle context和五尺寸；真实 selectOptions、原生input/change、option/group禁用、multiple重复FormData、undefined首项默认和五尺寸。

本地只运行 Prettier、WebStorm受影响文件诊断和diff whitespace检查；没有运行Vitest、Playwright、typecheck、svelte-check、build、Chrome或CI。最终多浏览器结果由下一次远端CI确认。

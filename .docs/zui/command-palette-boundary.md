# Command Palette组合边界

状态：已采用（2026-09-02）

## 组件所有权

ZCommandPalette不是第三套Collection或Layer实现。它只组合：

- ZCommand：查询、相关性过滤、分组、active-descendant、键盘导航与Action；
- ZDialog：modal Portal、scroll lock、inert、focus trap、Escape和焦点恢复；
- Command shortcut matcher：调用方显式配置的按键与DOM作用域；
- ControllableState：`open`与`query`两条互不混淆的受控/非受控轴。

路由跳转、异步请求、权限、二次确认、重试和错误状态仍由应用拥有。Action默认关闭；`preventDefault()`是保持Palette打开继续输入的显式边界。

## 快捷键作用域

组件不会默认注册全局快捷键。配置`shortcut`后：

1. 显式`shortcutTarget`优先；
2. 否则从内置Trigger或Dialog content的Document/ShadowRoot推导；
3. 再尝试Provider portalContainer所属root；
4. 无安全owner时不注册；`null`显式禁用。

Element target只接收在该区域内冒泡的keydown，适合一个页面存在多个业务Palette。effect在target、shortcut、disabled变化及卸载时成对释放listener。

## Trigger与焦点

- `showTrigger=true`时，ZDialogTrigger是打开与恢复焦点owner；
- `showTrigger=false`时，调用方按钮设置受控`open`，Dialog关闭后回到打开前的真实焦点；
- 不提供任意`asChild`，不从Snippet猜测元素身份；
- title/input/list/close/trigger默认名称都来自typed locale，placeholder不替代accessible name。

## 文档证据

五个示例分别固定：内置Trigger+快捷键、查询持久化、外部Trigger、open/query/action受控所有权、Element作用域快捷键。Dialog/AlertDialog/Popover的底层ARIA与FocusScope继续由overlay生产批次统一收口。

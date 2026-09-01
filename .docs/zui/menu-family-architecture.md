# ZUI Menu Family生产架构

## 范围与结论

本批统一 `ZMenu`、`ZDropdownMenu`、`ZContextMenu` 与 submenu/selection/link compound parts。三类入口只保留触发方式差异：

- `ZMenu`：拥有完整logical item顺序、真实DOM焦点、typeahead与action协议；
- `ZDropdownMenu`：真实button触发，复用Popover的open、Floating、Portal、Presence、dismiss与focus restore；
- `ZContextMenu`：真实pointer client坐标或键盘目标logical start更新锚点，其余生命周期与Dropdown相同；
- `ZMenuSub`：每层有独立Menu集合与Popover layer，但action沿父Menu链复用同一个 `MenuActionEvent`。

不实现独立Dropdown/Context item状态，不以DOM查询反向构造logical顺序，不复制Floating、outside、Escape、reduced-motion或RTL定位算法。

## 参考与取舍

- [WAI-ARIA APG Menu and Menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)允许roving tabindex或active-descendant。ZUI选择roving：菜单通常项数有限，并包含真实anchor；真实DOM焦点能保留原生链接行为、focus ring和更直接的submenu恢复目标。
- [React Aria / Spectrum Menu](https://react-spectrum.adobe.com/Menu)验证了action、selection mode、section、submenu、link与context trigger的能力边界。ZUI不把所有selection policy塞入Root，使用Checkbox/Radio窄部件以减少API组合歧义。
- [Radix Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)验证了Root/Trigger/Content、CheckboxItem、RadioGroup/RadioItem、Sub/SubTrigger/SubContent的compound分层。ZUI沿用部件边界，但继续复用已有Popover和CancelableEvent，而不是引入第二个overlay runtime。
- [MUI Menu](https://mui.com/material-ui/react-menu/)验证了真实Popover组合、selected initial focus、checkbox/radio角色和滚动菜单的实际需求。ZUI保留 `appearance="bare"` 组合，不复制MUI的component polymorphism，link由 `ZMenuItem href` 明确表达。
- [Ant Design Menu](https://ant.design/components/menu/)验证了data items、multiple/openKeys和inline navigation的规模。ZUI当前Menu是application command menu，不把站点侧栏/inline navigation模式混入同一ARIA合同。

## 所有权

| 能力                                        | 唯一owner              | 说明                                        |
| ------------------------------------------- | ---------------------- | ------------------------------------------- |
| typed key、禁用、分组、文本、顺序           | `LogicalCollection`    | string `"1"` 与number `1`严格不同           |
| 当前挂载element/id                          | `MountedElements`      | 只做DOM握手和DOM顺序校正                    |
| active key和nearest reconcile               | `CollectionNavigation` | 动态移除当前项后按旧logical位置恢复         |
| DOM焦点                                     | `ZMenu` roving adapter | enabled item只有一个tabindex=0              |
| locale前缀搜索                              | `Typeahead`            | Provider locale变化时重建Collator并清buffer |
| action取消与跨submenu冒泡                   | `MenuActionEvent`      | 一次创建，任一层取消即停止后续效果          |
| open、Portal、碰撞、outside/Escape、restore | `ZPopover`             | Dropdown、Context和Sub都不复制              |
| 同级唯一打开submenu                         | 父`ZMenu`              | pointer或键盘转移到另一Item时关闭旧submenu  |

`ZPopoverContent`补出typed、可取消的 `onEscape` / `onFocusOutside` / `onPointerOutside`，让顶层submenu判断原始target是否仍在父Menu内：父Item交互只退当前层，真正外部交互沿 `onDismissRequest` 关闭整条Popup链。所有监听仍由 `DismissableLayer` 唯一拥有。

## 公共部件

- `ZMenuItem`：action或真实anchor link；`closeOnSelect=true`；可显示ZKbd shortcut与danger状态。
- `ZMenuCheckboxItem`：controlled/uncontrolled/mixed；默认 `closeOnSelect=false`。
- `ZMenuRadioGroup` + `ZMenuRadioItem`：typed单选域；默认保持Menu打开。
- `ZMenuGroup` + `ZMenuLabel` + `ZMenuSeparator`：分组、命名与不可聚焦分隔。
- `ZMenuSub` + `ZMenuSubTrigger` + `ZMenuSubContent`：nested layer、父action链与RTL逻辑方向键。

## 键盘与焦点

- Root：ArrowUp/ArrowDown、Home/End、locale-reactive printable typeahead；Tab不在Item间循环。
- Dropdown Trigger：Enter/Space沿用button；ArrowDown/ArrowUp打开并聚焦首/末enabled item。
- Context Trigger：原生 `contextmenu`、`ContextMenu` key、Shift+F10；公开 `aria-keyshortcuts="ContextMenu Shift+F10"`。
- Submenu：逻辑前进键打开并聚焦首项；反向键或Escape关闭并恢复父Item；RTL翻转左右键与side placement。
- outside、Escape与nested layer仅由当前顶层DismissableLayer消费；关闭根Popup后恢复真实Trigger/Context target。

## 明确后置

- Virtual menu：当前没有真实超大command menu；长数据优先搜索、Command、分组或重新设计信息架构。实现virtual roving前需要明确屏幕阅读器与未挂载active项合同。
- Touch long-press context menu：需要真实移动端需求决定阈值、滚动/文本选择冲突、触觉反馈和pointer cancel；不使用一个通用timer伪装生产能力。
- Menubar/inline navigation：它们有不同orientation、Tab入口、openKeys与站点导航语义，应在真实产品需求出现时独立设计。

## 验收面

专属 `menu-family.browser.spec.ts` 固化：dynamic nearest、typeahead、checkbox/mixed、typed radio、link cancellation、ArrowUp/ArrowDown进入、nested action/dismiss/focus restore、pointer坐标、RTL keyboard anchor、ownerDocument iframe realm。完整执行交CI，本地只做WebStorm error diagnostics、生成器、静态审计与格式检查。

# E5 NavigationMenu API 决策（2026-09-06）

本文件是 N3-B 的小范围 API 决策，不修改实现。当前生产基础是 `ZMenu`（命令菜单）、`ZPopover`/Floating/Presence、`ZLink`、`ZOverflowList`、`ZToolbar`、`LogicalCollection`/`CollectionNavigation`。NavigationMenu 不新增第二套菜单焦点、浮层或测量运行时。

## 成熟库对标结论

| 场景                 | 官方资料得到的事实                                                                                                                                                                                                                                                                                                                         | ZUI 取舍                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ant Menu             | `mode` 有 `inline`、`vertical`、`horizontal`；`items` 可表达 item/group/submenu；`selectedKeys` 与 `openKeys` 分开；支持 `disabled`、`onSelect`、`onOpenChange`、submenu hover/click、inlineCollapsed 和横向 overflow indicator。[Ant Menu](https://ant.design/components/menu/)                                                           | 借鉴 `items`、current/open 分离和三种布局；route link 不复用 command Menu 的 selection/action 语义。                               |
| Mantine NavLink      | `NavLink` 是单个导航节点，支持 `href`、`active`、`disabled`、`label`、`description`、`leftSection`、`rightSection`；children 可嵌套，`opened/defaultOpened` 控制子项，`childrenOffset` 控制层级。[Mantine NavLink](https://mantine.dev/core/nav-link)                                                                                      | 提取 `ZNavLink` 的内容槽位和 nested/opened API；active 是 route/current 表现，不等于 focus 或 selection。                          |
| Radix NavigationMenu | Root/List/Item/Trigger/Content/Link/Viewport 分层；Viewport 存在时 Content 通过 viewport mount，缺少 Viewport 时 Content 直接位于 Trigger 旁；嵌套 Sub 有独立 provider；Content 本身不提供定位 CSS。[Radix NavigationMenu source](https://github.com/radix-ui/primitives/blob/main/packages/react/navigation-menu/src/navigation-menu.tsx) | 借鉴 Trigger/Content/Viewport 的 horizontal panel 结构，定位继续交给现有 Floating；不要把 Viewport 变成第二个 portal/focus owner。 |

## 统一 items 模型

保留一个数据模型，按 item kind 区分职责；不要让 `ZMenuItem` 兼任站点导航：

```ts
type NavigationItem<TKey extends SelectionKey, TValue = unknown> =
	| { kind: 'link'; key: TKey; label: string; href: string; disabled?: boolean; value?: TValue }
	| {
			kind: 'group';
			key: TKey;
			label: string;
			children: readonly NavigationItem<TKey, TValue>[];
			disabled?: boolean;
	  }
	| { kind: 'separator'; key: TKey; label?: string }
	| { kind: 'panel'; key: TKey; label: string; panel: Snippet; disabled?: boolean };
```

- `children` 表示 inline hierarchy 或 vertical side tree；它参与 logical collection，但 group 的展开状态不等于 current。
- `panel` 表示 horizontal mega/panel 内容；面板可以是 lazy snippet，只有打开时挂载；它不把 panel 内任意内容自动注册为 NavigationMenu item。
- `separator` 是非焦点结构，不进入 current/focus key 序列。
- `label` 保持文本 typeahead/accessible name；复杂可视内容通过 item/leading/trailing snippet 定制，不让数据模型承载 DOM。
- `currentKey` 表示当前 route/页面；`openKeys` 表示展开 group/panel；内部 `active/focusKey` 仅由 CollectionNavigation 拥有，三者不可互相推断。

## 三种布局的 DOM 与键盘合同

### Inline hierarchy

- 根使用 `nav`，层级使用 `ul/ol > li`；普通 link 是真实 `ZLink`，group 使用 button 或明确的 disclosure trigger。
- group 展开只显示/隐藏 children；Arrow 键是否参与树导航需单独选择，不把 `role=menu` 强加到站点导航。
- Enter/Space 激活 group disclosure；Enter 在真实 link 上保留 native href 行为。
- `currentKey` 只表达 active route；父 group 可以 `open` 但不因此变成 current。

### Vertical side flyout

- 侧栏仍是 `nav`/list；展开 group 的 button 与 link 分开，submenu 可用现有 Popover/Floating 定位。
- group 触发器拥有 `aria-expanded`/`aria-controls`；关闭时恢复触发器焦点，打开 submenu 时只把焦点交给明确的 child owner。
- `openKeys` 允许多个或按产品策略只保留一个，但该策略属于 NavigationMenu，不复用 ZMenu 的 checkbox/radio selection。
- disabled group/link 不参与 focus/current；disabled route link 不渲染可导航 href。

### Horizontal panel / mega content

- `Trigger` 是真实 button，`Content` 是与 trigger 关联的 panel；`Viewport` 只是可选的统一面板挂载/动画边界。
- pointer hover 可作为 open 请求，但 keyboard focus/Enter 必须能打开；Escape/outside 由现有 Popover/DismissableLayer 处理并恢复 trigger。
- panel 内容可以包含 headings、links、cards 和非 menu DOM；除非明确是 command menu，不设置 `role=menu/menuitem`。
- panel 定位沿用 Floating；不能假设 Radix Content 的无定位实现会自动适合 ZUI。

## Route link、current、cancel

- `href` 由调用方拥有，真实 `ZLink` 保留 Enter、modified click、上下文菜单和浏览器导航。
- current 由 `currentKey` 或调用方明确 active 计算；focus 变化不触发 current change。
- `disabled` link 去除导航能力并保留可访问 disabled 状态；不要用 `preventDefault` 模拟 disabled 后继续显示 href。
- 第一版不引入 command-style `onSelect`；如需 SPA 拦截，另设可取消的 `onNavigateRequest`，且必须尊重 Ctrl/Cmd、Shift、Alt、中键和外部 href。
- `onOpenKeysChange` 只报告 disclosure；`onCurrentKeyChange` 只在调用方确认 route 后更新，避免点击即把失败导航标成 current。

## 与现有基础合并边界

- 复用 `LogicalCollection`、`MountedElements`、`CollectionNavigation`、Provider direction 和现有 Toolbar/OverflowList 的 owner-document 生命周期。
- 命令子菜单直接复用 `ZMenuSub`、`ZMenuItem`、Popover/Floating；NavigationMenu 只提供 route/group/panel 结构适配。
- 横向 overflow 使用 `ZOverflowList`；overflow trigger 是唯一真实入口，隐藏 links 在 Popover 中继续可访问。
- 不复制 `typeahead`、outside/Escape、submenu delay、focus restore、浮层 collision 或宽度测量。
- 不让普通站点导航使用 `role=menu`：Menu role 保留给执行命令、checkbox/radio、typeahead 的 menu contract。

## CSS disclosure motion

- 通用 fallback 继续用 wrapper `display:grid; grid-template-rows:0fr/1fr`、`overflow:hidden` 和已有 Presence；`grid-template-rows` 是广泛支持的基础能力。[MDN grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-rows)
- `@starting-style` + `transition-behavior: allow-discrete` 可渐进增强首次挂载、display/top-layer 过渡，但必须由现有 Presence owner 控制 mounted/inert/focus；不能用 CSS 动画取代生命周期。[MDN @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style)
- `interpolate-size`/`calc-size()` 适合 `auto` intrinsic height 的增强；Chrome 官方资料指出需 opt-in、并要求不支持时提供 fallback。[Chrome intrinsic size](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)
- `@media (prefers-reduced-motion: reduce)` 下立即完成；forced-colors 下依靠边框/outline/原生 focus，不把 current/open 只交给颜色。
- SSR 初始 panel 状态必须稳定；不读取几何尺寸，不在 hydration 前用 CSS 猜测 active panel 高度。

## 第一批实施后的 API 收敛

已实现 `ZNavigationMenu` 的 `mode=inline/vertical/horizontal`（取代初稿 orientation）、`items`、`currentKey`、`openKeys`、`defaultOpenKeys`、`onOpenKeysChange`、`onNavigateRequest`、`expandMode`、`collapsed`、`disabled`、`overflow`、`item/start/end` snippets、实例方法与 ref。panel 属于具体 item，并与 children 在类型和 runtime 两端互斥；不提供 onCurrentKeyChange，路由 owner 自己确认并传入 currentKey。NavLink 是可单独使用的导航项。命令型 Menubar 仍是下一阶段。

横向 overflow 保留源 DOM 单实例；包含自定义 panel 的根项固定显示，More 仅重新呈现 label/icon/href 等数据，不重新执行消费者 item/start/end/panel snippets。这样避免把同一表单、固定 ID 和局部状态挂载两次；内容过多时由调用方采用 vertical/inline，或减少固定的根项。

验收必须覆盖：真实 href/modified click、current 与 focus 分离、group disabled、panel Escape/restore、RTL 水平键、SSR 无 DOM、ShadowRoot/iframe owner、窄宽度 OverflowList、reduced/forced-colors；完整浏览器验证放 CI。

官方资料：

- [Ant Menu](https://ant.design/components/menu/)
- [Mantine NavLink](https://mantine.dev/core/nav-link)
- [Radix NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu)
- [Radix NavigationMenu source](https://github.com/radix-ui/primitives/blob/main/packages/react/navigation-menu/src/navigation-menu.tsx)
- [WAI-ARIA Navigation Menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)

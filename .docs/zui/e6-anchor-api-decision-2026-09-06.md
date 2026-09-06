# E6 Anchor / ScrollSpy API 决策（2026-09-06）

本文件只记录 Anchor 的 API 与边界，不修改 `ZAnchor` 实现。目标是以原生 anchor、滚动容器和现有 owner-document 生命周期完成页面目录，不引入新的滚动引擎。

## 官方对标

- Ant Design Anchor 提供 `items`、嵌套 `children`、`getContainer`、`offsetTop`、`targetOffset`、`bounds`、`onChange`、`onClick`、`direction` 和可选 `affix`；它把滚动容器和 active link 分开配置。[Ant Anchor API](https://ant.design/components/anchor/)
- Mantine `useScrollSpy` 以 `scrollHost`、`selector`、`offset` 追踪活动 heading，返回 `active`、数据和 `reinitialize`；它没有证明组件必须拥有路由状态。[Mantine use-scroll-spy](https://mantine.dev/hooks/use-scroll-spy)
- Mantine NavLink 的 nested/active 经验只适合作为导航内容和展开样式参考；Anchor 的 section current 不应复用 NavigationMenu 的 `openKeys`。[Mantine NavLink](https://mantine.dev/core/nav-link)

## 建议统一模型

```ts
interface AnchorItem<TKey extends SelectionKey = SelectionKey> {
	readonly key: TKey;
	readonly href: string;
	readonly label: string;
	readonly children?: readonly AnchorItem<TKey>[];
	readonly disabled?: boolean;
}
```

- `href` 必须是页面内真实 fragment，例如 `#usage`; item 由调用方拥有，不能从 DOM headings 反向猜业务顺序。
- `children` 只表达目录层级；separator/group label 如有需要由 item snippet 或上层内容表达，不进入 active key。
- `currentKey`/`activeKey` 是当前可见 section 的导航状态，独立于焦点、滚动位置和路由 owner；点击后浏览器 hash/SPA 路由由调用方决定。
- 目标 section 必须真实存在且有稳定 `id`；删除或暂未挂载时清理 active，不制造悬空 `aria-current`。

## Scroll host 与 DOM realm

- `target`/`scrollHost` 由调用方提供，默认使用真实 owner document 的 `scrollingElement` 或 viewport；不要直接读取全局 `window/document`。
- 支持 `HTMLElement`、同一 owner document 的 ShadowRoot/宿主边界；所有 `getComputedStyle`、RAF、ResizeObserver、scroll listener 从 `ownerDocument.defaultView` 获取，并在切换/卸载清理。
- 对容器滚动，目标链接应使用真实 anchor；滚动调用由目标 owner/container 执行，Anchor 只负责请求和 current 观察。
- 不把 `ZAppShell`、`ZScrollArea`、`ZSplitter` 的滚动状态复制到 Anchor；调用方传入当前 scroll host。

## 点击、current 与滚动

- 原生 anchor 保留 Enter、modified click、上下文菜单、target/rel 和 hash 行为；仅在确认是同源、未修改的 SPA 请求时提供可取消导航钩子。
- `currentKey` 不因 focus 或点击自动写回；scroll spy 根据真实 section 几何发布 active，路由 owner 可以独立决定是否同步 URL。
- `scroll-margin-block-start` 应放在目标 section；`scroll-padding-block-start` 应放在 scroll container，用来避开 sticky header。两者是标准 CSS 滚动偏移，优先于 JS 像素常量。[MDN scroll-padding](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-padding)、[MDN scroll-margin](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-margin)
- smooth 只作为可选行为；`prefers-reduced-motion: reduce` 时改为 instant/auto，且用户手势中断不应被重新平滑滚动覆盖。[MDN scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior)、[MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)

## scrollend 与降级

- Element `scrollend` 在 MDN 标为 Baseline 2025，覆盖最新设备，但旧浏览器仍可能缺失；使用 `'onscrollend' in element` 或事件能力检测。[MDN Element scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)
- `scrollend` 只用于减少 active 重算或在平滑滚动结束后发布稳定状态，不能作为唯一 scroll spy 输入。基础路径仍监听 `scroll`，通过 owner Window RAF/throttle 合并。
- 如果没有 `scrollend`，以最后一次 scroll + RAF/debounce 作为近似，并允许用户滚动中 active 按 section 变化；不要等待一个永远不会来的事件。

## Sticky 与 motion 边界

- Sticky Anchor 由现有 `ZAffix` 或调用方原生 `position: sticky; inset-block-start` 拥有；Anchor 不再复制 Affix 的 observer/offset 生命周期。
- Anchor 的 `offset` 只作为 active 判定和 `scrollIntoView` 请求的语义配置；真实遮挡优先由 CSS `scroll-padding`/`scroll-margin` 表达。
- 不用 `interpolate-size`、height 测量或自定义滚动动画作为 Anchor 必要能力；目录展开使用普通 CSS/现有 Presence，reduced motion 下立即完成。

## 第一批可执行边界

最终实施使用 `activeKey/defaultActiveKey/onActiveKeyChange`、`scrollContainer`、`getTarget`、`offset`、`behavior`、`history`、`focusTarget`、`item` snippet与`ref`，并支持vertical/horizontal和嵌套children；初稿currentKey/target/smooth名称由这些更具体的名字取代。items的href始终必填，targetId只是独立定位标识。完整实施与边界见[Anchor执行记录](./execution-anchor-2026-09-06.md)。

验收覆盖：window 与 HTMLElement scroll host、owner Document/ShadowRoot、hash/SPA click cancellation、active 与 focus 分离、section 删除/动态插入后的 reinitialize、resize、RTL、reduced motion、scrollend fallback、sticky header 偏移。复杂 scroll restoration 与路由持久化由调用方拥有。

官方来源：

- [Ant Design Anchor](https://ant.design/components/anchor/)
- [Ant Design Affix](https://ant.design/components/affix/)
- [Mantine useScrollSpy](https://mantine.dev/hooks/use-scroll-spy)
- [Mantine NavLink](https://mantine.dev/core/nav-link)
- [MDN scroll-padding](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-padding)
- [MDN scroll-margin](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-margin)
- [MDN Element scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)
- [MDN scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior)

# ZBreadcrumb collapse execution record — 2026-09-06

本记录对应当前 `ui/zui/src/components/navigation/ZBreadcrumb.svelte` 的 collapse 能力 Docs 接入，仅新增 `apps/docs/src/content/components/navigation/breadcrumb/CollapseDemo.svelte` 与 `doc.ts` 中的 demo 注册，不修改组件、exports、generated、catalog 或测试。

## 实际 API 覆盖

- `collapse={false}` 保留完整路径并停止折叠。
- `collapse={true}` 使用组件默认真实宽度测量，默认 `maxRows=1`、`keepFirst=true`。
- `collapse={{ maxItems: 5, maxRows: 1, keepFirst: true }}` 展示固定端点优先的数量/行数预算。
- 首页和当前末项由组件的 protected keys 保留；`maxItems` 是预算，不承诺在固定项、长文本或窄容器下必然 `fits`。
- 隐藏祖先不是静态文本计数：组件内部的真实 Popover 入口会展示 `overflowItems`，其中有 href 的项目继续渲染为原生 `ZLink`。
- 演示外层使用可调整宽度容器，验证长路径和实际 inline-size 改变；没有创建第二个 button、重复 id 或额外 Snippet 工厂。

## 语义边界

- `item` 和 `separator` snippet 仍由组件拥有链接、`aria-current`、分隔符和列表结构；演示只使用默认语义。
- 文档不假设 `HTMLNavElement` 类型，沿用当前组件公开的 `HTMLElement | null` ref 类型。
- collapse 入口由组件内部使用 `ZPopover` 与 `ZPopoverTrigger` 管理；调用方不需要复制隐藏路径或自己维护祖先菜单。
- CSS 继续使用组件内部现有 ICSS callback `s`、主题 token 和运行时容器宽度，不新增未经 properties.ts 支持的 CSS keyword。

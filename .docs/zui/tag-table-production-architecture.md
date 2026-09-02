# Tag 与 Table 生产架构

## 责任边界

### ZTag

`ZTag` 是静态分类/状态文本与一个可选 remove 请求按钮。它不拥有：

- Tag 数组、增删状态或拖拽排序；
- TagGroup、CheckableTag、选择模型或方向键集合；
- clickable/link 根语义；
- 删除后的焦点目标；
- Badge 的 count/dot/anchor overlay。

独立 Tag 的 remove button 是普通 Tab 入口。`ZTagsInput` 等具有 LogicalCollection、方向键和删除后焦点恢复的复合 owner 才能把 `removeTabIndex` 设为 `-1`。Tag remove click 固定停止冒泡，避免删除标签时同时激活父 Card、List row 或其他组合动作；`onRemove` 只通知，是否卸载仍由调用方决定。

### ZTable

`ZTable` 是真实 HTML `table/caption/thead/tbody/tfoot` 的有限视觉壳。调用方继续直接写 `tr/th/td`、`scope`、`rowspan`、`colspan`、`id/headers` 和单元格内真实控件。

它不拥有：

- data/columns schema；
- 排序、筛选、选择、展开、分页或请求；
- sticky/fixed column/header；
- 行/列虚拟化；
- row click、cell edit、cell roving 或 clipboard；
- DataTable/DataGrid 状态机。

这些交互继续属于 `ZDataTable`、未来独立 DataGrid 或页面数据层。

## 成熟库取舍

### Tag

- 采用 [Ant Design Tag](https://ant.design/components/tag/) 的 content/close/status surface 分区与 [MUI Chip](https://mui.com/material-ui/react-chip/) 的 small/medium、delete action 和 multiline 经验。
- 保留现有五个有限 tone：`default | accent | success | warning | danger`，不接受任意颜色。
- 不复制 filled/solid/outlined 矩阵、href/clickable root、CheckableTag、TagGroup、avatar 或内部数组状态。
- 默认背景使用 `currentColor` 的低比例 `color-mix`，base surface 是不支持 color-mix 时的回退；文字和边框仍使用 Theme semantic token，因此高对比不只依赖背景。
- `small | medium` 由明确 prop 或 Provider density 解析，不接受任意像素。

### Table

- 遵循 [WAI Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/) 与 [caption guidance](https://www.w3.org/WAI/tutorials/tables/caption-summary/)：caption 是真实 table 标识，header/data cell 关系使用原生结构。
- 采用 [MUI TableContainer](https://mui.com/material-ui/react-table/) 的“table 外层横向滚动 owner”结构，但 wrapper 是否可聚焦由真实 overflow 测量决定。
- 不复制 Ant Design Table 的 dataSource/columns、scroll 配置对象、fixed/sticky、selection、pagination 和 virtual API。

## Tag Locale 与移除名称

新增 typed namespace：

```ts
interface ZuiTagLocale {
	removeTag(textValue?: string): string;
}
```

优先级：

1. 显式 `removeLabel`；
2. `localePack.tag.removeTag(textValue)`；
3. 没有 `textValue` 时 locale 返回通用“Remove tag/移除标签”。

`textValue` 只提供可访问名称上下文，不控制视觉 children。复杂视觉 children 与可读名称因此不会互相绑死。`ZTagsInput` 继续使用自己的 `tagsInput.removeTag(value)` 并把结果显式传给内部 Tag，两套 namespace 不重复拥有集合状态。

## Tag Size、Tone 与长内容

- `size` 只有 `small | medium`。未传时 compact Provider density 映射 small，comfortable/spacious 映射 medium。
- `tone` 同时驱动文字、border 与 relative currentColor 背景；默认 tone 使用普通 text/border/surface。
- root/content 都设置 `min-width: 0`、`max-width: 100%` 和安全 `overflow-wrap`，允许长 CJK、阿拉伯文和无分隔标识符换行。
- remove button 继续复用 `styleInternalAction` 焦点环与 Lucide X；disabled 只描述 remove，不把静态 span 标记为 disabled widget。
- `removeTabIndex` 运行时只接受 `0 | -1`，避免正 tabindex 或任意 Tab 顺序。

## Table Scroll Owner

`ZTable` 始终渲染稳定 wrapper，但只有 `scroll="auto"` 且测得 `scrollWidth > clientWidth + 1` 时才：

- 设置 `data-overflowing=true`；
- 建立 `role=region`；
- 使用 `scrollLabel ?? caption` 命名；
- 设置 `tabindex=0`，允许键盘用户使用原生横向滚动。

无溢出或 `scroll="none"` 时，wrapper 不加入 Tab 顺序，也没有伪造 region。`wrapperRef` 指向滚动 owner，`ref` 始终指向真实 table；所有原生 table attributes、class、style 和 ICSS carrier 继续落到 table。

已有外部滚动 owner 必须显式使用 `scroll="none"`：`ZDataTable` 的 viewport 和文档 `ApiTable` 的 API region 已这样迁移，避免嵌套横向滚动与重复 Tab 站。

测量使用 wrapper 所属 Window 的 `ResizeObserver`、resize listener 和 microtask；卸载时断开 observer/listener。SSR 初始为非溢出、非焦点 wrapper，客户端测量后再提升语义，不读取错误全局 realm。

## Caption、Density、RTL 与高对比

- caption 必填且运行时拒绝空字符串。
- `captionHidden` 不是复制 CSS：真实 caption 内复用 `ZVisuallyHidden`，caption 仍保持 table 直接子元素。
- density 完整继承 Provider 的 `compact | comfortable | spacious`，显式 prop 优先。
- RTL 依赖逻辑 text alignment、padding 与浏览器 table/scroll 行为；DOM 列和阅读顺序不反转。
- striped 只改变 tbody 偶数行 surface；边框、caption 和 header 关系仍在高对比/无背景色环境中存在。
- 单元格内交互完全由真实 ZButton/ZLink 等 owner 管理，wrapper 只在 overflow 时额外成为滚动焦点站。

## SSR 与验收

- SSR 输出稳定 wrapper、真实 caption/table sections 与 native attributes；不依赖 Window/ResizeObserver。
- browser fixture 验证 Tag locale/size/tone/stopPropagation/removeTabIndex，以及 Table ref/wrapperRef、真实 overflow 聚焦、无 overflow不聚焦、caption hidden、density/RTL和交互子控件。
- type fixture 验证有限 union、typed locale、wrapper binding 和非法值拒绝。
- 本地只执行 Prettier、WebStorm errors-only、diff-check与快速静态审计；完整 browser/SSR/type运行交由CI/CD。

# B2 / N03：ZNavLink 执行合同

日期：2026-09-06。本批把单一 `ZLink appearance="navigation"` 补成可独立复用的完整导航行；当前为 experimental，测试合同交 CI 执行。

## 最终接口

- `label: string` 是必填非空标签并始终拥有可访问名称与 compact 后备；`labelContent?: Snippet` 只替换非 compact 状态的可见标签内容。`description?: string` 提供第二行说明，`start?: Snippet` 和 `end?: Snippet` 保留本库 Button/ToggleButton 已采用的内容方位术语。组件不提供 `children` 树或第二套导航数据模型，子层、选中 key、开放 key 和面板生命周期归 `ZNavigationMenu`。
- `href?: string` 决定主元素语义：有 href 时复用真实 `ZLink` anchor；没有 href 且存在 `expanded` 或 `onExpandedChange` 时为原生 button；两者均无时为无 role、无伪 href 的被动 div。`class`、`style`、ICSS carrier、原生属性/事件和 `ref` 只落到这个主元素，双控件布局包装不冒充公共 root。
- `expanded?: boolean` 是受控子层展示事实，`onExpandedChange?(next)` 只发用户切换请求，组件不渲染或保管面板。链接同时拥有子层时，anchor 旁边渲染独立原生 disclosure button，避免 button 嵌入 anchor；无 href 时主 button 同时负责展开。
- `contentId?: string` 作为 `aria-controls` 只写到负责展开的 button；`disclosureId?: string` 为该真实 button 提供 SSR 稳定 ID，使 NavigationMenu 可以直接对齐 Popover triggerId。链接双控件分支保留原生 `id` 给 primary anchor，并把 disclosureId 写到兄弟 button；无 href 的单 button 分支使用 `disclosureId ?? 原生 id`。`disclosureLabel?: string` 为链接旁独立按钮命名，默认使用 label。`disclosureRef` 始终指向负责展开的真实 button；无 href 时它与 `ref` 指向同一元素，方便 NavigationMenu 把现有 Popover trigger/restore target 接到正确控件。
- `active?: boolean` 只产生 `aria-current="page"` 和当前页视觉；`expanded` 只产生 disclosure 的 `aria-expanded`；`disabled` 只关闭导航与展开操作。三者互不推断，组件不猜当前路由，也不把展开误当选中。
- `variant = subtle | solid | outline` 沿用现有 Button 词汇，`tone = primary | neutral | info | success | warning | danger` 控制当前页 surface、边框、文字和逻辑侧 indicator；`indicator = start | end | none` 使用逻辑方向。`size` 共用五档 `ZControlSize` 和 Provider density。
- `compact=false` 时显示完整标签、说明和 end；compact 时保留完整可访问名称与 start，隐藏标签/说明/end。未提供 start 时显示 label 的首个 Unicode 字符，避免折叠导航出现空白控件。
- 链接分支保留 `href/target/rel/download/hreflang/media/ping/referrerpolicy/type` 和浏览器修饰键行为，并复用 ZLink 的 external 图标、`target=_blank` opener 隔离及本地化新窗口提示。禁用链接继续由 ZLink 移除导航属性并阻止 click。

## 键盘、方向与焦点

anchor 使用浏览器 Enter、修饰键和目标窗口规则；button 使用原生 Enter/Space。负责展开的 button 额外接受实际渲染方向下的 ArrowRight/ArrowLeft：LTR 右开左关，RTL 左开右关；已处于目标状态、带修饰键或调用方已取消的主 button keydown 不重复请求。

方向通过 `getElementDirection` 从真实主元素读取，而不是只相信 Provider 默认值。链接旁 disclosure 被调用方切换后若同步卸载，组件用 `containsComposedNode` 确认原焦点属于本行，并在下一个 tick 回退到仍存在的主链接；正常展开时焦点留在 disclosure。减少动画由主元素所属 Window 的 `ReducedMotionState` 驱动，关闭 surface/边框和箭头过渡。

## N03 边界

该组件承接对标矩阵 N03 的 rich row：label、description、start/end、五档尺寸、semantic tone、surface/border、当前页 indicator、compact 与独立 disclosure。它不是 `ZMenu` 命令项别名，也不实现 NavigationMenu 的层级 Collection、current/open keys、collapsed owner、horizontal overflow、mega panel、Popover 或路由适配。

`ZNavigationMenu` 可用数据层决定 href/expanded/contentId，把 `disclosureRef` 接入已有 overlay trigger/restore target，并拥有子层 DOM 与键盘集合。ZNavLink 不导入 Popover、不创建 Portal、不扫描父导航，也不把自己的 `active` 或 `expanded` 写回根状态。

## 根整合

新增源码为 `ui/zui/src/components/navigation/ZNavLink.svelte`。根整合需处理公共 runtime/type/metadata 导出、catalog、generated API、Docs 和共享 Theme/default scope；本批没有修改这些共享文件。建议公开导出 `ZNavLink`、`ZNavLinkProps`、`NavLinkVariant`、`NavLinkTone`、`NavLinkIndicator` 与 `navLinkMetadata`。

## 已写但未执行的证据

- `nav-link-production.spec.ts`：SSR 真实 anchor、外链隔离、active/expanded/disabled 分离、链接旁 sibling disclosure、无 href 原生 button、被动 div 与 compact 首字符后备。
- `nav-link-production.browser.spec.ts` 与 `NavLinkProductionFixture.svelte`：修饰键 click、target/rel、原生属性/class/style/ref 的主元素所有权、无嵌套交互元素、disclosure 关系与焦点、LTR/RTL 箭头请求、无 href 单 button、compact 名称、五档实际几何和禁用状态。
- `nav-link-production-types.ts`：完整链接/button/passive 合同，以及缺 label、无效 variant/indicator/size 和禁止 nested children 的负例。

本地验证严格限制为直接 Node Prettier 和 WebStorm 受影响文件诊断；没有运行 Vitest、浏览器测试、Svelte/TypeScript 全量检查、构建或 CI。因此这里记录的是已落盘待执行合同，不能写成测试通过或稳定发布。当前会话未暴露项目说明中列出的 Svelte MCP `list-sections/get-documentation/svelte-autofixer` 工具，无法执行 autofixer；WebStorm 的 Svelte 语法/IDE 检查是本批可用的静态边界。

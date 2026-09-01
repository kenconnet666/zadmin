# ZUI 生产完成度系统修复与组件、文档站完善蓝图

状态：**Draft for review（待审阅，不代表已批准实施）**

基线：2026-09-01，`a10bed3`

范围：`@zadmin/zui`、`apps/docs`、相关 SvelteKit/WebView 消费夹具、CI/CD 与发布治理

关系：本文不替换 `system-blueprint.md`；它把当前审计发现转化为下一轮可执行的生产收口计划。两者冲突时，在本文审阅通过前仍以源码和已发布事实为准。

## 1. 结论先行

ZUI 已经具备真实组件库的工程地基，不是只有外观的样品：原生元素优先、Svelte 5 类型、ICSS、六主题、SSR/CSP/ShadowRoot、Portal/Layer、Standard Schema、FormData、键盘与焦点、固定高度虚拟化、三浏览器测试和 WebView2 验收都有实际实现。

当前仍不能把整个系统描述为“生产完成”，原因不是组件数量不够，而是下列合同没有闭合：

1. 包版本仍是 `0.1.0`，但 124/133 份 metadata 声称来自 `0.2.0`—`0.8.0`，版本事实错误；
2. 133 份 metadata 中 125 份为 `experimental`，稳定面没有冻结；
3. 受控状态无法可靠表达“外部把值清空为 `undefined`”；
4. Provider 暴露的 density、contrast、translations 只部分或完全没有被组件消费；
5. Form 仍是扁平字段模型，Collection、Selection、Virtualizer 也没有形成统一逻辑集合；
6. Layer 的父子图、跨 realm、集中监听和反馈服务生命周期没有收口；
7. 文档页有真实 Demo 和生成 API，但 Demo 只满足最低数量，不证明组件能力完整；
8. 文档站仍是一次加载全部 Doc/Demo/源码的 Hash SPA，缺少版本化、迁移、发布说明、真实搜索和移动导航；
9. 当前 HEAD 的远程门禁仍失败，后续 Docs E2E、全构建和部分 package acceptance 被串行跳过；
10. API、Demo、测试、版本和稳定状态之间没有机器可执行的逐组件成熟度矩阵。

因此下一阶段不继续无目标堆组件。先修共享内核和事实合同，再按组件族逐一从 experimental 晋级 stable，最后只补真实后台产品高频缺口。

## 2. 审计证据基线

### 2.1 代码与文档规模

| 指标 | 当前值 | 解释 |
| --- | ---: | --- |
| Svelte 组件文件 | 135 | 包含根组件与 compound member |
| 公开 metadata | 133 | API 快照记录的公开组件单元 |
| 文档组件族页面 | 78 | compound member 合并到组件族页面 |
| 真实同源 Demo | 171 | Demo 与复制源码来自同一 Svelte 文件 |
| Stable metadata | 8 | ZProvider、ZBox、ZText、ZIcon、ZButton、ZInput、ZField、ZStack |
| Experimental metadata | 125 | 占 94.0%，不能批量改标签掩盖缺口 |
| 2 个 Demo 的页面 | 63 | 当前门禁的最低值 |
| 3 个 Demo 的页面 | 15 | 当前最高值，没有页面超过 3 个 |
| 官方主题 | 6 | 两套亮色、两套暗色、两套高对比 |
| Form value 组件文件 | 24 | 只有 10 个消费 ZField context |
| API metadata 漂移 | 32 组件 / 约 180 props | 排除 class/style 与小写原生事件后的公开 Props 缺项 |

`defineComponentDoc` 只要求 `demos.length >= 2`、ID 唯一和源码非空，见 `apps/docs/src/framework/component-doc.ts`。它没有描述 Demo 覆盖了哪些状态、API 或交互。

### 2.2 版本事实

`ui/zui/package.json` 当前为 `0.1.0`，metadata 的 `since` 分布为：

| since | 数量 |
| --- | ---: |
| 0.1.0 | 9 |
| 0.2.0 | 21 |
| 0.3.0 | 35 |
| 0.4.0 | 32 |
| 0.5.0 | 8 |
| 0.6.0 | 5 |
| 0.7.0 | 18 |
| 0.8.0 | 5 |

当前 15 份 ZUI Changeset 全是 `minor`。从 `0.1.0` 合并发布时只会产生一次最高级别 bump，而不会依次制造 `0.2.0`—`0.8.0` 的历史。因此 metadata 把开发阶段编号误当成了真实 SemVer。

### 2.3 WebStorm 与真实 Chrome

本轮通过 WebStorm 的 `dev (2)` 配置启动 `apps/docs`，Vite 监听 `http://localhost:5174/`。WebStorm 对 App、ComponentPage、FormControl、ZProvider、ControllableState、FormRegistry、LayerStack 和 Virtualizer 等关键文件的 error 级检查未发现语法错误；这只证明 IDE 静态状态干净，不等于生产合同通过。

真实 Chrome 观察：

- 首页、ZNumberField 页和 Theme Lab 均能渲染，控制台没有新增 error/warning；
- Theme Lab 能展示 6 套主题和 theme、scheme、contrast、density、motion、direction、locale 轴；
- 1440px 桌面布局基本正常；
- 默认约 932×911 视口中，主题按钮计算高度为 94px，超过 68px 顶栏并覆盖下方内容；
- 390×844 视口没有 document 级横向溢出，但搜索框只剩约 78px，87 个导航链接退化为单行横向滚动，首页主内容高度接近 1.9 万像素；
- 移动端组件页 TOC 直接隐藏，无法快速访问 Demo/API/可访问性段落。

### 2.4 当前远程 CI

当前 HEAD 对应的已结束运行是 [CI run 33321897676](https://github.com/kenconnet666/zadmin/actions/runs/33321897676)，不是仍需等待的运行。结果：

- Windows C# WebView2 desktop 成功；
- Workspace 类型/Svelte、lint/format、源码审计成功；
- 全 workspace tests 失败：14 项失败、479 项通过、2 项跳过；
- NumberField locale/reset、Popover `matchWidth`、Field reset 回调计数在三引擎失败；
- WebKit 另有 Transfer 和 Command 失败；
- Docs E2E、全构建和生成文件检查因前置失败被跳过；
- acceptance 中 API contract 成功，ZUI coverage 失败，后续 bundle/SSR/publish/package 项被跳过。

按既定工作流，实施期间不等待 CI；每次下一次正常推送时查看上一轮结果并处理明确失败。发布 SHA 则必须拥有完整全绿证据。

## 3. 参考系与取舍原则

### 3.1 参考多个成熟库，但不求 API 并集

| 参考 | 采用的思想 | 不采用的部分 |
| --- | --- | --- |
| [Ant Design](https://ant.design/components/overview/) | 企业后台组件谱系、ConfigProvider、Form/Table/Date/Overlay 的场景覆盖、When To Use、Semantic DOM、Design Token、Changelog/Migration | React API、全局静态 service、全部语法糖、为目录对齐而加组件 |
| [Naive UI](https://github.com/tusen-ai/naive-ui) | 类型安全主题覆盖、Provider 服务、90+ 组件的 Demo 密度、数据组件的虚拟列表意识 | Vue emits/slots 形态、内部实现和依赖选择、无差别复制所有组件 |
| [MUI](https://mui.com/material-ui/customization/overriding-component-structure/) | 一致的结构扩展思想、Core/X 能力边界、版本与弃用治理、明确说明“不支持所有组件” | `sx`、Emotion、任意 `slotProps`、React ownerState 和过大的 theme component override |
| WAI-ARIA APG / React Aria | 角色、状态、键盘、焦点、逻辑 Collection 与 Selection 模型 | 直接依赖 React runtime 或照抄 React hook API |
| 旧 ZUI | 一个组件多个示例、中文后台使用场景和可读文档密度 | 旧 API、旧视觉、旧依赖和历史实现债务 |

### 3.2 固定原则

1. 优先顺序保持：平台原生 API → 现有依赖的稳定 API → 薄适配 → 自研 runtime；
2. ZUI 继续自行拥有 DOM、Svelte 状态、键盘、ARIA、FormData、ICSS 和主题；
3. 参考成熟库的职责与场景，不复制其框架相态；
4. 同类 API 必须统一，不为单组件保留偶然命名；
5. 复杂能力通过共享 primitive 实现，不在 Select、Menu、Tree、DataTable 中分别复制；
6. 不为所有视觉变化增加 prop；优先 Theme token、recipe variant、data-state、part 和 snippet；
7. 不做自动字节大小预算；只持续记录构成与 delta，明显异常人工审计，错误依赖边界继续硬失败；
8. 所有图标使用 `@lucide/svelte`。仅允许 ZProgress 这类数据可视化在 allowlist 内使用语义 SVG，禁止手画图标；
9. 动画必须有用途、可中止、可清理，并支持 reduced motion；不为了“成熟感”随意增加渐变和动效；
10. 文档站优先 dogfood ZUI；若现有 API 无法支撑文档产品，先补通用 API，再替换文档自绘实现。

## 4. 生产成熟度合同

### 4.1 生命周期

公共用户只需要理解四种状态：

```text
experimental -> stable -> deprecated -> removed in a major release
```

`candidate` 和 `approved` 保留为内部 roadmap 状态，不进入包根入口和公开组件目录。公开 metadata 的状态语义：

- `experimental`：可用但 API 可变；缺口必须公开，证据不得倒退；
- `stable`：适用能力全部有实现、文档和测试证据，遵循 SemVer；
- `deprecated`：仍可使用，必须给 replacement、deprecatedSince、removalTarget 和 migration；
- stable API 至少经历一个兼容窗口后才能移除。

根入口边界的推荐决策：1.0 前将 stable 与 experimental 明确分层；根入口默认只承诺 stable，实验组件由 `@zadmin/zui/experimental` 或显式实验导出进入。最终形式在 B0 阶段用真实消费者迁移成本确认。

### 4.2 Profile 驱动的能力矩阵

不要给 133 个 metadata 手写大量真假布尔值。每个组件声明一个或多个 profile：

```ts
type ComponentProfile =
	| 'primitive'
	| 'form-control'
	| 'collection'
	| 'layer'
	| 'animated'
	| 'virtualized'
	| 'data-view'
	| 'service';
```

profile 自动推导适用能力：

```text
basic-render
variants-and-states
native-props-and-ref
controlled
uncontrolled
external-clear
disabled
readonly
invalid
loading
keyboard
focus-visible
focus-entry-restore
form-data
form-reset
validation
rtl
locale
density
high-contrast
full-motion
reduced-motion
portal
outside-dismiss
escape
nested-layer
scroll-lock
ssr
shadow-root
hmr
webview
large-data
resource-cleanup
```

允许 waiver，但必须包含原因、责任人/issue 和过期日期。禁止用裸 `false` 逃避 stable 门禁。

### 4.3 证据模型

```ts
interface DemoDefinition {
	id: string;
	title: string;
	description: string;
	component: Component;
	source: string;
	covers: readonly Capability[];
	auditScenarios?: readonly AuditScenario[];
}

interface ContractEvidence {
	component: ComponentId;
	capabilities: readonly Capability[];
	environments: readonly EvidenceEnvironment[];
	source: string;
}
```

CI 生成：

```text
component × capability × demo × unit × chromium × firefox × webkit × SSR × WebView
```

规则：

- experimental：矩阵显示缺口，新增变更不得让已有证据倒退；
- stable：所有适用能力必须同时有 Demo 和自动化/静态证据；
- 晋级 stable 的 PR 一次性通过严格矩阵；
- README、指南和组件 Demo 的代码片段进入可编译 fixture；
- Docs 直接消费生成的矩阵，不再维护第二份“已完成”叙述。

## 5. 共享架构修复

### 5.1 ControlledState：先修所有选择型组件的状态所有权

当前 `ControllableState.current` 使用 `read() ?? fallback`。这无法区分“未受控”与“受控值就是 undefined”，影响 Select、Combobox、RadioGroup、Tabs、Accordion、Calendar/Date/Time、NumberField、Segmented、TreeSelect 和 DataTable sort。

统一决策：

1. 内部使用 `UNSET` 哨兵表达没有受控 owner；
2. 允许空值的公共 API 统一采用 `null` 或明确的 empty sentinel；不得由每个组件自行选择；
3. 统一 `value/defaultValue/onValueChange`、`open/defaultOpen/onOpenChange`；
4. 明确运行时 controlled↔uncontrolled 切换策略，并在开发环境警告；
5. reset 必须回到捕获的 default，而不是最近 fallback；
6. 覆盖外部清空、owner 回写、异步回写、form reset 和组件卸载。

### 5.2 Provider：让已公开轴真实生效

当前组件消费者数量：density 0、contrast 0、translations 1、motion 23、locale 16、direction 20、portalContainer 4。

统一决策：

- 建立类型安全 `ZuiLocalePack`，值允许参数化函数，不再使用无约束 `Record<string,string>`；
- Calendar/Date、Select/Collection、Transfer、Upload、Command、Carousel、Tour、Toast、DataTable 等默认文案全部进入 locale pack；
- 普通 locale 与 date locale/time hour-cycle 分层，TimeField 不再硬编码 24 小时制、Hour/Minute/Second、AM/PM；
- 对用户可见默认文本和 ARIA label 增加“组件内不得硬编码英文”的静态门禁，允许显式业务 prop 覆盖；
- 增加显式、SSR 稳定的 `timeZone` 轴；
- density 只在组件没有显式 size/density 时决定默认尺寸；显式 prop 优先；
- contrast 通过 Theme/token 解析生效；若没有独立语义则从 Provider 公共 API 移除；
- component defaults 只允许少量真正全局的行为，不引入 MUI 式任意 defaultProps 字典；
- 动态切换 locale/direction/density/contrast/motion 必须在真实组件上更新。

### 5.3 Form：从扁平注册表升级为字段图

必须补齐：

1. `FieldPath = readonly (string | number)[]` 与稳定序列化；
2. Standard Schema 完整 issue path 映射；
3. 字段实例 ID 与 HTML `name` 分离，允许数组、同名 checkbox 和动态列表；
4. field-level touched、dirty、validating、errors、warnings、success；
5. 字段依赖图、增量验证和 per-field async race token；submit 仍可全表验证；
6. 按实时 DOM 顺序首错聚焦；
7. 泛型 `ZForm<TInput,TOutput>` 或可推导 schema 输出；
8. controller：`validate`、`validateField`、`reset`、`setErrors`、`focusField`、`scrollToField`；
9. 统一 `FormValueBridge`，替代 19 个组件各自的 hidden input/reset 实现；
10. 保留 Standard Schema 与原生 FormData，不复制 Ant Form 的规则 DSL 和私有值 store。

#### FieldControl owner 必须显式化

当前 `useZField()` 只被 Input、Textarea、Checkbox、Switch、Slider、RadioGroup、Pin/Number/Date/Time Field 等 10 个组件消费；Select、Combobox、MultiSelect、Cascader、ColorPicker、DatePicker、DateRangePicker、FileUpload、Segmented、TagsInput、Transfer、TreeSelect 等表单组件不会继承外层 Field 的 controlId、description、error 和 invalid。

同时，ZInput 会自动把 `name ?? field.name` 写到原生 input。ZTransfer 内部两个仅用于过滤的 ZInput 没有显式 name，因此会继承外层 ZFormField.name；用户的 source/target 搜索词可能与 Transfer hidden values 一起进入 FormData。

修复决策：

1. compound root 是唯一 FieldControl owner，内部辅助输入不得自动参与外层字段；
2. 新增显式 `FieldControlBridge`/attachment，传递 id、aria-labelledby/describedby、invalid、required、register 和 form participation；
3. 支持 `formParticipation: 'owner' | 'auxiliary' | 'none'` 的内部类型合同，但不把该底层 prop 暴露成所有用户组件的噪音；
4. Select/DatePicker/Transfer 等由 root trigger/control 消费 Field；其内部搜索、日历和按钮标记为 auxiliary；
5. FormData 测试必须拒绝任何内部查询词、草稿、typeahead buffer 或 presentation value 泄漏；
6. Field label 点击必须聚焦组件声明的主 control，而不是第一个偶然的内部 input。
7. size/state 优先级固定为：组件显式 prop > Field > Provider > 组件默认值；ZField.size 必须通过控制桥真正影响 control。

### 5.4 Collection、Selection、ActiveDescendant 与 Virtualizer

当前 Collection 只包含已挂载 DOM，无法表示虚拟窗口之外的项目；Selection 工具几乎没有组件消费者。

新分层：

```text
LogicalCollection   完整数据、key、disabled、textValue、group
MountedElements     key -> element，仅记录当前挂载节点
SelectionModel      single/multiple/all/range、anchor、disabled过滤
ActiveDescendant    activeKey、稳定id、scrollToKey、挂载提交
Virtualizer         key/index滚动、挂载完成通知、固定/估算尺寸
```

Select、Combobox、MultiSelect、Command、Mention、Transfer、Tree、Cascader、TreeSelect 和 DataTable 必须消费同一逻辑层。小集合可以不虚拟化，但不能因此拥有另一套选择语义。

### 5.5 LayerManager、Portal、FocusScope 与跨 realm

当前 `parentId` 被记录但没有参与计算，`isPointerBlocked` 没有消费者；每个 DismissableLayer 各自注册三类 document 捕获监听，部分实现使用 global Node/HTMLElement/Document。

新架构：

- 每个 ownerDocument 一个 LayerManager 和一组集中监听；
- 显式 parent-child/branch 图；
- topmost Escape、outside pointer/focus、pointer blocking 和 modal focus scope 统一派发；
- 所有 realm 判断来自 `ownerDocument.defaultView` 或 nodeType；
- Portal、ShadowRoot、iframe/WebView document 作为一等边界；
- Trigger 默认仍是 ZButton，但增加类型受控的 Svelte attachment/snippet，接收 ARIA、event 和 ref；
- 不采用任意 `asChild`，开发环境校验触发元素是否具备合法交互语义。

### 5.6 Presence 与反馈服务

Presence 统一管理 entering/present/exiting/unmounted；动画结束、取消、reduced motion、卸载都必须收口。Dialog、Drawer、Popover、Tooltip、Accordion、Toast 使用同一生命周期语义。

Toast/Toaster 重构为：

```text
queued -> visible -> exiting -> removed
```

- 只有 visible 时开始计时；
- hover/focus/document visibility 暂停剩余时间；
- Portal 到 Provider 容器；
- 支持 update/dismiss/clear/promise task；
- Toast 和 Notification 共用 queue 内核、采用不同展示策略；
- live region 去重并限制连续 assertive 公告；
- 保持显式 Provider/Queue 为主，可提供安全的应用级 facade，不引入不可隔离静态单例。

### 5.7 Motion、焦点、高对比与图标

- 保留现有 focus-visible token 和 `styleInternalFocusRing`，不为已经可由 CSS 平台完成的 modality 再造 JS；
- 为 Press、ActiveDescendant、Tooltip hover intent 建立共享 controller，消除各组件 Enter/Space/hover timer 重复；
- WAAPI 和 CSS transition 全部使用 Theme duration/easing token，不保留 800/1000/1200/1400ms 等散落周期；
- 每个 animated profile 都验证 full/reduced 两条路径和 cleanup；
- forced-colors、高对比主题与 focus ring 进入代表性视觉/行为矩阵；
- inline SVG source audit 采用 allowlist：图标必须来自 `@lucide/svelte`，数据图形可保留语义 SVG。

### 5.8 公开入口和工具链 ABI

- `exports` 从 `./*` 改为显式白名单；
- 将当前 `internal` 重命名并冻结为职责明确的 `compiler-runtime` 工具链 ABI，或完全移出外部 exports；
- theme、layer、code 等子入口要么正式文档化和版本化，要么移除；
- 禁止多层 deep import；
- API 快照从纯 SHA 扩展为可语义 diff 的结构化 JSON；
- diff 计算最低 Changeset bump，并验证 default、required、type、part/state、deprecation 和 migration。

### 5.9 DataTable 与 DataGrid 的边界

ZTable 继续作为小而稳定的原生 table 视觉壳。ZDataTable 的近期职责是后台常用 table：

- sort/filter/pagination/server state；
- loading/empty/error；
- selection、expand、column visibility/resize、sticky/fixed；
- 固定高度虚拟化与长文本；
- state persistence 由调用方或显式 adapter 拥有。

二维焦点、单元格编辑、列/行分组、聚合、pivot、clipboard、Excel、超宽列虚拟化属于 DataGrid/X 轨道。先用真实需求决定独立 `@zadmin/zui-data-grid` 或显式实验入口，不把 MUI X 全部能力一次塞进 ZDataTable。

## 6. 文档站产品与架构重构

### 6.1 路由、构建与按需加载

当前 `catalog.ts` 静态导入 78 个 Doc 模块；Doc 又静态导入 171 个 Demo 组件和同一批 `?raw` 源码。首页因而把全站 Demo 与源码带入初始依赖图。Hash fragment 不会发送给服务器，`llms.txt` 中的 hash 地址也不能成为独立可抓取内容页。

推荐迁移到 SvelteKit prerender；若迁移成本需要分批，先建立同样的数据边界：

```text
ComponentSummaryManifest  名称、状态、分类、摘要、轻量搜索字段
ComponentDocManifest      页面长文、API结构、成员索引
DemoModule                路由命中后加载真实组件
DemoSource                展开源码时再加载
```

最终必须得到：

- 真实 pathname、每页 HTML/head/canonical/OpenGraph；
- sitemap、robots、Markdown/LLM 内容端点；
- latest、release version 和 commit SHA 绑定；
- 源码链接固定到当前 release tag/SHA，不永远指向 `master`；
- PR preview、release docs、部署后 smoke、可回滚构建标识；
- nav、search、sitemap、llms、E2E 路由全部从同一 manifest 生成。

### 6.2 全站搜索必须 dogfood ZCommandPalette

当前搜索只对 name、summary、category、status、keywords 和根 Props 做 `includes`。新的索引层级：

```text
Guide -> Component family -> Member -> Demo -> API member ->
Prop/Event/Binding/Snippet/Part/State/Keyboard -> Accessibility
```

要求：

- 权重、别名、中文/英文关键词、模糊匹配和命中片段；
- `/` 与 Ctrl/Cmd+K、方向键、Enter、Escape；
- 查询状态进入 URL，可分享；
- 结果项显示类型、分类、状态与摘要；
- 大索引使用 ZCommand + ZVirtualList；
- 指南、compound member、Demo 和可访问性文本进入索引。

### 6.3 移动导航与响应式

- Header 保留品牌、搜索、菜单和压缩后的主题/显示入口；
- 使用真实 ZDrawer 承载 87 个导航链接和分类层级；
- 当前项自动展开并滚入视口；
- 组件页 TOC 改为可展开“本页目录”，不在窄屏直接消失；
- 修复 48—68rem 中间断点的主题按钮纵向塌缩；
- 390px 验证触摸滚动、搜索、菜单、当前项恢复和深层组件定位，而不只验证“没有 document 溢出”。

### 6.4 ComponentFamilyDoc 与 MemberDoc

当前 compound member 的 props 被并入 API 表，但 member 的 source、since、status、dependencies、summary 和 import 身份被丢弃。新的页面模型：

```ts
interface ComponentFamilyDoc {
	family: ComponentMemberDoc;
	members: readonly ComponentMemberDoc[];
	whenToUse: readonly string[];
	whenNotToUse: readonly string[];
	decisions: readonly string[];
	limitations: readonly string[];
	composition: readonly ComponentLink[];
	demos: readonly DemoDefinition[];
}

interface ApiItemMetadata {
	name: string;
	type: string;
	default?: string;
	since: ReleasedVersion | 'unreleased';
	deprecatedSince?: ReleasedVersion;
	replacement?: string;
	removeIn?: string;
	requires?: readonly string[];
	conflictsWith?: readonly string[];
	nativeFrom?: string;
	demoIds: readonly string[];
}
```

每个组件页固定具有：

1. 状态、当前版本、首次发布和支持级别；
2. When to use / When not to use；
3. 安装、import 与 component member 索引；
4. 多个按能力拆分的真实 Demo；
5. Props、events、bindings、snippets、parts、states、keyboard；
6. 焦点、ARIA、FormData/reset 和 locale/RTL 合同；
7. Theme token、recipe part 与可定制边界；
8. SSR/CSP/HMR/ShadowRoot/WebView 支持；
9. 限制、常见误用、相邻组件选择；
10. Changelog、deprecated/migration、Issue/Edit/Feedback；
11. 上一个/下一个组件和面包屑；
12. API 行与覆盖它的 Demo/测试互链。

### 6.5 Demo 不是固定数量，而是能力覆盖

Ant Button 当前约 15 个示例主题，[Naive UI Button](https://github.com/tusen-ai/naive-ui/tree/main/src/button/demos/enUS) 有 18 个独立 Demo；Naive DataTable 的示例覆盖异步、受控排序/筛选/分页、列拖拽、固定列、编辑、汇总、树和横纵虚拟化。ZUI 不设置“每页至少十个”的形式指标，但高复杂度页面不能继续用两个近似 Demo 通过门禁。

建议最低场景模板：

| Profile | 必须证明的 Demo 维度 |
| --- | --- |
| primitive | 基础、变体/尺寸、语义与原生属性、主题/高对比 |
| form-control | controlled/uncontrolled、clear、disabled/readonly/invalid、FormData、reset、validation、locale/RTL |
| collection | 键盘、typeahead、disabled 跳过、动态/空/异步、大数据或明确上限 |
| layer | controlled open、placement、Portal、nested、outside/Escape、焦点进入/恢复、scroll、RTL |
| animated | full/reduced、enter/exit、快速切换/卸载 cleanup |
| data-view | loading/empty/error、长文本、响应式、server ownership、large data |

### 6.6 Theme Lab 变成完整 token 工作台

保留 6 套主题与偏好轴，扩展为：

- color、typography、spacing、radius、shadow、size、motion、z-index；
- token 用途、alias 与引用关系；
- global token 与 component recipe token 分层；
- 主题/高对比差异对比；
- 编辑、重置、导入/导出和可复制 ZProvider/Theme 代码；
- 全组件代表性预览，不把 78×6 全量截图变成高维护门禁；
- locale、timeZone、density、RTL 和 motion 控件必须驱动真实组件。

### 6.7 版本、迁移和反馈闭环

新增公开页面：

```text
Changelog
Migration / Upgrade
Deprecated APIs
Version Support
Browser / Node / Svelte / WebView Support
Release Notes
```

Header 显示当前版本。Demo 增加 reset、编辑/反馈链接、最小复制例和环境说明。反馈 URL 自动带组件、版本和浏览器，但不得自动传输敏感日志。

## 7. 78 个组件族逐项完善矩阵

说明：P0 是共享合同或当前发布阻塞；P1 是 stable 晋级前必须补；P2 是完善产品体验；Keep 表示实现边界合理，重点补文档与证据。每项仍须经过 profile/capability 矩阵，不以本表替代测试。

### 7.1 Gene 与 Layout（14）

| # | 组件 | 优先级 | API / 架构决策 | 文档和 Demo 必须覆盖 |
| ---: | --- | --- | --- | --- |
| 1 | ZProvider | P0 | typed locale pack、timeZone；density/contrast 真正生效；ownerDocument/portal；保留小型全局 defaults | 嵌套 Provider、动态 locale/RTL/density/contrast/motion、SSR/ShadowRoot、6 主题 |
| 2 | ZBox | Keep | 保持真实 div 与 ICSS carrier；不增加 `sx` 和无限多态 | 原生属性、class/style/ICSS、嵌套 theme、SSR、布局组合 |
| 3 | ZText | P0 | 修复 README `as="h1"` 漂移；推荐保持 body/inline 语义，新增独立 ZHeading 候选而非退化类型 | 元素映射、size/weight/tone、截断、长文本、可访问标题取舍 |
| 4 | ZIcon | Keep | 保持 Lucide 子路径与装饰/具名语义；自动治理 manifest | decorative/named、尺寸、颜色继承、RTL 是否镜像、非法 icon 审计 |
| 5 | ZCode | P1 | Shiki 保持可选 peer 和独立入口；明确 async highlighter、fallback、copy API | inline/block、语言、无 Shiki、SSR/CSP、错误 fallback、长代码与复制 |
| 6 | ZButton | P1 | `variant + tone + size + shape` 正交；danger 不再占 variant；默认 loading 使用 ZSpinner；保留原生 button | 基础、全部变体/尺寸、loading 延迟/图标、start/end、full width、form type、disabled、键盘、reduced motion |
| 7 | ZToggleButton | P1 | 统一 pressed/defaultPressed/onPressedChange 与 ControlledState；明确与 Segmented/Toolbar 的边界 | 受控/非受控、pressed/disabled、图标按钮、ARIA pressed、键盘、动态 owner |
| 8 | ZLink | P1 | 保持原生 anchor；统一 tone/underline/external/disabled 策略，target 安全提示 | 内外链、下载、当前页、键盘焦点、长链接、图标、disabled 取舍 |
| 9 | ZSeparator | Keep | 保持语义/装饰模式，不增加视觉语法糖 | horizontal/vertical、decorative、具名 separator、高对比 |
| 10 | ZVisuallyHidden | Keep | 保持单一职责；验证 focusable 模式是否真实需要 | screen reader 文本、跳转链接、可聚焦内容、打印/高对比 |
| 11 | ZKbd | Keep | 保持展示语义；可增加组合 snippet，不猜平台按键 | 单键、组合键、平台替代文本、与 Command shortcut 组合 |
| 12 | ZStack | Keep | 继续统一 Flex/Space；如需响应值采用类型化 breakpoint，不新增重复 ZFlex/ZSpace | direction/align/justify/wrap/gap、数字 gap、RTL、嵌套布局 |
| 13 | ZAspectRatio | Keep | 保持原生比例容器；校验正有限 ratio | 图片/视频/自定义内容、响应式、非法 ratio、无内容 |
| 14 | ZContainer | P2 | 明确 max-width/gutter token 与嵌套行为；响应式值只按真实需求加入 | 尺寸、gutter、全宽、嵌套、窄屏、长内容 |

### 7.2 Input 与 Form（27）

| # | 组件 | 优先级 | API / 架构决策 | 文档和 Demo 必须覆盖 |
| ---: | --- | --- | --- | --- |
| 15 | ZCalendar | P0 | 修 ControlledState 空值；Provider timeZone/locale；统一日期禁用与 focusedValue；range 与 picker 协作 | controlled/clear、min/max/disabled、键盘矩阵、locale/RTL/timeZone、outside dates、range、FormData |
| 16 | ZCascader | P1 | 接入 LogicalCollection/Selection/Virtualizer；补 clear、异步/lazy 节点和完整 disabled path | 基础/多级、受控清空、搜索、lazy/loading/error、大数据、键盘、FormData/reset |
| 17 | ZCheckbox | P1 | 统一 checked/defaultChecked/indeterminate；FormValueBridge；新增 ZCheckboxGroup 候选 | 单值/数组、indeterminate、invalid/disabled、group、reset、native change、键盘 |
| 18 | ZColorPicker | P1 | 明确颜色值规范与 alpha；统一 Popover/clear/FormValue；文案进 locale pack | hex/alpha、受控、非法草稿、键盘原生控件、FormData、locale、outside/Escape |
| 19 | ZCombobox | P0 | LogicalCollection、async、virtual、clear、readonly、group；保持输入值与选择值双状态 | input/value/open 三受控轴、freeform 取舍、IME、async、empty/loading、键盘、FormData、large data |
| 20 | ZDateField | P0 | 修空值；timeZone/locale；明确 granularity、placeholderValue 和 segment contract | 手输/方向键、clear、readonly/disabled/invalid、locale/hour cycle、reset、边界日期 |
| 21 | ZDatePicker | P0 | 复用 DateField + Calendar；支持 clear/readOnly/timeZone；统一 open/value owner | 选择/手输、clear、min/max、locale/RTL/timeZone、outside/Escape、FormData/reset |
| 22 | ZDateRangePicker | P0 | partial range、clear、timeZone；统一 start/end validation；多月仅后续按需求 | 起止选择、反向规范化、部分值、受控、禁用范围、locale/RTL、FormData/reset |
| 23 | ZField | P0 | stable 组件仍需对接新 FieldPath；messages 支持 error/warning/success 与 snippets；label placement 可选 | label/description/messages、required/optional、多个消息、动态验证、首错聚焦、嵌套字段 |
| 24 | ZFileUpload | P1 | 明确 FilePicker/Upload 产品命名；如保留 Upload，建立 file status、progress、abort/retry 和 transport adapter | click/drop、type/size/count/duplicate、受控队列、上传中/失败/重试、键盘、FormData/reset |
| 25 | ZForm | P0 | FieldPath/动态数组/同名字段、增量验证、typed output、controller、FormValueBridge | submit/change/blur、异步竞态、动态字段、依赖、reset、server errors、首错 focus/scroll、原生提交 |
| 26 | ZInput | P0 | 作为 stable 基线迁移到新 ControlledState/FormValueBridge；统一 native/custom callback 文档 | value/defaultValue、外部清空、IME、readonly/disabled/invalid、prefix/suffix 取舍、FormData/reset |
| 27 | ZInputGroup | P1 | 定义 add-on/control 的唯一 Field owner、焦点环和 invalid 合并；防止不合法嵌套 | 前后 add-on、多个控件、disabled/invalid、键盘焦点、响应式、Field 集成 |
| 28 | ZMention | P1 | 复用 ActiveDescendant/Collection；async suggestions、virtual、大文本与 IME | trigger、多关键词、async/loading/empty、键盘、IME、受控、textarea 集成、large data |
| 29 | ZMultiSelect | P0 | LogicalCollection/virtual；clear、readonly、group、maxTagCount/overflow；统一 values 命名 | controlled/clear、搜索、tag overflow、disabled item、async、keyboard、FormData 多值/reset |
| 30 | ZNumberField | P0 | 先修当前 locale/reset CI；ControlledState 空值；明确 precision、clamp/allowOutOfRange、parser/formatter | locale 小数、focus/edit/display、step/Page 键、货币、空值、readonly/invalid、FormData/reset |
| 31 | ZPinInput | P1 | 统一 length/paste/OTP autocomplete、readonly、mask、安全说明；FormValueBridge | 粘贴、删除、方向键、移动端 OTP、受控/clear、invalid/disabled/readonly、reset |
| 32 | ZRadioGroup | P0 | ControlledState 空值；逻辑 Collection；options shorthand 可作为便利层；统一 required/FormValue | 单选、受控清空、orientation/RTL、disabled item、keyboard、invalid、FormData/reset |
| 33 | ZSegmented | P0 | ControlledState 空值；item model、disabled/icon、明确是否允许无选择；接 FormValue | options、受控、图标/文本、disabled、keyboard/RTL、FormData/reset、窄屏 |
| 34 | ZSelect | P0 | LogicalCollection/virtual；clear/readonly/group/separator/loading；typed trigger attachment 只在必要时 | controlled/clear/open、groups、async/loading/empty、typeahead、keyboard、FormData/reset、large data |
| 35 | ZSlider | P1 | 保持原生单值 range；marks/vertical 按需求；范围选择新增 ZRangeSlider，不扭曲单值 API | min/max/step、RTL、键盘、invalid/disabled、FormData/reset、格式化值、触摸 |
| 36 | ZSwitch | P1 | 统一 checked/defaultChecked、loading 是否真实需要；locale 化 label 由 Field 提供 | controlled、disabled/invalid、label、keyboard、FormData/reset、RTL、reduced motion |
| 37 | ZTagsInput | P1 | 复用 Collection/Press；duplicate/max/validate/transform；明确 draft 受控语义 | add/remove/edit、paste、多分隔符、IME、invalid/readonly/disabled、FormData/reset、大量 tags |
| 38 | ZTextarea | P1 | autosize 使用 ownerDocument，不再猜 global body；统一 minRows/maxRows 与 ControlledState | value/default、IME、autosize、readonly/invalid/disabled、长文本、FormData/reset、ShadowRoot |
| 39 | ZTimeField | P0 | 修空值；locale/hourCycle/granularity；time 本身无 zone，但与 Provider locale 明确协作 | 12/24h、seconds、clear、readonly/invalid、方向键、FormData/reset、locale/RTL |
| 40 | ZTransfer | P0 | 先阻止内部搜索 ZInput 继承 Field name 并污染 FormData；再复用 Selection/Virtualizer，定义 async 边界 | 基础、多选、搜索不提交、select all、disabled、受控、large data、FormData/reset、locale |
| 41 | ZTreeSelect | P0 | LogicalCollection/Tree model/virtual；clear、async children、selection/expanded 双状态收口 | controlled clear、expand/select、lazy/loading/error、keyboard/typeahead、FormData/reset、large tree |

### 7.3 Navigation（9）

| # | 组件 | 优先级 | API / 架构决策 | 文档和 Demo 必须覆盖 |
| ---: | --- | --- | --- | --- |
| 42 | ZAccordion | P0 | 修 ControlledState 空值；统一 single/multiple/collapsible；Presence 使用共享生命周期 | single/multiple、controlled clear、disabled item、dynamic item、keyboard、nested、full/reduced motion |
| 43 | ZCommand | P1 | 接入 LogicalCollection/ActiveDescendant/Virtualizer；typed item snippet；async 结果由调用方拥有 | filter/ranking、groups、keyboard、async/loading/empty、custom item、large data、locale |
| 44 | ZCommandPalette | P1 | ownerDocument 快捷键；复用新 Dialog/Command；避免 global document；异步与触发器 API 收口 | Ctrl/Cmd+K、受控 open/query、禁用、route action、async、focus restore、ShadowRoot |
| 45 | ZContextMenu | P1 | 基于统一 Menu；补 submenu、checkbox/radio/link item；touch long-press 仅按真实需求 | pointer/keyboard 打开、viewport collision、submenu、selection item、disabled、nested layer、RTL |
| 46 | ZDropdownMenu | P1 | 与 Menu/Popover 统一状态和 item 类型；typed trigger attachment；避免重复 open owner | click/keyboard、submenu、checkbox/radio/link、controlled open、outside/Escape、focus restore |
| 47 | ZMenu | P1 | LogicalCollection、PressController、locale-reactive typeahead；补 submenu 与选择 item | roving、Home/End、typeahead、groups/separator、submenu、disabled、dynamic/virtual、RTL |
| 48 | ZPagination | P1 | 补 pageSize/total/onPageSizeChange、simple/compact；server state 不发请求；全面 locale pack | controlled page、边界页、page size、total、disabled、RTL、keyboard、与 DataTable 组合 |
| 49 | ZTabs | P0 | 修 ControlledState 空值；明确 automatic/manual activation、orientation、动态删除后的选中策略 | controlled clear、horizontal/vertical、keyboard、disabled、dynamic tabs、lazy panel、RTL |
| 50 | ZTree | P1 | 迁移 LogicalCollection/Selection/Virtualizer；补 lazy、checkbox/half-check、typed node content；DnD 后置 | expand/select、multi/check、lazy/loading/error、keyboard/typeahead、virtual、large tree、RTL |

### 7.4 Overlay（7）

| # | 组件 | 优先级 | API / 架构决策 | 文档和 Demo 必须覆盖 |
| ---: | --- | --- | --- | --- |
| 51 | ZAlertDialog | P1 | 复用新 LayerManager/Dialog；强制 modal 与描述语义；action/cancel 不隐藏业务 async | destructive confirm、async action、Escape/overlay 取舍、focus trap/restore、nested、RTL |
| 52 | ZDialog | P0 | LayerGraph、跨 realm、typed trigger attachment、Portal/Presence；compound member metadata 完整保留 | controlled open、modal/non-modal、nested、outside/Escape、initial/final focus、scroll lock、SSR/ShadowRoot |
| 53 | ZDrawer | P1 | 复用 Dialog 内核；逻辑 side、size、responsive 与 body scroll；不复制独立 layer | 四方向、尺寸、controlled、nested、focus/scroll、RTL、full/reduced motion、窄屏 |
| 54 | ZPopconfirm | P1 | 复用 Popover/AlertDialog；action 支持 pending/resolve/reject owner，避免重复提交 | controlled、async confirm、cancel、placement、outside/Escape、focus restore、danger 文案 |
| 55 | ZPopover | P0 | 先修当前 `matchWidth` CI；LayerGraph、typed trigger、anchor/update/portal、nested branch | placement/collision、matchWidth、controlled、nested、scroll/resize、outside/Escape、focus restore、RTL |
| 56 | ZTooltip | P1 | TooltipGroup/delay hysteresis；disabled trigger 包装策略；非交互内容边界；ownerDocument | hover/focus、delay group、disabled control、multiple tooltips、Escape、RTL、reduced motion、touch 取舍 |
| 57 | ZTour | P1 | 移除 global document/window；root-scoped target、wait/skip missing target、Portal/Presence 与 locale | step/open 受控、target missing、scroll into view、mask、keyboard、resize、ShadowRoot、RTL/reduced motion |

### 7.5 Data Display（16）

| # | 组件 | 优先级 | API / 架构决策 | 文档和 Demo 必须覆盖 |
| ---: | --- | --- | --- | --- |
| 58 | ZAvatar | P1 | typed image props：loading/decoding/crossorigin/referrerPolicy/srcset/sizes；新增 ZAvatarGroup 候选 | image/fallback/error、shape/size、initials、a11y alt、lazy image、group/overflow |
| 59 | ZBadge | P0 | 当前只是 inline pill。推荐将 ZBadge 改为 count/dot/max/anchor/overlap；短状态文本迁移到 ZTag/新 ZStatus | count/dot/showZero/max、anchor positioning、status、a11y label、RTL、动画/reduced、迁移例 |
| 60 | ZCard | P1 | 明确 header/body/footer/media/action snippets 和可点击 Card 语义；不把整卡默认变 button | 基础、分区、media/actions、loading、可点击/链接、嵌套交互、响应式、主题 |
| 61 | ZCarousel | P1 | locale pack、autoplay state、lazy mount 可选；触摸滑动按真实需求；共享 Presence | controlled、autoplay/pause、keyboard、indicators、dynamic slides、RTL、reduced motion、可见性 |
| 62 | ZDataTable | P0 | 先修 sort 受控空值；补 filter/pagination/server/loading/column state/expand/sticky；明确 DataGrid 边界 | sort/filter/page、selection、loading/empty/error、column visibility/resize、virtual、long text、server ownership |
| 63 | ZDescriptionList | P1 | term/description 改为 typed snippets；响应列/span/bordered 只按真实需求；保持 dl 语义 | text/rich content、responsive columns、long value、empty value、RTL、copy/action 组合 |
| 64 | ZEmpty | P2 | 统一 icon/illustration/action slots；默认使用 Lucide 或 CSS，不内嵌随意 SVG | no data/no result/error 区分、custom icon/action、紧凑/大尺寸、a11y、主题 |
| 65 | ZList | P1 | 明确 semantic list 与 data-driven convenience 边界；typed item key/snippet；不复制 DataTable | ul/ol、rich item、actions、empty/loading、large list 与 VirtualList 组合、nested list |
| 66 | ZMeter | Keep | 保持原生 meter；规范 min/max/low/high/optimum 与 formatter；不做通用 progress | optimal/suboptimal/critical、边界值、custom label、a11y、主题/高对比 |
| 67 | ZProgress | P1 | 保持原生 linear + 语义 circular SVG；统一 duration/token、label/formatter；SVG allowlist | determinate/indeterminate、linear/circular、min/max、status tone、reduced motion、高对比 |
| 68 | ZSkeleton | P1 | 共享 motion token；支持组合 shape/lines，避免业务结构 DSL | text/avatar/card 组合、尺寸、loading 切换、reduced motion、主题/高对比、SSR |
| 69 | ZStatistic | P1 | locale/format/precision/prefix/suffix；Countdown/NumberAnimation 独立候选，不塞入同一状态机 | number/date/percent/currency、locale、trend/tone、loading、large value、SSR 一致性 |
| 70 | ZTable | Keep | 保持原生 table 视觉壳；caption/responsive wrapper/density；不与 DataTable 合并 | caption/headers、striped/density、wide table scroll、sticky 取舍、RTL、a11y |
| 71 | ZTag | P1 | 作为状态/分类 pill 与可移除 tag；统一 disabled/removeLabel locale；承接旧 Badge 文本迁移 | tone、removable、disabled、keyboard remove、长文本、tag collection、迁移示例 |
| 72 | ZTimeline | P1 | typed item content/icon/time；保持 ol 语义；pending/reverse/alternate 按真实需求 | 基础、rich content、status/icon、pending、long timeline、RTL、responsive |
| 73 | ZVirtualList | P1 | 公开 scrollToIndex/key controller；动态尺寸/estimate、scroll anchoring；接 LogicalCollection | 10k items、initial/imperative scroll、dynamic data、resize、keyboard consumer、SSR、cleanup |

### 7.6 Feedback（5）

| # | 组件 | 优先级 | API / 架构决策 | 文档和 Demo 必须覆盖 |
| ---: | --- | --- | --- | --- |
| 74 | ZAlert | P1 | tone/live/dismiss/action 一致；默认文案 locale 化；区分 inline alert 与 toast | tone、title/body/action、dismiss、polite/assertive、keyboard、高对比、动态插入 |
| 75 | ZLoadingBar | P1 | WAAPI token、ownerDocument、page/local 两模式；任务 controller 与进度更新 | determinate/indeterminate、page/local、start/update/finish/error、visibility、reduced motion、cleanup |
| 76 | ZResult | P1 | icon/actions/content snippets；tone 与 Alert 统一；空状态不与 ZEmpty 重叠 | success/error/warning/info、custom icon/action、long content、responsive、a11y heading |
| 77 | ZSpinner | P1 | 统一 size/label/tone；WAAPI duration token；inline/overlay 不由 Spinner 单体承担 | named/hidden label、sizes、Button 内、区域 loading、reduced motion、高对比 |
| 78 | ZToast / ZToaster | P0 | queued/visible/exiting、Portal/Presence、真正 maxVisible、update/promise、locale；Notification 共享内核 | queue overflow、pause/resume、action、async task、assertive 节流、placement/RTL、reduced motion、cleanup |

## 8. 新组件候选与明确不做项

候选不等于缺陷，也不在共享内核修复前并行铺开。按后台生产价值排序：

### 8.1 第一候选批次

| 候选 | 理由 | 推荐边界 |
| --- | --- | --- |
| ZHeading | 修复标题语义缺口，不让 ZText 无限多态 | h1—h6、level/size 解耦、原生 heading props |
| ZGrid | 后台响应式网格是高频基础设施 | CSS Grid、columns/minmax/gap，不做页面布局框架 |
| ZScrollArea | Select/Tree/Docs/Panel 都需要一致滚动边界 | 原生滚动优先、可选 viewport/scrollbar part，不自绘滚动物理 |
| ZCheckboxGroup | 表单数组值与选择组选项高频 | 复用 Collection/Selection/FormValueBridge |
| ZBreadcrumb | 文档站和后台信息层级高频 | 原生 nav/ol、当前项、collapse，可与路由解耦 |
| ZSteps | 表单流程和向导高频 | current/status/orientation，不内置路由/业务流程 |
| ZImage | 图片 fallback、preview 和 lazy loading 高频 | 原生 img 为核心，preview 复用 Dialog |
| ZNotification | 长时反馈、标题/正文/操作与 Toast 有不同产品语义 | 共享 queue，独立 viewport/生命周期策略 |

### 8.2 第二候选批次

`ZResizable/ZSplit`、`ZRangeSlider`、`ZAvatarGroup`、`ZHoverCard`、`ZToolbar`、`ZRating`、`ZWatermark`。只有出现真实 ZAdmin/Docs 消费者和明确 API/ARIA 设计后进入实现。

### 8.3 暂不采用或后置

- QRCode：继续遵守现有蓝图禁止项，不为了对齐 Ant 目录引入；
- Marquee、BorderBeam、装饰性渐变组件：不作为生产核心组件；
- Pivot/Excel/AI DataGrid：进入独立 X/DataGrid 研究轨道；
- 全局静态 message/modal/notification 单例：不采用；
- MUI `sx`、任意 `slots/slotProps`、无语义 `asChild`：不采用；
- 为组件数量而实现 Affix、BackTop、Anchor、NavigationMenu 等：先由真实页面需求证明；
- 将第三方 headless 组件库、TanStack Table/Virtual 直接包装为 ZUI：继续不采用。

## 9. 跨组件 API 一致性规则

### 9.1 状态命名

| 责任 | 统一 API | 说明 |
| --- | --- | --- |
| 主值 | `value / defaultValue / onValueChange` | 标量和数组都使用 value；MultiSelect 当前 `values/defaultValues` 需迁移 |
| 开关 | `checked / defaultChecked / onCheckedChange` | Checkbox、Switch |
| Toggle | `pressed / defaultPressed / onPressedChange` | ToggleButton |
| 浮层 | `open / defaultOpen / onOpenChange` | Dialog、Popover、Select 等 |
| 查询 | `query / defaultQuery / onQueryChange` | Command；可编辑选择的原始文本用 inputValue |
| 选择模型 | `selectedKeys / defaultSelectedKeys / onSelectionChange` | Tree、DataTable 等非单一表单 value 的选择集合 |
| 展开模型 | `expandedKeys / defaultExpandedKeys / onExpandedChange` | Tree/TreeSelect |
| 分页 | `page / defaultPage / onPageChange` | pageSize 同样遵循三元组 |

空值必须在全库只有一种语义。推荐标量可清空状态使用 `null`，`undefined` 只代表 prop 未提供；数组空值使用冻结空数组。最终决策在 ControlledState 迁移前形成 ADR。

### 9.2 视觉与状态轴

```text
variant     结构/强调方式，如 solid、outline、ghost
tone        语义颜色，如 neutral、accent、success、warning、danger
size        small、medium、large
shape       default、round、circle（只在有语义的组件）
density     Provider默认密度；组件显式size优先
orientation horizontal、vertical
direction   ltr、rtl，仅表示书写方向
```

`status` 只用于组件发布生命周期或业务记录状态，不能与 visual tone 混用。Button 当前 danger 作为 variant，要在 pre-1.0 阶段迁移为 tone。

### 9.3 通用交互状态

- `disabled`：阻止交互并遵循原生 disabled 能力；
- `readonly`：值可浏览/复制但不可修改；只有语义成立的控件提供；
- `invalid`：视觉和 `aria-invalid` 同步，并能继承 Field 状态；
- `required`：进入原生 Form/ARIA 合同，不只是标签星号；
- `loading`：表示当前组件操作 busy，不与全页 loading 混用；
- state prop、ARIA 与 `data-*` 必须由同一 resolved state 计算；
- 所有 interactive part 使用统一 focus ring、PressController 和 disabled 语义。

### 9.4 Callback 与 Event

- 状态变化 callback 直接传新值：`onValueChange(next)`；
- 业务动作传 typed detail/event：`onAction(event)`；
- 可取消的 outside/escape/beforeSelect 等使用统一 CancelableEvent；
- 原生事件继续按 Svelte 原生小写属性透传，如 `onclick`、`oninput`；
- 不同时发出语义重复的 native 与 custom callback；若两者都保留，文档明确顺序和取消规则；
- callback 不隐藏状态 owner，组件不得在调用 callback 后假设外部一定同步接受新值。

### 9.5 Props、ref、native attributes 与 metadata

- 根 DOM ref 一律为 bindable `ref`；复杂组件的 controller 使用独立 `controller`/imperative handle，不重载 DOM ref；
- `class`、`style`、`data-*`、`aria-*` 和适用原生属性必须透传到文档声明的 root；
- compound member 必须公开各自 root、source、status、since、parts 和原生属性类型；
- metadata 不再手写重复的 props 事实。AST 从公开 Props 类型生成 name/type/required/native source，组件只补 default、说明、版本和关系；
- 当前 AST 横向扫描在排除 `class/style` 和小写原生事件后，仍发现 32 个组件约 180 个实质公开 prop 未进入 metadata/API 表；
- 代表性缺项包括 TreeSelect 的 defaultValue/defaultOpen/form/placement、DataTable 的 defaultSort/defaultSelectedKeys/density、DateRangePicker 的 onOpenChange/locale，以及 ZForm callback、ZTag disabled；
- 上述问题必须由“Props 类型 vs metadata”门禁统一发现，不能继续依赖手工抽查；
- README/Guide/Demo 的公开 API 代码进入编译 fixture，防止 ZText `as="h1"` 一类漂移。

### 9.6 Snippet、Part 与结构扩展

- 高频结构优先命名 snippet：`start/end/header/footer/item/empty/loading`；
- part 使用稳定 `data-slot`，metadata 和文档列出语义与可用状态；
- 不增加任意 component replacement/slotProps 字典；
- Trigger、item renderer、cell renderer 等确实需要替换结构时，使用 typed snippet 参数或 attachment；
- 开发环境验证最终 DOM 语义，避免 block 嵌 inline、nested button、无 focus target。

### 9.7 表单控件能力与优先级

不能给所有组件机械添加同一批 prop，但同一族必须一致：

| 族 | 必须统一的状态 |
| --- | --- |
| 文本/数字/日期 segment | size、disabled、readonly、required、invalid、name、form |
| Select/Multi/Combobox/Cascader/TreeSelect | size、disabled、readonly、required、invalid、open、value、name、form |
| Upload/Transfer/Tags | size、disabled、readonly、required、invalid、loading、empty、name、form |
| Table/DataTable | density、loading、empty、error、striped、virtualization |
| Button/action | size、variant、tone、loading、disabled、fullWidth |

优先级固定：组件显式 prop > ZField/FormField > ZProvider > 组件默认值。建立公共 `ZControlSize` 与 `ZSurfaceDensity`；特殊组件只有真实语义不同时才新增取值。

### 9.8 ARIA 命名与 ref

- root DOM 属性使用 Svelte 原生拼写：`aria-label`、`aria-labelledby`、`aria-describedby`；
- 现有 `ariaLabel/ariaLabelledBy/ariaDescribedBy` 用户 API 保留一段 deprecated alias 后移除；
- 只有动态生成函数使用语义名，例如 `getTriggerLabel(value)`；
- 有 root DOM 的组件，`ref` 永远指 root；无 DOM context root 不提供 ref；
- composite 若要额外引用，明确使用 `triggerRef/contentRef/inputRef` 或 controller；
- metadata 记录 ref 的目标、挂载时机和 null 生命周期。

### 9.9 Open reason、可取消事件与 ZForm callback

所有 layer open callback 采用“值 + detail”，普通 value callback 仍保持首参数是值：

```ts
interface ZuiChangeDetail<TReason, TEvent extends Event = Event> {
	reason: TReason;
	originalEvent?: TEvent;
}

interface ZLayerStateProps {
	onOpenChange?: (
		open: boolean,
		detail: ZuiChangeDetail<
			'trigger' | 'escape' | 'pointer-outside' | 'focus-outside' |
			'action' | 'cancel' | 'programmatic'
		>
	) => void;
}
```

所有可取消事件只保留一种统一基类/协议；CommandAction、Select/Menu action 和 DismissableLayer 不再提供互不兼容的 event 形态。

ZForm 恢复原生 `onsubmit/onreset` 透传；保留 `onValidSubmit/onInvalidSubmit/onValidationError` 语义 callback。删除或 deprecate 含义模糊的 camel `onSubmit/onReset`。`ZForm<TSchema>` 从 Standard Schema 推导成功输出，不能继续向用户暴露 `data: unknown`。

### 9.10 Floating 与 Portal 实例合同

高层 Select/Combobox/MultiSelect/Cascader/ColorPicker/DatePicker/DateRangePicker/Mention/TreeSelect 不应只暴露 placement 并硬编码其他 Floating 参数。统一一个窄 API：

```ts
interface ZFloatingOptions {
	placement?: FloatingPlacement;
	offset?: number; // 迁移现有 gutter 命名后只保留一个
	matchWidth?: boolean;
	collisionPadding?: number;
	portalContainer?: HTMLElement | ShadowRoot | null;
}
```

只公开成熟产品场景，不泄漏 Floating UI 全部 middleware。Provider 给默认值，实例 prop 优先；实例 portal 覆盖不得隐式改变整棵子树的 locale/theme。

## 10. 版本、发布、支持与 CI/CD

### 10.1 修复 since 与唯一版本真相源

metadata 允许：

```ts
type ComponentSince = ReleasedVersion | 'unreleased';
```

规则：

1. 未发布 API 只能写 `unreleased`；
2. release PR 计算目标版本后物化 since；
3. CI 禁止 `since > package.version`，并验证 tag/CHANGELOG 存在；
4. 文档显示当前版本、unreleased、deprecated 和 replacement；
5. S2—S8 是开发阶段，永远不再映射成 SemVer；
6. API diff 的最低 bump 不得高于 Changeset 实际声明；
7. stable breaking change 必须有 migration，不能只更新 SHA 快照。

### 10.2 唯一发布产物链

```text
精确 release SHA 的全绿 CI
-> Changesets version PR
-> 合并后再次完整 CI
-> build
-> pack 一次
-> tarball 内容/类型/exports 检查
-> 仓库外 frozen install + SSR/CSP/optional Shiki/WebView consumer
-> npm trusted publish 同一 tarball/version
-> tag + GitHub Release
-> 部署对应版本 Docs
```

发布命令必须强制构建和复用已验收 tarball；不能依赖操作者记得先运行另一个脚本。npm 组织权限、OIDC/trusted publishing 和域名属于外部授权边界，代码准备完成后单独向用户确认。

### 10.3 支持矩阵

建议阻塞线：

- Node 22 最低线 + Node 24 当前线；
- Svelte 5.56 最低线 + 最新兼容 5.x；
- 若承诺 SvelteKit/Vite，则分别验证最低与当前兼容版本；
- Chromium、Firefox、WebKit 明确最近版本或固定最低版本，不再只写“modern”；
- WebView2 明确 Evergreen 最低能力/版本；
- TypeScript、pnpm 和 OS 仅声明真正进入门禁的范围；
- nightly/latest 可做非阻塞预警，最低支持线必须阻塞。

### 10.4 CI 拆分但不降低门禁

```text
static
zui-unit
zui-browser-chromium
zui-browser-firefox
zui-browser-webkit
docs-e2e-chromium
docs-e2e-firefox
docs-e2e-webkit
coverage
build
package-tarball-ssr
webview-windows
release-readiness
required-aggregate
```

一个 job 失败不得让无依赖的证据全部消失。失败时上传 Playwright trace/screenshot、browser attachment、coverage summary、成熟度矩阵和 bundle JSON。不得用 retry、降低断言、跳过 WebKit 或降低覆盖阈值伪造绿色。

### 10.5 真实 HMR、视觉回归和 bundle 证据

- 增加一个小型 Vite dev 外部 HMR fixture：Provider + Button + Layer；验证状态保留、CSS owner 不重复、Portal/focus 不泄漏、控制台干净；
- 视觉回归只覆盖 Button/Input、Dialog/Popover/Select、DataTable、Calendar，以及 light/dark/high-contrast、LTR/RTL 的代表性面；
- Chromium 维护主像素 baseline，Firefox/WebKit 保持行为合同；
- bundle 继续记录 gzip/构成/delta，不设硬字节预算；整包依赖、compiler/server 混入等边界继续硬失败；
- bundle 组件清单从 metadata/entrypoints 自动发现，报告存为 CI artifact/summary。

### 10.6 供应链与运营

在稳定发布前补：

- dependency updater；
- `SECURITY.md`、`CODEOWNERS`；
- npm trusted publishing/provenance；
- publint、AreTheTypesWrong；
- SBOM/attestation；
- Node ESM、TypeScript Bundler/NodeNext 的最小 tarball 消费者；
- Docs PR preview、生产部署、版本归档、release notes、部署 smoke 与回滚标识。

## 11. 分阶段实施计划

每阶段拆成可构建、可审阅的聚焦提交并推送 `origin/master`。本地只做 WebStorm error 级诊断和真实 Chrome 定向验收；类型、Vitest、Playwright、build、coverage、bundle、package、SSR、WebView 和视觉回归全部交给远程 CI。永远不等待当前推送的 CI；下一次正常推送前查看上一轮结果并修复明确失败。

### R0：事实重置与当前红灯收口

交付：

1. 将虚构未来 `since` 改为 `unreleased` 或真实已发布版本；
2. 增加版本事实门禁与生命周期说明；
3. 更新 production audit，使当前 CI run 和生成状态不再依赖手工陈旧文字；
4. 修复当前 CI 的 NumberField locale/reset、Popover matchWidth、Field reset、WebKit Transfer/Command；
5. 将 CI job 拆分到足够并行，后续证据不再整段 skipped；
6. 冻结 1.0 候选根组件清单和 experimental 入口策略。

本地验收：WebStorm 修改文件 0 errors；真实 Chrome 验证 NumberField、Popover、Form reset 和 Docs 响应式；不运行本地慢测试。

远程验收：当前失败类别归零，所有独立 jobs 有明确结果；不通过降低门禁实现。

### R1：Metadata、API diff 与成熟度证据

交付：

1. profile/capability/waiver schema；
2. Demo `covers` 与 `auditScenarios`；
3. Props AST 生成 + 手工教学 metadata 分离；
4. ComponentFamily/Member 完整身份；
5. 结构化 API snapshot 与 SemVer/Changeset diff；
6. README/Guide/Demo 代码编译 fixture；
7. CI/Docs 可消费的成熟度 JSON 与 Summary。

验收：8 个当前 stable 组件先满足严格矩阵；其余 experimental 显示缺口且已有证据不倒退。

### R2：ControlledState、Provider 与 FormValueBridge

交付：

1. 空值/owner sentinel ADR；
2. 全部 `value/open/checked/pressed/query` 状态迁移；
3. typed locale pack、timeZone、density/contrast 生效；
4. locale-reactive Typeahead；
5. FormValueBridge 统一单值、多值、disabled、external form、reset 与 serialization；
6. ZProvider、ZInput、ZField、ZButton、ZStack 等稳定基础组件重新毕业。

验收：外部清空、异步 owner 回写、controlled reset、Provider 动态轴和 SSR 初始值矩阵完整。

### R3：Form 字段图与输入组件族

交付：

1. FieldPath、动态数组/同名字段、field state 与依赖图；
2. per-field async validation、typed output、controller；
3. ZForm/ZFormField/messages；
4. Calendar/Date/Time/Number 等空值、locale/timeZone；
5. Checkbox/Switch/Slider/Pin/Tags/Textarea/FileUpload 等 FormValue/reset 收口；
6. Input 类文档能力矩阵与多个场景 Demo。

验收：所有 input/form profile 在三引擎覆盖 FormData、reset、validation、focus、IME/locale（适用时）。

### R4：LogicalCollection、Selection、Navigation 与 Virtualization

交付：

1. LogicalCollection、MountedElements、SelectionModel、ActiveDescendant、PressController；
2. scrollToKey/index 与虚拟挂载握手；
3. Select/Combobox/MultiSelect/Menu/Command/Mention/Transfer/Tree/Cascader/TreeSelect 迁移；
4. submenu、checkbox/radio/link menu item；
5. async/loading/empty/lazy/large-data 合同；
6. 相关组件 API 命名和 compound member metadata 收口。

验收：未挂载项仍参与 Home/End/typeahead/selection；虚拟滚动后 active descendant、focus 和 selection 正确。

### R5：LayerManager、Presence、Overlay 与反馈服务

交付：

1. ownerDocument LayerManager、parent/branch 图和集中监听；
2. 跨 realm FocusScope/ScrollLock/Portal；
3. typed trigger attachment/snippet；
4. Presence 统一进入退出；
5. Dialog/AlertDialog/Drawer/Popover/Popconfirm/Tooltip/Tour 迁移；
6. Toast/Toaster/Notification queue 生命周期；
7. CommandPalette、TextareaAutosize、Tour 等 global document/window 清理。

验收：nested layer、outside、Escape、modal pointer blocking、focus trap/restore、ShadowRoot/WebView、快速开关和卸载 cleanup 完整。

### R6：Data Display、DataTable 与剩余组件 stable 晋级

交付：

1. Badge/Tag 产品语义迁移；
2. Avatar/Card/List/Descriptions/Timeline 的 typed content；
3. Progress/Skeleton/Carousel/LoadingBar 的 motion token；
4. DataTable filter/page/server/loading/column/expand/sticky 基线；
5. VirtualList controller 与动态尺寸评估；
6. 78 个现有组件族逐一满足矩阵，或明确移除/合并/迁移。

验收：计划进入 1.0 根入口的组件全部 stable；任何保留 experimental 的组件只能从实验入口访问，并在 Docs 明示缺口。

### R7：文档站生产化

交付：

1. 轻量 manifest 与 Doc/Demo/source 按需加载；
2. SvelteKit prerender + 真实 pathname；
3. ZCommandPalette 全站搜索；
4. ZDrawer 移动导航与可展开 TOC；
5. 新 ComponentFamilyPage、API/Member、token、capability/evidence UI；
6. 完整 Theme Lab；
7. Changelog/Migration/Version Support/Deprecated/Release Notes；
8. Markdown/LLM、sitemap、canonical、preview/deploy；
9. 文档站能用 ZUI 的地方全部 dogfood ZUI，不保留重复自绘控件。

验收：每个 route 有独立内容与 head；首页不加载全站 Demo/source；移动端可定位任意组件；文档显示的状态、版本和证据全部来自唯一数据源。

### R8：高价值候选、发布与最终系统审计

交付：

1. 只实现已批准的第一候选批次；
2. 真实 Vite HMR fixture、支持矩阵、供应链与 release workflow；
3. build→pack→install→publish 同产物链；
4. 生产 Docs 与版本归档；
5. 全系统最终审计报告。

最终审计维度：

```text
API consistency
state ownership
keyboard/focus/ARIA
FormData/reset/validation
locale/timeZone/RTL
theme/density/contrast/high-contrast
motion/reduced-motion/cleanup
layer/portal/ShadowRoot/WebView
SSR/CSP/HMR
large data/virtualization
docs completeness/search/mobile/versioning
SemVer/deprecation/migration
CI/release/supply chain
Lucide/inline SVG allowlist
dogfood/reuse/duplicate implementation
```

## 12. 完成定义

系统只有同时满足以下条件，才能称为“生产可用”：

1. 当前 package、tag、Changelog、Docs version 和所有 `since` 一致；
2. 1.0 根入口不存在未解释的 experimental API；
3. 78 个现有组件族全部 stable，或经过明确审阅后移除/合并/迁入实验入口；
4. 每个 stable 组件的适用 capability 都有 Demo 与测试证据；
5. 不存在已知 P0 状态所有权、Form、Layer、locale 或 reset 问题；
6. 发布 SHA 的 static、三浏览器、Docs E2E、coverage、build、package/SSR、WebView 和 release-readiness 全绿；
7. Docs 已部署、版本化、可预渲染、可搜索、移动端可用，并能说明迁移与弃用；
8. 真实消费者使用打包 tarball，不依赖仓库源文件或意外 deep import；
9. 文档站主要使用 ZUI 组件并成为一等 dogfood 消费者；
10. 所有图标通过 Lucide/source allowlist，所有动画支持 reduced motion 和 cleanup；
11. 没有通过降低覆盖率、跳过 WebKit、硬编码 bundle 预算或手工“已完成”文字掩盖失败；
12. 最终审计无 P0，P1 只允许有责任人、issue 和到期时间的明确 waiver。

## 13. 风险与防退化机制

| 风险 | 防线 |
| --- | --- |
| 为对标而堆 API | 每项必须关联真实 consumer、profile capability 和不采用说明 |
| 78 组件同时重写失控 | 先共享 primitive，再按组件族迁移；每阶段小提交 |
| metadata 再次漂移 | AST 生成事实 + 语义 API diff + Docs 单一消费源 |
| Demo 数量膨胀但重复 | `covers` 与 API/测试互链，不设固定数量 KPI |
| experimental 批量改 stable | stable 严格 evidence 门禁；状态变更需单独审阅 |
| Docs 迁移期间双路由 | manifest 先行，旧 hash 到真实 pathname 有显式兼容期 |
| Layer/Form 重构破坏现有组件 | adapter 过渡、行为 fixture、按族迁移，不一次删除旧 runtime |
| CI 太慢导致本地偷跑全量验证 | 本地仍只 WebStorm + Chrome；CI 并行拆分且不等待 |
| bundle 过大争议 | 记录构成/delta、人工看明显异常，不设自动字节预算 |
| 外部发布权限阻塞 | 代码流水线与授权边界分离，权限只在最终 publish 前确认 |

## 14. 需要审阅的架构决策

下列为本文推荐值，审阅后再进入实现：

| 决策 | 推荐 | 备选与代价 |
| --- | --- | --- |
| 空值语义 | 标量可清空状态使用 `null`，`undefined` 表示 prop 未提供 | 内部 UNSET + 对外 undefined 可兼容更多旧 API，但类型与 owner 检测更复杂 |
| 根入口 | 只承诺 stable；experimental 使用显式入口 | 单入口保留到 1.0，迁移少但 94% 实验面继续污染公共 ABI |
| Badge | ZBadge 改为 count/dot/overlay；文本状态迁移到 ZTag/ZStatus | 保留现状并新建 ZCountBadge，兼容好但命名长期含混 |
| Typography | ZText 保持 body/inline，新增 ZHeading | 扩大 ZText `as`，API 少但元素属性类型更复杂 |
| Docs 路由 | SvelteKit prerender + 真实 pathname | 继续 Vite SPA，可实现懒加载但版本化/SEO/LLM 能力较弱 |
| DataGrid | ZDataTable 保持后台 table；高级 grid 独立实验/X 轨道 | 单组件持续扩张，短期入口少但长期复杂度高 |
| FileUpload | 保留 ZFileUpload，UI 管文件状态，transport 由 adapter 注入 | 重命名 FilePicker 更精确，但迁移成本与用户认知变化大 |
| 新组件首批 | Heading、Grid、ScrollArea、CheckboxGroup、Breadcrumb、Steps、Image、Notification | 全部 27 候选并行会再次制造大量 experimental 半成品 |
| 发布 | npm trusted publishing + tag + versioned Docs 同流水线 | 手工 token/publish 更快但不可审计且易发布错误产物 |

## 15. 审阅后第一批动作

如果本文通过审阅，第一批只执行 R0，不同时开始新组件：

1. 修正版本/since/lifecycle 真相源；
2. 修复当前 CI 明确失败；
3. 拆 CI 取证拓扑；
4. 建立 stable/experimental 入口决策 ADR；
5. 建立 profile/capability schema 的最小可运行版本；
6. 以 8 个 stable 组件作为第一组严格 evidence 样本。

R0 完成并推送后不等待 CI，继续 R1；下一次推送前回看 R0 对应运行。任何新的组件实现都要等共享合同和证据模型先落地。

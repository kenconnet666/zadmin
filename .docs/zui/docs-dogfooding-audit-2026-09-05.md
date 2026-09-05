# Docs 组件复用与整站排版审查（2026-09-05）

## 范围与当前结论

用户要求文档站尽量使用组件库，允许按通用需求扩充组件/API，并补充了标题、代码、标签、导航和主题排版截图。随后明确授权“全部审计直接在当前会话就修改，不必等我确认”。本报告保留初始缺陷证据，并记录当前实现和验证边界；下文旧行号均属于审查基线，不代表修复后的行号。

审查基线：`f906246dab9b4b48f909e4c86c2ed4f894f8e58a`；本机 Docs：`http://127.0.0.1:5174/`。浏览器探测使用全新 Chromium context，1920×1080、默认 aurora-light 主题。

结论：当前文档站大量调用 ZUI，但仍自行维护了通用 UI 外观和行为。前一轮的 recipe specificity 修复还暴露了组件与 Docs 样式组合的回归。现有 `VisuallyVerified=141` 是测试文件存在局部视觉断言的覆盖指标，不能作为整站排版、所有 API 组合或成熟设计质量已验收的依据。

仅 `apps/docs/src/views` 就有 11 个 Svelte 文件，全部定义 Docs 自有 slot recipe；约 2544 行源码中有 1226 行位于 module recipe 区域，含 136 个静态 ZUI 调用位置。这些计数用于定位维护面，不是运行时节点计数或组件质量评分。

## 发现与证据

### P1-1：Recipe 优先级缺少组件组合层，主标题与导航色回归

- `ui/zui/src/recipes/runtime.ts:55` 将 base 设为 specificity 1，variant 按序提升；所有输出均位于 `zui.components`。
- `ui/zui/src/recipes/slots.ts:215` 对 Docs 自有 recipe 使用同样策略。
- `apps/docs/src/views/ComponentPage.svelte:141` 定义 `clamp(2.4rem, 4vw, 3.75rem)` 主标题，并在第 252 行传给 `ZHeading size="xlarge"`。
- 实际 CSS：ZHeading size 使用三重 class selector，Docs 标题使用单 class。1920px 下，原本应解析到 60px 的页面标题实际只有 **24px / 30px line-height**。
- `apps/docs/src/views/AppSidebar.svelte:31` 定义 muted 色，实际被 `ZLink` 默认 tone 的三重 selector 覆盖。源码期望 `rgb(82,98,122)`，实际为 **`rgb(36,87,230)`**，对应用户截图中整列导航变蓝。

修复方向：先以组件公开 tone/size/typography API 表达需求；明确组件基础、变体、组合定制与 utility 的顺序。保留已修复的跨 recipe 原子去重不破坏 variant 的合同，同时增加“ZHeading/ZLink 接收组合样式”的回归。不能继续由各页面提高 specificity 或追加 `!important`。

### P1-2：ZCode 异步高亮后增加空白和高度

- `ui/zui/src/components/gene/ZCode.svelte:236` 不区分 inline/block，统一让 line span `display:block`。
- 第 499–549 行的 highlighted snippet 与 inline `<code>` 模板含额外空白节点；多行处理又插入显式换行。
- 真实页面导入代码只有一行：`import { ZButton } from '@zadmin/zui';`。
- loading 时实际框高 **22px**；highlighted 后实际框高 **40px**，`textContent` 从源码本身变为带首尾空格的字符串。字号为 12px、行高 18px，所以多出了一行高度。

修复方向：在 ZCode 内分开 inline/block 的行排布，严格保留源码空格和换行；验证 loading → highlighted 前后单行高度稳定、多行没有额外空行、复制文本与源字符串完全一致。修改覆盖所有消费者。

### P1-3：DemoBlock 仍拥有 Card、复制和 disclosure 的通用实现

- `apps/docs/src/views/DemoBlock.svelte:4` 自建带 border/shadow/header/preview/source 的卡片。
- 第 77 行直接调用全局 `navigator.clipboard` 并管理反馈 timer；第 110 行以后手写 expanded 状态与按钮关系。
- ZUI 已有 `ZCard` 和 `ZCode copyable`；ZCode 复制逻辑已有 owner-window、异步 generation 和销毁保护，Docs 另维护一套更弱的实现。
- 第 95 行的普通容器内直接放 heading、inline ZText 和 tag row，没有垂直 Stack 间距。

修复方向：DemoBlock 保留加载 DemoDefinition 和 demo source 的文档编排；surface/header/body 使用 ZCard，纵横布局使用 ZStack，复制使用 ZCode 的能力。若必须在源码收起时仍从顶栏复制，可提取通用 ZCopyButton/shared clipboard controller；若保留独立源码折叠，则用通用 disclosure，而非每个页面拥有自己的交互状态机。

### P1-4：Tag medium 字体继承不受控，文档辅助信息抢占层级

- `ui/zui/src/components/data-display/ZTag.svelte:112` medium 分支只设 padding/gap，没有显式 font-size；small 分支则明确设置字号。
- Docs body 是 16px，描述 ZText 是 14px，默认 medium Tag 因此实际为 **16px / 27px 高度**。
- 实测 Demo 描述到标签行只有约 **1px** 垂直间距。
- `DemoBlock.svelte:101` 直接显示 `basic-render`、`variants-and-states` 等测试能力标识，对阅读组件用法的用户帮助有限。

修复方向：明确 Tag 两个 size 的完整字体/行高合同；Docs 辅助标签采用 small。普通阅读视图隐藏测试能力标识，保留 metadata；需要时通过显式审计视图显示。标题、描述、标签和操作区使用可复用布局间距。

### P1-5：视觉和 dogfooding 门禁口径过宽

- `apps/docs/scripts/generate-maturity-matrix.mjs:19-28` 只在整个测试文件上匹配 render、marker 和任意 geometry/computed-style 调用。
- 第 380 行的 visualTests 筛选没有把组件 marker 绑定到具体 test block、DOM target 或完整浏览器运行结果。
- `apps/docs/scripts/audit-system.mjs:630-646` 只禁止一组原生交互标签，无法检测 ZLink 外面重写 Button 视觉、ZTable 外面另造 scroll owner 或复制逻辑重复。
- `docsRawInteractiveElements: 0` 是通过这组黑名单之后的固定输出，不是整站完全组件化的统计。

修复方向：输出真实 UI 责任清单和复用状态。局部视觉合同、实际执行结果、整页视觉验收分别记录；组件级证据至少绑定 test block 和目标 selector。以截图中已复现的问题构建整页验收，不继续以补 marker 数量作为成熟度目标。

### P2-1：ApiTable 绕开 ZTable 的滚动所有权

- `apps/docs/src/views/ApiTable.svelte:93` 永久建立 `role="region" tabindex="0"`；第 100 行把内部 `ZTable scroll="none"`。
- `ui/zui/src/components/data-display/ZTable.svelte:282` 已有真实溢出测量，只在溢出时提供焦点和 region。

修复方向：让 ZTable 恢复唯一 scroll owner；视需要增加 typed wrapper 属性（class/labelledby/describedby），由组件库统一 border/radius/overflow 外框。API 行数据与递归字段展开仍属于 Docs。保留 ZTable 支持的原生 tr/th/td snippet 结构。

### P2-2：导航/目录由 Docs 维护，目录高亮存在逻辑缺口

- AppSidebar 的 active、hover、border、密度和方向样式均在本地 recipe；其中 borderLeft/borderRight 是物理方向。
- `ComponentPage.svelte:229` observer 只注册 demos、每个 demo、api、accessibility；第 325 行渲染的 `api-<section.id>` 子目录没有进入观察列表，所以不能按滚动可靠激活。
- observer 在 onMount 建立，文档切换还需要核实重新绑定行为。

修复方向：通用链接导航/分组/active/RTL 和锚点追踪可下沉为 ZNavigation、ZAnchor 等库能力，Docs 传入路由和标题。导航保留原生链接语义；不能把页面导航改成 action menu，也不能把 href 改为 Button onclick 导航。额外的折叠只有存在真实展开层级时才提供。

### P2-3：首页、Theme Lab 与状态区域重复 surface/typography

- `HomePage.svelte:29,123,152` 自制可点击卡片和 primary/secondary 链接按钮。
- `ThemeLabPage.svelte` 多个 axis/preset/token/preview recipe 重复 Card 的 border/radius/padding/shadow。
- `ComponentPage.svelte:258` 状态和版本信息自制 pill，accessibility 自制 Card + list。
- `AppShell.svelte:276` 加载/错误只是文本；404 自制 surface 和 CTA。

修复方向：优先现有 ZCard、ZTag、ZStatistic、ZText、ZList、ZStack、ZSkeleton、ZAlert、ZResult。链接按钮应复用 Button recipe 并保持 anchor 语义，可扩充 ZLink 或新增有限的 ZButtonLink。Theme Lab 色块和媒体数据展示可保留显式值；主题数据不进入基础组件。

## 组件化实施顺序

1. **先修基础设施和截图中可复现的缺陷**：ZCode 高亮空白；recipe/组合样式优先级；Tag 字体；页面主标题、sidebar tone 和 Demo vertical gap。完成 Button 页、主题切换和异步高亮的真实整页回归。
2. **替换现有 ZUI 已覆盖的 UI**：Card surfaces、metadata tags、列表、统计、状态、Stack 排版、ZTable scroll、ZCode copy。优先减少通用行为与样式的重复，不以原生标签数量为唯一指标。
3. **从真实需求补最小公共 API**：优先 Table wrapper 合同和 Card 内容留白；确有必要再加入链接按钮、导航、锚点、独立复制/disclosure。ZStack 已支持 justify="between"，无需再造该 API。
4. **保留薄的文档编排**：App/页面负责路由、文档数据、DemoDefinition、源代码、主题偏好持久化。通用外观和交互由 ZUI 所有。原生 landmarks 和 table/list/form 示例按语义保留；不把 Docs 文件改个 Z 前缀后搬入组件库。
5. **重建验收口径并分阶段提交**：每阶段聚焦 type/lint/真实视觉验证，广泛回归交给 CI。比较默认/暗色/高对比主题、手机/窄桌面/宽桌面、density 与 RTL，以及异步状态变化；报告哪些画面实际检查过。

## 已实施修复

- Recipe / SlotRecipe 新增显式 `layer: 'utilities'` 组合层，默认组件层不变，避免依赖样式注入顺序。
- ZCode 保留精确源码文本；去除高亮模板额外空白，取消与显式换行重复的 block 行布局；复制操作预留空间不再被 inline 变体覆盖。
- ZText、ZTag、ZButton 使用主题字体；Tag medium 明确字号，段落默认 margin 为零，布局间距交由 Stack / 页面组合所有。
- ZLink 新增 `appearance="button" / "navigation"`、size、variant；按钮链接共享 Button recipe，导航链接依据 `aria-current` 选中，始终保留 href 和原生 anchor。明确不同 appearance 下 tone/underline 的适用范围。
- ZCard 增加 `bodyPadding`，ZTable 增加 `scrollLabelledBy/scrollDescribedBy`；只有实际溢出时才创建可聚焦的具名 region。
- DemoBlock 改用 ZAccordion + ZCard + ZCode copyable；ApiTable 改用 ZCard + ZTable，移除自己维护的复制、反馈 timer、disclosure 和永久 scroll region。
- Sidebar / TOC / 首页 CTA 改用 ZLink 的公共外观；首页、Theme Lab、可访问性区域复用 Card / Statistic / List / Text / Stack。保留页面网格、响应式、路由和内容编排，不新增 Docs 专用基础组件。
- 目录观察包括各 API 子节，并随文档变化重新建立、释放 observer。
- Select / MultiSelect / RadioGroup 尺寸优先级统一为局部 Item/Trigger > Root > Field > Provider；Select / MultiSelect 的局部 disabled 与 Root disabled 合并。Transfer 虚拟与普通分支的 disabled ARIA 一致。
- MenuCheckboxItem / MenuRadioItem 排除实际被内部指示器覆盖的 leading，MenuSubTrigger 排除 trailing；关系型 Trigger / TabsPanel 不再暴露无法生效的 child id。Popover Root.triggerId 等实际有效入口保留。
- Carousel / Toast 组合转发 hover、focus 原生回调；Dialog、Popover、Tooltip、Accordion、Tour 的 transitionend 转发与内部 Presence 生命周期共存。
- ICSS 逻辑边框的缺失注册与未知 accessor 静默失效另设定向修复和类型回归；不以页面 `!important` 绕过基础设施问题。

## 全组件与基础设施审计覆盖

公开元数据清单为 **141 个组件，79 个文档家族**；自动 API 审查读取 **1762 个公开自定义属性事实**，涵盖声明、继承、默认值、受控状态三元组、metadata、rest forwarding 和被后置属性覆盖的问题。原生 HTML 属性没有全部进入这 1762 项统计，另对关系 ID、事件组合、表单、输入与浮层家族做源码审查和定向浏览器验证。

- 输入：input 目录及 Select / Combobox / MultiSelect / RadioGroup 复合家族；重点检查 Field/Provider 继承、disabled/readonly、值所有权、表单桥接和虚拟分支。
- 其余组件：gene、layout、data-display、feedback、navigation、overlay，以及 Accordion / AlertDialog / ContextMenu / Dialog / Drawer / DropdownMenu / Menu / Popconfirm / Popover / Tabs / Tooltip / Tree 的公开组件。
- 基础设施：主题属性定义、ICSS builder/type/registry、Recipe 级联与 HMR 所有权、原生事件与关系 ID、Presence、表单 reset/collection keyboard/portal 现有系统门禁，以及 API/成熟度/Docs 生成流水线。
- UI 复用门禁增加五组明确的公共组件所有权约束，并输出从源码实际统计的 Docs ZUI 调用次数。计数不是完整复用率，也不证明设计质量。
- 视觉证据必须在同一 test block 包含对应组件/fixture render、标记和视觉断言；新统计中只有 **134/141** 有符合此口径的局部测试合同。其余七项不通过补标记制造覆盖率；所有静态阶段字段都不是本次执行报告。

## 验证与边界

- 真实执行：读取 Git 状态/当前源码，默认主题 1920×1080 Chromium 浏览器复现，采集 h1、sidebar、Demo Tag/description 和 ZCode 高亮前后的 computed style、CSS selector 和 DOM。
- 已运行的定向测试：Recipe 单元 11 项；Code / size visual Chromium 13 项；选择器与 RadioGroup 尺寸 Chromium 2 项；Doc composition Chromium 3 项；原生回调 Chromium 3 项；Accordion/Tabs Chromium 3 项；浮层 SSR 1 项。后续整合结果以阶段交付记录和同提交 CI 为准。
- Docs 首轮页面回归中目录/源码、间距、API table 滚动、六主题切换、复制拒绝五项通过。新增整页排版测试的初版测试代码错误（高亮状态名称和未计 padding 的高度公式）修正后，三主题标题/代码/导航边框与 Provider density、RadioGroup RTL、Tabs RTL、Pagination 五项整合回归通过。
- 另用当前开发服务器真实检查 390px 手机导航：打开 Drawer、选择 ZButton、关闭并完成路由、页面无横向溢出，且无 pageerror。
- Recipe / ICSS property / runtime / runtime-edge 合计 28 项单元通过。全 API 与系统审计通过（141 组件、1762 属性，actionableIssues=0）；此处仅表示该门禁范围内无剩余发现。
- ZUI 与 Docs 最终 svelte-check 均为 0 errors / 0 warnings。Docs 检查曾发现新增演示误用了不存在的 icss prop，已移除该错误用法并复跑通过。改动文件 ESLint 中发现的三项 ICSS 类型写法问题也已修复；其余本轮改动通过该检查。用户要求少做本地阻塞验证，广泛多浏览器、桌面与覆盖率回归交给 CI。
- 当前 Svelte MCP 不在可调用工具中；使用项目 Svelte compiler、svelte-check 与真实 Chromium 替代。WebStorm MCP 可发现；本轮不改 IDE 配置。
- 未完成所有 141 组件的全部主题、视口和 API 笛卡尔积视觉验收，不能据此宣称组件库整体达到成熟库全部细节。`ZProgress` 自定义 min/max 的 native 归一化与 ARIA 原始范围目前没有证实为缺陷，本轮不盲目重写。
- 用户原有四个修改保持原样：`.idea/vcs.xml`、Tooltip context、`ZField.svelte`、`MenuFamilyProductionFixture.svelte`。

## 阶段提交与 CI 回归修复

第一阶段：`1f1e2c4860c5ab86c89321ccf34b5532199f62f7`，已推送 master。CI run `33937855419` 的 Windows WebView2 桌面、静态合同、包与外部消费者检查通过；没有将整轮标记为通过。

CI 暴露并继续修复的事项：

1. **Docs 入口预算回归**：复用 Accordion/API 表格后，入口达到约 346KB，高于原有 326KB 限额。ComponentPage 现在与文档数据并行按路由加载，入口降至约 304KB（gzip 约 89KB），79 个文档仍独立懒加载。构建检查增加禁止 ComponentPage 重回静态入口的回归，不调高预算。
2. **旧 ICSS 边界测试冲突**：旧 `builder-edge` 测试要求 `.color.unknown` 静默返回 undefined。更新为检查明确 TypeError，另保留 `then` 探测兼容断言；5 项通过。不回退 fail-fast 修复、不降低覆盖率门槛。
3. **1px 表格溢出失去键盘入口**：Result 文档 API table 实测 scrollWidth-clientWidth=1，原 `> clientWidth + 1` 判断漏掉真实滚动区域。ZTable 改为严格检测正溢出，并新增单像素焦点/region 回归。Result 页 axe 检查与表格组合测试通过。
4. **过度承诺的旧 404 文案测试**：同步移除测试中“并通过验收”的旧字符串，实际页面仍提供明确 404、正确路由状态与恢复链接。
5. **禁用状态 hover**：Button 的原生 disabled/loading，以及 Button/Link 的 aria-disabled 状态不再应用可操作 hover 视觉；不改变全局 ICSS hover 语义。真实鼠标回归覆盖 enabled/disabled 的 button、navigation、text 外观，1 项通过。

第二阶段的定向 Docs 回归（新排版、浏览器前进后退、Result 可访问性、代码/节深链接、404）为 5/5 通过。完整多浏览器与覆盖率结果以修复提交对应的新 CI run 为准，不能复用第一阶段的通过项作为新提交的完整验收。

## 用户授权后的剩余工作区审查

用户随后要求“工作区修改都审核后提交”。对剩余项逐一核对：

- Tooltip context、ZField、MenuFamilyProductionFixture 与 HEAD 的规范化文本完全一致，`git diff` 无代码差异；属于文件状态/换行规范化，不生成虚假的代码修复提交。
- `.idea/vcs.xml` 从 `$PROJECT_DIR$` 映射改为项目根映射；XML 有效，WebStorm MCP `get_repositories` 实测仍仅返回当前项目根的 Git 仓库。
- API contract 与 maturity JSON 只同步已审核 Button hover recipe 的导出指纹；`api:contract:check`、maturity 和 progress 检查通过。

运行时代码提交 `5f400e40e660252970bd3da4862eff8030f40d78` 的 CI `33938515688` 已通过 workspace builds、组件测试、覆盖率、外部消费者以及 Chromium / Firefox 文档回归。该轮静态检查发现合同指纹未更新（此处已补齐）；Windows 编译/类型/合同测试通过，但 WebView2 启动烟测 30 秒超时，尚不能认定根因。后续合同/工作区收尾提交对应的新 CI 才是最终整轮状态依据。

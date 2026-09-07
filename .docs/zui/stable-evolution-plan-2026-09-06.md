# ZUI 稳定化验收与后续演进规划

日期：2026-09-06。范围：`C:\code\zadmin` 的 `@zadmin/zui`、Docs、浏览器/SSR/WebView 消费证据及相关发布合同。

状态：**稳定化验收附录**。最新建设范围和执行顺序以[完整能力对标与大范围建设路线图](./full-capability-roadmap-2026-09-06.md)为准。本文件保留稳定证据和验收合同，不再限制新增规模。用户已授权自主实施，无额外人工审阅关卡；规划能力与已实现能力分别记录。

## 0. 下一步直接执行的顺序

最新优先级：已定位修复作为 W0 提交，随即推进总纲 W1 基础设施与 W2/W3 布局、导航、输入和日期建设；下面的验收工作并行跟进。Docs 入口大小保留记录与告警，不作为稳定化阻断项。已完成的五档体系、八档排版、语义色、换行阅读及顶部复制入口作为基线。

| 顺序         | 执行批次             | 具体动作                                                                                                                           | 完成条件                                                               |
| ------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1 / P0       | 当前候选 CI 修复收口 | 提交已定位的 Recipe 泛型、专用 spacing 外泄、Mention label-for、代码高亮空白、测试入口与旧断言、复制宽度和测试隔离修复；更新生成物 | 同一候选 SHA 的类型、API、构建和已定位回归闭合；保留原断言精度         |
| 2 / P0       | 剩余真实阻断定位     | 对单次 WebKit modal Popover opacity=0 使用 connected/open/opacity 与新增截图诊断；如重现，按实际状态修复生命周期或事件问题         | 问题有明确根因和回归；没有通过加长等待或跳过用例隐去失败               |
| 3 / P1       | 79 族稳定验收台账    | 按七类目录核对每个公开成员的适用行为、视觉、可访问性和生命周期证据；把源码合同、实际执行、接受结果分别记录                         | 141 个公开组件的适用门槛均有当前候选证据，才宣布全部达到浏览器稳定标准 |
| 4 / P1       | 真实组合场景         | 优先编辑 Dialog/Drawer + Form + Select/DatePicker；再做查询条件 + DataTable + Pagination，以及错误摘要/确认反馈；复用现有组件      | 状态、请求、焦点、reset、错误各有唯一 owner；示例可直接复制，窄屏可读  |
| 5 / P1       | API 冻结与发布候选   | 汇总已发生的重命名、删除、尺寸变化和支持范围；通过 Changesets 形成可追溯候选，分别处理浏览器稳定、桌面证据和实际发布               | 版本与迁移说明一致；未执行的发布、桌面项目明确保持待执行               |
| 6 / 并行主线 | 全面能力扩展         | 按总纲 W1–W8 建设布局导航、完整输入日期、表单集合、拖放、数据视图、媒体反馈、图表编辑器与日程                                      | 每个能力都有目标 API、真实实现、文档和适用证据；新增族沿用相同稳定合同 |

执行方式保持短阶段：WebStorm 做受影响文件诊断，浏览器检查实际页面，复杂矩阵交 CI；每批清晰提交/push，下次 push 前检查上一轮结果。新的基础设施应有明确能力和实际消费者，不为体积数字延后建设。

## 1. 目标与三个独立结论

当前 79 族的浏览器稳定化与大范围建设共同推进；141 个公开组件是扩展前基线，新增族也必须满足相同门槛。不能通过批量填写 `status: stable` 或增加演示数量完成稳定目标。

| 结论           | 需要证明什么                                                                                                  | 不应混淆的事项                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 浏览器组件稳定 | 当前候选 SHA 的公开 API、实际行为、可访问性、样式/几何、资源生命周期及承诺浏览器范围满足本文件门槛            | npm 尚未发布或没有 provenance，不说明组件逻辑不稳定；metadata stable 和静态测试库存也不证明当前 CI 成功。                           |
| 桌面宿主可用   | 相同 SHA 的 WebView2 宿主、bridge、组件场景和运行时证据绑定成立                                               | 包可安装、facade smoke、Linux WebKit 成功不能替代 Windows 组件行为；checked-in DesktopVerified=0 也不等于历史上没有执行过桌面测试。 |
| 稳定包已发布   | 版本/API/变更说明一致，已验证 tarball 进入 registry，provenance、tag、registry smoke 和对应版本文档有实际产出 | 发布工作流已配置、dry-run 或 artifact verifier 通过，只证明准备合同，不证明外部发布已发生。                                         |

浏览器稳定化的范围沿用[系统蓝图](./system-blueprint.md)：普通 Web、SvelteKit 与桌面 WebView 使用 ZUI；Miniapp 使用自己的组件和运行时。当前支持报告中的 Miniapp package acceptance 不能解释成 79 个 DOM 组件能够输出微信原生小程序。

`ui/zui/package.json` 在编制时仍为 `0.1.0`。建议在 API 冻结并完成稳定验收后，以 Changesets 和真实 registry/version 事实决定 `1.0.0-rc.N → 1.0.0` 的执行路径，不为获得“稳定”文字直接改版本。SemVer 的 0.x 与 1.0 公共 API 边界、兼容新增与破坏性变更规则见 [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html)。这不要求把后续新组件塞进 1.0 首次稳定面。

## 2. 编制时证据与最新边界

本轮实现已提交并推送为 `07778ba`（五档体系、API、文档阅读与复制工具栏），前置修复为 `dd5f18c` 和 `bf1e01c`。当前源码生成与页面检查记录属于这轮实现；该候选的完整 CI 执行结论需要单独关联，不挂到旧 SHA 下宣称通过。

后续 CI `34011087935` 已证实该候选仍有阻断：类型约束、旧断言和展示文本/可访问性等问题。已定位修复已提交为 `b0dc933`；单次 WebKit Popover 终态问题保留诊断。新提交的完整 CI 尚待执行结果，不能将已修复源码等同于全绿。执行顺序以总纲及第 0 节为准，尚不宣称稳定验收全部完成。

| 证据源                                                                          | 已知事实                                                                                                                              | 当前边界                                                                                                                                 |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [三组系统审计](./system-audit-2026-09-06.md)及下列细表                          | 36 + 27 + 16 = 79 族都有源码/API/视觉职责复核；第二批已落实共享尺度与实际消费者                                                       | 源码复核与文件诊断不能代替全部交互、主题、视口和浏览器执行。                                                                             |
| [catalog manifest](../../apps/docs/src/framework/catalog-manifest.generated.ts) | 79 个家族，141 个公开组件                                                                                                             | 生成物应在最终提交统一刷新，不以手写计数覆盖实际 catalog。                                                                               |
| [maturity](./component-maturity.md) / [JSON](./component-maturity.json)         | 静态矩阵分别统计metadata、公开入口、API快照、runtime及browser/visual/production/SSR合同资产；执行证据独立                             | `*ContractsDeclared`只表示资产存在；当前revision没有对应manifest时明确pending。DesktopVerified仅由绑定revision的WebView2 evidence提升。  |
| [stability candidates](./stability-candidates.md)                               | 初始读取为 stableCompliant=141、stableViolations=0                                                                                    | 当前脚本基于 authored contract 和 Docs/SSR/teaching 条件，不能独立授予浏览器稳定结论。                                                   |
| [前一提交 CI](https://github.com/kenconnet666/zadmin/actions/runs/34006402280)  | 已完成且失败；包括 Desktop Tooltip 改名遗漏、动画中间帧几何采样、固定颜色数断言、Mention reset、Tree fixture 名称和一个浏览器连接中断 | 修复或归属处理已记录在[导航/浮层审计](./navigation-overlay-audit-2026-09-06.md)；必须用修复后的 SHA 证明结果，不能把旧失败改写为新通过。 |
| 本轮真实 Chrome                                                                 | 主任务已有全页、实际主题/状态、入场中间帧、390px 阅读与导航、源码复制等检查记录                                                       | 逐页无横滚不等于全部 Demo 的全部组合均已验收；主任务的最终页面记录优先，本文不复制一个未完成的“全绿”数字。                               |
| [release readiness](./release-readiness.md)                                     | 报告仍 blocked；真实 publish tarball reuse、OIDC/provenance、自动 tag/release、registry smoke、versioned Docs 执行证据尚未闭合        | 这是发布渠道证据，不应混成组件逻辑故障。配置项与实际执行项分别保留。                                                                     |
| [support matrix](./support-matrix.md)                                           | 声明 Node >=22、Svelte >=5.56 <6；CI 基线 Node 24，chromium/firefox/webkit；独立 SvelteKit 和 WebView acceptance                      | 不编造浏览器最低版本，不承诺所有 SvelteKit/WebView2 版本；运行时版本和支持承诺分别登记。                                                 |

本轮已经落实的主要合同为：五档控件/面板/指示器用途尺度、八档文字、五种状态色与独立品牌色、Button 外观/色调分离、主题化入场/退出、动态 reduced motion、Field/reset 和禁用视觉修复、Palette 搜索透传、Tree CSS 行高观察、窄屏自然排版与源码复制。完整迁移见[视觉 API 迁移](./visual-api-migration-2026-09-06.md)、[输入审计](./input-api-audit-2026-09-06.md)、[导航/浮层审计](./navigation-overlay-audit-2026-09-06.md)。这些不是下一阶段待新增的功能。

## 3. 79 族覆盖映射

下面按真实 catalog 分类映射全部 79 族，不复制三个细表的逐组件结论。公开组件计数包含 compound 成员；Toast 的一个文档家族拥有多个公开组件。

| Catalog 类别 | 家族数 | 公开组件数 | 完整逐族记录与本轮落点                                                                                                             | 稳定验收重点                                                                                  |
| ------------ | -----: | ---------: | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| gene         |     12 |         12 | [通用/布局/展示/反馈 36 族](./foundation-display-feedback-audit-2026-09-06.md)、[第二批处置](./visual-api-migration-2026-09-06.md) | 原生语义与透传、Theme/Provider、文字/控制尺寸、Button/Link/Toggle 状态、Code 独立重依赖入口。 |
| layout       |      3 |          3 | 同上：Stack、AspectRatio、Container                                                                                                | 有界父布局、实际 gap/ratio/max-width、RTL、长内容；不增加无意义 tone/motion。                 |
| data-display |     16 |         16 | 同上：Avatar 至 Carousel 的全部 16 族                                                                                              | 展示语义、真实业务颜色/量程、表格滚动 owner、列几何、虚拟化与长内容。                         |
| feedback     |      5 |          6 | 同上：Alert、LoadingBar、Result、Spinner、Toast 家族                                                                               | live 优先级、排队/暂停/完成、异步竞态、实际主题颜色与运动偏好。                               |
| input        |     27 |         38 | [输入 27 族](./input-api-audit-2026-09-06.md)第二批表                                                                              | 原生 FormData/reset、Field 状态、IME/草稿、日期时间、异步选择和上传、复合尺寸。               |
| navigation   |      9 |         29 | [导航/浮层 16 族](./navigation-overlay-audit-2026-09-06.md)第二批表                                                                | 焦点与选择分离、键盘/RTL、菜单嵌套、Palette 搜索、Pagination、Tree、Tabs 容器边界。           |
| overlay      |      7 |         37 | 同上：AlertDialog、Dialog、Drawer、Popconfirm、Popover、Tooltip、Tour                                                              | Portal/owner Window、命名、嵌套 dismiss、焦点恢复、定位和真正的进入/退出。                    |
| 合计         | **79** |    **141** | 三组细表的并集与 catalog 对齐                                                                                                      | 不因某个根组件有证据，就自动忽略其公开 compound 成员。                                        |

验收所有权优先使用真实 Docs owner/member 映射，而不是仅从目录名猜 family；特别是 Toast/Toaster 等不在 compound 目录的组合。无 DOM Provider、纯结构布局与内部辅助元素允许“该视觉轴不适用”，但必须写明原因，并保留其真实结构/生命周期合同。

## 4. 浏览器稳定门槛

以下门槛应用到每个家族的全部适用公开合同。某轴不适用时写明原因，不为通过表格伪造 size/tone/键盘行为。

| 门槛              | 必须具备的证据                                                                                                                                                  | 不接受的替代                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| B1 公共 API 冻结  | 类型、实际默认值、runtime 消费、metadata、Docs/source copy、导出与负例一致；明确 null/undefined、受控/非受控、清空与 reset；所有重命名有迁移记录                | 只改 Props 联合类型；让生成器忽略旧 metadata；只在 Docs 用 CSS 遮蔽组件缺陷。                                                |
| B2 真实行为       | 当前候选 SHA 的三浏览器适用用例执行；键盘、focus、disabled/readonly/loading、IME、异步错误/迟到结果、用户与外部更新的事件次数正确                               | 旧 SHA 成功；测试源码存在；浏览器连接关闭或关键用例 skipped 后仍算全绿。                                                     |
| B3 实际视觉/布局  | 每个可见组件有与自身 render 对应的计算样式/几何/截图合同；适用组件覆盖五档比例、八档字级、状态色、长中文/无空格 token、RTL、390px 和桌面                        | data-size/data-tone 标记、CSS 源字符串或截图文件存在本身，不能证明实际渲染正确。                                             |
| B4 可访问性       | 原生元素优先、名称/说明/角色、可见 focus、无隐藏 Tab stop、正确 aria-current/selected/checked；高风险复合场景有目标浏览器与辅助技术检查记录                     | 只有 axe；把 Tab 菜单、Steps、Toolbar 的不同键盘模型统一成一个导航模式。                                                     |
| B5 生命周期与组合 | SSR/CSP、HMR、Document/ShadowRoot/iframe、Portal、observer/timer/RAF、异步 generation 和卸载清理都有适用证据；切换 reduced motion 立即生效                      | 单组件默认挂载截图；把 Svelte context 等同于 Portal DOM 祖先或 CSS 变量继承。                                                |
| B6 消费与文档     | 当前源码生成物一致；独立 SvelteKit 消费同一 checksummed pack；声明下界与现行主线有代表性组合验证；optional Shiki 不泄漏到普通入口；复制片段可编译且反映当前 API | 本 monorepo 相对路径恰好能导入；只验证开发源码而没有 package 边界；把单一 Node 24/catalog 版本外推成所有已声明版本都测试过。 |
| B7 无未说明的缺陷 | 阻断/高严重度问题为零；其余真实限制明确列出场景、替代路径与后续归属；生成报告绑定 SHA/run/test 或 artifact                                                      | “全部 stable”标签；没有数据的“性能很好”；为赶进度把故障改成宽松断言。                                                        |

B4 的辅助技术记录应覆盖实际目标，例如可取得的 Windows NVDA + Chromium/Firefox 场景；未执行 VoiceOver/Safari 等组合不能写成已验证。APG 明确要求针对实际浏览器/辅助技术组合验证，参考 [APG Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)。平台不可取得时，精确记录支持/验收边界，不通过添加 ARIA 属性假装完成。

矩阵不做无价值的笛卡尔积：基础样式 factory 可以用完整五档/六色×三外观 marker 检查；每个真实家族仍必须有消费和几何验证；状态、异步和嵌套交互按风险选择具体组合。纯文本/布局无需重复所有表单状态。性能只在实际虚拟/大数据/动画场景记录数据量、硬件、运行时和基线；不在缺乏测量时新增数字 SLO。

## 5. 七项视觉关联的准确修复

初始 maturity 的 7 个视觉 N 并不是 7 个完全没有视觉测试的组件。`data-display-layout-visual-contract.browser.spec.ts` 的原标记在文件顶部，Fixture 中也有重复 HTML 标记；当前生成器只认“同一 it 内显式标记 + 自身/自有 fixture render + 真实视觉断言”，因此原标记被正确忽略。

本规划过程中已获授权把标记移到以下实际拥有断言的 it 块，移除文件级/fixture 重复。没有改变断言、增加空测试或放宽生成器。

| 组件         | 已有实际断言                                               | 本次处置                                                                 |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| ZBox         | 根节点 240×20 实际几何                                     | 关联到第一条布局 it。                                                    |
| ZStack       | row、非零 gap，以及相邻子项真实位置差                      | 同上；foundation-stable-production 另有真实 flex/gap 合同。              |
| ZAspectRatio | 宽/高实测 16:9；foundation-utilities 另有计算 aspect-ratio | 同上。                                                                   |
| ZList        | OL、grid、24px 逻辑缩进与直接 li                           | 关联到第二条 List/Table it。                                             |
| ZTable       | measured overflowing、唯一 region、实际 overflow-x:auto    | 同上；tag-table-production 另有原生 table ref 和窄表/宽表的 owner 切换。 |
| ZDataTable   | 实际 th 非零宽度、真实列名与数据行                         | 关联到第三条 DataTable/VirtualList it。                                  |
| ZVirtualList | viewport 实测 120px、实际 overflow-y:auto、渲染窗口存在    | 同上；现有 virtual-list 用例另覆盖窗口、key、动态行与 iframe。           |

来源：[视觉合同测试](../../ui/zui/tests/data-display-layout-visual-contract.browser.spec.ts)、[自有 Fixture](../../ui/zui/tests/DataDisplayLayoutVisualFixture.svelte)、[生成器](../../apps/docs/scripts/generate-maturity-matrix.mjs)。

这能修复“基础视觉合同归属”，不能证明其全部视觉状态已执行。后续有意义的深化项为：

- DataTable：把已有键盘 resize 的 aria-valuenow=168 和 data-sticky 标记，补到真实 th/td 宽度、sticky 位置及 RTL 横向滚动后的对齐；不重新开发已经存在的列固定/显隐/调整 API。
- VirtualList：在变高内容、prepend、字体/主题改变时比较可见 key 的实际屏幕位置，确认无空白跳跃；已有数据窗口/active-descendant 断言继续保留。
- List/Table：自定义 Theme 的缩进、前景/分隔与有界长内容，验证 computed style 和唯一滚动区域；明确需要横向浏览的数据表可保留局部滚动。
- Box/Stack/AspectRatio：现有原生尺寸和布局合同有效，不为刷数量新增相同断言；新的嵌套 flex/grid 溢出问题只针对实际复现增加回归。

生成后的视觉关联数量与 CI 执行结果继续是两个字段，不把 141 个 authored visual links 写成 141 个视觉验收通过。

## 6. 应优先完成的稳定化与小幅重构

成本口径：S=单一职责/少量调用点，无新状态机；M=跨若干家族或生成/消费合同，需要集中迁移；L=新的交互状态模型和多环境组合，按总纲依赖拆分实施，不因规模而排除。

| 编号 | 优先级 / 类别   | 实际问题与建议                                                                                                       | 依赖 / 成本                                               | 可验收结果                                                                                        |
| ---- | --------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| S1   | P0 / 验收       | 将当前修复后的 API、Docs、package 和浏览器结果绑定同一 SHA；关闭旧 CI 已定位问题，单列浏览器连接中断                 | 现有 CI、maturity、artifact reader；M                     | 候选 SHA 的必要 job 完整执行，无关键跳过/未处理错误；问题与修复可追溯。                           |
| S2   | P0 / 证据归属   | 七项现有视觉合同准确关联，已实施；保持同 it/owned render 守卫                                                        | 现有生成器；S                                             | 生成物识别真实所属断言，反例仍拒绝文件级标记、其它组件或空 expect。                               |
| S3   | P1 / API 一致性 | 完成本轮重命名收口和原生回调边界；复核 Recipe 定义期 defaults/when 的 undefined、空 variants 与运行时守卫            | Props/metadata/Docs/types；M                              | 合法 API 不出现“类型接受但初始化抛错”的未说明分支；执行期 selected undefined 的既有回退不被误改。 |
| S4   | P1 / 报告可读性 | 报告明确区分 authored、executed、accepted；静态字段统一为AssetsPresent/ContractsDeclared，执行证据独立且绑定revision | maturity/stability/desktop artifact/report consumers；S–M | 单靠静态合同资产不可能展示“当前 CI 全绿”；旧Verified名称不再承载两种含义。                        |
| S5   | P1 / 删除冗余   | 清理旧 API 名称、重复手写尺寸/色盘、已被共享 helper 替代的代码和误导性旧阶段文案                                     | 本轮迁移表、rg、source facts；S                           | 无真实消费者的兼容壳不残留；历史文档明确历史性质；不删运行时边界和有意义负例。                    |
| S6   | P1 / 组合文档   | 补第 7 节的真实组合示例与针对性验收，不新建业务框架                                                                  | 现有 Form/Layer/Collection/Theme；M                       | 每个组合有唯一状态/焦点/reset/错误 owner；复制代码无需覆盖内部 data-slot 样式才能工作。           |

以下命名/结构先保留：Tree/DataTable 的 selectedKeys/expandedKeys 与现有事件名；files/nodes/items/options 的不同业务含义；页面 density 与控制 size；虚拟 itemSize/rowHeight 与主题尺寸；onAction、onConfirm 和原生 onsubmit/onreset 的职责差异。没有实质收益时不为整齐再次制造破坏性迁移。

`PresenceEntryMotion` 与 `Presence` 分别拥有入场帧和挂载/退场生命周期，已有多个真实消费者，保留这个小边界。不要把它们扩成全局动画框架。ICSS 遵循原生 CSS → 已有工具 → 薄适配，稳定视觉量用用途 token，结构零值、百分比、业务数据和一次性计算不机械 token 化。

## 7. 不新增公共框架的组合验证

| 组合场景                                      | 使用现有能力                                                              | 明确的 owner                                                        | 关键验收                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 编辑 Dialog/Drawer + Form + Select/DatePicker | Dialog/Drawer、Form/Field、输入、原生提交与取消                           | Form 拥有数据/校验；Layer 拥有焦点/dismiss；业务拥有异步保存        | 子浮层 Escape 只关闭顶层；校验失败保持值和焦点；取消后迟到保存结果不影响下一次打开；reset 一次。                         |
| 查询条件 + DataTable + Pagination             | Form/Input/Select、DataTable.sortingMode=server、Pagination.page/pageSize | 应用查询 owner 持有条件、请求、页码和排序；Table 不发请求           | 改条件显式回到第一页；旧请求不能覆盖新结果；分页/排序不双重执行；窄屏过滤区换行，表格只有自身滚动。                      |
| 表单错误摘要 + 字段内反馈                     | Form.errors、focusField/scrollToField、Alert/List/Link 或 Button          | Form/controller 拥有字段定位；页面拥有摘要标题与 live 策略          | 摘要关联字段标签和修正方法，能到达对应字段；错误不是仅靠颜色；不重复宣布同一消息。                                       |
| 菜单/确认 + Toast/LoadingBar                  | Menu、Popconfirm/AlertDialog、Toast、LoadingBar                           | 动作 Promise 由业务拥有；确认组件只处理一次请求；反馈服务只展示状态 | 取消不执行，pending 防重复，错误留在明确位置；Toast timeout 不充当请求超时；重开不复用旧结果。                           |
| 自定义 Theme + Portal + CSS 长度              | Provider/portalContainer、嵌套 Dialog/Popover、五档控件/Tree              | Svelte context 与真实 DOM/CSS 祖先各自明确                          | CSS var 在实际 Portal 祖先可解析；继承变量/字体改变后几何同步；iframe/ShadowRoot observer、样式与焦点在正确 realm 清理。 |

表单摘要的需求有官方依据，但仓库已具备 errors、focusFirstError、scrollToFirstError、focusField 和 scrollToField，因此先给组合示例，不立即新增一个维护相同状态的 ZFormErrorSummary。参考 [WAI 表单通知指南](https://www.w3.org/WAI/tutorials/forms/notifications/)。

## 8. 新能力的语义验收补充

新增范围、目标 API、优先级统一见[全面建设总纲](./full-capability-roadmap-2026-09-06.md)及两份完整对标矩阵。以下保留已研究的行为合同，不能解释成只建设三个组件。

- **Breadcrumb**：具名 nav、ol/li、原生链接与唯一当前项；隐藏装饰分隔符；保留 Ctrl/Cmd 点击；长路径折叠仍可访问、窄屏换行。层级分类没有真实路由时不伪造 href。依据：[APG Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)、[React Aria Breadcrumbs](https://react-aria.adobe.com/Breadcrumbs)。
- **Steps**：稳定 key、当前/完成/错误状态与切换请求；业务拥有校验、保存和是否允许离开；最多一个 aria-current=step。支持动态插入、跳过、长标签与完整流程；不强加 tablist 键盘模型。依据：[WAI 多步骤表单](https://www.w3.org/WAI/tutorials/forms/multi-page/)、[Ant Design Steps](https://ant.design/components/steps/)。
- **Toolbar**：一个 Tab 停靠点、方向键移动不执行动作、RTL/动态移除/disabled 回退；Menu 关闭恢复触发器；文本输入和内部集合的按键所有权明确。Toolbar 内的 RadioGroup 不能沿用普通方向键即切换 checked 的规则。依据：[APG Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)、[APG Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)、[Radix Toolbar](https://www.radix-ui.com/primitives/docs/components/toolbar)。

DataTable 已有排序、列固定/显隐/宽度、行选择/展开和虚拟化应继续复用；本轮在其基础上增加筛选、编辑、分组汇总、树数据、导出等能力，是否提供 DataGrid 高层入口由最终职责决定。RangeSlider、Rating、Watermark、图表、日程、富文本和代码编辑等全部属于新总纲建设范围。

DOM 组合接入和 Motion/Layer 的新能力需提供清晰的类型、焦点、原生属性、状态与卸载合同。纯布局、Provider、Form 或 Separator 只接入有意义的视觉轴，不为统一数量强加无意义状态。

## 9. 执行波次与完成定义

| 波次             | 内容                                                                                           | 退出条件                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| A 当前收尾       | 修复本轮已发现问题、源码/metadata/Docs/迁移一致，准确关联 7 项既有视觉合同，提交当前改动       | 文件诊断与生成物一致；变更范围可审查；最终候选 SHA 确定。                                                     |
| B 浏览器稳定验收 | 按 79 族映射执行 B1–B7；重点复查旧 CI 失败、动态主题、表单 reset、浮层几何、数据布局与阅读区域 | 当前候选 SHA 的必要 CI 与适用真实页面/辅助技术记录齐全；未处理问题有明确归属。不能用旧 run 或未执行声明代替。 |
| C 稳定 API 冻结  | 汇总 79 族/141 公开成员的适用证据、迁移指南、支持边界和 release candidate                      | 浏览器稳定结论可独立成立；后续兼容新增/破坏变更遵守公开版本策略。                                             |
| D 桌面与包发布   | 分别校验同 SHA 的桌面 runtime evidence 和发布 tarball/provenance/registry/versioned Docs       | 各自有实际执行证据才宣告通过，不回写成浏览器组件逻辑失败或成功。                                              |
| E 全面能力建设   | 按总纲 W1–W8 和能力矩阵实施大范围增强、新增、重构与组合                                        | 每个参考能力有实现或明确等价映射，新增组件达到相同稳定门槛。                                                  |

保持当前工作习惯：本地 WebStorm 与受影响文件检查，复杂测试、构建、性能/泄漏交给 CI；分阶段提交/push，在下一次 push 前读取前一轮对应 run，不在当前实现任务忙等新 CI。宣布最终浏览器稳定或执行稳定发布时，必须已有最终候选 SHA 的完整证据。

最小验收台账可在现有报告上追加 family、source SHA、实际 run/test/scenario、主题/尺寸/视口、结果和证据位置；不另建重复数据库或第二套 release manifest。状态至少分“已编写合同”“已执行通过”“待执行”“失败/有阻断”“不适用且有理由”。只有 79 族的所有适用门槛闭合，才对外表述“现有全部组件达到浏览器稳定标准”；包发布和桌面结论仍分别说明。

## 10. 本文件交付说明

本文件汇总三组逐族审计、catalog/source、maturity/stability/release/support 和官方参考的验收依据。生产修复、浏览器实测与提交记录见系统审计；本文件本身不构成新的执行证据。

本文件中的候选 API 与优先级是结合当前仓库职责作出的设计建议，不是官方库 API 的照抄，也不是已实现清单。旧蓝图的历史数量、实验状态和候选列表只用于理解来源；当前源码、生成物及绑定 SHA 的实际证据优先。

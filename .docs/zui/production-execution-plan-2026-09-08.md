# ZUI 完整能力、一致性与生产候选执行计划

日期：2026-09-08。本文是当前执行入口，承接最近的代码与用户规划。09-05 的逐项审计仅代表历史批次；09-06 的完整能力矩阵继续保留目标范围，本文确定最新基线、优先级、验收和模型分工。

## 1. 建档基线（后续状态见执行记录）

- Git：`13c9a6327ac424584c088f64b5441375c5cc6ea8`，master 与 origin/master 一致，开始时工作区干净。
- 生成事实：187 个公开组件、2674 个 Props、117 个组件文档页、598 个演示、9 个 guide。这是规模，不是完成率。
- 静态合同登记：browser 175/187、visual 161/187、production 179/187、SSR 184/187。缺口需区分真缺测试与 inventory 未识别。
- 141 个 metadata stable、46 个 experimental；当前执行证据 pending/partial，stableCompliant=0。标签或资产存在不等于通过。
- 建档时最新 [CI 34112603400](https://github.com/kenconnet666/zadmin/actions/runs/34112603400) 失败：构建、外部包、Docs 三浏览器通过；Static、组件行为、Coverage、Windows 前端检查失败。执行证据 job 成功但报告仍 partial。
- 最近完整绿 CI [33956955357](https://github.com/kenconnet666/zadmin/actions/runs/33956955357) 对应旧提交 3b4536f，不能外推至当前 HEAD。
- 发布工作流已配置，真实 publish/provenance/tag/registry smoke/版本化 Docs 五项仍无完成证据。

每批开始重新读取 HEAD、dirty changes、CI 和生成事实。其他会话的修改属于用户，不能覆盖；规模数字不在多份文档独立维护。

## 2. 目标与范围

目标是成熟组件库的完整接受能力、统一 API/主题/交互、独立可消费的包与文档、可追溯的生产候选验证。四条主线同步推进：当前候选修复与证据；一致性与公共抽取；标准/企业/领域能力；Docs 演示整理与美学。

真实 npm publish、tag/GitHub Release、生产部署及需凭据/审批的操作必须独立授权；此前交付可发布候选与明确外部待办，不伪称已发布。未发布阶段直接迁移冗余 API，不保留没有独立意义的废弃兼容分支。

完整目标继续承接：[总纲](./full-capability-roadmap-2026-09-06.md)、[企业矩阵](./benchmark-enterprise-components-2026-09-06.md)、[表单数据矩阵](./benchmark-forms-data-2026-09-06.md)、[组件族一致性](./component-family-consistency-2026-09-06.md)。复杂能力不能因成本或旧排除记录被悄悄删除。

每个能力 ID 记录：参考库/版本/日期/官方来源、ZUI落点、实现与差距、采纳/等价组合/延后/不采纳及理由、owner、代码/演示/测试、适用环境与验收SHA。延后不算完成，同名不算等价。

参考：[Ant目录](https://ant.design/components/overview/)、[Ant主题](https://ant.design/docs/react/customize-theme/)、[Naive DataTable官方文档源](https://raw.githubusercontent.com/tusen-ai/naive-ui/main/src/data-table/demos/enUS/index.demo-entry.md)、[MUI组件主题](https://mui.com/material-ui/customization/theme-components/)、[MUI X](https://mui.com/x/)、[Mantine Core](https://mantine.dev/core/package/)、[WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)。明确 core、企业组合与商业/可选领域边界。

## 3. G0：当前明确阻断

| ID   | 动作                                               | 验收                                                               |
| ---- | -------------------------------------------------- | ------------------------------------------------------------------ |
| G0.1 | reorder泛型key、Sortable duration与fixture类型     | typed key不丢失；集中duration转换；合法/非法Props测试，不用any绕过 |
| G0.2 | 四个DateTime/Calendar的泛型Props与DOM rest TS2590  | 语义props/DOM转发边界清楚；源码、外部声明、Windows检查通过         |
| G0.3 | DOMRect/IntersectionObserver shim、初值捕获warning | 真实接口兼容，有意初值明确，不隐藏警告                             |
| G0.4 | Form date adapter day 14/20复位失败                | 正式合同优先，接受/拒绝/reset与model owner一致                     |
| G0.5 | Sortable targeted、RTL顺序、FormList焦点/身份      | pointer/keyboard/action正确；接受回写、DOM/key/FormData保留        |
| G0.6 | Toolbar/ToggleGroup嵌套焦点                        | 依据实际owner区分item/trigger，Home/End与恢复一致                  |
| G0.7 | catalog旧79/141断言、README旧说明                  | 独立源集合对账或有意API快照，不生成物自证；合成fixture不机械改数量 |
| G0.8 | 当前SHA执行与汇总门禁                              | 必需CI全绿，composer/verifier接受真实输入，partial不算完成         |

先判定实现缺陷、旧测试预期或环境故障。Coverage当前有行为失败，不降低阈值解决。不相关设计和Docs整理可并行；依赖受影响基础的实现必须在对应合同修复后集成。

## 4. G1：API、主题与组件一致性

### API和默认值

- 逐族明确controlled/default/bindable、外部同步、用户通知、reset，以及undefined/null/空串/空数组的语义。保留value、checked、pressed、open、selectedKeys、Form.values的职责区别。
- readonly/disabled/loading/invalid不合并；原生事件取消权、业务回调时序和FormData有真实测试。
- 现有默认值规则表继续作为事实源，收敛消费者手写链。视觉覆盖与禁用/只读限制合并不能共用万能resolver；实例、Field/Group、专属默认、基础默认、density的差异应可读可测。

### Theme / ICSS / Recipe

- 保留五档控件、八档文字及size/space/fontSize/indicator的不同语义，不因数值相同合并。
- 明确status/content/action tone、品牌色、图表类别色、自由选色的边界。
- 严格内建Theme、自定义ICSS schema、业务扩展token的类型和运行时契约一致。
- 组件tokens、Parts、variants与应用覆盖层优先级清晰，所有配置有真实消费点。
- JS动画时间统一使用现有duration转换；CSS时长、反馈时间、业务超时分开。
- Recipe/SlotRecipe只共享重复校验、缓存、优先级、SSR注册和HMR/dispose内核，保留公共表达语义。

### Motion / Layer / Focus / 公共抽取

- 评估Presence/createPresence/EntryMotion重复编排，统一挂载/进入/退出/重开、RAF/timer/transitionend、reduced和destroy核心。Dialog、Popover、Accordion等至少三类消费者验收后推广。
- 业务关闭、focus/inert、定位分别保留；outside dismiss不是Tab trap，Sortable Escape不是关闭浮层。
- Layer/DismissableLayer/FocusScope共享必要realm/注册基础，但不形成UniversalOwner。
- CollectionNavigation、roving、active-descendant、Sortable handle形成窄focus adapter；selection不拥有DOM、query和业务mutation。
- Picker shell可共享open、inline/popover、readonly/disabled、focus restore、size，但不拥有日期/时间/range draft或Form model。
- createContextKey、ClipboardController已有基础继续复用，不再实现第二套；Clipboard可仅收敛重复反馈映射。

抽取前必须写重复证据、两个以上真实消费者、不能共享的职责和回归。优先函数、recipe、controller、私有片段，不增加无意义DOM；内部能力经简单/复杂消费者验证后才决定公开。

## 5. G2–G4：完整能力建设

### G2 W4与标准缺口

修复Sortable/FormList后衔接[Transfer E19](./w4-composition-next-2026-09-07.md)：专用移动事务→现有按钮消费→跨栏pointer/touch→Tree拓扑和lazy目标→DataTable行列重排。共享accepted/rejected/cancelled/stale/error词汇，不复制canonical数组，不用reorder冒充membership变化。

同步核对SearchInput、MaskInput、Editable、CheckboxCard/RadioCard、AvatarGroup、Prose、Highlight、CodeBlockGroup。等价外观/组合可以替代名称，不能遗漏能力。已有布局、导航、Range/Rating和日期族不重复从零建设。

### G3 企业、媒体与反馈

- DataTable/DataGrid：编辑事务、多列排序、筛选/服务端协议、跨页/all-filtered、分组/汇总/树数据、列状态、二维虚拟化、键盘单元格、导出与批量操作。
- 企业组合：FilterBar、QueryTable、FormDialog、EditDrawer、FormWizard、PropertyGrid、Kanban；HTTP/路由/持久化由调用方拥有。
- 媒体反馈：Image/PreviewGroup/ImageViewer、Cropper、Dropzone、Notification、LoadingOverlay、HoverCard、Watermark、QRCode；资源、队列、可访问性与释放所有权明确。

### G4 可选领域

Charts、RichText、Markdown、CodeEditor、DiffViewer、Scheduler进入接受能力矩阵。引擎版本/许可/体积、SSR/CSP/worker、清洗、主题和销毁先形成ADR。核心入口保持轻量；不把领域算法、编辑历史或日程状态塞进基础组件。

## 6. D：文档站整理，与每批实现同步

1. 为598个当前演示登记demo ID、组件族、教学目的、API/状态/组合覆盖、测试引用、源码/依赖、独立可复制性、保留/合并/重写/新增/移至测试。
2. 合并仅颜色/尺寸/文案不同且目标一致的展示；不能仅凭covers相同判重复。controlled/default、外部清空/reset、异步终态、键盘/触摸/RTL/reduced、FormData、独有领域边界必须保留或补齐。
3. 删除合并同步锚点、导航、源码、测试和执行证据；演示总数可以下降，关键覆盖不能下降。
4. 页面结构：最小可运行示例→常用API/外观→状态与所有权→真实组合→边界/失败/可访问性→完整API/限制。按profile定义最低场景，不为固定数量造重复Demo。
5. 紧凑、表单、数据、画布使用不同预览布局；统一标题/说明/操作/源码层级，减少多余空白和巨型状态墙。
6. 保留DemoBlock/ApiTable文档编排；通用按钮/复制/弹层/滚动使用ZUI。Theme Lab管理公共轴，不靠Docs局部CSS掩盖组件问题。
7. README/package guide补theme/layer入口与实际默认值；版本化Docs源码链接绑定版本/SHA，不永久指向master。
8. DateTime、FormList、Sortable、overlay、table代表页在干净外部消费者验证源码、辅助文件与依赖。试点Button/Form/DateTime/Sortable/DataTable后推广全部页面。

## 7. 里程碑与验收

| 里程碑                  | 必须满足                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| M0 可验证候选           | G0阻断闭合、同SHA必需CI全绿、执行报告真实接纳或逐项说明pending                             |
| M1 一致标准体系         | API/主题/动画/焦点有真实消费者，标准组件与Docs结构一致                                     |
| M2 接受能力完整         | G2–G4接受范围逐项闭合，延期不能冒充完成                                                    |
| M3 生产候选             | 三浏览器、SSR/CSP/HMR/ShadowRoot、外部包、支持的Windows/WebView2、关键AT与性能资源检查通过 |
| M4 真实发布（独立授权） | 同SHA制品复用、provenance、registry/tag/Release/Docs与post-publish smoke真实通过           |

几何、computed style、截图、键盘、屏幕阅读器、forced-colors分别取证；Axe和源码marker不替代全部验收。固定环境建立大数据滚动、连续开关、主题切换、样式规则增长与卸载资源预算。

当前12个browser、26个visual、8个production、3个SSR静态登记缺口先分类：真缺测试还是未识别。优先CheckboxGroup parts、Menubar parts、Fieldset、Grid/GridItem、新日期族/FormList视觉；不得只加marker抬分。

## 8. 模型、并行、验证与提交

- 依赖优先较新、支持完整的稳定版本：定期核对全部catalog、非catalog直接依赖、peer范围、Node/pnpm与CI工具链；升级按耦合族分批，不用裸`latest`代替可复现lockfile。当前清单见[依赖升级审计](./dependency-upgrade-audit-2026-09-08.md)。
- 升级先检查官方registry实际制品、engines/peer、类型入口、SSR/CSP与现有API兼容性，再做定向类型/消费端验证和精确SHA CI。major升级需同步代码和文档；已有预发布依赖按真实能力与迁移成本判断，不能机械改回数字更小的稳定分支。
- 最新版有可复现缺陷时选最新可验收版本，记录原因、证据、受影响范围及解除限制条件，不长期停留旧版本，也不以stub、skipLibCheck或放宽门禁掩盖上游缺陷。安全发布等待策略不全局关闭。
- GPT-5.3-Codex-Spark：搜索定位、明确小修、test shim与短反馈；不独立裁定公共状态或复杂泛型。
- GPT-5.6 Luna：批量清单、Docs归类、机械迁移和明确边界测试。
- GPT-5.6 Terra：常规组件、范围清楚的多文件类型/实现与定向测试。
- GPT-5.6 Sol/主代理：公共API、复杂泛型、异步事务、焦点/取消/生命周期与集成复核。
- 仅传必要上下文；每代理固定文件范围、验收、禁止动作，不无限再分代理。公共文件单一写入owner。
- 本地类型检查与定向验证；长检查用后台日志/状态。完整workspace、coverage、三浏览器/桌面矩阵交CI；不降阈值、不屏蔽错误、不反复重跑掩盖确定性失败。
- 审阅全部修改后阶段性提交；新CI只认精确SHA。构建成功、Docs成功、job成功、报告passed分开检查。

## 9. 执行记录

| 批次 | 状态                   | 内容/证据                                                                                                                                        |
| ---- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| P00  | 已提交                 | `6477326`：先提交本文与总纲入口，再创建持续执行目标；此前未修改生产代码                                                                          |
| P01  | 已提交，CI发现后续阻断 | `95d1113`：ZUI包2984用例通过（2跳过）、Docs三浏览器、构建、外部包、Windows桌面通过；Static/WebView类型、Docs生成类型语法、Coverage综合用例仍阻断 |
| P02  | 已提交，CI发现后续阻断 | `76c1f82` + `8375bfe`：运行时/类型显示/演示修复；精确CI已通过workspace行为、构建、外部包和Windows，但Static、Coverage及两个Docs时序用例仍失败    |
| P03  | 已提交，CI发现后续阻断 | `2858e37` + `2e8495a` + `d852182`：运行时/文档/审计修复，完整结果与未闭合项见P03记录；不算M0通过                                                 |
| P04  | 已提交，CI发现后续阻断 | `6576d4d` + `2d72d1e` + `6fda5ab`：Transfer E19A、状态比较、API生成与诊断；精确CI仍有外部声明、immediate行为及浏览器断连失败                     |
| P05  | 已提交，待组合SHA CI   | `1d7bf25`修复Transfer声明与同步终态、排除损坏Lucide版本，补TimeField边界及失败时coverage诊断；随后升级健康Lucide并同步依赖审计                   |
| P06+ | 待执行                 | 较新受支持依赖按族升级；继续消除coverage预算缺口与浏览器中断，再推进G2–G4与D；E19B跨栏拖放等接受能力不删减                                       |

### P01 集成记录

- Calendar与DateTime的DOM Props和语义判别分支分离；补充部分联合泛型、原生事件/ARIA、local/zoned与inline互斥负例。四组件原TS2590已消除，fixture有意初值捕获显式标注。
- 日期Picker先恢复受控canonical值，再rollback子字段草稿，避免模型拒绝后DOM仍显示候选值。Toolbar布局变化只有改变物理owner时才重建ToggleGroup注册。
- Sortable使用现有主题duration单位转换；键盘target回到源行定位为dragmove与position微任务之间的几何发布时序，并发现上一轮WAAPI取消后的初始rect过期。共享adapter只同步投影无nativeEvent的相对move，使用generation/source/initial token撤销未接受投影，并在dragstart后重新捕获已稳定且未移动的源rect。取消、replacement、disconnect、真实KeyboardEvent、scroll/ref边界已回归；未复制第二套键盘引擎，未保留临时Scroller接管或调试代码。
- FormList WebKit删除后的list root焦点视为浏览器fallback，但仅在删除前焦点属于本list时恢复邻项，外部程序化删除不抢焦点。server error测试改为真实编辑后seed，再验证重排迁移；不改变编辑清server error的正式合同。
- Docs检查发现并修正19处消费端类型错误：标题使用ZHeading、独立snippet明确参数类型、混合typed key明确领域、删除NativeSelect重复绑定回调。Stack响应式演示补回漏掉的component；catalog改AST计数并拒绝缺字段，运行时也拒绝不可运行demo。
- 重新生成时发现API提取器不支持反向条件类型，曾将2674个Props少计为2503；此错误生成结果未提交。现已修复有限条件集合求值、裸参数分发、不可达never与合法空分支、别名分发，以及禁止分支不应成为可用属性来源的问题；自测包含真实日期Props集合。重新生成完整恢复2674，逐组件数量与基线一致。
- 已执行的定向证据：日期adapter/Toolbar/floating/geometry Chromium 4文件12用例；Docs catalog 2文件17用例；Sortable三浏览器24用例；geometry/RangeSlider三浏览器18用例；reorder与Sortable SSR 7用例；FormList及nested Chromium12用例、unit8用例，WebKit12用例后补充外部焦点回归的FormList5用例。最终修改仍以收口后的检查结果为准，以上不替代精确SHA CI。
- 最后geometry与Sortable三浏览器合计48/48通过；ZUI和Docs类型检查均为0 errors/0 warnings。最终执行`pnpm zui:artifacts:update`、`pnpm --filter @zadmin/docs tokens:update`、全部修改文件Prettier/ESLint、`api:catalog:check`与Docs catalog 17用例均通过。生成器自测通过，类型提取数量完整保留2674；Stack漏挂演示恢复后catalog实际计数为599，不是凭空新增一项教学内容。
- 记录位置：本地可追溯日志`.codex/production-p01-final.json`及逐项log；执行计划与修复分阶段提交。M0仍等待修复提交精确SHA的完整CI，不以本地定向结果替代。没有执行发布、tag或生产部署。

### P02 集成记录

**精确CI取证。** [34187254423](https://github.com/kenconnet666/zadmin/actions/runs/34187254423)对应`95d1113d1d311ae86b1e31109572b678c67d6afe`，最终failure。构建、外部包、Windows C# WebView2和Docs三浏览器通过；ZUI包634个测试文件通过、2984用例通过/2跳过，workspace job在后续Docs生成类型语法测试失败。Coverage有1428通过/2失败；Static在WebView消费ZUI源码时出现30个ImportMeta.hot类型错误。已下载并检查component-execution产物：报告仍partial、三个Verified汇总均0；job成功不能代替报告验收。

- HMR：24个context owner以局部ImportMetaLike结构消费hot，保留编译后的调用方直接`import.meta.hot`，不向WebView添加vite/client或全局类型。WebView check已0 errors/0 warnings；真实源码擦除类型的回归与symbol identity测试通过。包含helper的25个模块与95d1113逐一比较，擦除类型/注释后的运行时代码完全一致。
- AsyncCollectionQuery：替代load/cancel先登记controller/generation，再abort旧请求并复核owner，修复同步abort listener发起的新请求被外层覆盖。9项unit通过，涵盖旧结果、重入、dispose不得复活；DataQuery与DataTable相邻4项验证通过。
- API显示类型：联合/交叉合并按TypeScript优先级为function/constructor/conditional等添加必要括号。没有改变原始组件API；生成2674个Props的语法测试已通过。错误日志只输出诊断code/message，避免循环AST对象淹没CI日志。
- Coverage综合用例：显式控制旧慢验证的完成顺序、等待真正的invalid/focus/值状态，按trigger的aria-controls定位弹层。保留25→22反向范围归一化以及新验证成功后旧验证才返回的覆盖。2个目标用例三浏览器6项通过；单用例coverage行为通过但全库阈值不满足，不记录为完整Coverage通过。
- Docs：完成Button尺寸展示去重、五档尺寸集中、模拟失败重试与语义tone；DataTable复用公开AsyncCollectionQuery，提供保留旧数据、空结果、失败/重试、取消和替代请求。未新增重复demo；5项新交互测试在现有WebStorm/Vite站点的Chromium通过，production build及其他浏览器交新SHA CI。
- CI诊断：workspace setup成功后，Static中的独立检查即使前一检查失败也继续运行；取消或setup失败时不运行。未使用continue-on-error，任何失败仍保留job失败结果。
- 最终本地验证：ZUI、Docs类型均0 errors/0 warnings；WebView消费检查通过；Docs unit 6文件32用例通过；新增Docs交互5用例通过；全部修改文件Prettier/ESLint、生成器自测与产物刷新通过。日志见`.codex/production-p02-types.json`、`.codex/production-p02-final.json`及对应逐项log。

P02运行时修复单独提交为`76c1f82`；Docs/类型显示/CI诊断与同步记录在随后提交，最终CI验证两者组成的完整候选。

### P03 集成记录

**精确CI取证。** [34190193018](https://github.com/kenconnet666/zadmin/actions/runs/34190193018) 对应 `8375bfe27a87adf02a3ccdf6c5966f607cf2e61e`，最终 failure。Workspace组件行为、构建、外部包、Windows C# WebView2、Drizzle和Docs Firefox通过；Static的workspace类型已通过，后续lint和系统审计失败；Coverage为1433通过/1失败，唯一失败是单一全量Docs SSR测试超过5秒；Docs Chromium/WebKit各218通过/1失败。执行汇总仍不可当作全候选绿灯。

- Rating：发现真实RAF未取消，新增同owner Window帧取消、替代版本和销毁保护。真实native selection回归验证重复调度、过期回调、当前修复和卸载取消；Chromium 6项通过。
- Splitter：抽取Home/End边界resize，键盘路径改为明确switch，保留水平RTL、垂直方向、百分比step/Shift step、collapse恢复和约束；unit/SSR/Chromium合计11项通过。不是仅为lint改写交互。
- SSR：保留全部600个物理示例及原glob，独立文件集合对账与逐项SSR共601项通过。没有降低范围或提高全局timeout；完整Coverage阈值仍交新SHA CI。
- 静态基础设施：正确识别返回disposer的DragDropManager monitor；共享recipe追踪实际消费与本地export，避免把抽取后的focus/border-box判成缺失；Form busy覆盖validating和submitting，日期段导航保留owner realm和非循环合同。静态AST正/负自测不替代真实浏览器行为。
- Docs图标：Calendar/MiniCalendar/PeriodCalendar自定义页头替换字符图标为Lucide，并保持RTL/按钮语义。审计区分控件图标和正常范围、尺寸、键位文本，避免误删正文。
- Docs复用与资源：4个既有演示的8个裸button改用ZButton，AppShell演示保留h2语义改用ZHeading；原生表单示范仍保留form所有权。Form schema演示补140ms校验和500ms提交timer卸载清理，并结算等待中的Promise、阻止卸载后写结果。测试明确断言同document的实际clearTimeout调用，不以等待timer自然结束代替清理证据；与日期偏好合计2项最终Chromium通过。
- Lint：修正误删type import、未用fixture参数/导入、稳定key和错误Svelte-ignore格式。命令式Map/Set仅对具体声明/预提交scratch保留窄例外，不改为响应式集合以免破坏事务发布；FormRegistry补原子重排观察者回归，Form unit 37项通过。
- Action默认值：metadata补delegated Toolbar层，新增实例/Field/Toolbar/专属/基础默认冲突的真实组合测试；外层Segmented专属值不被Toolbar基础fallback覆盖，非默认danger tone实际继承而CopyButton仍neutral。Chromium 2项通过，包含实际height/font-size，详见[局部审计](./action-family-defaults-audit-2026-09-08.md)。
- 日期偏好：现有DateTimePicker family demo增加RTL/full/reduced、外部清空和native reset；确认前后owner、草稿和实际CSS motion/方向回归1项Chromium通过。异步Docs pilot显式pause clock后5项通过；Slider的WebKit键盘FormData流程改为真实Enter提交并保留全部值/reset断言，不宣称发现Slider运行时缺陷。
- Transfer：新增不可变membership candidate/snapshot和共同结果词汇，typed key、disabled、orphan/order、过期快照与只读getter读取边界有20项mutation/transfer/reorder unit通过。尚未接入ZTransfer请求、取消、状态、locale、公开entrypoint与Docs，E19仍pending。

阶段提交已完成：`2858e37`（Rating/Splitter）和`2e8495a`（mutation/Transfer内核）。当批ZUI与Docs类型均0 errors/0 warnings，产物/token刷新和完整`audit-system.mjs`通过；其后的整库ESLint/CI结果见下文，不把当时后台检查记为已通过。历史日志见`.codex/production-p03-*.json`及对应log。

本地完整`pnpm lint`因历史CRLF工作树失败，不能记为原命令通过：Git索引与`.gitattributes`均为LF，工作树保留CRLF/混合换行。使用本地auto-EOL格式检查后，剩余32个warning文件逐个以原Prettier配置格式化结果对账，LF归一化后全部完全相同。未放宽仓库Prettier/CI配置，未批量重排849个历史文件；提交索引继续遵循LF。整库ESLint独立执行，远端仍执行标准`pnpm lint`。

P03最终组合提交为`d8521829917a03592cebed0c22957d4cb1d750c7`，对应[CI 34201251501](https://github.com/kenconnet666/zadmin/actions/runs/34201251501)。后续已核实：workspace类型、标准Prettier、完整系统/发布静态合同、构建、外部包、Windows桌面与Docs Chromium通过；ESLint只剩FormDemo新增timer Set的命令式所有权例外遗漏，P04按具体声明补齐。后台本地整库lint因耗时且要开始新代码编辑已显式停止，不能与新工作树混跑后记为该SHA验收。

Coverage的2052项测试全通过，但未覆盖预算失败。下载当前和旧绿`3b4536f`的实际summary后确认：uncovered lines 875→1591、functions 290→456、branches 1966→3760、statements 1694→2938；期间源码新增/变更多个组件族，不能归咎于当前SSR拆分，也不能把旧失败轮当作budget已通过。现有阈值不变，后续CI增加完整JSON定位分支；优先补NavigationMenu、TimeField/TimeRange/DateTimeRange与Tree/DataTable真实边界回归，不再重复基础smoke抬数量。Workspace测试另因`international-date-time-owner.browser.spec.ts`期间browser连接断开，在444/640文件后中止；只有3124通过/2跳过的局部结果，剩余文件不算通过。P04修正该文件对异步render的等待，并增加浏览器进程日志；尚未证明断连根因已解决。

该轮Docs WebKit/Firefox最终各220通过/1失败。WebKit失败发生在刻意打开未提交draft后点击被popup遮住的外部reset按钮，不是已经证明有退出残留；改为在确认dialog仍open时调用真实`HTMLFormElement.reset()`，直接验证reset本身关闭/重建草稿，普通reset按钮click仍在同测试前段保留。Firefox Cascader失败时trace显示popup已关闭、attempts=1、pending=true/error=none，失败按钮动作未真正结算应用Promise；不能归为请求被close abort。当前两场景在本机WebKit/Firefox合计4项通过，但Firefox原因尚未复现/闭合，新SHA CI继续验收。

### P04 接入前的关键边界

继续按W4计划落地Transfer E19A，先写下会影响实现的边界，不能只完成表面pending状态：

1. request pending允许原始value或预期nextValue两种快照，避免调用方先写回、Promise后resolve时误判stale；items key/order/disabled变化仍需过期。
2. pending时禁止重复membership写入，但不禁止筛选/浏览；不能提前按新membership裁剪来源勾选，accepted后才清理来源侧。调用方真实外部写入不能被拒绝结果回滚。
3. abort前预留终态，处理同步signal listener重入；所有旧请求收尾只修改自己的session，onMoveEnd可开始新请求而不被旧收尾覆盖。
4. reset先终止请求再完成唯一value owner、临时选择和草稿复位；卸载只释放，不发卸载后的公告/回调/焦点请求。
5. 焦点恢复使用语义key、现有MountedElements/ActiveDescendant与generation；等待期间用户主动移至其他控件时不抢焦点，virtual item需等待真实挂载或退回listbox。
6. immediate保持一次onValueChange；request由显式判别模式和外部精确回声确认，不再写第二次canonical value。最终公共Props/locale/entrypoint和正负类型测试一起定稿，纯candidate是否公开须由真实消费需求决定。

后续仍推进动画公共owner和Docs其余家族整理；G2–G4接受范围不缩减。新提交绑定精确SHA CI，不以以上定向结果代替M0。

### P04 集成收口记录

- `6576d4d`独立修复共享状态比较器：区分数组空洞与自有undefined槽位；逐对象对记录循环访问，单节点/多节点循环不再栈溢出，同时保留普通alias和复制对象的内容比较语义。组件状态与相邻Form共49项unit通过。
- Transfer E19A已有真实按钮消费者、显式immediate/request判别、精确raw echo、pending/终态、深层item变更、模式切换、reset/unmount及container-focus lease。独立8项Chromium与5项SSR通过。提前echo时header按当前full pane投影勾选数量，保留真实selection且不受filter影响。没有实现E19B跨栏拖放，不把本地通过当作完整W4交付。
- 实测发现并修复：onMoveEnd重入读取缓存的旧value；重复/稀疏echo被错误规范化；深层item修改未进入tracked snapshot；旧await后的focus未复核session；双重data-state metadata使API表格重复key崩溃。Docs新增统一递归API行路径校验，覆盖metadata和additionalApi，不用index key遮盖重复。
- Docs新增独立请求owner演示，保留数据加载/孤儿演示。通过真实FormData（不去重）、手动接受/拒绝/error、外部value/items stale、native reset和路由卸载验收；Chromium1项通过。继续补完整callback参数/终态文档，不仅显示类型别名。
- 生成器已支持同模块Shared、alias、union/intersection及可明确解析的Omit/Pick组成，request和terminal文档展示真实参数结构；继续拒绝外部原生handler、无关local、never-only、不明确filter和未支持的本地泛型实例化，不删除来源门禁。自测及真实API生成通过，187组件/2677 Props、0 metadata gaps/0 true fallbacks只是当前事实，不是成熟度。
- 最终验证：ZUI与Docs类型均0 errors/0 warnings；Docs unit 6文件35项通过；最后的artifacts/token刷新、全部修改文件Prettier/ESLint、完整audit:system、SSR5项及计数修复后的ZUI类型检查全部通过。日志见`.codex/production-p04-validation.json`和`.codex/production-p04-finish.json`及对应log；早期失败记录只用于诊断，不能混作通过。
- 未执行本地整库Coverage或重复三浏览器完整矩阵；新SHA CI必须继续验证coverage、浏览器中断与Firefox Cascader未复现路径。未发布npm、tag或生产站点，M0–M3未宣布完成。

### P05 当前修复与依赖审计

**精确CI取证。** [34212149364](https://github.com/kenconnet666/zadmin/actions/runs/34212149364)对应`6fda5ab1dd908aadbe8c99f183585a2dea410d83`，最终failure。Static、Docs三浏览器、workspace构建、Windows C# WebView2及Drizzle均通过；外部包检查因ZTransfer发布声明TS2590失败，workspace三浏览器和Coverage均复现immediate紧接反向移动失效。Coverage为2069通过/1失败，不能记为预算通过；workspace另有browser connection closed，需独立定位，不能因单用例修复便宣称断连闭合。

- Transfer源级类型：DOM props与语义判别分支分离，组件泛型约束真实moveMode；增加直接`ComponentProps<typeof ZTransfer>`正负测试和独立打包消费测试。P04仅缩窄SSR调用的泛型不足以修复发布声明，此批以实际`.d.ts`消费作为证据。
- Transfer同步行为：immediate在用户value写入同栈结算，不跨tick保留pending禁用选择；异步request仍保留pending、快照、回声及取消合同。测试检查紧接反向操作时目标已选、按钮可用、原始value清空且通知恰好三次；修前失败、修后定向Chromium通过，request八项通过。
- TimeField：补真实FormModel拒绝写入次数与接受通知区分、canonical/FormData回滚、enabled/readonly/disabled/formParticipation=none，以及原生reset。两项Chromium通过；未把未测的locale/hourCycle/RTL/IME算作完成。
- 依赖完整性：实测Lucide 1.42.0声明导入未发布的`@lucide/shared/types`，官方registry返回404；1.41.0声明自包含。暂以peer上界`<1.42.0`保护外部消费，同步安装文档，后续通过健康较新版本的完整验收再更新workspace锁定版本。上游修复后重新检验并解除限制，不加stub或skipLibCheck。
- Coverage诊断：Vitest默认在测试失败时不输出coverage，此轮产物确实缺少ZUI完整JSON；新增`reportOnFailure: true`保留诊断，不降低阈值，也不将失败或局部报告当作全量基线。
- 独立消费端新建项目自动选中Lucide 1.41.0，严格类型、构建、SSR及ZCode探测通过；Windows收尾发现preview进程未退出就删目录导致EBUSY。现已等待自有child退出并有限重试目录清理，进程未停或验证失败时保留现场；第二次全新gate最终exit 0。最终失败分支又收窄为stop失败不删目录，并以无child/已退出/正常退出/退出超时保留目录的self-test验证；CI同一验收步骤先执行该自测。原始功能错误不被cleanup错误覆盖。
- 浏览器断连仍未闭合：DEBUG日志中三个引擎均正常退出，无OOM/非零进程退出证据。Firefox的Input API专项四项通过且未启用Textarea autosize，未复现响应式/尺寸读写循环；此局部通过不能替代全部workspace剩余文件验收。下一SHA CI继续保留进程诊断。
- 本地收口：ZUI/Docs类型均0 errors/0 warnings，Docs unit六文件35项、Transfer SSR五项、TimeField最终两项Chromium通过；artifacts/token、修改文件格式与ESLint、完整audit:system通过。TimeField reset等待真实变化的分钟值恢复，避免只检查未变化的小时。日志见`.codex/production-p05-validation.json`及各项log；最后CI自测接线另通过cleanup self-test、release:coherence和格式检查。
- 依赖先行批已把workspace Lucide锁定版本从1.37.0提升到已验证的1.41.0，仅该包lock变化并移除旧发布等待例外。在线frozen install通过供应链策略，升级后ZUI与Docs类型0 errors/0 warnings、Transfer八项Chromium通过，日志见`.codex/production-p05-lucide.json`。未把首次缺少本机元数据的offline失败当作通过。
- 依赖审计覆盖53项普通catalog、2项named catalog、19条独立外部声明/peer，以及Windows两个NuGet引用；详细版本、来源、限制及下一组动作见[清单](./dependency-upgrade-audit-2026-09-08.md)。TypeScript 7当前不满足Kit和typescript-eslint peer；Vitest 5与pnpm 12作为独立迁移，不与本批行为修复混同验收。Vitest迁移先核实browser API配置、artifacts路径、sequential接口和实际render调用所有权；静态命中未await的数量不是已验证缺陷数量，也不能把升级推定成断连修复。

每条完成记录提交、命令/CI链接、结果和未验证边界。目标模式不能把一次局部测试通过当作全库完成，也不授权未经确认的生产发布。

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

### 本任务周额度预算（用户于2026-09-08确认）

- 以账户主Codex周额度**剩余30%**为停止线，而非已使用30%。按实际周窗口长度识别，不假设primary/secondary固定代表哪一种窗口；剩余量为100减去usedPercent。
- 每轮开始、派发/续发子代理前、阶段收尾时读取实时用量。接近剩余33%开始停止新批次与扩展并行，仅完成必要收口，为停止线留余量；达到剩余30%或更低时停止本任务开发和子代理，不因目标模式再次触发而忽略预算。
- 达线前记录最后已验证提交、未提交/未验证修改及CI待办，不为了提交而跳过审阅或把未完目标标成完成。Spark独立周额度达到剩余30%时停用Spark，不切换额度池来绕过主任务停止线。
- 若用量接口不可用，不猜剩余额度；先重试读取，仍不可用时暂停新派工并说明。额度是账户共享且有检查间隔，本任务无法限制其他任务消耗，也不能设置账户级硬上限。
- 仅因周预算暂停后，重置检查确认新周额度已恢复，且用户未另行停止/取消时，才从现有工作树与计划恢复；不能重新定义目标或覆盖其他会话修改。本地定时恢复需要电脑与应用运行；若目标模式开关仍需用户手动恢复，应明确告知，不能声称已自动切换。

### 执行约定

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

| 批次 | 状态                     | 内容/证据                                                                                                                                        |
| ---- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| P00  | 已提交                   | `6477326`：先提交本文与总纲入口，再创建持续执行目标；此前未修改生产代码                                                                          |
| P01  | 已提交，CI发现后续阻断   | `95d1113`：ZUI包2984用例通过（2跳过）、Docs三浏览器、构建、外部包、Windows桌面通过；Static/WebView类型、Docs生成类型语法、Coverage综合用例仍阻断 |
| P02  | 已提交，CI发现后续阻断   | `76c1f82` + `8375bfe`：运行时/类型显示/演示修复；精确CI已通过workspace行为、构建、外部包和Windows，但Static、Coverage及两个Docs时序用例仍失败    |
| P03  | 已提交，CI发现后续阻断   | `2858e37` + `2e8495a` + `d852182`：运行时/文档/审计修复，完整结果与未闭合项见P03记录；不算M0通过                                                 |
| P04  | 已提交，CI发现后续阻断   | `6576d4d` + `2d72d1e` + `6fda5ab`：Transfer E19A、状态比较、API生成与诊断；精确CI仍有外部声明、immediate行为及浏览器断连失败                     |
| P05  | 已提交，CI发现后续阻断   | `1d7bf25` + `b163154`：Transfer声明/行为与独立包已通过新CI；覆盖率预算、整库browser断连及Docs WebKit首击仍未闭合                                 |
| P06  | 已提交，CI发现后续阻断   | `1cb7356` + `1b3f6fd` + `1eb6277`：render所有权与组件回归推进；新CI定位Select重入、TimeField WebKit及Docs旧locator，仍有断连和coverage缺口       |
| P07  | 已提交，CI安装被拦截     | `7969859`组件修复、`c21f3cb`浏览器隔离、`7ae21cd`工具组；新CI因typescript-eslint发布等待期未进入组件验证                                         |
| P08  | 已提交，CI发现阻断       | `9b9756a`三浏览器Docs与其余组件/构建门禁通过，仍有Chromium整库连接中断和coverage预算缺口                                                         |
| P09  | 已提交，CI继续定位       | `8a914f1`只读范围/周期规则验收及API/pool/GC诊断已推送，整库断连仍复现；不算已修复                                                                |
| P10  | 基础本地通过，E19B实现中 | Chromium新headless、周期范围/焦点合同先独立提交；Transfer跨栏adapter、request-owner演示和回归独立收口                                            |
| P11  | 局部通过，完整CI未闭合   | Vitest5迁移已提交；三浏览器Docs及WebKit组件通过，Chromium仍断连、Firefox两处断言失败、coverage超预算                                             |
| P12  | 局部已验证，触屏未闭合   | Transfer布局动画、Docs策略和RangeSlider回归定向通过；Chromium触屏原型保留明确失败/未执行边界，未作为发布门禁                                     |
| P13  | 本地通过，待精确SHA CI   | 修复触屏滚动/长按焦点冲突，普通/虚拟模式10项模拟通过；补容器resize失效和脱敏浏览器生命周期诊断                                                   |
| P14  | 本地通过，待精确SHA CI   | Playwright/test1.63成对升级，通用触屏驱动供Transfer/Sortable复用，17项模拟回归通过；主CI配置保持对照                                             |
| P15  | 已提交，CI仍有阻断       | 共享布局捕获/失效/清理、Sortable early echo一致性、诊断启用路径unit与可选CDP网络错误采集                                                         |
| P16  | 局部通过，待CI           | DataTable pointer归属与实例dir向ZTable传递已复现修复，14项Chromium通过；33%阶段只做必要收尾                                                      |
| P17+ | 待执行                   | 继续连接/coverage与剩余接受能力；接近33%停止新批次，30%停止开发并交接                                                                            |

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

### P06 组件边界与测试基础设施

**上一批精确CI。** [34217518592](https://github.com/kenconnet666/zadmin/actions/runs/34217518592)对应`b1631543ebf7fe78614c27d1124f18d3ce50b095`，最终failure。Static、workspace构建、外部包、Windows C# WebView2、Drizzle、Docs Chromium/Firefox通过。Coverage 317文件/2072项全部通过，但未覆盖lines1589/functions455/statements2947/branches3779仍超过既有预算；full JSON已取得，不能算Coverage通过。Workspace在462/647文件、3210项通过/2跳过后因`choice-virtualization.browser.spec.ts`的tester连接关闭中止，不能把剩余文件算通过。Docs WebKit为221通过/1失败，DateRangePicker首击后仍是旧完整range，没有证据证明是重复日期或动画遮挡。

- TimeField真实修复：IME期间不提前提交/清空canonical，不接管方向键；compositionend后只在仍拥有焦点时前进，并复用ShadowRoot/realm-aware的`getActiveElement`。空composition、尾随input不重复通知、blur到外部后不抢焦点、ShadowRoot内正常前进都有回归。受约束的非法两位草稿不移焦，Escape恢复真实input文本与canonical/FormData。修前已复现提前清空和残留非法46；最终组件测试6项通过。
- NavigationMenu真实修复：快速single-sibling替代或全局disable发生在panel挂载前时，旧keyboard edge不得遗留。清理逻辑复用`isOpen`，同时考虑实际tree、expanded、ancestor、disabled和hidden，而非只看数组包含key。两种路径都先证明修前错误聚焦末项，再验证修后默认首项；专用13项Chromium通过。没有扩展非合同submenu delay或增加第二套焦点owner。
- 测试基础设施：当前已安装的`vitest-browser-svelte@3.0.0`的render已是async，并非等待Vitest 5才需修复。按真实import symbol识别474处standalone Promise，108文件补await、90个it/test/it.each callback补async，保留两个已有Promise chain owner的返回。主代理相对b163独立校验107个纯时序文件的AST去除async/await后完全相同；NavigationMenu与TimeField的新增行为断言单独审阅。未降低断言或容错时间。
- 持续门禁：browser lifecycle审计用TypeScript checker区分named alias、namespace及字面量成员、`/pure`、shadow和业务/SSR同名函数；识别括号await/return，拒绝standalone/void等不符合调用点所有权约定的写法。return/then仅证明直接owner转交，不声称完整数据流分析；变量转交当前要求改写为直接await/return。guard自测与当前全测试源码审计通过，定向Chromium3项/Firefox6项通过。此项尚不能证明此前CI断连根因已解决。
- Docs保持现有两个demo ID：模式演示从静态四控件改成单一可操作实例；实际小时、AM/PM、秒段、15分钟/10秒步进与readonly/disabled可观察，正文仅保留canonical值。表单展示enabled/readonly提交与disabled排除，先修改值再reset。最终专用Chromium E2E通过，使用已有5174 dev服务、无webServer配置；生产build/三浏览器仍交新SHA CI。
- 依赖补丁组：catalog和lock升级`@internationalized/date`3.12.3→3.12.4、`magic-string`1.2.2→1.2.3；未改变Svelte/Vitest/Playwright工具链，未强行重写第三方锁定的transitive依赖。现有编译器、日期/范围、Form值比较六文件50项unit通过；详细实施见[依赖审计](./dependency-upgrade-audit-2026-09-08.md)。
- 集成中发现Svelte原生oninput推断为Event而非InputEvent，已恢复真实事件签名并以属性存在性判断isComposing，没有cast绕过。最终ZUI、Docs类型均0 errors/0 warnings；artifacts/token、browser lifecycle门禁、Docs unit六文件35项、两组件Chromium19项、全部修改文件Prettier/ESLint及完整audit:system均通过。统一收口记录见`.codex/production-p06-final.json`，先前失败留在`.codex/production-p06-validation.json`，不混为通过。
- DateRangePicker的CI WebKit首击问题，在当前5174 dev服务使用原测试定向一次通过；本机已是date3.12.4且不是b163生产构建，不能据此认定旧失败flaky或已解决。没有扩大timeout、force click或改断言，保留待新SHA CI验证。

阶段提交：`1cb7356`包含组件行为、专用回归与Docs；`1b3f6fd`包含其余107个纯时序测试文件与持续门禁。后续依赖/记录提交组成完整候选，CI只认最终组合SHA；没有执行npm发布、tag或生产部署。

### P07 请求身份、跨浏览器交互与CI隔离

**上一批精确CI。** [34220762091](https://github.com/kenconnet666/zadmin/actions/runs/34220762091)对应`1eb62776e02a35dd11da50890136575121b3d1b9`，最终failure。Static、构建、外部包、Windows C# WebView2与Drizzle通过。Docs三浏览器各222通过/1失败：同一演示新增readonly/disabled实例后，旧分钟locator匹配到三个输入。Workspace为3350通过/4失败/2跳过，512文件通过、3失败且其余未完成；Select在Chromium/WebKit不能从已打开的trigger返回listbox，TimeField WebKit两项键入失败，另有`icss-token-integration` tester断连。Coverage 2077通过/1失败（同Select焦点），未覆盖lines1569/functions456/statements2926/branches3739仍超既有预算；失败时的coverage仅作诊断，不是通过基线。

- Tree以typed key为身份。否决按node引用重建请求：LogicalTree每次规范化会克隆node，不能因此让label-only或不可变数组更新重载。请求缓存owner只追踪loader、parentKey与hasChildren；普通label/textValue/selectionDisabled更新保持pending/error/loaded，禁用只终止活动请求，不清已完成empty/error缓存。
- Tree先释放旧generation登记再abort，允许同步abort listener启动的新generation不被旧finally删除。卸载先失效并清登记，再abort快照；持有旧controller也不能重新加载。预加载节点删除后同key空lazy重建的旧loaded缓存已有失败→通过回归；使用既有`tree.nodes` Map查询清理，避免对大树反复数组扫描。Tree专用11项Chromium通过，未修改LogicalTree的不可变约定。
- Select真实缺陷：等待初始open focus完成后，trigger方向键仅重复写true，不触发再次聚焦。新增私有content reader，区分普通listbox与virtual inner listbox，同步处理first/last重入，不改选中值；键盘veto与composition保留。普通/virtual合计六项Chromium、六项WebKit通过，keyboard metadata同步。不是删掉焦点断言或退回未await render。
- TimeField WebKit真实A/B：原focus.select被初次pointer默认caret覆盖，导致maxlength=2下键入12/46没有替换原值。仅在未聚焦segment首次左键时接管focus，使用realm-aware活动元素判断，已聚焦再次点击保持原生行为。修前WebKit2/6失败，修后WebKit与Chromium各6/6通过。
- TimeRangePicker只增加真实边界回归：有序范围的跨午夜草稿不半写双FormData、Escape恢复、open panel draft在reset时不提交、受控拒绝confirm后clear仍拒绝。等待Presence实际退出，不要求关闭动作同步移除DOM；没有改范围运行时。六项Chromium通过，关键业务字段用getAll检查单一提交owner。
- Docs旧TimeField locator限定到实际enabled实例，保留全部值与reset断言，Chromium/Firefox两项通过。Tree保留既有demo ID，使用公开controller与稳定key+signal，await后校验取消与节点存在再发布children；外部pending移除、取消计数、错误重试和selectionDisabled已有Chromium E2E。时钟最终使用pauseAt/runFor；早期只install仍走真实时间的失败不得当作runtime取消缺陷。
- CI隔离：workspace-tests保持同job id，三引擎独立matrix、fail-fast=false；Chromium跑完整workspace，另外两leg跑全部ZUI browser，不重复unit。维持非coverage CI原有串行file并发，避免隔离同时提高单job负载；coverage与Docs原矩阵不缩减。依据[Vitest v4官方实例说明](https://v4.vitest.dev/config/browser/instances)，原instances共享Vite server；这只是隔离/诊断措施，新CI前不能称断连已修复。
- 证据合并：三份原始Vitest报告文件名、artifact名唯一，各自hash与revision/run绑定。成功workspace必须齐三环境，unit只允许Chromium；环境/runner不一致、spec集合不同、同环境跨project重复、unit伪装browser pool均拒绝；旧单报告名明确拒绝。每条evidence指向真实所属输入，不生成伪合并producer文件；失败缺leg保留partial诊断且阶段blocked。reporter/composer/verifier自测通过，composer含22个负例。
- 集成发现support parser仅统计安装命令中的字面量浏览器，未识别matrix；已改为分别解析workspace/Docs各自job的matrix与install，防止借别的job凑齐浏览器。自测涵盖动态安装、缺matrix、仅部分Docs环境、CRLF；没有跳过支持矩阵校验。
- 工具依赖组已安装：ESLint10.10、typescript-eslint8.70、globals17.12、Changesets3.0.2、tsx4.23.13；@types/semver原已锁7.8，本次收归catalog，不冒充版本升级。Core类型与35项unit、release version self-test通过。未改变Svelte/TypeScript/Vitest/Playwright版本或发布包。最终ZUI/Docs类型0 errors/0 warnings，29项组件Chromium、Docs unit35项、reporter/composer/verifier、release coherence、全部修改格式/lint及audit:system均通过，日志见`.codex/production-p07-v2-final.json`。首次support parser失败保留在`.codex/production-p07-final.json`，不算已通过。

P07阶段提交为`7969859`（组件/Docs）、`c21f3cb`（CI/证据链）及`7ae21cd`（工具依赖/记录）。[精确CI 34228715125](https://github.com/kenconnet666/zadmin/actions/runs/34228715125)安装被typescript-eslint8.70.0整组未满24小时拦截，尚无本批组件矩阵结果。P08保留安全窗口并收敛至合格版本；细节见[依赖审计](./dependency-upgrade-audit-2026-09-08.md)。当前主周额度仍高于30%停止线；预算约定保存在本计划第8节，不改变完整目标。

### P08 安装策略、焦点所有权与既有演示验收

- `c774ce9`已提交并推送依赖修正。隔离目录/空cache、store的527条锁供应链校验通过，SHA256不变；[CI 34231365948](https://github.com/kenconnet666/zadmin/actions/runs/34231365948)已跨过所有setup步骤，工作区构建与外部包检查通过，完整结果尚待收集。该SHA不包含以下组件修复，不能混用证据。
- DateField真实WebKit pointer替换红测原本保持08而非新09。与TimeField抽取窄私有`segment-pointer-focus.ts`，初次左键聚焦保持整段选择，已聚焦后的点击仍走原生光标；不把locale/calendar算法放进该helper。补齐IME期间不提交/切段，结束后仅接受的有效日期且仍持有焦点才推进。根审阅补上组合结束前移焦外部及无效月13回归；两日期/时间spec的WebKit共12项通过。未据此宣称所有历法、输入法与移动浏览器已验收。
- DataTable真实外部点击删行红测证实旧focusedKey恢复会抢焦点。改为实际DOM焦点所有权检查，恢复前与tick后都核对owner realm；仅在仍持有焦点或移除/禁用后退回body时恢复。自有selection/expand控件失效与consumer cell控件分开处理，不更改公开API。审阅补齐原生onfocusout透传与consumer cell保焦回归，避免内部handler覆盖消费者事件。WebKit原生button点击不保证取焦，最终测试先显式建立并断言外部焦点后删除，不修改Button迎合测试；完整DataTable WebKit8项通过。
- DataTable `server-owner`现有演示已能说明分页、无结果和跨页选择，本次不增加重复demo。补真实Docs浏览器用例验证总行数9（含header）、第二页首行rowindex5、筛选空结果回到1/1页、清除恢复8条且保留`api, docs`选择；复用5174开发站，Chromium1项通过。DateField既有表单演示说明与可访问性同步IME/pointer规则。
- `c774ce9`的CI追加证据：Firefox/WebKit组件任务通过；Coverage的317文件2086项测试全通过，但未覆盖global lines1557/functions446/statements2903/branches3728、components1318/392/2465/3109超既有预算，没有放宽门槛。Chromium workspace在`pin-input-focused`创建tester时断连，268/317文件、1979项已通过，余下未执行；本批浏览器拆分不能记为彻底解决断连。Windows WebView2、build、外部包与Drizzle已通过；Docs与其余任务完整结论仍待采集。下一批优先检查Chromium非coverage与成功coverage/另两浏览器的执行差异，不把断连误计为组件断言失败。
- 最终本地：ZUI/Docs类型0 errors/0 warnings，日期/时间Chromium12项、DataTable最终Chromium8项与WebKit8项、日期/时间WebKit12项、Docs新增1项通过；artifact生成、browser lifecycle guard、改动格式/lint、audit:system通过。日志见`.codex/production-p08-final.json`与最终增量`.codex/production-p08-reviewed.json`；后者在native callback与typed testid审阅后重做ZUI类型及DataTable8项，不把前一轮结果冒充最终版本。
- 当前仍需新组合SHA CI。整库覆盖率预算、剩余组件家族/新能力与依赖组均继续按原计划推进；没有发布、tag或生产部署。

P09入口：先收集上述完整CI与coverage产物，按文件比较未覆盖绝对值，不降低既有预算。Chromium使用根`pnpm test`（包含workspace与ZUI unit/browser），另两浏览器仅执行ZUI browser project；coverage也能完成全部317文件。因此应在远端比较执行入口与provider连接生命周期，保留process stderr/exit和文件初始化证据；单文件绿灯不能排除跨文件问题，也不能直接归因于PinInput、OOM或声称升级Vitest必然修复。Luna完成只读预审，没有据此修改组件或测试框架。

### P09 范围只读合同、周期业务规则与连接诊断

- P08组件组合已提交为`9b9756aaddf94c2672a02c4a26c643b407b2fca2`，对应[CI 34232628520](https://github.com/kenconnet666/zadmin/actions/runs/34232628520)。上一轮`c774ce9`的Static最终通过，但三项Docs任务被新提交取消，不能算已验证；后续先等待当前Docs完整结论，避免连续推送让这条门禁始终被取消。
- `9b9756a`的Coverage完整317文件2091项全过，未覆盖global为1562/446/2909/3729（lines/functions/statements/branches），仍超既有预算。Chromium非coverage在`form-array-transaction`创建tester前断连，288/317文件2041项通过；不同轮次落点不同，tester与Vite先报告连接丢失，再报createTesters关闭，浏览器随后正常graceful exit。没有PinInput、FormArray断言失败或OOM的充分证据。
- Sol审计测试清理、直接mount与页面导航，未找到可证明的生命周期违规，因此不改这些文件。根代理核对已安装Vitest4.1.11的browser API、pool和Chromium GC源码，在workspace与coverage对照任务启用这三个精确debug namespace，并记录workspace测试前后的磁盘/共享内存与内存快照。未启用打印认证URL的Playwright provider namespace，未改并行度、移除测试、关闭reporter、强制GC或放宽预算；本次是诊断增强，不是断连已修复。
- Terra核对DateTimeRangePicker的readonly inline：开始/结束切换属于查看状态，不能因readonly而无依据禁用。实际选择、清除、确认仍禁止写业务值。本轮保留实现，补查看另一端后值不变、两端FormData各仅一条、受控FormModel拒绝clear且不通知onValueChange/onCommit的真实回归；切面板后重新查询仍连接的日期元素，避免对旧DOM空点击。专用Chromium7项通过，Docs同步分层语义。
- Luna审计两个日期/周期页面后没有按covers相似强行合并独立教学场景。在PeriodCalendar原RulesDemo补`isPeriodUnavailable`，禁用第2周，真实方向键跳过并选择第3周；保留财年与weekRules，仍使用ZUI组件，无新增重复demo。复用5174开发站的Docs Chromium1项通过。
- 本地最终集成：ZUI/Docs类型0 errors/0 warnings；模拟CI串行策略的11项Chromium（日期时间范围7、PinInput3、ICSS token1）通过，API/pool精确debug namespace实际输出已确认。静态生成、格式、定向lint、audit:system通过，日志见`.codex/production-p09-final.json`。小范围没有复现跨文件断连，不作为整库修复证明。
- `9b9756a`的Static、build、外部包、Windows WebView2、Drizzle、Firefox/WebKit组件与Docs Chromium已通过；Docs Firefox/WebKit仍运行。P09先本地提交，待这两项结束再推送，保留精确SHA完整诊断。当前主周额度剩余52%，未触及30%停止线。
- Vitest5.0、browser/coverage5.0与vitest-browser-svelte3.1.0已核对registry基础engines/peer及主要迁移点，支持链具备迁移条件，但尚未安装；官方迁移包括clearMocks默认、inline project server共享、sequential移除、command locator对象和matcher类型等，不能只改版本或声称其必然解决断连。major迁移仍按独立分组验收，先保留本次4.1.11的诊断对照。

### P10 基础验证与Transfer E19B接入

- `9b9756a`的Docs三浏览器最终全部通过，只有Chromium workspace连接中断与coverage预算使Required aggregate失败；随后已推送P09 `8a914f18391dd0ceb0744a082f287386c9c24233`，对应[CI 34234984396](https://github.com/kenconnet666/zadmin/actions/runs/34234984396)。
- 新诊断确认8a在`code-size`待执行期间先失去orchestrator，再失去tester；294/317文件2055项通过后中断。最后一次GC检查尚有约57GB可用空间，`triggered=false`，不能归因于低磁盘GC，也没有浏览器崩溃/被杀证据。Coverage仍完整317文件2092项全过，未覆盖global1552/439/2896/3719、components1313/385/2458/3100，仍超既有预算。不是所有连接断开都是异常：本地正常退出也会产生断连，必须结合发生在汇总前还是汇总后判断。
- Chromium instance改用`launchOptions.channel='chromium'`，运行完整二进制的新headless模式；依据[官方Playwright provider配置](https://vitest.dev/config/browser/playwright)。Firefox/WebKit、依赖版本、并发与覆盖率门槛不变。日志`.codex/p10-new-headless-probe.log`确认启动`chromium-1234/chrome-win64/chrome.exe`而非headless shell，代码尺寸2项与周期日历7项通过；这只是候选运行方式，是否修复整库稳定性仍待新SHA CI。
- PeriodCalendar增加strict范围拒绝跨不可用2026、allowNonContiguous允许内部空洞但不绕过2024/2028 min/max及不可用端点的回归；两端FormData明确单条/缺失。外部选择更新2027-02不改当前June焦点，也不伪造focusedValue回调。未发现需要修改运行时的缺陷，Docs同步公开合同。
- 上述基础改动ZUI类型0 errors/0 warnings、9项Chromium、定向格式/lint及maturity生成通过，可独立提交；Transfer新API实现不混入这次验证声明。
- E19B开始按[接入合同](./w4-composition-next-2026-09-07.md)实施`dragDrop`、pointer与Alt+逻辑跨栏移动。复用既有移动事务和request-owner Demo，明确gesture快照、typed key、checked清理与取消边界。当前实现/Docs尚未完成集成验证；真实touch、滚动竞争与动画仍保留为完整目标，不因本批先实现pointer/keyboard而删除。

P10后续收口：

- 基础提交为`30112c6aec02030a0857c5668f4623f7772ce9a8`，[CI 34237579270](https://github.com/kenconnet666/zadmin/actions/runs/34237579270)三浏览器Docs、Static、build、外部包、Windows、Drizzle、Firefox/WebKit组件全部通过。完整Chromium仍在`visual-evidence-audit`待执行期间断连，272/317文件2000项通过，不能把新headless模式宣称为既定修复。Coverage317文件2094项全过，未覆盖global1547/434/2889/3708、components1308/380/2451/3089仍超预算。
- E19B首批已实现`dragDrop=false`默认、普通/虚拟option的pointer跨栏与listbox Alt+逻辑方向移动，同一request/immediate事务保留typed key与唯一canonical owner。拖未勾选项只移动自身且不清其他checked，拖已勾选项按组；private focusKey保留拖起锚点。语义同值clone/改label不取消，实际value或readonly变化中止旧gesture，未提交手势不伪造onMoveEnd；同owner相反pane才高亮/可接收。
- 根审阅补齐非首项锚点、virtual真实注册/active-descendant、fixture abort/unmount结清等待、合法/非法dragDrop类型和dragDrop两种SSR idle路径；普通按钮/request回归与共享drag命令的Sortable调用仍通过。Docs只扩展已有request-owner并保留人工接受/拒绝/错误，不另造双栏示例；接受前后原生FormData与source的2项浏览器用例通过。
- 最终集成中资源审计先拒绝新monitor disposer数组写法；改成与geometry一致的具名typed连接函数，一处订阅、一处返回清理，未放宽规则。新增方向分支也改用共享navigationIntent，消除重复RTL箭头映射。首次审计失败保留在`.codex/production-p10-transfer-final.json`，中间失败见`p10-transfer-lifecycle-audit.log`，不覆盖为绿灯。
- 当前证据：ZUI/Docs类型0 errors/0 warnings，unit/SSR/plugin14项、Transfer/Sortable Chromium28项、Docs2项通过；最后连接函数/共享intent审阅后又复核ZUI类型、Transfer14项及完整audit:system，全部通过，见`.codex/production-p10-transfer-reviewed.json`。API/Token/Docs生成已同步，待组合SHA远端验收，不把局部结果扩张为全库通过。
- 下一步仍保留E19B真实touch/pen与滚动竞争、跨栏动画/reduced-motion、五尺寸/六主题和跨realm nonce交互验收。同时按Terra只读清单准备Vitest5+browser/coverage5+renderer3.1迁移：browser.api归并、sequential替换、.vitest工件路径及reporter/transform验证；不要把升级当作未经验证的断连根因结论。没有发布、tag或生产部署。

### P11 Vitest 5 工具链迁移

- Transfer首批已提交推送`9b1f93cc02749f28de1a7d14bf3564f0fb8fad23`，[CI 34243292365](https://github.com/kenconnet666/zadmin/actions/runs/34243292365)三浏览器Docs、Firefox/WebKit组件、Static、build、外部包、Windows、Drizzle均通过。Chromium非coverage仍在下一文件创建tester时断连（本轮selection-collection，268/318文件1993项通过）；Coverage318文件2101项全通过但global1551/432/2897/3722、components1312/378/2459/3103仍超预算。E19B第一批不是未经运行的占位实现，但全库验收仍未闭合。
- 按[依赖审计](./dependency-upgrade-audit-2026-09-08.md)升级Vitest/browser/coverage至5.0.0，renderer至3.1.0；保留Node24、TypeScript6.0.3、Vite8.2.2、Playwright1.62.1和1440分钟严格等待策略。正常安装与隔离空cache/store的524条frozen锁供应链校验通过，锁SHA256未改变；未新增安全例外。
- browser.api迁移到browser项目自身的test.api。第一次放到全局root test.api导致根服务与独立browser cluster争用端口，启动前/后端口均空且spec未执行；修正作用域后固定端口与strictPort保持，混合unit/SSR/browser正常通过。未通过随机端口、关闭严格模式或结束他人进程掩盖问题。
- Terra只迁移唯一describe.sequential为concurrent:false，原有9项Popover/Tooltip计时器与取消用例在Vitest5下通过，无skip/超时放宽。Luna补.vitest忽略及隐藏诊断上传；根审阅保留apps/packages/plugins/ui全部workspace的精确产物目录，不把整个工作区或.env加入上传。
- Reporter实际Vitest5 API仍兼容，无需改自有schema；reporter/composer/verifier自测通过，composer22负例与verifier3篡改负例保留。独立真实CI输入仍待新SHA采集，不伪造GITHUB_RUN_ID制造本地产物。
- 本地最终验证见`.codex/production-p11-final.json`：ZUI/Docs/WebView/Miniapp类型均通过；Core35、WebView24、Miniapp41、SvelteKit19、Docs35共154项消费者unit通过；ZUI混合23项与独立Tooltip9项通过。静态生成、lifecycle guard、改动格式/lint和audit:system通过。没有本地重复全库coverage或三浏览器大矩阵。
- 下一轮先核对新SHA的整库连接与coverage，不把局部成功当成Vitest5已修复断连。随后继续Playwright成对升级、E19B真实触屏/滚动/动画与剩余能力矩阵；任何新增失败按实际合同处理，不降门槛，不回退到已知不受支持的API。

### P12 跨栏动画、触屏模拟与真实 CI 失败审查

- 前置提交为`87907ab9fd3bb1a080165347a1c566341b4ff2ea`，[完整CI 34247029272](https://github.com/kenconnet666/zadmin/actions/runs/34247029272)已结束：Static、build、外部包、Windows、Drizzle、三浏览器Docs与WebKit组件通过。证据合并任务成功仅代表如实生成部分证据，不代表所有组件通过；Required aggregate失败。
- Chromium在`choice-input-size-production`创建tester后orchestrator断连，294/318文件、2062项通过。首次关闭前没有crash、SIG或heap-limit证据；GC日志中`triggered=false`、临时目录尚有约57GB。不能仅因最后文件名变化就归因于该组件，Vitest5也未解决整库断连。
- Firefox为164文件通过、2文件失败，816项通过、2项失败、1项跳过。失败分别是Popover退出DOM仍连接，以及RangeSlider真实拖动后值停在`50,50`。Coverage318文件2101项全通过，但global未覆盖lines/functions/statements/branches为1563/432/2910/3730，components为1324/378/2472/3111，仍超过原有预算；不下调门槛。
- Transfer触摸原型单独使用`vite.touch.config.ts`和`.cdp.ts`入口，手动命令为`pnpm --filter @zadmin/zui exec vitest --run --config vite.touch.config.ts`。报告独立保存为`test-results/transfer-touch-chromium.json`，不覆盖原三浏览器`component-execution`报告。原型尚未稳定，不接入必须CI步骤；不通过skip或放宽断言把它伪装成已通过的正式套件。CDP触摸输入不是物理设备证据，也不代表Firefox/WebKit触屏已验收。
- 共享keyed布局动画已实现：由同一移动事务驱动，接受后才匹配目标新DOM；外部提前呈现的echo、取消/拒绝、窗口resize/scroll旧几何、减弱动画及卸载清理均有明确边界。Sortable旧identity入口与keyed入口复用同一WAAPI实现，保留调用者动画，不写inline style、不复制DOM。验证包含virtual replacement、same-batch接受、跨render早echo不倒拉、拒绝和滚动失效。最后测试直接检查真实动画target/keyframes与Theme的normal=1000、easing=linear，暂停真实动画避免依赖短暂活跃窗口；通过真实1024×768 viewport建立横向布局，没有覆盖组件内部CSS。
- RangeSlider的原轨道宽1024、viewport宽1024，而endRatio=1.1将鼠标发送到x=1126.4。修正夹具宽度并加入“轨道外但视口内”的几何前置、真实pointer move/capture/up断言；组件运行时不变。Chromium/Firefox各13项通过；Juggler日志警告仍有出现，不能以该警告作为原失败的唯一根因。Popover退出本轮未复现，保留CI失败记录，不改时限。
- Docs复用原RequestOwner，增加公开ZuiMotion与ZProvider控制，默认auto尊重系统偏好；同一个Transfer/value owner覆盖full与reduced，保留接受前/后FormData。真实原生animate探针记录调用和关键帧，不只断言文案；Chromium2项通过，无新增重复业务演示。
- 本地收口：ZUI/Docs类型均0 errors/0 warnings，事务/SSR14项、共享动画/Sortable前轮14项与最后Transfer motion3项、上述Range/Popover两引擎各13项、Docs2项通过；API/Token生成、lifecycle、格式/lint和audit:system通过。首次夹具SelectionKey类型、动画spy的this类型、Docs choices泛化错误均已修正；失败日志分别保留在`.codex/production-p12-types.json`、`production-p12-final.json`和`production-p12-reviewed.json`，最终ZUI成功见reviewed，Docs与其余成功见`production-p12-reviewed-final.json`。
- 触屏独立冻结运行见`.codex/p12-transfer-touch-isolated-final.log`：横向跨栏通过，canonical按items顺序为`item-3,item-24`；tap/cancel未改value，但纵向内部scrollTop仍0。readonly/disabled两项在runner断连后未完成，不能记为通过。微任务事件记录未观察到dragging并不能排除sensor异步激活/转移pointer capture；下一批应在CDP事件后的帧边界独立读取dragging和滚动状态，先定位再决定是否采用上游touch长按激活策略。参考[Pointer Events触控行为边界](https://www.w3.org/TR/pointerevents3/#determining-supported-direct-manipulation-behavior)，触摸行为与最近滚动容器及touch-action有关；本批没有未经证实修改生产touch-action或阈值。

### P13 触屏滚动、长按与动画几何收口

- 前置`c3f0ee74cc2b1459af148ae6b151320d9b79cf17`的[CI 34252958841](https://github.com/kenconnet666/zadmin/actions/runs/34252958841)已结束：三浏览器Docs、Static、build、WebKit组件、Windows与Drizzle通过。Chromium在avatar待执行期间orchestrator断连，282/319文件2036项通过；Firefox为166文件821项通过、1失败1跳过，失败转为Dialog进入时的中间opacity轮询。Coverage319文件2105项全过，未覆盖global1563/432/2910/3734、components1324/378/2472/3114仍超预算。外部包任务是artifact Finalize阶段HTTP403失败，不误记成包编译/断言错误。
- 触屏帧级checkpoint给出独立红证据：纵滑18px后真实item已`data-dragging=true`，原Distance6抢走滚动。adapter针对touch复用上游长按/容差，鼠标保留Distance6；不新增公开阈值API。随后直开Docs发现hold后仍idle，追到TransferPane无条件preventDefault原pointerdown，导致延迟激活误判为已取消；改成只取消非touch的默认焦点行为，tap完成后恢复listbox焦点。两类缺陷都由生产实现修复，不在测试里跳过输入。
- 新的opt-in Playwright诊断在touch套件首次定位到主Page从`/__vitest_test__/`导航到`about:blank`，然后才发生provider teardown；无crash。活动拖拽修复后，前三类case在保留浏览器历史时通过。readonly/disabled本就不应接管原生手势，其右滑仍可触发宿主后退；仅这两类测试用受Vitest专属路径限制的[CDP history isolation](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-resetNavigationHistory)去除一次性runner历史，未在组件中禁止浏览器导航，未对活动拖拽清空history。
- 普通/虚拟模式按case成对执行：tap保留listbox焦点与canonical、短纵滑真实scrollTop增长且不drag、长按跨栏、激活后cancel、readonly/disabled无drag无membership变化，共10项Chromium触屏模拟通过。报告仍独立于三浏览器主证据，现加入Chromium专属CI步骤；见`.codex/p13-touch-normal-virtual.log`。hold duration是被模拟的真实按住输入，不是等待测试结果的补丁；检查点在每次事件后的帧边界读取。
- 直接打开5174 Docs、保留真实历史且不经过Vitest iframe的对照也完成：修前hold后dragging0/state idle，修后dragging1/state pending，owner接受后FormData为`["stable","candidate"]`；见`.codex/p13-docs-touch-native.out.log`与`p13-docs-touch-fixed.out.log`。现有演示与metadata同步短滑/长按规则，未增加重复owner或演示；真机、其他引擎触屏和更完整pen/跨realm验收仍未完成。
- Transfer root容器resize新增owner-window ResizeObserver，初始同尺寸delivery不失效，stop时disconnect；不改变accepted结果或canonical。独立真实observer确认CSS容器宽度变化，正常pending仍动画、resize后接受不使用旧FLIP。审阅纠正了把pending按钮Spinner旋转误计为列表动画的探针，现只统计role=option；没有因此给生产动画追加帧延迟。Sortable无同类本地pointerdown取消，但仍需补真实touch/grip规则和异步几何一致性，不能从Transfer的证据推导完成。
- 诊断wrapper默认关闭、factory保持同步，保留provider descriptor/prewarm/serverFactory及原launch/端口/并发；启用时区分unexpected、session-replaced、provider-teardown。URL仅pathname，消息去host/userinfo/query/hash、折行并截断，3项unit通过。主CI不运行旧touch原型，因此主Chromium断连原因仍待新SHA的诊断，不能用touch导航结论代替。
- 依赖候选重新核实于[依赖审计](./dependency-upgrade-audit-2026-09-08.md)：Playwright/test1.63.0已过等待期，但本轮未安装，以保持本批输入/runner诊断版本固定。typescript-eslint8.70.0在核查时仍未满1440分钟，保留8.69.0，没有增加安全例外。
- 最终本地：ZUI/Docs类型0 errors/0 warnings，unit/SSR/诊断17项、鼠标/键盘与既有motion9项、修正探针后的容器resize2项、触屏普通/虚拟10项通过。resize fixture显式full，不依赖宿主系统动画偏好；最后再核对2项通过。API/Token生成、lifecycle、格式/lint和audit:system通过；见`.codex/production-p13-final.json`（保留Spinner误计导致的首次失败）、`production-p13-reviewed.json`及`p13-resize-final.json`。诊断URL大小写scheme脱敏补充负例后单独3项unit通过。无本地整库三浏览器或coverage重跑，仍等待提交SHA的完整CI。

### P14 Playwright 成对升级与 Sortable 触屏合同

- 前置为`d14c2337ddd749a108060ea460e5ef5059d38b34`，[CI 34259123075](https://github.com/kenconnet666/zadmin/actions/runs/34259123075)已结束：Firefox/WebKit组件、三浏览器Docs、Static、build、外部包、Windows和Drizzle通过；独立Transfer触屏10项也通过。Chromium主套件仍断连，Coverage321文件2110项全过但未覆盖global1619/450/2975/3760、components1326/378/2475/3121超旧预算。证据生成成功不是全库验收成功。
- 诊断更正：历史116/142/130/150个browser文件完成后分别出现断连，不能把unit+browser总文件数当iframe次数或固定阈值。本轮第151个browser文件tester已连接，Vite与control WS接着连接失败；Page没有异常导航、关闭、崩溃或pageerror，provider随后才teardown。现有socketerror为空字符串，不能臆造Chromium net error。每页iframe/WS周转与问题相关的假设仍待验证；未用内部强制GC、增加并发、改端口或放宽timeout冒充根因修复。
- 按[官方1.63发布说明](https://playwright.dev/docs/release-notes#version-163)升级Playwright/test成对版本，保留Vitest5、主spec集与CI并发作为对照。Node24满足要求，三个浏览器安装通过并用`--no-remove`保留旧缓存。pnpm顺带调整的svelte-check三个peer指向和Parcel的picomatch解析已恢复，完整frozen安装与523条供应链校验通过；当前锁SHA256为`C28CA8A2ABF3083AD60B77C7AB13E3DDEC52A5A1B94FA156D02F3845BC000190`。1.63官方未声明修复本项目这类WS问题，完整CI结果仍是判据。
- 触屏命令提取为`tests/touch-commands.ts`与独立类型声明，供Transfer和Sortable共享；不保留未发布旧名字的deprecated别名。专属config输出改为`test-results/touch-input-chromium.json`，主三浏览器证据协议不变。健康tester在文件隔离时会关闭WS，诊断现在标记Page仍active，不误称为异常Page关闭。
- Sortable直接使用已有readonly/disabled/itemDisabled和onMoveRequest合同：内容区短滑滚动，独立grip长按跨行，cancel、整体禁用、单项禁用、只读与owner拒绝各有真实协议输入和实际顺序/终态断言。起终点先验证可见，锁定项先滚入视口；修正了content选择器误匹配嵌套ZButton content的问题，采用row直接子部件。既有组件实现通过，不为了测试额外制造API或定制一套手势。新增7项与Transfer10项合计17项Chromium模拟通过；真机与其他引擎触屏仍未验收。
- 本地验证见`.codex/production-p14-final.json`：API等生成、ZUI/Docs类型0 errors/0 warnings、26项Chromium组件回归、2项Docs E2E、证据composer/verifier自测、3项诊断unit、lifecycle、格式/lint与audit:system全通过；触屏17项见`.codex/p14-touch-combined.log`。旧的Sortable选择器失败保留在`p14-sortable-touch.log`。没有本地整库三浏览器或coverage重跑，下一步用新SHA完整CI确认1.63的稳定性及覆盖情况。

### P15 共享动画几何与诊断覆盖

- 前置`9ddb8b5666bb726048031116dabbc36cb8943387`的[CI 34264653813](https://github.com/kenconnet666/zadmin/actions/runs/34264653813)已结束：Firefox/WebKit组件、三浏览器Docs、Static、build、外部包、Windows、Drizzle和独立触屏17项通过。Chromium主套件114个browser文件完成后，在carousel新tester连接阶段再次出现Vite/control WS失败；267/321总文件1991项通过。Page无异常导航/crash，1.63并未解决整库连接问题。Coverage321文件2110项全过，但未覆盖global1615/448/2970/3756、components1322/376/2470/3115仍超预算，未降低门槛。
- 新增内部`layout-motion-capture.ts`供Transfer与Sortable共享，统一stable-key几何、root/已测量元素尺寸、scroll、owner-window resize及AbortSignal的生命周期；首次同尺寸ResizeObserver通知不使快照失效，失效/停止即释放监听与元素引用。纯`layout-motion.ts`仍只负责几何与WAAPI，不拥有业务items或事务。reduced/零时长/预先abort不调用元素getter或读取几何，避免无用布局读取。
- Sortable对齐Transfer：接受与“能否播放动画”分离；same-batch owner echo+resolve仍动画，已跨render呈现的早echo在晚到接受时不倒播。正常/rejected/error/cancel/stale/unmount均清理捕获。保留先取消旧owned动画、再采集的位置，以及setup错误进入原onMoveEnd(error)路径，不增加公开API或生产帧延迟。
- 初次联合25项通过但helper的测试观察器在自己的ResizeObserver回调微任务内接着写尺寸，产生undelivered notifications告警；改为在下一帧恢复测试变更后，helper6项通过且无此告警。测试只记录真实row/option的transform，不把Spinner计入；尺寸与滚动使用实际浏览器通知，不以tick代替render事件。
- 诊断启用分支补真实wrapper unit，使用有类型的provider/page替身驱动实现，覆盖factory同步/descriptor保留、页面生命周期、WS、console过滤、脱敏和终止分类。未排除诊断脚本或下调coverage。1.63仍未给出net error，因此增加独立开关的Chromium CDP Network错误取证；只记录脱敏路径/错误和资源类型，不读取请求头、响应体或WS帧payload。新SHA的网络证据仍待采集，不能由空socketerror猜测错误码。

- 最终定向验证见`.codex/production-p15-recheck-final.json`：ZUI/Docs类型0 errors/0 warnings、15项unit/SSR、26项Chromium、17项触屏模拟、2项Docs、lifecycle、生成/格式/lint与audit:system均通过；border-box及border-only尺寸变化也有真实回归。首次类型失败日志保留，测试替身保持同一显式provider结构类型，不放宽生产factory合同。
- 真实浏览器发现诊断在Page正常关闭后重复detach会误报。独立session仅在Page仍打开时detach，并对期间关闭做窄处理；活着的Page上的真正清理异常仍报告。最终14项unit+browser复验与ZUI类型/格式/lint通过，日志含network-ready且没有setup/cleanup误报，见`.codex/p15-diagnostics-final.json`。这只证明诊断可运行，不等于整库WS断连已修复。完整CI与coverage仍待新SHA。
- 03:38与收尾实时查询主周额度均剩34%，未到停止线；不继续扩大本批或派新子代理。[阶段交接](./handoff-2026-09-09.md)保留现有预算规则、代码边界与下次CI取证入口。

#### P15 远端核对（2026-09-09，北京时间）

- `7180baa8c89c08a0d8617b3ef10fd547ed806363` 的 [CI 34270838463](https://github.com/kenconnet666/zadmin/actions/runs/34270838463) 已确认三浏览器组件任务通过，Chromium 主套件为323文件2127项，独立触屏17项通过。本轮没有中途断连，Network诊断实际启用且无错误；只记为本轮通过，不把新增观察器后的单轮成功当作历史WS断连根因已解决。
- Coverage同样323文件2127项全过，但global未覆盖lines/functions/statements/branches为1595/459/2960/3755、components为1325/377/2471/3115，仍超原有预算。已读取本次完整coverage JSON，优先核对DataTable pointer调宽与resetColumnWidths、Tree公开controller、NavigationMenu overflow请求取消/关闭透传；这些是验证缺口，不直接推断实现错误，详见交接。
- 本轮已全部结束，最终failure。Static、build、外部包、Windows、Drizzle、三浏览器组件、Docs Chromium/Firefox和证据合并通过；Docs WebKit为226通过/1失败。失败是DatePicker选择20日后trigger未聚焦，而截图值仍是18日、popup仍open，不能只认定是焦点延迟。完整trace/screenshot已下载至`.codex/p16-docs-webkit-7180`，先保留待定位；没有放宽timeout。此前文档提交`40cbaef`保留在本地，待这一轮结束后随下一次已审阅提交推送，未主动取消运行中的Docs证据。

### P16 DataTable 指针归属与方向一致性收尾

- 从 P15 的真实coverage定位`beginResize`未执行，再在浏览器复现无关pointer影响当前列宽。按[Pointer Events 的 pointerId](https://www.w3.org/TR/pointerevents3/#dom-pointerevent-pointerid)保持手势身份，过滤无关move/up/cancel；结束监听不再被无关事件的once提前消费。原宽度canonical owner、clamp、键盘和结束语义保持，不新建公开API。
- 真实鼠标检查继续发现实例`dir="rtl"`没有传递给内部ZTable。已用公开prop复现“外层rtl、内部ltr”，统一外层/内部的解析方向并让pointer与keyboard均读取分隔线实际方向。测试先确保分隔线进入视口且实际命中，不通过改内部样式或增大超时绕过。
- 最终定向Chromium14项通过；原有8项保留，新增4项pointer身份/终态回归和2项真实鼠标LTR/RTL。浏览器事件派发不是物理多触点设备验收，其他引擎和完整coverage仍交新SHA CI。首轮失败记录、类型/资源审计/生成收尾结果见`.codex/p16-datatable-recheck-final.json`与交接。
- 04:10主周额度剩33%，仅完成此批已确认问题的必要收尾，不派新代理或开启DatePicker/其他组件族修复；保留新CI与WebKit失败入口，30%停止线不变。
- 04:15本地收尾全部通过：14项Chromium、ZUI/Docs类型0 errors/0 warnings、生成/token同步、lifecycle、lint/format和audit:system；其余验证交新SHA CI，不以旧轮绿任务代替本批完整验收。
- P16已推送`f0e71706e5eda473682c216834c3c777108eba84`，[CI 34273892722](https://github.com/kenconnet666/zadmin/actions/runs/34273892722) 的Chromium主套件323文件2133项与独立触屏17项通过；DataTable14项实际执行通过。Coverage同样全过测试，但global1560/456/2921/3734、components1290/374/2432/3094仍超原门槛，其余任务尚需终态。只补交接证据，不再开启新组件族；P15 WebKit trace的点击拦截/坐标变化线索已保留在交接，未冒称根因修复。

每条完成记录提交、命令/CI链接、结果和未验证边界。目标模式不能把一次局部测试通过当作全库完成，也不授权未经确认的生产发布。

# ZUI 完整能力、一致性与生产候选执行计划

日期：2026-09-08。本文是当前执行入口，承接最近的代码与用户规划。09-05 的逐项审计仅代表历史批次；09-06 的完整能力矩阵继续保留目标范围，本文确定最新基线、优先级、验收和模型分工。

## 1. 当前核查基线

- Git：`13c9a6327ac424584c088f64b5441375c5cc6ea8`，master 与 origin/master 一致，开始时工作区干净。
- 生成事实：187 个公开组件、2674 个 Props、117 个组件文档页、598 个演示、9 个 guide。这是规模，不是完成率。
- 静态合同登记：browser 175/187、visual 161/187、production 179/187、SSR 184/187。缺口需区分真缺测试与 inventory 未识别。
- 141 个 metadata stable、46 个 experimental；当前执行证据 pending/partial，stableCompliant=0。标签或资产存在不等于通过。
- 最新 [CI 34112603400](https://github.com/kenconnet666/zadmin/actions/runs/34112603400) 失败：构建、外部包、Docs 三浏览器通过；Static、组件行为、Coverage、Windows 前端检查失败。执行证据 job 成功但报告仍 partial。
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

- GPT-5.3-Codex-Spark：搜索定位、明确小修、test shim与短反馈；不独立裁定公共状态或复杂泛型。
- GPT-5.6 Luna：批量清单、Docs归类、机械迁移和明确边界测试。
- GPT-5.6 Terra：常规组件、范围清楚的多文件类型/实现与定向测试。
- GPT-5.6 Sol/主代理：公共API、复杂泛型、异步事务、焦点/取消/生命周期与集成复核。
- 仅传必要上下文；每代理固定文件范围、验收、禁止动作，不无限再分代理。公共文件单一写入owner。
- 本地类型检查与定向验证；长检查用后台日志/状态。完整workspace、coverage、三浏览器/桌面矩阵交CI；不降阈值、不屏蔽错误、不反复重跑掩盖确定性失败。
- 审阅全部修改后阶段性提交；新CI只认精确SHA。构建成功、Docs成功、job成功、报告passed分开检查。

## 9. 执行记录

| 批次 | 状态               | 内容/证据                                                                                                                         |
| ---- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| P00  | 已提交             | `6477326`：先提交本文与总纲入口，再创建持续执行目标；此前未修改生产代码                                                           |
| P01  | 本地通过，CI待验收 | G0类型/shim/catalog；Sortable共享几何、日期adapter拒绝回滚、Toolbar焦点与FormList WebKit恢复；以本节对应修复提交的精确SHA进入CI   |
| P02  | 试点清单已建立     | 当前SHA执行验收待CI；[7族41项演示静态清单](./docs-demo-pilot-inventory-2026-09-08.md)已区分保留/重写/补证据，尚未把建议当作已实现 |
| P03+ | 待执行             | 依赖闭合后按G2–G4与D主线继续，不重复历史数量                                                                                      |

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

每条完成记录提交、命令/CI链接、结果和未验证边界。目标模式不能把一次局部测试通过当作全库完成，也不授权未经确认的生产发布。

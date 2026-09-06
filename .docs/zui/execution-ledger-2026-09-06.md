# ZUI 全面演进执行台账

总纲：[完整能力路线](./full-capability-roadmap-2026-09-06.md)。目标模式已启动；本文件随可交付阶段更新。适用范围包括已有/新增组件、删减重构、UI/Theme/Motion 与 Docs。

## 执行约束

- 本地使用 WebStorm MCP 的文件读取、符号信息/重命名、受影响文件诊断；必要的真实页面交互通过 Chrome 插件检查。
- 长时间类型检查、测试、构建、覆盖率、多浏览器/桌面和稳定矩阵交远程 CI/CD；推送后继续实现，不等待新 run。后续推送前读取上一 run 的具体结果。
- 主模型处理共同基础与最终集成；独立组件使用较低成本模型，文档/CI归类/能力研究使用轻量模型。所有分支限定文件所有权，并由主任务检查实际类型、语义、样式和组合。
- authored、implemented、executed、accepted 分开；目标不会因新增文件或 metadata 标签而自动完成。

## E1：响应式布局与默认值基础，导航首个消费者

已提交并推送：`424128d6fd5c6e73cbe5a99bc50b8845591bcf0f`。推送后继续E2，未等待新CI。

对应总纲 W1/F2/F4、W2/N2/N3 与 V1–V4。当前目录为 82 个家族、145 个公开组件；新增能力尚待远程完整验收，metadata 保持 experimental/unreleased。

| 工作               | 已落实内容                                                                                                                            | 仍需后续扩展                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ICSS 响应式        | `ResponsiveValue` 按 base/small/medium/large 固定语义顺序生成 CSS；媒体与命名容器共用 typed breakpoints；容器查询使用逻辑 inline-size | 自定义断点键的主题类型扩展、更多视觉参数消费者                |
| 布局 API           | Stack 增响应式 direction/align/justify/wrap、rowGap/columnGap；Container 增响应式 size/gutter、maxWidth、query/queryName              | Group/Compact/AppShell/Splitter/ScrollArea 等后续批次         |
| Grid/GridItem      | 任意正整数列、响应式 span/start/rowSpan/order/align；子项继承查询，span/start随父列数收敛，防止无意产生隐式额外列                     | subgrid 与更完整布局组合，offset/自动内容轨道等按对标矩阵展开 |
| SimpleGrid         | 固定等宽列与auto-fit最小宽度两种互斥 API；CSS长度/百分比/数学函数/变量；用途 token `size.gridItemMinWidth`                            | 复杂子项样式组合继续深化；普通children与GridItem职责分开      |
| Breadcrumb         | 原生nav/ol/li、typed key、真实链接、默认末项current、内容snippet保留组件语义、locale名称、自然换行                                    | 复用OverflowList后提供真实完整的折叠/祖先菜单                 |
| component defaults | 原6组扩至16组，类型与runtime校验共用规则；专属/共享/实例优先级及null继承停止                                                          | 后续全库覆盖与元数据支持白名单生成；不纳入业务状态            |
| UI/文档            | 新布局与路径Demo、命名容器实际缩放、五档/文字/Overlay默认值样例；修正旧Container说明及重复样式                                        | Theme Lab全面视觉工作台仍在后续V7范围                         |

本阶段同时做减法：删除 Stack/Container 的重复枚举样式表；默认值手写类型改为从同一规则推导；Breadcrumb 内容定制不再要求调用方重新实现链接和当前项语义；删除多余 HMR 注册；SimpleGrid 长度单位复用 ICSS 单位事实源。

## 当前证据

- WebStorm 已实际读取新文件、诊断响应式基础与布局/导航文件，并用 rename refactoring 将 `resolveMediaQuery` 改为覆盖两类查询的 `resolveBreakpointQuery`，同步更新两处引用。
- 当前命名容器 Demo 在 Chrome 实测 300/500/700px 容器分别出现1/2/4列；span随列数变化，没有局部或页面横向溢出。
- Grid/SimpleGrid/Breadcrumb/Stack/Container五页在390px实际检查均正常，无页面溢出或局部横向滚动；Provider切换默认值时Toggle高40→28、标题24→20，已选业务状态保留，console无错误/警告。
- 类型/SSR/样式序列化/真实几何/Portal/继承回归合同已编写，完整执行由本阶段推送后的 CI 完成。
- 前一 run [34015051161](https://github.com/kenconnet666/zadmin/actions/runs/34015051161) 在首次读取时：构建、包边界、覆盖率、Windows成功；静态格式与workspace组件测试失败，Docs三浏览器仍运行。这里只记录那次读取，未轮询。
- 格式失败已修复；遗留 modal Popover 终态断言仍待继续定位，最新失败为 connected/open 但 opacity≈0.601663，另有浏览器连接中断。不能以改宽松断言或忽略引擎关闭缺陷。
- 已为下一次CI加入有上限且只在失败时输出的动画时间线诊断，保留原poll预算、严格opacity和几何断言，详见[定向诊断](./popover-ci-diagnosis-2026-09-06.md)。

## E2：布局组合、原生滚动与流程步骤

当前源码新增 Group/Center/Spacer/ScrollArea/Steps，目录扩至87族/150公开组件，均为experimental/unreleased。

- Group以`itemSizing=auto/grow/equal`替代互斥布尔；复用Stack并让原始style/ICSS carrier持续透传，不再保存会过期的初始style。
- Spacer收窄为空白布局部件；SimpleGrid和Spacer共用CSS长度表达式格式处理，支持主题、数学函数与变量，不用JS换算CSS相对单位。
- ScrollArea保持单一原生viewport、可聚焦具名区域、原始RTL偏移、双轴/高度约束、标准scrollbar属性和controller；reduced motion下明确instant并停止原有平滑滚动。
- Steps采用稳定泛型key、native ol/li/button/link、同步可取消请求、受控更新与实例reset；链接与按钮/被动项使用互斥类型，补locale和实例方法文档。
- ICSS补齐逻辑小/大/动态视口与cqmin/cqmax单位、subgrid、自动网格轨道及标准滚动条/overscroll关键词与单位合同。
- 修正Docs预览grid的固有最小宽度：统一`minmax(0, 1fr)`，避免子Demo把滚动viewport撑成1208px后被外层裁切。390px下实际viewport324px、内容1208px，水平/二维滚动留在明确示例自身。
- 本地WebStorm局部诊断无已报告错误；实际浏览器核对了ScrollArea top=96/reduced、Steps取消→确认→reset，以及五页390px不出现页面横向溢出。完整测试执行继续交CI。

E1远程反馈也并入本批：移除Breadcrumb重复类型导入；SimpleGrid改为flat Props和明确minItemWidth优先，修外部.d.ts联合类型复杂度；SSR负例读取惰性render输出的body；locale验证随继承的namespace扩展。414px默认测试视口正是Dialog372.6px和Grid未跨500px断点的原因，几何用例现明确宽/窄视口，不改生产尺寸或放宽断言。WebKit Popover改用真实用户点击后仍保留严格终态与时间线诊断，尚待CI验证；DateRangePicker另一个open/焦点失败继续单列跟进。

## 下一执行批次

1. [N3-A Toolbar/ToggleGroup 执行方案](./execution-navigation-next-2026-09-06.md)：复用并收敛集合焦点与选择基础，接入 OverflowList；随后 NavigationMenu/Menubar 与 Splitter。
2. F1 状态与 F5 DOM 组合合同，真实输入和浮层消费者；现有API按六类处置表逐项处理。
3. 输入首批与完整日期/表单集合并行展开；大能力引擎选型按[平台能力台账](./platform-capabilities-2026-09-06.md)适度采用新CSS/JS/TS/Node能力。

E1 仅是总目标的首个实现阶段，不代表 W1–W8 或全库稳定验收已完成。

## E3：测量集合、完整祖先导航和应用布局壳

本阶段新增 OverflowList/AppShell，目录为 89 个组件家族、152 个公开组件；API 源审计为 1888 个 props、actionableIssues=0。141 个 stable 标签为已有声明，新组件继续 experimental/unreleased；源码生成器的覆盖标签不等同于本候选已经执行通过远程稳定矩阵。

- OverflowList 支持真实尺寸测量、多行/数量预算、逻辑折叠方向、固定 key、暂停和显式刷新；每项一个 DOM 实例，隐藏 wrapper 保持可测但 inert/aria-hidden，不克隆交互树。入口宽度变窄可回收空间，非单调宽度回路才采用有界保守预算。禁用期间的人工布局不会伪装成已测量。
- Breadcrumb 的 `collapse` 复用 OverflowList/Popover：保留首页（可关）、当前项和末项，被折叠祖先通过真实链接访问；默认不折叠，保留原生 nav/ol/li 和单一 aria-current。
- AppShell 支持五个原生区域、两种布局、响应式侧栏、main/root 滚动、main/div 语义。修复根滚动模式正文覆盖页脚；增加四个目的明确的尺寸 Theme token 和 locale 主导航名称。
- 真实浏览器揭示无 DOM Provider 的 direction 未落到部分布局根；Stack、Container、Grid/GridItem、SimpleGrid、Center、Spacer、ScrollArea、OverflowList、Breadcrumb、AppShell 现统一使用显式原生 dir 优先于 Provider context。Group 继续复用 Stack。
- 做减法：Breadcrumb 和 OverflowList 共用 typed key 校验；不增加第二套祖先浮层/测量；AppShell 以 Grid 轨道确定区域位置，不引入相互矛盾的 fixed/offset 开关。
- WebStorm 已使用读取、运行点发现、受影响文件诊断及真实语义 rename；`parseCssPixels` 的命名修改自动更新 7 处引用。Docs 继续由 WebStorm dev 运行于 localhost:5174。
- Chrome 检查：OverflowList/Breadcrumb/AppShell 在 390px 无页面横向溢出；折叠项目失焦时转交入口、展开恢复首项；祖先弹层 Escape 恢复入口；AppShell 根滚动 main 内容完整结束后才到 footer。额外 SSR/类型/几何/RTL/焦点合同已编写，远程执行结果仍待后续交付流程。

E3 同时保留上一远程 run 的严格 DateRangePicker 纯指针路径，并加阶段状态与终态联合诊断。证据仅定位到 focus preview 与 click commit 之间的中断，尚不能排除生产焦点滚动问题；不以预聚焦、重试、延时或放宽断言将其隐藏。Popover entry motion 的 WebKit 问题仍单列，见各自诊断文件。

交付边界：E2 已在 `cfe32ad` 本地提交；此前普通 HTTPS push 连接 github.com:443 失败，E3 实施没有因此停止。E3 提交前读取远程记录，最新实现 run 仍为 E1 的 `34017484365`（failure）。下一次成功 push 将一起交付待推送阶段，不等待新 CI；在再下一次交付前读取其结果。

## E4：Toolbar / ToggleGroup、焦点组合与旧 CI 反馈

E2/E3 最终一起成功推送至 `ae19b1b`。本批新增 Toolbar、无 DOM ToolbarItem 和 ToggleGroup，目录为91族/155公开组件；source API 审计1918个props、actionableIssues=0。componentDefaults 从16组扩至19组，新增Toolbar、ToggleGroup、Segmented的低风险视觉默认值，保持业务状态由调用方拥有。

- Toolbar直接组合已有LogicalCollection/CollectionNavigation/MountedElements，不新增同形roving引擎或Button/Link别名。通用Item用稳定Svelte attachment交付原生属性；单Tab入口、方向/RTL、真实控件编辑键、disabled、动态移除、嵌套Toolbar和OverflowList的物理可见性分别处理。
- ToggleGroup支持统一typed数组的single/multiple、allowEmpty、readonly/disabled、五尺寸、六tone、三variant、Field关联、重复FormData和reset。组直接进入Toolbar时逐按钮委托焦点，保留各自选择；Portal内组不被父Toolbar收纳。避免了按钮与组各持一份pressed状态。
- 三类焦点消费者共享DOM树边界方法：MountedElements、FocusScope、OverflowList现在理解已知ShadowRoot与owner document。真实原生focus/blur会取消过期排队请求；Segmented尊重用户取消事件、实际CSS方向和销毁后的焦点修复边界。
- 本轮Vite浏览器检查发现并修复：MountedElements新旧局部变量active重复声明；ToggleGroup的state变量遮蔽$state符文；嵌套集合读取child派生状态造成递归；Toolbar子attachment早于父ref建立时的注册校验。WebStorm静态结果不能代替实际Vite转换与页面执行。
- Chrome确认：Toolbar四个示例各有一个Tab入口；Arrow跨ToggleGroup不选中，Space只更新当前可编辑组；ToggleGroup五档高度24/28/32/40/48；相关390px页面不横向溢出。

上一E3 run `34025263618` 的构建和外部包验收通过。旧Modal Popover严格opacity用例在三个浏览器有明确逐例通过日志，DateRangePicker在三个Docs引擎执行并计入185/186通过结果。新的失败与修复详见[E4远程反馈](./e4-previous-ci-remediation-2026-09-06.md)：

- Grid/Stack轴向间距在后续断点持续覆盖共享gap；新Docs真实320→640容器下始终row=3px、column=5px。
- Steps的280→281溢出实际来自共享VisuallyHidden的负margin；定位到RTL隐藏状态像素位于280..281后，修改为零margin和逻辑起始inset，真实owner恢复280/280；没有放宽严格断言。
- AppShell四例改为唯一的导航/辅助区名称；ScrollArea原生量化误差仅在对应坐标断言使用半CSS像素范围，保留原始double，不在生产取整；旧RTL fixture明确原生dir来源。
- 修正AppShell重复类型导入、OverflowList snapshot/$state命名与泛型测试实例，以及表单reset内部output夹具。

本阶段编写了SSR、类型、原生键盘、ShadowRoot/iframe、Toolbar×ToggleGroup×Portal和视觉回归合同。完整运行仍交远程CI，暂不将新增组件提升stable。下一批继续N3-B NavigationMenu/Menubar和N2-B Splitter，再按总纲推进完整输入/表单/数据能力；全目标未缩小。

## E5：导航菜单、导航项与分栏，继续修复上一轮 CI

本批新增 NavLink、NavigationMenu、Splitter，目录扩至94族/158公开组件；componentDefaults由19组扩至22组。新增组件保持experimental/unreleased。生成器中的覆盖标签是源码资产盘点，不代表此提交已执行通过远程稳定验收。

- NavLink以真实Link、Button或被动内容呈现；href与disclosure并列，统一五档尺寸、五语义色加primary、三种variant、当前项指示和紧凑呈现。独立导航项不重复承担树状态。
- NavigationMenu支持inline/vertical/horizontal、静态分组/分隔、受控current与open、single/multiple、collapsed、RTL、可取消SPA请求、原生修饰链接、公开focus/expand/collapse/close与panel snippets。复用现有集合、Popover和OverflowList；children/panel在TS和runtime互斥。
- 关闭single sibling同步移除所有后代key；方向键只交给一个owner；Portal面板以具名region呈现。Overflow固定当前项与含自定义panel的根项，More使用数据标签和图标，避免消费者片段、固定ID、表单状态重复挂载。
- Splitter支持百分比数字、百分号、px/rem混合单位，真实content-box分配、多面板min/max、RTL、两轴与嵌套、拖动生命周期、键盘大小步长/Home/End、折叠恢复和reset。SSR未测量时不伪造ARIA数值或隐藏内容；不可能的约束通过constrained状态呈现。
- 本次减法包括：共享Popover/Floating/Presence，未新增第二套浮层或导航焦点引擎；删除独立current-change回调设想，由真实路由owner确认；共享已有主题尺寸/颜色/动画token，避免重复尺度。
- Chrome在390px检查三页没有页面横向溢出；NavigationMenu展开、More与Escape正常，面板末项Tab移至下一真实入口。Splitter键盘25/50/25→26/49/25；1440px下折叠文件186.5→40px并inert，恢复186.5px。浏览器还发现pointerdown取消默认行为后handle未获焦点，已补真实焦点并改为真实点击/按键CI回归。
- 面板Tab揭示共享Popover恢复目标使用$state导致effect cleanup读旧快照；改成普通imperative字段后Chrome确认目标保持。审查修复和未完成的禁用/移除焦点验收边界见[E5集成审查](./e5-navigation-integration-review-2026-09-06.md)。
- 前一`db12350`的CI run `34029475777`构建/包边界通过，静态/组件/Docs失败。本批修复Toolbar/ToggleGroup泛型、夹具过窄类型、无效matcher、roving时序，以及ScrollArea即时reduced行为、原生RTL初始offset合同和AppShell可滚动区域键盘入口；详见[E5反馈](./e5-previous-ci-remediation-2026-09-06.md)。

本地仅执行WebStorm局部诊断、真实浏览器检查、格式和源码制品生成；完整类型/SSR/多浏览器/几何/视觉/无障碍合同交远程CI。继续下一批Menubar、通用Resizable和Anchor，随后推进输入/表单/日期与数据大能力；不等待新CI。

## E6：Menubar、Resizable、Anchor 与 Docs 目录迁移

本批目录为97族/164公开组件，API源审计2060个props、actionableIssues=0；componentDefaults增至25组。新增组件维持experimental/unreleased，不将资产覆盖标签当作当前候选已通过远程稳定验收。

- Menubar新增Root/Menu/Trigger/Content四个组合部件，复用DropdownMenu/Menu/Popover，拥有单开根菜单、单Tab入口、根级左右/RTL、首末项打开、跨菜单、取消、Escape/Tab和动态可用性；不重复实现命令、checkbox/radio、submenu、typeahead和浮层引擎。
- Resizable提供单元素inline/block/both、八种逻辑边角、混合单位、min/max、原子尺寸通知、键盘/拖动/取消和reset，复用resize.ts。边使用separator，角用真实button；五档手柄、默认locale名称、RTL光标与可定制grip同步交付。
- Anchor提供嵌套真实链接、活动章节、可替换滚动容器、getTarget、原生平滑/即时与减少动画、取消和历史策略、公开控制器。Docs ComponentPage移除私有IntersectionObserver和重复链接循环，改为Anchor；保留AppShell原有hash路由滚动所有权。
- 浏览器揭示并修复Menubar ArrowUp的last策略被first覆盖，以及Resizable百分号被错误输出为percent。实际Menubar能跨根、Escape恢复、ArrowUp到末项、Tab离开；Resizable的真实px与ARIA一致，真实拖动会更新百分比，RTL角键盘同时调整两维。示例增加主题Card边界、正确尺寸绑定类型与真实滚动容器。
- 164组件元数据的default/description字面量现在在API生成阶段校验，并有CI自测，提前发现与ZuiComponentMetadata类型不符的行，避免等全量类型门才暴露。
- 上批E5已随后续远程master提交成功送达。已完成run `34034413308`（632fa5a，包含E5）的Docs三引擎、workspace build、bundles/external验收通过；失败仍来自Static/组件/Windows类型检查。本批修复NavLink可选props metadata与真实size透传、NavigationMenu类型/ARIA、Splitter合法键盘separator warning。
- 旧Toolbar重复失败经Chrome定位到共享Compound registry的effect旧数组快照覆盖兄弟注册。现在token Map保存生命周期，独立递增计数只发出响应式通知；真实RTL/Inner/Outer First→Last均通过。Overflow在hold期间回退到focusable候选，640px真实owner下More隐藏且焦点回首个命令，唯一Tab入口保持。ScrollArea夹具等待父Provider传播，再断言真实坐标、CSS和事件；未放宽业务状态或删除失败断言。

完整证据见[Anchor](./execution-anchor-2026-09-06.md)、[Menubar](./execution-menubar-2026-09-06.md)、[Resizable](./execution-resizable-2026-09-06.md)及[旧CI修复](./e6-previous-ci-remediation-2026-09-06.md)。本地仍只有WebStorm局部检查、必要Chrome交互、格式/源码制品生成，没有跑本地长套件。下一批继续Affix/BackTop与输入基础能力，推进Form/Input/日期和数据矩阵；新CI不等待，后续交付前读取结果。

## E7：按组件族复用，补滚动辅助、原生输入与复制

跨日收尾于2026-09-07。本批目录102族/169公开组件，API源审计2141个props、actionableIssues=0；componentDefaults增至29组。新增组件仍experimental/unreleased。用户要求的高层复用、主题/动画/控制成套一致及最终检查已写入[组件族验收](./component-family-consistency-2026-09-06.md)并链接总纲，作为整个目标的关闭前置条件。

- 新增CopyButton、PasswordInput、NativeSelect、Affix、BackTop及15个以上实际Docs示例。每项同时补API/metadata与适用SSR、类型、浏览器/组合回归，不以数量代替验收。
- 复制族共用ClipboardController/CopyStatusIcon/Button；Docs删除重复Promise与计时器，ZCode保持原onCopy接口，默认反馈统一2000ms。真实源码按钮和ZCode复制均得到copied/check，查看源码按钮顺序保持。
- Input/NativeSelect共享input-control chrome；Password只有visible状态，内层ZInput唯一持有值/Field/FormData。InputGroup以已注册control marker向复合wrapper内输入传播内容高度，xsmall外层实际24px、输入22px、toggle24px；readonly/disabled同步，禁用透明度只在Group承担一次，RTL toggle位于逻辑结束边。实例/Group/Field/专属与基础defaults优先级明确。
- 密码原生type切换后浏览器会在tick之后折叠selection；一次owner渲染帧恢复原选择并验证generation、连接与当前焦点，键盘toggle不抢input。真实Chrome同节点password→text、focus保留、selection恢复[2,7]；NativeSelect单选、多选以及readonly FormData/reset实际通过。
- Anchor/Affix/BackTop使用统一公开ScrollContainer，删除重复AnchorScrollContainer/ZScrollTarget命名与scrollingElement解析。目标限定同owner Document，iframe通过对应文档挂载支持。
- Affix默认CSS sticky，显式container才fixed投影；Portal content拥有自身几何变量和有限继承快照。真实高度前后21px、宽292px，祖先Window滚动80px时fixed top也跟随-80，仍与owner+offset相等。祖先发现复用Floating UI，避免重复引擎。
- BackTop复用Button、Presence/EntryMotion、Theme间距与指标尺寸；退出inert并把焦点交实际scroll owner，显式dir优先。局部reduced示例实际滚至0、按钮卸载、焦点位于具名ScrollArea；Docs浮动示例位置分开，避免重叠。
- 实际集成还修复NativeSelect的props.id放置错误、文档缺少accessibility、强制runes模式下普通let不响应、错误Stack方向和缺少控件名称。未为错误Docs改变生产状态机；所有临时诊断已清除。

上一候选e99b407的已完成CI反馈及修复见[E7旧CI记录](./e7-previous-ci-remediation-2026-09-07.md)。本批仍只本地短诊断、制品生成和必要Chrome操作，完整验收交远程CI；继续后续输入、表单、日期与数据大能力，最终还须逐组件族执行主题、动画与控制一致性复查。

## E8：RangeSlider、Rating、Fieldset 与输入族一致性

本批新增三个家族，目录达到105族/172公开组件；新增 fieldset、slider、rangeSlider、rating 四组视觉默认。新组件保持 experimental/unreleased。

最终 API 源审计为2,215个属性、actionableIssues=0。Windows IDE/文件监控两次造成生成文件短暂占用；API与目录生成器现跳过未变化内容，并仅对Windows共享占用错误有限重试（总退避上限750ms），避免反复触发HMR或重跑整个生成链。最终制品生成成功。

- Slider/RangeSlider 共用数值域、百分比、碰撞和尺寸/色调/轨道 recipe。单值继续真实 input ref；双值为严格 readonly tuple、两个独立具名原生 range 和一个 reset owner。增加 marks、valueLabel、format/snippet、orientation/reversed、commit、minRange、clamp/push/swap。不把邻居边界错误写成每个input不同坐标域。
- Rating 使用真实 radio 集合，提供 fractions、清除、hover-only preview、自定义符号、Field owner、locale itemLabel、readonly/disabled、FormData/reset 和方向键。实际命中尺寸采用五档control尺度，避免把装饰图标尺寸当作控件。
- Fieldset 使用真实 fieldset/第一 legend，组内复用 ZStack，不伪造 Field/value context。五档只影响组布局；原生 disabled 的第一 legend 例外保持。Button/Input/NativeSelect/Checkbox/Textarea 共用原生禁用样式，Switch 只淡化可见根，InputGroup 统一拥有一次透明度。
- 一致性审查修正了 PasswordInput 双向 value 转发、Group 内外几何、CopyButton/ZCode 等待时丢焦点、NavLink 紧凑内边距、Menubar 动态禁用的相邻焦点回收。
- 第二位代理交叉审查滑块，修复 orientation 语义、端点 marks 溢出、pointer cancel/lost capture/consumer preventDefault 清理、重叠 thumb 与 swap 焦点、实例dir优先级。共享轨道命中区域与装饰thumb分开使用control/indicator尺寸。
- 本地真实Chrome确认 Fieldset 390px无横向溢出、禁用不提交/legend恢复、Password bind与FormData；CopyButton成功check图标与焦点保持；Rating键盘递增、再点清空、hover只预览、只读提交与reset；RangeSlider tuple绑定、重复FormData/reset、RTL及vertical语义。浏览器还发现并修掉无效ICSS accessor/token，不能只依赖IDE绿灯。

详细实现见[Fieldset与输入族](./execution-fieldset-family-2026-09-07.md)、[Slider/RangeSlider](./execution-slider-range-2026-09-07.md)、[Rating](./execution-rating-2026-09-07.md)。上一1ce39f2的完整远程状态与修复见[E8旧CI反馈](./e8-previous-ci-remediation-2026-09-07.md)。本批使用WebStorm局部诊断、必要Chrome、格式/源码制品生成；多引擎测试和构建交远程CI，不等新CI。下一批按[E9表单基础准备](./execution-form-foundation-next-2026-09-07.md)推进CheckboxGroup和唯一显式model，再接FieldArray与控制适配；完整目标保持进行中。

## E9：CheckboxGroup与表单值基础

本批目录106族/175公开组件，API源审计2,251个属性、actionableIssues=0。新增CheckboxGroup、Item、SelectAll保持experimental/unreleased；141个既有stable标签不是本批完整远程验收证据。

- CheckboxGroup直接复用ZCheckbox、Collection/SelectionModel/ControllableState/Field与native reset。options/children类型互斥，typed key数组、min/max/required、普通Tab、全选mixed/容量、readonly/disabled、重复FormData、动态移除、Field归属均有实现和回归资产。
- ZCheckbox新增正式tone与组件默认值，Group/Item/SelectAll通过公开props继承五档/语义色。invalid选择器明确压过tone；组级原生customValidity使用localePack.form或validationMessage，并清理旧owner。
- Chrome暴露拒绝超过max后Checkbox私有checked仍为true的问题。Item/SelectAll现通过函数binding投射唯一组状态；min/max拒绝后value、DOM checked、aria-checked、label状态一致。实测min2下0/1无效、2有效，max3拒绝第4项，错误色与success tone随有效性一致变化。
- 原生ZForm增加getValues/getFieldValue只读快照与setFieldFeedback正式名，setFieldState保持兼容alias。NativeFormBaseline纠正用户改回初值仍dirty的旧行为，处理File身份/空占位、reset epoch、卸载以及重复同名字段增删。详见[原生表单执行](./execution-form-native-values-2026-09-07.md)与[交叉审查及修复](./review-form-native-foundation-e9-2026-09-07.md)。
- 独立FormModel/FormArray/ErrorLayers已经公开并有真实组合Demo。不可变快照、typed path、batch、baseline dirty、受控接受/拒绝、同引用deep state、订阅、stable row id、失败回滚和分层错误使用同一套基础。数组响应式身份单独通知，因此相同值行的move也不会被值层no-op吞掉。详见[模型执行](./execution-form-model-array-2026-09-07.md)。
- Chrome观察到Alice→Bob dirty=true、改回Alice=false；模型批量写入后dirty=true，reset回原值与false；row-1/row-2移动保持各自行身份。390px Docs正常换行，无页面横向滚动。完整SSR/类型/多引擎回归只编写资产，交远程执行。

E8提交d4eb6fa起初因系统GitHub地址不可达而延迟推送。只读核查发现Cloudflare/Google DoH的当前地址可通过TLS，随后以单命令http.curloptResolve和schannel成功推送，未改全局代理、hosts或关闭证书校验。E9推送前查看上一轮CI34050004211仍在运行，没有轮询或等待。

下一批按[E10集成](./execution-form-integration-next-2026-09-07.md)把已有模型注入ZForm，接入唯一control adapter、错误层、聚合状态与ZFormList。独立helper和手工受控示例不代表这些自动集成已完成；完整能力与最终组件族一致性目标保持进行中。

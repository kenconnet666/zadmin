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

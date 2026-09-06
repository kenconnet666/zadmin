# ZUI 全面演进执行台账

总纲：[完整能力路线](./full-capability-roadmap-2026-09-06.md)。目标模式已启动；本文件随可交付阶段更新。适用范围包括已有/新增组件、删减重构、UI/Theme/Motion 与 Docs。

## 执行约束

- 本地使用 WebStorm MCP 的文件读取、符号信息/重命名、受影响文件诊断；必要的真实页面交互通过 Chrome 插件检查。
- 长时间类型检查、测试、构建、覆盖率、多浏览器/桌面和稳定矩阵交远程 CI/CD；推送后继续实现，不等待新 run。后续推送前读取上一 run 的具体结果。
- 主模型处理共同基础与最终集成；独立组件使用较低成本模型，文档/CI归类/能力研究使用轻量模型。所有分支限定文件所有权，并由主任务检查实际类型、语义、样式和组合。
- authored、implemented、executed、accepted 分开；目标不会因新增文件或 metadata 标签而自动完成。

## E1：响应式布局与默认值基础，导航首个消费者

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

## 后续直接推进

1. N2 布局便利组合与 ScrollArea/OverflowList 基础；N3 Steps/Toolbar/NavigationMenu。
2. F1 状态与 F5 DOM 组合合同，真实输入和浮层消费者；现有API按六类处置表逐项处理。
3. 输入首批与完整日期/表单集合并行展开；大能力引擎选型按[平台能力台账](./platform-capabilities-2026-09-06.md)适度采用新CSS/JS/TS/Node能力。

E1 仅是总目标的首个实现阶段，不代表 W1–W8 或全库稳定验收已完成。

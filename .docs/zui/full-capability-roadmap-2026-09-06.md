# ZUI 完整能力对标与大范围建设路线图

日期：2026-09-06。范围：浏览器/SvelteKit/WebView 使用的 ZUI、ICSS、主题、文档和企业级组合能力。

本文件是最新执行总纲。用户已经明确要求大范围新增能力，完整对标成熟组件库的组件、API 与交互能力；此前“仅补 Breadcrumb、Steps/Toolbar 暂缓”等小范围策略不再决定本轮范围。旧文档中因当时范围而排除的 RangeSlider、编辑器、QRCode、图表等，重新纳入能力矩阵。Miniapp 继续使用独立原生适配体系。

## 1. 目标与完成口径

当前基线为 79 个组件族、141 个公开组件。目标是在此基础上建设完整企业级组件系统，包括成熟通用组件库已有而 ZUI 缺失的能力，也包括现有同名组件尚未覆盖的高级 API。

“完整对标”按能力覆盖，不按导出组件数量：Button + shape 可以覆盖 ActionIcon，单个组件的 compound 成员也不能冒充多个完整组件族。参考库的每项能力都要落到增强、新增、重构、组合或明确等价实现；不能因为已有同名组件就填写“完成”。

本轮同时审计现有系统的删减、重命名、拆分重构与重新组合，组件和参数总数不作为增长指标。每项对标必须记录五层：

1. 公开组件及可组合子部件。
2. Props、默认值、受控状态、回调、methods/controllers 与类型约束。
3. 鼠标、触摸、键盘、IME、拖放、异步、虚拟化等实际行为。
4. 尺寸、颜色、布局、动画、主题覆盖、响应式、RTL、可访问性。
5. 原生表单、SSR/CSP/HMR、Portal/iframe/ShadowRoot、文档、独立包和回归证据。

同名且只覆盖基础示例，仍标记为“部分覆盖”。逐参数规范在对应实施波次开始前形成可检查的 API 表，直接随实现落地，无额外用户审批步骤。已有 API 也逐项进入同一台账，不能只登记新增。

### 1.1 每个组件/API 必须作出处置判断

| 处置            | 适用情况                                                         | 必须交付                                                                       |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 保留并增强      | 职责合理但行为、定制或视觉不完整                                 | 差距、目标 API、实现与证据                                                     |
| 新增            | 现有公开能力没有同等职责                                         | 简单用法、深度组合、依赖与完整交互                                             |
| 删减            | 无消费者的别名、重复入口、无效参数、误导语义、被新结构替代的逻辑 | 调用点盘点、能力承接位置、删除和迁移；有用户价值的便利入口不能只因代码相似被删 |
| 重命名/类型收紧 | 名称误导、多个含义混用、类型接受无效状态                         | 最终命名、合法状态、旧名迁移及负例                                             |
| 拆分/合并重构   | 一个组件承担互斥职责，或多个组件重复同一状态/生命周期            | 唯一状态所有者、内部复用边界、兼容/破坏性变更说明                              |
| 重新组合        | 原语能表达能力但常见场景使用繁琐，或现有组合重复维护状态         | 高层便利入口与低层组合入口、可定制片段、事件/焦点/表单所有权                   |

处置同时适用于 ICSS、Theme token、recipe、运行时函数、导出子入口、Demo 和文档。先说明最终职责再决定组件数量；删除旧入口可以与新增更合理入口在同一阶段完成。

优先检查：Select/Combobox/MultiSelect/TreeSelect 的集合与表单桥接重复；Date/Time/DateTime 的值域边界与共享段输入；Dialog/Drawer/Popover 的共享生命周期和不同交互；Button/Toggle/Toolbar 的便利组合；DataTable 高阶功能与 DataGrid 高层入口；ZCode 与编辑器的显示/编辑分工；主题专用 token 与通用尺度的泄漏、重复默认值和 recipe。

## 2. 对标基线与分工

| 基线                                                                               | 主要对标范围                                                                   | ZUI 取舍方法                                                                                     |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [Ant Design 完整组件目录](https://ant.design/components/overview/)                 | 企业后台表单、日期、Table/Tree/Upload、导航、布局、反馈与复杂展示              | 覆盖成熟业务能力，保留 Svelte 原生状态和事件，不照搬 React 风格的包装层                          |
| [Mantine 完整目录](https://mantine.dev/core/package/)                              | 通用组件广度、细分输入、日期时间、AppShell、响应式、样式 API、扩展包           | 核对便利 API 与细节；对已有原语提供真正易用的组合入口                                            |
| [Chakra 组件目录](https://chakra-ui.com/docs/components/concepts/overview)         | 语义 token、recipe/parts、布局、可组合控件、图表和编辑能力                     | 保持 ICSS/Theme 一个事实源；增强扩展方式与状态表达                                               |
| [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) | NavigationMenu、Menubar、Toolbar、ScrollArea、HoverCard、ToggleGroup、原语组合 | 对齐交互和 DOM 组合契约，采用适合 Svelte 的 snippet/attachment 接入                              |
| [React Aria](https://react-aria.adobe.com/)                                        | 集合、选择、拖放、表单、日期/色彩、跨输入方式与辅助技术                        | 对齐行为深度、状态所有权、国际化和复合组件边界                                                   |
| 领域引擎                                                                           | 图表、富文本、代码编辑、Markdown、二维码/条码                                  | 使用可兼容的非 React 核心能力或算法，ZUI 拥有公开 API、主题和生命周期；具体版本/许可在接入前核实 |

目录和组件页以 2026-09-06 在线核对为基础，参考库后续变化按差异更新。详细矩阵分别见[企业组件对标](./benchmark-enterprise-components-2026-09-06.md)、[表单及数据输入对标](./benchmark-forms-data-2026-09-06.md)与[UI、主题及动画专项规划](./visual-theme-motion-plan-2026-09-06.md)。这些矩阵是建设范围与差异记录，不代表所有参考 API 已经实现。

## 3. 全面能力建设地图

下表为执行分域，具体差异展开在两个对标矩阵。新增名称是目标命名，允许在同等能力与更清晰 API 下合并，不能因合并而遗漏行为。

| 域               | 大范围新增 / 专项能力                                                                                                                            | 现有组件的深化重点                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 布局与应用结构   | Grid/GridItem、SimpleGrid、Center、Wrap、Group、AppShell、Affix/Sticky、Splitter/ResizablePanels、ScrollArea                                     | Stack/Container 的响应式和容器约束、逻辑布局、嵌套滚动、布局持久化接入                                        |
| 页面导航         | Breadcrumb、Anchor、BackTop、NavigationMenu、Menubar、NavLink、Toolbar、ToggleGroup、Steps                                                       | Menu/ContextMenu/DropdownMenu 的触发与选中模型；Tabs 可编辑/关闭/溢出；Pagination 全部展示和业务组合          |
| 基础及便利输入   | PasswordInput、SearchInput、NativeSelect、MaskInput、CheckboxGroup、CheckboxCard、RadioCard、Rating、RangeSlider、AngleSlider、Editable          | Input/NumberField/Textarea 的 clear、formatter/parser、adornment、autosize、提交语义与状态一致性              |
| 日期时间完整族   | TimePicker、DateTimePicker、DateTimeRangePicker、MonthPicker、YearPicker、WeekPicker、QuarterPicker、Month/Year ranges、InlineDateTime、TimeGrid | Calendar 多面板/视图/选择模式、日期段输入、range preview、presets、时区、时间约束、locale/calendar system     |
| 选择与集合       | 独立 Listbox/GridList、Autocomplete 便利入口、Creatable/Async Select、Checkbox selection list                                                    | Select/Combobox/MultiSelect 远程查询、分组、虚拟化、创建、清空；Cascader 多路径、TreeSelect 多选、树键盘/拖动 |
| 完整表单         | Fieldset、受控 values/errors、FieldArray、动态字段、路径操作、表单状态订阅、错误摘要、分步骤表单、声明式映射适配                                 | Form 的验证时机/异步竞态、dirty/touched、依赖、局部重置、滚动定位与原生 FormData                              |
| 企业数据视图     | DataTable/DataGrid 扩展、可编辑单元格/行、分组/汇总、树数据、列排序/固定/显隐/宽度、批量操作、导出、数据视图切换                                 | 现有排序/选择/展开/虚拟化保持；补筛选、服务端协议、跨页选择、列/行级状态和键盘单元格模型                      |
| 拖放与重排       | DragDrop 基础设施、Sortable、Droppable、Draggable、拖动手柄、列表/树/列重排                                                                      | pointer/touch/keyboard sensors、碰撞、自动滚动、取消、live announcements、跨容器身份与事件                    |
| 文件与媒体       | Dropzone/FileButton、目录与粘贴输入、Upload 预览/队列/并发/暂停能力、Image/PreviewGroup、ImageViewer/Lightbox、Cropper 适配                      | 现有 transport/AbortSignal/retry/progress 继续复用，补完整文件交互和可访问预览                                |
| 富内容与编辑     | RichTextEditor、Markdown/Prose、CodeEditor、DiffViewer、Highlight/Mark、Blockquote、Spoiler                                                      | ZCode 保持显示/复制/高亮；编辑状态、commands、selection、history、校验和内容输出由专门入口拥有                |
| 图表与业务展示   | Line/Area/Bar、Pie/Donut、Scatter/Bubble、Radar、Heatmap、Funnel、Treemap、Sankey、Sparkline、Gauge、组合图、图例/工具提示/缩放                  | Statistic/Progress/Meter/Timeline 保持各自语义；新增 Countdown、滚动数值、活动日历等明确展示职责              |
| 反馈与浮层       | HoverCard、Collapsible、Notification、LoadingOverlay、ActionBar、FloatingPanel、OverlayManager、Clipboard、DownloadTrigger                       | Dialog/Drawer/Popover 的组合、定位、受控生命周期；Toast/Notification 队列、更新、Promise 与公告策略           |
| 企业展示补齐     | AvatarGroup、CheckableTag、DescriptionList 响应列/span、Watermark、QRCode/Barcode、Status、Result/Empty 变体                                     | Card 媒体/操作布局，列表与元信息展示，多状态与长内容，主题/打印/下载需求                                      |
| 国际化与环境工具 | FormatNumber/Byte/Date/Time、环境/方向/locale 边界、可访问 shortcut、FocusScope/Portal/Presence 的稳定接入                                       | 公开支持边界、消息覆盖、多编号/日历、owner Document 和辅助技术一致性                                          |
| 日程与排期       | Schedule/Scheduler、日/周/月/Agenda、资源视图、事件创建/编辑/拖动/缩放、recurrence                                                               | 与日期选择 Calendar 分工；复用时间值、时区、约束、拖放、虚拟化和编辑浮层，明确 DST 与重叠事件布局             |

复杂能力必须进入计划：编辑器、图表、二维码、范围控件、数据视图不会因体积或旧候选策略被排除。领域算法是否复用成熟引擎，单独形成有版本、许可、维护性和 API 边界依据的接入决策。

## 4. 先升级支撑全面能力的基础设施

| 编号 | 基础设施工作              | 目标 API / 合同                                                                                                                                 | 首批真实消费者                                  |
| ---- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| F1   | 统一状态协议              | 标量清空/null、未提供/undefined、空集合；value/defaultValue/onValueChange、open 三元组、选择/展开模型各自明确；user/programmatic/reset 事件来源 | Select/Combo、日期、Form、DataGrid、Steps       |
| F2   | typed responsive props    | 仅对有意义视觉轴支持 `ResponsiveValue<T>`；base 与主题断点键，媒体/容器响应式，SSR fallback 与实际几何同步                                      | Grid/AppShell、size、布局、DataTable、面板      |
| F3   | 主题与样式扩展            | 五档控件/指示器与八档文字继续；component tokens、semantic states、parts/recipes、可扩展的类型化主题 token；通用尺度不泄漏专用 token             | 全部家族及 charts/editors                       |
| F4   | component defaults 全覆盖 | 从受支持元数据生成可配置白名单；视觉默认值与业务状态分离，显式 props/局部上下文优先                                                             | 全部可见组件、Form/Input families               |
| F5   | 原生 DOM 组合接入         | snippet/attachment 提供关系属性、事件与ref接入，合并顺序/取消语义清楚；避免嵌套button和额外无意义DOM                                            | Menu/Popover/Tooltip/Link/Toolbar/复杂编辑器    |
| F6   | Collection / Selection    | typed key、active 与 selected 分开；范围选择、跨页/all-filtered、分组、可取消操作、mounted DOM 与逻辑集合分离                                   | Tree/Listbox/GridList/DataGrid/Transfer         |
| F7   | Form store / field array  | values/defaultValues、字段路径set/insert/remove/move、dirty/touched/errors、局部订阅、reset/validation mode、schema adapters                    | 完整业务表单、Wizard、编辑行                    |
| F8   | DragDrop 内核             | sensors、drag data、collision/drop target、keyboard、autoscroll、cancel、announcements；清楚的状态与生命周期                                    | Sortable/Tree/Table/Upload/布局编辑             |
| F9   | Motion / Layer            | enter/exit/placement 状态、动态reduced、可替换动画、受控转场、嵌套层优先级、Portal与焦点、programmatic manager                                  | FloatingPanel/Notification/Editor菜单/Overlay   |
| F10  | 异步能力协议              | loading/error/empty、AbortSignal、latest-wins、缓存适配与外部数据 owner；不把组件绑定单一HTTP客户端                                             | 选择器、上传、表单、查询表格                    |
| F11  | 模块与领域引擎            | core + 明确子入口/适配器，生命周期统一，SSR fallback、错误与卸载、可选peer/license 边界                                                         | charts、rich-text、markdown、code-editor、image |
| F12  | 契约与文档生成            | 每个参考能力和已有 API 有映射 ID 与处置结论；Props/methods/snippets/parts/states/keyboard 及迁移同步；能力、源码合同、执行证据分别统计          | 全库，不再靠人工 stable 计数判断完成            |

Responsive 仅用于可解释的视觉/布局选项，不把业务 value 变成断点对象。VirtualList/Tree/DataGrid 需要像素时读取实际 owner DOM 几何，不能 parseFloat('2rem') 当像素。主题的组件专用值和通用 spacing/size API 分开，避免本轮已发现的 switchInset 外泄。

## 5. 全库 API 对标表的统一列

每个家族在开始实施前必须填写以下列，并和对应参考组件的实际参数核对：

| 维度       | 要核对并交付的内容                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 身份与值   | key/value 的类型、空值、受控/非受控、动态数据替换、序列化、默认值                                |
| 事件       | 输入/变更/提交/重置/打开/关闭/选择/展开/拖放/编辑回调，取消、来源、次数和异步时机                |
| 视觉       | size/tone/variant/shape/density、响应式、状态样式、component tokens、class/style/parts、图标位置 |
| 内容定制   | text/data 模式、snippets、compound members、可定制DOM、空/错/加载/占位与格式化                   |
| 表单       | name/form、Field、label/description/error、required/readonly/disabled、原生FormData、reset和验证 |
| 交互       | pointer/touch/keyboard/IME、焦点、typeahead、range selection、drag、scroll/virtualization        |
| 日期与数值 | locale、解析/格式化、时区/日历、范围/精度/步进、非法草稿、DST与边界                              |
| 数据能力   | 客户端/服务端过滤排序分页、远程搜索、创建、懒加载、并发/取消、缓存适配                           |
| 环境       | SSR/hydration/CSP/HMR、Portal/iframe/ShadowRoot、owner Window、cleanup                           |
| 控制器     | 仅必要的focus/scroll/open/selection/edit操作；不暴露内部可变集合让调用方绕过状态机               |
| 可访问性   | 原生语义、ARIA、名称/说明、辅助技术、live反馈、reduced/forced colors、RTL                        |
| 生命周期   | experimental/stable/deprecated、版本/迁移、兼容策略、当前执行证据                                |

目标是高层易用 API 与低层可组合 API 同时成立。常规使用不要求用户重建内部结构，深度定制也不要求复制组件源码。保留 Svelte bind、原生事件和 snippet/attachment 的语言优势；成熟库中同义且重复的外壳可以在 ZUI 合并，但必须记录对应关系。

## 6. 重点能力的目标接口方向

以下为实施规范的边界，不是已经发布的新 API。

- **布局**：AppShell 管理 header/navbar/aside/footer 与 collapse/responsive；Splitter 使用 panels/sizes/defaultSizes/onSizesChange、min/max/collapsible；Grid 使用 columns/span/offset/order/gap 的 typed responsive 形式。
- **导航**：Breadcrumb items/current、Anchor items/activeKey/scroll container、Steps items/currentKey/onStepRequest；Toolbar 提供方向与焦点集合协议；Tabs 的编辑/关闭/重排回调与 selected value 分开。
- **增强选择器**：query/inputValue 与 selected value 分开；multiple、create、group、remote、lazy、virtual 为有类型的合同；Cascader 多条路径与 TreeSelect 多选都有完整FormData/reset/disabled/checked strategy。
- **日期**：区分 Date、Time、DateTime、Range 和 Month/Year/Week/Quarter 值域；共用 calendar/segment/constraint 基础设施，保留清晰的高层控件，不用一个巨型mode对象掩盖互斥类型。
- **DataGrid**：columns/rows/rowKey、sort/filter/page、selection、column order/visibility/width/pinning、editing、grouping/aggregation、tree rows、virtual、export；外部请求由数据协议/调用方拥有。
- **Form**：typed values/paths、arrays、validation triggers、async validators、field subscriptions、dirty/touched/errors、controller operations、error summary和step navigation；schema只是校验/映射协议，业务请求和权限独立。
- **Upload**：files/defaultFiles/onFilesChange、accept/size/count、directory/paste/drop、beforeAdd/validation、transport/concurrency、progress/abort/retry、preview/remove/download。持久凭据、网络协议和分片服务由适配器/业务负责。
- **Editors**：document/value、format、onUpdate/onSelectionChange、extensions/commands、readonly、placeholder、history、upload adapter；编辑能力与ZCode显示能力独立。
- **Charts**：通用 Chart 容器 + typed data/series/axes/legend/tooltip/interaction；常见图形便利入口；Theme与locale联动、resize/visibility、data zoom、导出和可访问数据替代。
- **Schedule**：events/resources、view/date/timeZone、visibleRange、event create/update/delete requests、recurrence/exceptions、drag/resize、working hours；数据持久化由调用方拥有，日程表格与日期选择器各自保持独立语义。
- **Overlay/Notification**：可声明式或由明确scope controller调用；confirm返回明确结果，Promise取消/迟到回调可追溯；通知堆叠、duration、pause、update、action和公告优先级一致。

## 7. 实施波次：范围大，交付仍分批

| 波次                        | 并行工作包                                                                                                                 | 主要产物                                 | 退出条件                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| W0 稳定底座收口             | 已定位CI修复、WebKit剩余诊断、API生成与真实阅读/复制验证                                                                   | 当前79族可持续演进的候选；未处理问题清单 | 不靠改标签通过；已知阻断有修复与回归，按既有CI节奏处理    |
| W1 API/样式基础设施         | F1–F5：状态、responsive、主题扩展、默认值、DOM组合                                                                         | 通用API合同、类型负例、三类真实消费者    | 简单和复杂用法都能表达；无互斥状态/重复DOM owner          |
| W2 布局与导航大批建设       | Grid/AppShell/Splitter/ScrollArea；Breadcrumb/Anchor/BackTop/NavigationMenu/Menubar/Toolbar/ToggleGroup/Steps；Tabs扩展    | 新组件族、完整Demo、键盘/RTL/响应式合同  | 具备真实交互和视觉，不能只有壳                            |
| W3 输入与日期大批建设       | Password/Search/Mask/Group/Card/Rating/Range/Angle/Editable；全部日期时间值域与选择器扩展                                  | 日常到复杂输入完整族，typed值和Form接入  | 受控/默认/清空/非法草稿/IME/locale/原生表单全部适用合同   |
| W4 Form/Collection/DragDrop | F6–F8/F10；Form值与数组、选择集合、树/级联增强、拖放和重排                                                                 | 通用能力及输入/树/表格的实际消费者       | 每个owner、取消/错误、跨页/跨容器身份清晰                 |
| W5 企业数据视图             | DataGrid编辑/分组/汇总/树/导出；FilterBar、QueryTable、批量操作                                                            | 可以搭建真实复杂列表和编辑工作台         | 数据协议、键盘单元格、虚拟化、列/行状态及错误反馈完整     |
| W6 媒体与反馈               | Upload/Dropzone/目录粘贴/预览；ImageViewer/Cropper；Notification/LoadingOverlay/HoverCard/FloatingPanel/Watermark/QRCode等 | 文件处理、预览、通知和丰富展示能力       | 异步/资源清理、交互可访问性及多主题实际效果               |
| W7 图表、编辑器与日程       | Charts、RichText、Markdown、CodeEditor、DiffViewer、Schedule                                                               | 有稳定ZUI API和Theme联动的领域组件       | 引擎/许可/SSR/卸载边界清楚，核心实际功能完整              |
| W8 企业组合与正式稳定面     | FormDialog/EditDrawer/QueryTable/FormWizard/AppShell工作台、全矩阵差异闭合                                                 | 能力对标台账、迁移、支持范围、稳定候选   | 每项参考能力有落点；同SHA必要验证闭合；发布与桌面证据单列 |

W2、W3可在共同基础接口冻结后并行；W5依赖集合/表单/拖放的相应子合同；W6与W7的引擎研究、API设计和基本实现可并行推进。不是等所有79族每个历史问题结束才允许研究新增，也不允许未稳定的共同底座造成全库同时不可运行。

每个波次拆为可独立验证的小提交。W0完成已定位修复后，下一批直接从 **W1 + W2/W3接口设计** 启动；不再将新增规模收缩成一两个候选组件。

### 7.1 下一轮直接执行的工作包

| 工作包                | 代码范围与动作                                                                                                                                        | 可检查的交付结果                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| N1 共享 API 与 Theme  | `ui/zui/src/runtime`、`theme`、`recipes`；整理受控/清空/reset协议，实现 typed responsive 解析、component defaults 与 parts 覆盖；同步类型和元数据生成 | Grid、一个输入和一个浮层作为真实消费者；五档/八字级/语义色/局部主题覆盖能够组合；公布迁移表            |
| N2 布局首批           | `components/layout`；实现 Grid/SimpleGrid、AppShell、Splitter、ScrollArea，应用结构与容器滚动边界同步设计                                             | 桌面/窄屏工作台、可折叠侧栏、可拖动分区、嵌套滚动四类完整示例；键盘/RTL/持久化接入合同                 |
| N3 导航首批           | `components/navigation`；Breadcrumb、Steps、Toolbar/ToggleGroup、NavigationMenu/Menubar，复用现有集合与焦点原语；Anchor/BackTop 随滚动结构接入        | 页面导航、命令导航、分步骤表单各有独立交互；路由链接/当前项/取消切换/溢出明确                          |
| N4 输入与选择首批     | `components/input`；Password/Search/Mask/CheckboxGroup/Rating/RangeSlider；并行增强 TreeSelect 多选与 Cascader 多路径                                 | 完整 Field/FormData/reset，合法类型和互斥负例；分组/异步/清空/禁用/长内容；Docs 可复制的便利和组合用法 |
| N5 日期与集合设计落地 | 日期值域/段输入/约束、Collection/Selection 与 Form arrays；先落 TimePicker/DateTimePicker 和一个动态数组表单，再展开各日期粒度与 DataGrid             | 共用接口已有真实消费者；时区/空值/非法草稿/字段移动和异步验证的状态所有权明确                          |

N1 中相应子合同明确后，N2/N3/N4 可按互不重叠的组件目录并行。N5 与输入设计并行推进，依赖未稳定时先完成类型合同、示例和适配决策；图表/编辑器/日程的引擎核对同步进行。每个工作包在实现中补齐必要 ICSS 属性与 token，不先搭没有消费者的大框架。

## 8. 稳定性、体积与依赖策略

- 以正确性、可访问性、主题/视觉、完整API、组合能力和开发效率为优先；Docs入口原始/gzip体积只记录告警，不阻断建设。
- 保留模块图与按需加载的正确性，主要为清晰依赖、SSR和可选能力，而不是追求任意字节上限。
- ZUI拥有组件API、DOM/ARIA、状态和集成；既有状态/集合/虚拟化内核优先复用。成熟领域引擎可用于图表、富文本、代码编辑、二维码等，选型不由历史“必须全部自造”的范围文字自动决定。
- 图表可评估 [Apache ECharts](https://echarts.apache.org/handbook/en/get-started/)；富文本可评估带Svelte路径的 [Tiptap](https://tiptap.dev/docs/editor/getting-started/overview)。这是明确的技术候选，不代表已经安装或实现，也不预先承诺其所有商业附加服务。
- 通过同一个源码事实源生成API/目录/支持与差异报告，新增家族不能遗漏其compound成员；static/implemented/executed/accepted必须分开。
- 完整稳定规则沿用[稳定化验收文档](./stable-evolution-plan-2026-09-06.md)的证据门槛；该文档原先的小范围新增优先级已被本文件替代。

## 9. UI、主题、动画与结构重构同步执行

[视觉、主题与动画专项](./visual-theme-motion-plan-2026-09-06.md)定义 V1–V8：比例排版、状态层级、主题完整性、样式 API、交互动效、复杂组合、Docs 工作台与实际验收。该主线覆盖已有和新增组件，随 W0–W8 同时实施，不作为尾部装饰阶段。

每个家族的结论同时回答：功能是否完整、接口是否易用、职责是否应拆合、组合是否简洁、视觉是否协调、主题覆盖是否可靠、动画是否清楚且可打断。对重复入口、无效参数、同义 token、重复 recipe/状态逻辑、妨碍阅读和操作的效果，明确删减或替换；迁移与能力承接同期交付。

## 10. 每批必须交付什么

每个工作包同时交付：参考能力/API 差异及处置表、最终 ZUI 接口、真实实现、UI/主题/动效实际场景、复杂与常规 Demo、删改与迁移说明、适用单元/类型/浏览器/组合回归，以及当前执行结果。可访问性和艺术效果在开发中检查，不能留到所有组件写完后才补。

完整建设结束时，矩阵中的每项必须是“当前证据已接受”或“有明确等价实现及证据”；不以“能用现有div拼出来”“名字已存在”“测试文件已写”代替成熟组件能力。未来参考库新增的能力按版本差异进入新的工作包，避免无限无界地改变当期验收范围。

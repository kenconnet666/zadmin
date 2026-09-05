# 基础设施与组件 API 逐项审计台账

日期：2026-09-05。基线：`d6b30da37beddb00e7a260c4262d1446ca3e7696`；该提交的主 CI [33951875994](https://github.com/kenconnet666/zadmin/actions/runs/33951875994) 已全绿。

本轮按 79 个根组件文档家族登记，compound 子组件在所属家族下一起展开核查。当前 12 个根组件已有本轮具体复核记录，其他 67 个不因原成熟度标记或一次静态扫描而自动算完成。此表不是完成全库审计的声明。

## 审计口径

每个组件分别核对：公开类型与运行时消费、controlled/default/bindable、原生属性与 FormData/reset、disabled/readonly、size/density、主题与长内容、键盘/焦点/RTL/motion、Docs 的实际交互演示。没有明确缺陷的不为制造改动而扩容 API。

类型/SSR、浏览器计算样式/几何、手工视觉抽查、跨浏览器 CI 是不同证据；不能用 data-* 标记或静态测试文件计数替代真正的样式/交互断言。

## 基础设施

| 范围                                   | 本轮结果                                                                   | 证据与边界                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| ICSS 属性与关键字                      | 新增 overflowWrap 的 normal/breakWord/anywhere，迁移九处 raw 用法          | 类型与 builder 指令测试；ZCode 的浏览器行为验证序列化生效                                                         |
| Theme / Provider defaults              | input.size 覆盖 Input、InputGroup、Textarea；明确显式和近端上下文优先级    | 窄容器真实几何、large/small 字号/内边距、Provider Docs 演示；其他主题轴沿用前轮记录，不算全部重审                 |
| 组合控件禁用视觉                       | Group 统一施加 disabled opacity，直接 input/textarea 不重复乘 0.5          | 原生 disabled 不变，实际 Group=0.5、child=1 的 CSS 断言                                                           |
| 代码换行与 Docs 复用                   | wrap 增加无空格 token 的断行；Docs 使用现有 ZCode.wrap                     | 修复前 180px 代码框溢出约 1693px；修复后长 inline、highlighted block、wrap=false 回归通过                         |
| 发布准备与生成合同                     | release:version 串联 Changesets → 按需 materialize metadata → 全量生成合同 | 编排自测模拟版本变化/不变/失败，实际验证 pnpm launcher；未在本工作区真正升版或发布，真实 Release PR 分支验收交 CI |
| API/文档生成守卫                       | 继续执行 AST、runtime 消费和 catalog/teaching 核对                         | 本轮新增状态与 teaching 重新生成，不以零静态发现推断所有视觉状态通过                                              |
| SSR/CSP、HMR、Layer/Focus、定位/Portal | 后续专项逐项复核                                                           | 保留基线证据，不在本轮重复宣称完整审计                                                                            |
| 表单图、异步资源、日期国际化、虚拟化   | 后续结合所属组件逐项复核                                                   | 下一批优先 Field/Form/NumberField/PinInput 与 choice collection                                                   |

## 本轮实际修复说明

- ZCode 原 wrap 只设 pre-wrap，对没有空格的长哈希/URL/token 仍溢出。使用标准 overflow-wrap:anywhere，保留原源码与显式换行；不添加 word-break:break-all，也不往文本插零宽字符。规则依据 [CSS Text 3](https://www.w3.org/TR/css-text-3/#overflow-wrap-property)。
- 输入默认尺寸不再在 Group 和 Textarea 处中断；控件显式 size、Field/Group 与 Provider 默认仍分别拥有自己的优先级。测试不仅检查 data-size，也检查字体、padding、高度以及 12rem 容器中的 affix 边界。
- ZInput 补禁用与只读视觉；审阅时发现与 Group 叠加透明度的问题并一起处理，不降低输入可读性两次。
- Avatar 首字符按 grapheme 提取，👩‍💻 保持完整；无 Intl.Segmenter 时保留 code-point 降级。继续由原 img 事件与 keyed source 管理图片竞态，没有自建图片加载器。
- Badge offset 拒绝 sparse array、非数组与非 finite 数值，避免无效 transform；动态演示可切换尺寸/色调/角落，metadata 公开真实状态，ref 文案明确指向 Badge 根 span。
- 发布准备原先只有 changeset version，导致 Release PR 上的 versioned Docs 合同过期。现在与 metadata/生成物更新属于同一准备提交；失败停止后续步骤，不自动 publish、tag 或 merge PR。

## 根组件逐项状态

| 根组件 ID         | 本轮状态                       | 审查/改动                                                                   |
| ----------------- | ------------------------------ | --------------------------------------------------------------------------- |
| provider          | 本轮已复核                     | 同步 input.size 的家族范围；演示单行、组合、多行与显式覆盖                  |
| box               | 本轮待逐项复核                 | —                                                                           |
| stack             | 本轮待逐项复核                 | —                                                                           |
| text              | 本轮已复核                     | 语义标签、原生属性、尺寸/截断现有合同复核；新增 SSR 属性回归                |
| heading           | 本轮已复核                     | heading level 与视觉 size 分离、ARIA/id 透传复核                            |
| icon              | 本轮待逐项复核                 | —                                                                           |
| code              | 本轮已复核                     | 修复无空格长 token 在 wrap 下溢出；inline/block/高亮前后测试                |
| button            | 本轮待逐项复核                 | —                                                                           |
| toggle-button     | 本轮待逐项复核                 | —                                                                           |
| link              | 本轮已复核                     | 原生 anchor/download 与 button appearance 分离；属性回归                    |
| separator         | 本轮待逐项复核                 | —                                                                           |
| visually-hidden   | 本轮待逐项复核                 | —                                                                           |
| kbd               | 本轮已复核                     | 真实 kbd 与原生属性、不注入多余 role                                        |
| aspect-ratio      | 本轮待逐项复核                 | —                                                                           |
| container         | 本轮待逐项复核                 | —                                                                           |
| avatar            | 本轮已复核                     | 修复首字符 grapheme；图片生命周期保留；增加动态形状/尺寸演示                |
| badge             | 本轮已复核                     | 稀疏/非法 offset 诊断，状态 metadata 与动态 size/tone/placement 演示        |
| card              | 本轮待逐项复核                 | —                                                                           |
| description-list  | 仅等价 ICSS 迁移，完整复核待做 | overflowWrap.raw('anywhere') → overflowWrap.anywhere，未声称全部 API 已复核 |
| list              | 仅等价 ICSS 迁移，完整复核待做 | overflowWrap.raw('anywhere') → overflowWrap.anywhere，未声称全部 API 已复核 |
| tag               | 本轮已复核                     | size/tone、移除与复合 owner 既有合同复核；ICSS 关键字统一                   |
| progress          | 本轮待逐项复核                 | —                                                                           |
| meter             | 本轮待逐项复核                 | —                                                                           |
| skeleton          | 本轮待逐项复核                 | —                                                                           |
| empty             | 仅等价 ICSS 迁移，完整复核待做 | overflowWrap.raw('anywhere') → overflowWrap.anywhere，未声称全部 API 已复核 |
| timeline          | 本轮待逐项复核                 | —                                                                           |
| statistic         | 本轮待逐项复核                 | —                                                                           |
| table             | 本轮待逐项复核                 | —                                                                           |
| virtual-list      | 本轮待逐项复核                 | —                                                                           |
| data-table        | 本轮待逐项复核                 | —                                                                           |
| carousel          | 本轮待逐项复核                 | —                                                                           |
| alert             | 仅等价 ICSS 迁移，完整复核待做 | overflowWrap.raw('anywhere') → overflowWrap.anywhere，未声称全部 API 已复核 |
| loading-bar       | 本轮待逐项复核                 | —                                                                           |
| result            | 仅等价 ICSS 迁移，完整复核待做 | overflowWrap.raw('anywhere') → overflowWrap.anywhere，未声称全部 API 已复核 |
| spinner           | 本轮待逐项复核                 | —                                                                           |
| toast             | 本轮待逐项复核                 | —                                                                           |
| checkbox          | 本轮待逐项复核                 | —                                                                           |
| calendar          | 本轮待逐项复核                 | —                                                                           |
| cascader          | 本轮待逐项复核                 | —                                                                           |
| color-picker      | 本轮待逐项复核                 | —                                                                           |
| combobox          | 本轮待逐项复核                 | —                                                                           |
| date-field        | 本轮待逐项复核                 | —                                                                           |
| date-picker       | 本轮待逐项复核                 | —                                                                           |
| date-range-picker | 本轮待逐项复核                 | —                                                                           |
| input             | 本轮已复核                     | 补 disabled/readonly 视觉；原生属性、默认尺寸、reset 回归                   |
| input-group       | 本轮已复核                     | 共享 Provider 默认尺寸；修复组合禁用透明度叠乘                              |
| mention           | 本轮待逐项复核                 | —                                                                           |
| multi-select      | 本轮待逐项复核                 | —                                                                           |
| number-field      | 本轮待逐项复核                 | —                                                                           |
| pin-input         | 本轮待逐项复核                 | —                                                                           |
| field             | 本轮待逐项复核                 | —                                                                           |
| file-upload       | 本轮待逐项复核                 | —                                                                           |
| form              | 本轮待逐项复核                 | —                                                                           |
| radio-group       | 本轮待逐项复核                 | —                                                                           |
| select            | 本轮待逐项复核                 | —                                                                           |
| segmented         | 本轮待逐项复核                 | —                                                                           |
| switch            | 本轮待逐项复核                 | —                                                                           |
| tags-input        | 本轮待逐项复核                 | —                                                                           |
| textarea          | 本轮已复核                     | 共享 Provider 默认尺寸；保留 autosize、原生 rows/reset                      |
| time-field        | 本轮待逐项复核                 | —                                                                           |
| tree-select       | 本轮待逐项复核                 | —                                                                           |
| transfer          | 本轮待逐项复核                 | —                                                                           |
| slider            | 本轮待逐项复核                 | —                                                                           |
| accordion         | 本轮待逐项复核                 | —                                                                           |
| command           | 本轮待逐项复核                 | —                                                                           |
| command-palette   | 本轮待逐项复核                 | —                                                                           |
| context-menu      | 本轮待逐项复核                 | —                                                                           |
| dropdown-menu     | 本轮待逐项复核                 | —                                                                           |
| menu              | 本轮待逐项复核                 | —                                                                           |
| pagination        | 本轮待逐项复核                 | —                                                                           |
| tabs              | 本轮待逐项复核                 | —                                                                           |
| tree              | 本轮待逐项复核                 | —                                                                           |
| alert-dialog      | 本轮待逐项复核                 | —                                                                           |
| dialog            | 本轮待逐项复核                 | —                                                                           |
| drawer            | 本轮待逐项复核                 | —                                                                           |
| popconfirm        | 本轮待逐项复核                 | —                                                                           |
| popover           | 本轮待逐项复核                 | —                                                                           |
| tooltip           | 本轮待逐项复核                 | —                                                                           |
| tour              | 本轮待逐项复核                 | —                                                                           |

## 本轮验证结果

- ZUI 与 Docs 的项目类型检查均为 0 errors / 0 warnings。
- builder、component-defaults、gene-primitives 定向单测：3 files / 32 tests 通过；Avatar/Badge 最终 SSR：2 files / 7 tests 通过。
- ZCode 的 wrap/size/生产复制相关 Chromium：3 files / 9 tests 通过；Input 家族新增几何、状态和 reset Chromium：1 file / 3 tests 通过。子代理另外执行了相关既有输入与展示回归，未用它们代替新缺陷复现。
- Docs catalog/router：19 tests 通过；新增 Docs Chromium E2E：3 tests 通过，检查 Provider 默认值的实际字号、390px 视口下的长代码/主题 token 换行、Badge 实际尺寸/色调变化与 Avatar emoji 文本。已查看移动视口截图。
- release:version:self-test 通过；版本变更、未变更、步骤失败与非法版本使用模拟执行器，pnpm --version 使用实际 launcher。没有在当前工作区执行 changeset version、npm publish 或 tag。
- API 生成物更新与 audit:system 通过；新增状态和 teaching 已同步，后续完整多浏览器、桌面与构建矩阵以本批提交的 CI 为准。

## 下一批顺序

1. Field/Form 的标签、校验、error/help 与 native reset；NumberField/PinInput 的格式化、组合输入与尺寸。
2. Button/ToggleButton、Checkbox/RadioGroup/Switch/Slider/Segmented 的状态组合、键盘和主题一致性。
3. Select/Combobox/MultiSelect、Tree/Cascader/Transfer 与虚拟集合的受控状态、过滤、空态、长内容。
4. Dialog/Drawer/Popover/Tooltip/Menu 等浮层的嵌套层次、定位、退出动画、焦点恢复。
5. Date/Time、FileUpload、DataTable/VirtualList 等复杂 API；随后展示、反馈、布局余项逐一收尾。

每批保留明确问题、复现、修复、演示和验证记录，独立提交并读取前一阶段 CI。当前自动生成的 maturity 数量只作证据索引，不替代上述台账。

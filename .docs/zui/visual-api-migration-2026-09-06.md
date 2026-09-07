# 视觉 API、尺寸与语义命名迁移

基线：`bf1e01c`。本记录对应通用、布局、展示与反馈 36 个根组件家族；Theme/schema、Provider componentDefaults、公共入口、其他组件类别消费者与全局生成物由主任务同步。

## 当前共同合同

| 档位   | 控件高度 | 控件文字 | Icon/Spinner | Avatar | Badge 计数 | Badge 圆点 |
| ------ | -------: | -------: | -----------: | -----: | ---------: | ---------: |
| xsmall |       24 |       11 |           12 |     24 |         14 |          4 |
| small  |       28 |       12 |           14 |     32 |         16 |          6 |
| medium |       32 |       14 |           16 |     40 |         20 |          8 |
| large  |       40 |       16 |           20 |     48 |         24 |         10 |
| xlarge |       48 |       16 |           24 |     64 |         28 |         12 |

数值单位为默认 px。控件使用 `controlSizeStyles`；Icon/Spinner 和 Tag 移除图标使用 `indicatorSize`，Avatar 和 Badge 使用专用尺寸 token。最大控件的文字仍为 16px。三个 density 值继续表达空间偏好，不被扩成五个尺寸别名。

文字另有八档：`xsmall/small/medium/large/xlarge/xxlarge/xxxlarge/xxxxlarge = 11/12/14/16/20/24/32/40px`。Text、Heading、Code、Kbd 共用字号 factory；Statistic 的主值也复用这一轴。

五个状态词为 `neutral/info/success/warning/danger`；品牌 `primary`、辅助文字 `muted` 和 Spinner 的 `inherit` 分别保留自己的职责。状态色可单独定制；例如 info 不再隐式指向 accent。实心状态表面使用各自 `onNeutral/onInfo/onSuccess/onWarning/onDanger` 前景，避免把 canvas 当作所有状态的对比色。

## 调用迁移

| 旧调用                                                     | 新调用                                           | 原因                                                         |
| ---------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `ZButton variant="primary"`                                | `variant="solid"`                                | 外观与品牌色分开；默认 tone 为 primary。                     |
| `variant="secondary"`                                      | `variant="outline"`                              | 表达描边形式；中性外观显式 `tone="neutral"`。                |
| Button/Toggle `tone="default"`                             | `tone="primary"`                                 | 保留默认品牌动作的含义。                                     |
| Tag/Badge/Text/Heading/Statistic/Timeline `tone="default"` | `tone="neutral"`                                 | 明确中性语义。                                               |
| Tag/Badge `tone="accent"`                                  | `tone="info"`                                    | 使用一致的信息状态词。                                       |
| Typography `size="xlarge"`（原 24px）                      | `size="xxlarge"`                                 | 保留原 24px 视觉规模。                                       |
| Typography `size="xxlarge"`（原 32px）                     | `size="xxxlarge"`                                | 保留原 32px 页面标题。                                       |
| Statistic `trend={-18}` 自动红色                           | 默认 neutral；业务改善显式 `trendTone="success"` | 增减方向不能自动判断业务好坏。                               |
| `ZCalendar range={preview}`                                | `highlightRange={preview}`                       | 旧参数只画范围却与真实range value同名；新名不冒充selected。  |
| 手写常驻Calendar+TimeField模拟DateTimePicker               | `presentation="inline"`                          | 复用Picker唯一owner、Panel、草稿、提交、readonly与FormData。 |
| 替换Calendar内部button/header DOM                          | `dateCell` / `header` typed snippets             | 只定制内容；Calendar继续拥有button、ARIA、焦点、选择和分页。 |

Button、ToggleButton 与按钮外观的 Link 共用同一 recipe。色调 factory 通过明确的 `data-variant` 和原生 `aria-pressed` 选择器组合外观与选中态，总分支数保持在现有 64 上限内；没有创建六色×三外观×pressed 的 compound 笛卡尔积。Loading 的 Spinner 继承按钮已经解析的前景，不再维护第二套颜色映射。

E14补充：Calendar真实范围选择现在由`selectionMode="range"`的判别`value`拥有；`highlightRange`只承接DateRangePicker、DateTimePickerPanel/DateTimeRange和只读展示的额外范围，并只投射`data-highlighted`，不改变`aria-selected/data-selected`。源码与真实Docs直接消费者同步迁移，不保留两个都叫range但所有权不同的入口。

E15补充：DateTimePicker/DateTimeRangePicker的inline是同一组件的判别presentation，不新增`InlineDateTimePicker`别名或第二套事件模型。inline分支从类型上排除open/defaultOpen/onOpenChange/placement；Confirm后面板保持常驻，Cancel只回滚草稿。Calendar/PeriodCalendar及上层DateTime Picker传递typed cell/header内容时，调用方不再重建日期button、gridcell或分页状态。TimeValue作为ZText上的typed Time格式化展示，不能替代TimeField/TimeGrid的编辑或选择职责。

新增的最小 API：

- `ZHeading.wrap = balance | pretty | wrap | nowrap`，默认 balance；语义 level 不变。
- `ZKbd.size` 复用文字八档，默认 small=12px；Kbd 保持真实键盘提示。
- `ZStatistic.valueSize` 默认 xxlarge=24px；`trendTone` 默认 neutral，显式表达业务含义。
- `ZContainer.size` 五档最大宽度为 24/40/64/80/96rem，另保留 full；gutter 仍独立控制逻辑留白。

## 36 族处置结果

| 家族            | 本批结果                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Provider        | 组件本身保持无 DOM 与偏好所有权；对应 Demo 迁移新 defaults，公共 defaults/type 由主任务同步。  |
| Box             | 保留中性原生布局入口；没有新增无意义的 size/tone/motion。组合 Demo 已迁移按钮。                |
| Text            | 八档字号、五种状态色和 primary/muted；保留 truncate/lineClamp 的明确职责。                     |
| Heading         | 八档字号、共享语义色、默认 balance；默认标题保持 24px，真实 level 独立。                       |
| Icon            | 五档独立 indicatorSize；保留 numeric/full 和按需 Lucide 入口。                                 |
| Code            | 八档字号，保留代码主题、高亮、复制和 wrap；代码色彩不改为普通状态 tone。                       |
| Button          | 五档控制比例、solid/outline/ghost、品牌与五状态、按实际前景组合 loading。                      |
| ToggleButton    | 同步 Button 全部视觉轴；pressed 与回调所有权保持不变。                                         |
| Link            | 同步 Button 外观和五档导航高度；正文支持共享文字 tone，保持真实 href。                         |
| Separator       | 横竖分隔线改用 Theme hairline 边框；保留原生 hr/ARIA 分隔语义，不引入五档线宽。                |
| VisuallyHidden  | 保留辅助技术职责；仅迁移 Demo 的组合按钮。                                                     |
| Kbd             | 新增文字 size，保持默认 12px、mono 和原生 kbd。                                                |
| Stack           | 保留方向、对齐、gap、换行；已有五档 space 足够，不扩色彩/动画 API。                            |
| AspectRatio     | 保留正比例与原生 aspect-ratio；不将比例改为预设尺寸。                                          |
| Container       | 五档专用最大宽度 token；与控制高度分离，保留 full/gutter。                                     |
| Avatar          | 五档专用头像尺寸与匹配字号；图片生命周期、fallback 和形状保持原合同。                          |
| Badge           | 五档计数/圆点专用尺度、五状态色及正确 on-color；保留上批 duration/reduced/easing 修复。        |
| Card            | 保留 surface、elevation、区域/bodyPadding；没有将内容卡片强制映射成五档控件。组合按钮已迁移。  |
| DescriptionList | 保留 dl、term/body 层次、数据或手动模式；由共享 Theme 字体调整，不加交互色彩。                 |
| List            | 保留真实 ol/ul、普通正文标签与 description 层次；本批无额外行为缺陷。                          |
| Tag             | 五档控制比例与语义色；移除动作保持行高，图标比例独立。                                         |
| Progress        | 品牌色及五状态色用于 line/circle；保留原生范围与专用厚度/直径 token，旋转消费 Theme linear。   |
| Meter           | 原生 low/high/optimum 继续拥有状态含义，不增加任意 tone 覆盖量程语义。                         |
| Skeleton        | 保留专用宽高/lines/animated；pulse 曲线消费 Theme，保留合法 CSS 长度修复。                     |
| Empty           | 保留无数据语义、标题、说明和动作分区，不强加成功/失败状态。                                    |
| Timeline        | 状态色词统一、marker 的实际背景键与默认值一致；保留顺序、时间和 pending，保持 CSS 长度轴修复。 |
| Statistic       | 共享八档主值 size、五状态/文字角色及显式 trendTone；保持静态 Intl 数值合同。                   |
| Table           | 保留三档内容 density、caption 和单一 scroll owner；不把数据密度混成控件高度。                  |
| VirtualList     | 保留 itemSize/estimateSize/height 等真实测量值；组合 Demo 已迁移。                             |
| DataTable       | 保留密度、行高、列宽与虚拟化职责；内部选择输入随主任务共享尺寸，所属 Demo 迁移。               |
| Carousel        | 内部操作按钮迁移外观；保留 autoplayInterval、loop、焦点/悬停/隐藏暂停。                        |
| Alert           | 五状态色、信息色独立 token、关闭动作中性；live 优先级仍由调用方决定。                          |
| LoadingBar      | 保留 local/page、真实进度、状态和完成驻留时间；不把业务驻留时间变成转场档位。                  |
| Result          | 五状态色及对应图标；Heading 使用 24px 新档位与 balance。                                       |
| Spinner         | 五档 indicatorSize、primary/muted/inherit；持续旋转消费 Theme linear。                         |
| Toast           | Toast/queue 五状态色；关闭动作中性；进入与退出分别消费 Theme enter/exit 曲线。                 |

## 验证与边界

- 新增 `VisualScaleProductionFixture` 与浏览器 spec：实际几何验证五档控件/导航/Tag、图标/Spinner、Avatar、Badge/Dot、Container；验证八档 Text/Heading/Code/Kbd、真实 heading level/balance；用独立 RGB Theme marker 验证六色×三外观、按钮链接、pressed Toggle 及五种反馈消费者；验证默认中性趋势和负方向成功语义。
- 旧 Button、尺寸交叉、Typography 以及 Tag/Badge 的接受/拒绝断言已按新公开合同迁移。没有将新增的合法 large/info 继续当作非法输入。
- 本地执行 Prettier 解析/格式化、WebStorm 受影响文件诊断和 diff 检查；未运行 svelte-check、Vitest、Playwright 或 build。浏览器用例执行结果以提交后的 CI 为准，主任务另做真实浏览器检查。
- 最终 Node Prettier 处理本组 115 个代码/Docs 文件与 6 个架构/迁移文件，退出码为 0；WebStorm 对 28 个源码/新回归文件和 87 个其余受影响 Docs/专用测试完成 errors-only 诊断，均未返回错误或不完整标记。主任务接手的 Carousel、Timeline CustomDemo、VirtualList ControllerDemo 未被本组最终写入覆盖。
- 最终全四类源码与 Docs 的旧 secondary、旧 variant primary 绑定以及 accent/default tone 绑定扫描为零，覆盖条件表达式；专用 Badge 负例仍明确验证旧 accent 值被拒绝。文本 diff 和 diff 空白检查通过。
- 元数据类型与运行时 recipe 是分别需要检查的合同；本批修复了 Timeline 旧 default 键与 neutral 默认值不一致，不能用零 IDE 错误代替真实模块初始化。

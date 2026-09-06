# 组件族复用与一致性验收

本文件落实用户新增要求：上层组件适当复用底层或提取公共组件，主题、动画和控制行为成组成套；整个目标结束前必须基于最终源码与执行证据再次检查并修改。逐个组件通过不足以证明它们组合后一致。本表是验收边界，不是已完成标签。

## 统一原则

- 同一语义职责只保留一个状态、DOM交互或资源生命周期所有者。高层组件只增加自身职责，例如PasswordInput拥有visible，内部ZInput仍唯一拥有value/Field/FormData。
- 同组控件使用五档control size、共享图标比例、五个语义色加独立品牌色。八档文字大小属于排版轴，不能混成控件高度；图表类别色、用户选色等业务颜色独立处理。
- 默认值优先级明确：实例覆盖；局部组合/Field作用域优先于全局专属或基础组件默认；在每个真正消费点核对，不仅允许配置字段。
- 所有按钮操作沿用Button的禁用、loading、原生Enter/Space和用户取消click规则。readonly保留可访问与提交行为，不能统一替换成disabled。
- 进入/退出复用Presence与EntryMotion，duration/easing/位移使用同一主题体系。退出立即处理inert/可访问树/焦点，reduced立即完成；复制反馈保留时间、业务超时与CSS动画时间分开。
- 状态输入、默认值、用户通知、外部同步与reset保持一致边界；相同名称不能在相邻组件中偷偷改变含义。合法职责差异必须明确，例如Splitter按百分比点调整，Resizable键盘按像素调整。
- 公共滚动容器统一为ScrollContainer（Window或HTMLElement）；共享owner、scrollingElement与viewport解析。章节导航、返回顶部、固定投影各自拥有不同业务行为，组件在对应owner document中挂载，不能混用跨document节点。

## 组件族检查矩阵

| 组件族                                                   | 共享底层/单一所有者                                       | 必须成组验收的行为                                                                                          | 当前承接                                           |
| -------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Button/CopyButton/BackTop/密码toggle/Toolbar操作         | ZButton、尺寸/语义色/图标比例                             | disabled/loading/cancel、焦点、五档、Field/Toolbar嵌套、主题与forced-colors                                 | E7新增消费者，完整跨族执行待CI                     |
| CopyButton/ZCode/Docs源码操作                            | ClipboardController、CopyStatusIcon、Button               | 精确原文、真实成功/失败、晚到Promise、source变化、reset/destroy、owner Window、单次live公告、默认反馈2000ms | E7抽取并迁移，源码按钮实际copied/check已观察       |
| Input/PasswordInput/NativeSelect/InputGroup/Field        | input-control recipe、原生control、Field与FormResetSignal | 五档、border/focus/invalid/readonly/disabled、name/form/description、原生事件和reset                        | E7提取公共chrome，仍需连同原Input回归              |
| Checkbox/Switch/Radio/ToggleGroup/Segmented              | Selection/ControllableState、原生语义与对应集合焦点       | 原生checked、radio与pressed分别保留；同组默认、disabled、readonly、reset、焦点不误选                        | 按既有选择矩阵继续全库审计                         |
| Menu/Dropdown/ContextMenu/Menubar/NavigationMenu/Toolbar | Collection、MountedElements、Layer、Popover               | root/submenu/Portal边界、RTL、Tab/Escape、native link修饰行为、current/focus/open分离                       | E6共享registry与overflow焦点修复，继续读当前候选CI |
| Anchor/ScrollArea/BackTop/Affix                          | ScrollContainer与owner DOM、原生scrollTo                  | Window/局部容器、边界/offset、原始RTL、reduced、中断、监听器清理、Portal主题                                | E7统一类型/helper；明确CSS sticky与JS fixed职责    |
| Splitter/Resizable/后续窗口                              | resize长度解析/编码、几何约束、owner Window               | px/rem/%、五档handle、键盘/指针、RTL、cancel、嵌套、未测量SSR                                               | E5/E6共有基础，独立领域动作单位已文档化            |
| Popover/Dialog/Drawer/Tooltip/Tour/通知                  | Layer/FocusScope/Portal/Presence                          | 焦点和inert、堆叠、滚动锁、重复打开、打断、不同theme/realm                                                  | 最终必须对当前候选重跑适用矩阵，历史通过不能替代   |
| Text/Heading/Kbd/Code/后续富文本                         | 文字尺度、字体/行高、语义元素                             | 八档、截断/换行、heading语义、copy、SSR/CSP、窄屏阅读                                                       | 后续继续提取共享排版并补齐新增能力                 |
| 数据/反馈/高阶业务组合                                   | 原生数据状态与对应共享引擎                                | 数据所有权、loading/error/empty、语义色、动画、keyboard、表单与路由                                         | 保持完整对标范围，不能用现有同名组件关闭缺口       |

## 最终关闭条件

E11补充：六个日期/时间组件复用值语义、Field/InputGroup和五档size defaults，TimePicker复用Popover motion与有限列导航。DateField/TimeField新增Group继承与单一禁用透明度；Slider/Range视觉值提示改为非labelable文本，避免改变真实input的可访问名称并去掉常显重复。当前浏览器点查和回归资产已记录，仍须最终候选整组远程验证。

E10B 补充：Switch/RadioGroup/Slider/RangeSlider/Rating 已接入同一适配器；FormList 复用 Stack/Array/Registry/错误层。真实浏览器补正移动后的焦点和选区保留、内部 blur 与 dirty 基线。独立列表的删除、reset、连续原生提交已点查；嵌套列表和退出/重排动画继续规划，不以本批点查结束最终家族验收。

E10A 补充：Form/Field/Input/PasswordInput/Textarea/Checkbox/NativeSelect/CheckboxGroup 已共用 FormControlState 和 FormResetSignal 接入同一模型。组内值只由 compound owner 持有；父级 disabled/readonly 单向加强。schema/server/manual、batch 通知、reset 与晚到异步处理已接入既有 FormRegistry。其余值控件和动态数组仍须按相同合同接入；该实现记录不替代最终候选执行证据。

1. 从最新总纲与全部能力矩阵列出最终组件和组合，不遗漏新增、删减、重命名、拆合与迁移后的真实消费者。
2. 对每组审查重复状态/样式/计时器/监听器，确认复用边界及必要差异；发现问题直接修正源码、API/metadata与Docs。
3. 检查实际组合中的默认值、五档/八字级、多主题、RTL、窄屏、readonly/disabled/loading、进入/退出/中断/reduced、原生表单和Portal/owner生命周期。
4. 使用最终候选提交的适用CI执行结果证明整组行为；源码资产、metadata stable、历史提交绿灯或单页截图均不足以结束目标。
5. 记录未覆盖边界与仍需修改事项；未完成或证据不足时保持总目标进行中。

# E15：内嵌日期时间、时隙与日历定制

基线为 E14 `c701ab3a7509f4efbecb72252871d7f0e44469df`。上一阶段有已提交实现和本地证据，本阶段继续完整能力矩阵，不将未通过远程验收的组件晋升稳定。

## 分工与组合约束

1. DateTimePicker/DateTimeRangePicker增加`presentation="inline"`，复用当前Field、DateTimePickerPanel、FormControlState、草稿与提交策略。inline常驻，无Portal/浮层trigger；类型排除open/defaultOpen/onOpenChange/placement，不新增第二份日期时间owner。Confirm提交后保持面板；Cancel只恢复未提交草稿；disabled/readonly、reset和外部拒绝仍由根组件处理。
2. Calendar和PeriodCalendar提供类型化cell/header内容定制，保留内部button/grid/roving/ARIA行为；上层插入内容不能意外创造第二个选择owner。
3. TimeGrid使用明确Time时隙集合、唯一Form owner、共用集合导航与五档主题；TimeValue只格式化展示。二者不使用日期对象或字符串伪装时间值。
4. 复验同一天部分时刻可用、DST gap/fold、分段步长、presets以及readonly的联合边界。问题在共享Panel/runtime修复，再由真实上层消费者与远程资产验证。

通过Context7核对[Mantine InlineDateTimePicker](https://mantine.dev/changelog/9-2-0)的inline单选与范围，以及[DateTimePicker](https://mantine.dev/dates/date-time-picker)的日期/时间组合。ZUI采用现有判别mode和值类型，以presentation表达显示方式，避免新增仅复制状态机的命名别名。

本地只做WebStorm逐文件诊断、格式/源码制品审计及必要浏览器插件点查。完整类型、算法、SSR、三浏览器、Windows和长期矩阵交远程CI。推送后不等待；下一阶段处理已有完成结果。

## 当前实现检查点

- `ZDateTimePicker`与`ZDateTimeRangePicker`以判别`presentation="popover" | "inline"`共享同一个根值、Field、DateTimePickerPanel、草稿、FormValueBridge和提交策略。inline分支从类型上排除`open/defaultOpen/onOpenChange/placement`，常驻面板不创建Portal或浮层trigger；Confirm后保持inline，Cancel只回滚面板草稿。
- `ZCalendar`的`dateCell`只替换日期button内部内容，`header`通过只读context请求分页；gridcell、button、ARIA、roving focus、选择和分页owner仍在Calendar。`ZPeriodCalendar`采用同一内容定制边界；DateTime single/range把Calendar cell/header入口透传到共享Panel，不复制Calendar。
- 日期与具体时刻联合约束在共享runtime/Panel处理：同一天只有部分时刻可用时不禁整天；空面板可在目标日查找包含隐藏分、秒和min/max毫秒精度的合法参考。DST gap按disambiguation拒绝并保留可修正的日期草稿，已有明确offset的fold值在无改动确认时保留原instant、owner time zone和offset。preset/Now按动作时的完整约束求值，不clamp不可用候选。
- inline readonly不合并为disabled：Calendar和时间列仍可聚焦、方向导航和浏览，但日期、时间、preset、Now与Confirm不写值；Cancel和reset仍可清理草稿/反馈。Time Panel reset沿控制器级联，避免常驻面板留下过期状态。
- `ZTimeGrid`与`ZTimeValue`已落盘：前者以`Time`时隙、集合导航和唯一Form owner选择，后者复用`ZText`的同一文字recipe及通用`formatTimeValue/serializeTimeValue`。内部时隙辅助函数不进入公共入口。TimeGrid按[WAI radio pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)循环导航并选择，readonly只浏览；方向键不会应用显式激活的allowDeselect。完整远程矩阵未通过前，D12仍不记为accepted。

## 证据与未闭合项

E14远程任务已有完成日志，但整个run最后一次读取时仍在运行，不能写成整体完成或green。已完成job的事实为：覆盖率1320项通过、6项失败，失败集中在Period六项；静态契约有41个类型错误，多数位于Period泛型；外部SSR有4个`.svelte.d.ts`在`Component<Props, ...>`触发大DOM属性交叉联合的TS2590。Period失败由当前修复线处理；DateTimeField/Picker/Range与Calendar的Props改为先物化named interface分支，再组成纯union，避免在Svelte的`keyof Props`和`Partial<Props>`处反复分配联合。以上是已定位和正在修复的证据，不等于新候选已由远程复验。

本地真实浏览器已确认390px下inline single的form宽314px、surface宽312px，页面和局部横向溢出均为0；Cancel不写canonical，Confirm只产生一份`appointment`并保持inline，reset恢复值且不增加commit次数。另用320px真实组合确认：inline range预设草稿不改两条FormData，确认后各端点只提交一次并保持inline；只读Calendar可聚焦，两个时间listbox保持tabindex=0且aria-readonly=true，值和回调不变；拒绝写入的模型保留原值且不发commit。

TimeGrid在390px下各grid宽314px，页面/控件均无横溢出；实际ArrowRight把“晨会”移至并选中“午间窗口”(12:30)，readonly保留9点选择而焦点移至10点。TimeValue两套实质不同示例正常加载：datetime保留18:45:34.125，视觉可分别为18:45、下午6:45或18:45:34；八档字号实际为11/12/14/16/20/24/32/40px，五tone与换行无溢出。修正了示例误用字符串wrap，使用Group/Stack真实boolean合同。

源码生成基础设施同时修复有限字面量constraint的distributed conditional展开；PeriodCalendar/Picker不再静默生成空props，现分别32/46项。新增空Props硬失败和真实Period判别自测。当前制品为185公开组件、115文档族、354测试源文件、2624生成props；这些计数只代表源码资产。轻量source脚本自测与生成检查通过，完整类型、SSR、多浏览器、Windows、覆盖率和辅助技术矩阵仍交远程执行。所有新品保持既有experimental/unreleased边界，不据此晋升stable。

下一阶段可并行继续：MiniCalendar与Calendar现有owner/navigation的组合设计；国际历法可编辑值模型与locale/display calendar边界；当前日期时间联合约束及Period失败的远程复验；TimeGrid/TimeValue与Schedule后续时隙消费；以及不与日期目录重叠的集合、拖放、媒体、图表和编辑器波次。日期整族没有因E15源码落盘而关闭。

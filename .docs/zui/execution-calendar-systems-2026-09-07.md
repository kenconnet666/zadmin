# E16：紧凑日历、国际历法与真实验收状态

基线E15为`7c6123a2523fc3bfc420a43801014d1c23f4d994`。上一阶段已提交实际能力与制品；本阶段继续D13/D14和最终验收基础，不把已有静态资产标签当作当前候选通过。

## 实施分工

- Calendar增加month/strip显示分支。strip与month共用selection、focused value、禁用判断、按钮注册和Form owner；MiniCalendar只作为single/strip的易用入口，透明组合Calendar，不复制状态机。
- 国际历法将model calendar与display calendar分开。locale指定显示历法，编辑与月份算术在同一显示历法中进行，提交转换回原模型calendar；Era、闰月、跨年和SSR边界使用现有internationalized/date算法。
- 成熟度报告把基于文件数量的阶段改为准确的“资产存在/契约声明”，保留门槛；当前提交的适用CI执行证据独立显示，缺少证据明确pending。
- 读取E15已完成job日志处理Period类型、SSR惰性render断言、窄屏和外部声明问题。完整测试/构建/跨浏览器继续远程，不等待新run。

## 最后成组检查

- 日期按钮现在复用MountedElements的token清理、真实ref与焦点跟踪，month和strip共用同一个日期按钮snippet。不同历法重新挂载同一ISO日时，旧节点销毁不会删除新节点注册；恢复焦点只针对仍然有效的逻辑焦点日期。
- 整个目标月份不可用时，仍可浏览该月份，由grid提供唯一Tab目标并继续方向键导航；实测2026年10月全部不可选仍可进入，ArrowRight进入11月，业务值仍为9月15日。月份内选择可用焦点改为有限窗口搜索，不跳到窗口外留下隐藏焦点。
- Japanese同月跨纪元使用day arithmetic；实测从1912年6月30日翻至7月，focus为taisho:1-7-30，页头同时显示明治45年7月与大正元年7月。
- Japanese纪元年份自然显示8，输入12期间业务值仍为8，Enter后才提交12；Gregorian保留四位年份合同。Meiji下拉项使用稳定纪元内样本，实际显示“明治”。
- DateField和TimeField共同复用Number runtime解析locale数字；Persian DateTimeField实际显示year=۱۴۰۳、time=۱۳:۰۵:۰۹，输入minute=۰۷后模型仍为Persian并保留ms125，唯一FormData为2024-03-20T13:07:09.125。
- DateField、TimeField、DateTimeField统一先截断继承Form value scope，再按auto决定自身参与；none DateTimeField的suffixAction输入实测从suffix-local变为suffix-edited，外层模型仍为keep，FormData始终只有一份text=keep。
- strip选中日期的weekday跟随onPrimary前景色，避免暗色主题中muted文字落到亮色选中背景上。390px及1280px冷刷新页面均无横向溢出；1280px已核对完整侧栏/内容/页内目录布局。
- 最终冷刷新发现ZText丢失暗色Provider：Vite不同timestamp的context模块各自创建普通Symbol，导致底层组件回退defaultTheme。顶层Provider及同类Form/compound上下文统一复用现有createContextKey，开发时保留hot.data身份，生产仍使用局部Symbol。实测neonDark品牌正文从rgb(15,23,42)恢复rgb(235,250,255)，muted从rgb(100,116,139)恢复rgb(154,175,209)，没有在AppHeader局部覆色掩盖。
- 临时浏览器fixture与下载的旧候选包已卸载/清理。失败job日志保留用于后续候选比较；没有运行本地完整suite或build。

## 当前实现

- `ZCalendar`以`view="month" | "strip"`共享同一selection、focusedValue、按钮注册、日期可用性和FormControlState。`ZMiniCalendar`固定single/strip，仅提供紧凑入口；7日或10日窗口不产生另一份日期owner。
- model calendar与locale display calendar已分开：字段、Calendar、Picker在display calendar中展示和编辑，用户候选进入业务约束、canonical与回调前恢复parent owner calendar。clear只清业务值，保留最近一次非空calendar表示上下文；显式current/default/placeholder仍优先。
- DateTimeField、DateTimePicker与DateTimeRangePicker沿用相同owner规则。Panel的日期、时间、preset与Now先恢复calendar/era，zoned值同时保持instant、owner time zone和offset。Range分别记忆start/end calendar，已有混合历法端点不会被统一成Gregorian或互相覆盖。
- 支持的display calendar入口对应13套实际算法，并把`iso8601`明确作为Gregorian算法别名。当前支持列表为buddhist、coptic、ethioaa、ethiopic、gregory、hebrew、indian、islamic-civil、islamic-tbla、islamic-umalqura、japanese、persian、roc，加`iso8601`别名。`chinese`、`dangi`、`islamic`和`islamic-rgsa`等当前未实现标识会明确拒绝，不静默退回Gregorian。
- DateTimeField/Picker/Range与Calendar的复杂判别Props改用真实语义generic component，目的是让Svelte生成`$$IsomorphicComponent`并避开外部声明在`Component<Props>`上展开大DOM联合。mode、selection/view和presentation都有直接泛型推断锚点，具体zoned/inline/multiple/range分支仍强制判别属性；这项声明修复尚待新远程tarball复验。

## 真实浏览器证据

- MiniCalendar的7日和10日窗口在390px组合中实测grid宽314px，页面和控件横向溢出均为0。
- locale从Hebrew显示切到Persian显示时，canonical仍保持原model calendar，没有写入Gregorian中间值或产生伪业务变更。
- Hebrew闰年13月29日向后移动进入新年1月；clear后重新选择仍提交Hebrew calendar，没有把闰月边界压成Gregorian日期。
- Japanese从平成31年4月30日向后进入令和1年5月1日，era选择、跨era导航和owner回写保持同一Japanese calendar。
- DateTime联合边界选择10小时后精确得到`2026-09-07T10:30:15.125|1`，没有跳到下一整秒。同instant外部切换Hebrew后clear并执行Now，结果保持`hebrew:America/New_York`。Hebrew start/Persian end的范围接收Gregorian preset并确认后，canonical与commit均为`hebrew:persian`。

这些是指定路径的本地真实浏览器观察，不代表三浏览器、SSR、Windows、全部locale算法、辅助技术、forced-colors或动态组合已经验收。临时fixture已卸载关闭。

## 报告与远程边界

成熟度报告已把静态资产改名为`*ContractsDeclared`/`*Present`，真正的browser/production/visual/desktop执行证据独立并要求绑定revision。当前生成事实为186个公开组件、141个`stablePendingExecution`、0个`stableCompliant`；metadata stable声明、静态合同齐全和当前提交真实通过不再混成一个状态。没有同revision逐组件manifest时保持pending。

E15 external tarball中的四个DateTime/Calendar `.svelte.d.ts` 曾在`Component<Props>`触发TS2590。当前已改语义generic并增加源码与外部`ComponentProps`资产，但尚未获得新远程包结果，不能写成修复已验收。MiniCalendar和DateTime新品仍为experimental/unreleased；Calendar、DateField等既有stable声明也必须等待当前revision执行证据，不因上述点查认定验收或晋升stable。

## 下一阶段

主线转入当前revision执行证据composer：复用现有CI结果与revision-bound artifact，形成browser/production逐组件执行状态，不能再从测试文件存在推断Verified。W4集合、拖放与后续完整能力波次同步启动；MiniCalendar/国际历法剩余引擎、辅助技术、RTL/auto、极值年份和远程矩阵作为并行边界继续处理，不再无限阻塞在日期目录，也不把D14写成整体关闭。

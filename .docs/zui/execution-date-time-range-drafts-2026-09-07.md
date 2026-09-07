# E12：日期时间、时间范围与表单草稿

本阶段承接 E11 的 `588d8e4`，新增能力与重构同步推进，不把 metadata 中的稳定标签当作当前候选已经通过验收。

## 实现与复用

- 新增实验性 `ZDateTimeField`：`mode=local` 对应 CalendarDateTime，`mode=zoned` 对应 ZonedDateTime；显示时区与值拥有的时区分开。支持 Gregorian 编辑、placeholder、小时/分钟/秒、联合 min/max/unavailable、DST compatible/earlier/later/reject、跨日期时间边界键盘导航和整个草稿的 Escape 回滚。
- 新增实验性 `ZTimeRangePicker`：范围端点允许 null；`ordered` 与 `overnight` 明确同日顺序和跨午夜，不自动交换 23:00 → 01:00。allowEmpty 决定部分范围是否有效，预设与面板先编辑草稿，确认再提交；onCommit 与 onValueChange 分开。
- TimePicker 提取内部 `TimePickerPanel`，被单值与范围复用。面板只负责列、键盘、焦点、预设、当前时间及操作区；根组件拥有 Popover、模型、FormData 和 reset。预设函数在点击时求值，Now 按显式或 Provider 时区读取，并重新校验约束。
- DateTime 复用 DateField + TimeField + InputGroup，范围复用双 TimeField；子控件均退出表单参与，根组件唯一注册。新增公共边界导航 helper，复用底层字段的 rollbackDraft，避免另一套分段编辑实现。
- `componentDefaults.dateTimeField/timeRangePicker` 提供独立五档尺寸入口，内部字段与操作接收同一 resolved size；所有消息进入 locale pack。字段在 InputGroup 内只由 Group 绘制 focus ring，避免复合控件的重复描边。

## 表单草稿合同

`FormControlDraftState` 为 `{ valid, dirty, message? }`。它描述原始输入与控件自身约束，不混入 schema/server/manual 或父 Field.invalid，防止反馈循环。控件适配器可提供 draftState 和 resetDraft。

FormValueControls 把草稿与既有唯一 value owner 注册放在同一个生命周期内。Form/Field 的 dirty 包括尚未进入模型的草稿；valid 包括内在无效草稿。未触摸时不急于显示错误，blur、显式验证或提交后显示。清除外部错误层不会抹除仍然无效的真实草稿。

validate 在 schema 前后重新读取草稿；只改原始输入而未改模型也会使正在执行的校验过期。任何无效或过期结果都不返回成功 data。原生 fieldset 禁用使用 :disabled 检查并观察属性变化，包含 first legend 例外；只读仍参与校验和提交。

resetField 只在模型接受 baseline 后回滚草稿，不制造用户变更事件。卸载控件移除无法保留的原始草稿；保留的模型字段仍按 canonical baseline 计算 dirty，schema/server/manual 保留遵循现有政策。

## 前一候选远程反馈

E11 CI [34067417026](https://github.com/kenconnet666/zadmin/actions/runs/34067417026) 已完成：三个浏览器的 Docs E2E、工作区构建、bundles/external、Windows C# WebView2 与 Drizzle 通过；Static contracts、Workspace component tests、Coverage 失败。

本批修复可定位的日期模型拒绝回滚、首次空值分段过早提交、Select/MultiSelect/TagsInput 的 Provider RTL 传播、Rating 清空后的原生 radio 回滚和重复 hover 回调。纠正 SSR 跨表单计数、controller mount 时机、类型 fixture、FormList snippet 泛型、浏览器命令声明与实现同名导致的类型遗漏。异步表单断言等待实际结果，RangeSlider 断言共享 label 的完整双端点文本。

尚未归因或未经新候选远端复验的失败仍保持开放，包括 Firefox password autocomplete IDL 和导航弹层场景；不宣称 E11 全部故障已经验证消除。

## 本地验收与交付边界

只执行 WebStorm 受影响文件诊断、Prettier、diff/source/artifact 审计与真实 Chrome 插件点查，未执行本地完整类型、Vitest、Playwright suite、build 或 bundle gate。

实际 390px 浏览器确认：

- DateTime ArrowRight 从日期日段跨到时间小时段；ArrowUp 10→11 只产生一次用户变更，保留分钟秒。
- 纽约 2026-11-01 01:30 与上海 13:30 显示同一时刻。
- Form 清空时间分钟段后仍保存原 canonical 10:30:15，但 dirty=true、valid=false，提交显示未完成时间错误且不调用业务成功处理；字段 reset 恢复分钟。
- TimeRange 下午预设先改变面板，确认后产生 13:30→17:30、一次 onCommit、关闭并恢复 trigger 焦点；跨午夜保持 23:00→01:00。
- 新页面与五档范围控件在 390px 下没有横向溢出；API 长类型采用现有换行布局。

新增 pure/SSR/types/browser 回归资产交远程 CI 执行。当前源码制品为 109 Docs families、179 public components，API runtime/source 审计 actionableIssues=0；这些数字说明资产覆盖，不代表全组件执行通过。

## 下一阶段

继续组合 DateTimePicker、DateTimeRange 与 Calendar 的多月/周期选择；优先复用 DateTimeField、Calendar 和共享 TimePickerPanel，并检查统一确认策略、约束、时区及生命周期。保留最终整族主题、动作、禁用/只读、RTL、窄屏、动画中断/reduced-motion 和当前提交远端稳定验收门槛。

最终交叉检查还统一了实例dir与Provider方向优先级：方向透传到字段、Calendar、InputGroup和portalled时间面板，原生auto/CSS方向在键盘操作时读取。Time两Picker消除disabled action重复淡化；TimeRange秒粒度端点标题保留秒、showNow与单值同名同义、取消与确认复用Panel同一行footer。Date/Time所有Picker统一把open作为请求状态，disabled/readonly期间抑制实际层，解除后仍遵循请求值；该抑制不伪造用户open回调。新增DatePicker状态/方向回归资产交远端。

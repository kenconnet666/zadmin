# E13：日期时间选择器组合

基线：E12 `cd25bb24f24364f1d7dc357c1a1fd498c59f63b1`。本阶段继续 D04/D05，不缩减完整组件矩阵。

## 本批合同

1. DateTimePicker 使用一个 DateTimeField；DateTimeRangePicker 使用两个 DateTimeField。字段新增显式 formParticipation=none 和 suffixAction 组合点，根 Picker 唯一拥有 model、FormData、open、reset 与提交回调。无需额外套一层 InputGroup。
2. DateTimePickerPanel 是两种 Picker 共享的内部面板，组合 Calendar 和 TimePickerPanel，不包含完整 Picker、模型、表单桥接或独立浮层。
3. mode=local 对应 CalendarDateTime，mode=zoned 对应 ZonedDateTime。显示时区与拥有值的时区分开，采用现有 Gregorian 编辑与 DST disambiguation 合同；显示粒度不丢弃隐藏精度。
4. value/open/panelDraft 相互独立。字段完整有效输入更新 onValueChange；commitMode 只控制面板、preset、Now 的确认或即时提交。immediate 写入后保持面板以便继续调整，显式 Confirm 提交并关闭。onCommit 不由外部同步或 reset 伪造。
5. 范围端点始终可表达 null；allowEmpty 决定部分范围是否有效。order=strict 保留逆序并判为无效，order=swap 只在完整用户候选提交前排序，并用排序后的端点角色和完整范围校验。已有外部值不静默改写。
6. Calendar 先排除明确位于显示时区 min/max 日期之外的日期；任意联合谓词在具体时刻和确认时校验，不把一个时刻不可用等同于整天不可用。选到无可用时间的日期显示明确反馈，不穷举每个日历单元格的所有秒。
7. 新组件保持独立五档默认、共享消息包、dir 到 Portal 的传播、单一禁用淡化和焦点框；面板动画、reduced-motion、销毁由现有 Popover/Presence 负责。

## 对标依据

本阶段通过 Context7 核对 [React Aria DateRangePicker](https://react-aria.adobe.com/DateRangePicker/useDateRangePicker.html) 与 [DatePicker](https://react-aria.adobe.com/DatePicker/useDatePicker.html)：显示 granularity 与原始值精度分离、日期时间类型清晰、表单和日期边界验证相互组合。ZUI 使用既有 @internationalized/date，不增加第二套日期引擎。

## 本批整改与一致性检查

- NumberField 接入同一 FormControlDraftState、resetDraft 与 onDraftChange；未完成数值不再让旧模型绕过表单校验。新增专用五档默认，保留既有失焦格式化合同。
- ZFormField 的注册 effect 先捕获登记输入，再用 untrack 调用 registry.register。原实现订阅了 registry 内部 state，使验证时反复注销/注册字段，导致正确的 email 仍保留旧错误。这一根因已通过同一真实浏览器序列修复验证。
- 日期时间组件的 module/instance 重复类型导入、声明联合复杂度、FieldPath 精确返回类型、intent 空值与日期类型负例按 E12 CI 修正。子字段 Props 以真实 mode 分支构造，不使用不可能的日期类型交叉断言。
- DateTimeField 一侧清空时保留 canonical，仅双侧清空写 null；根 Picker 先记录字段 projection 再请求模型，以支持拒绝后的回投。
- Panel 的不可表示 DST 草稿通过同一 draft feedback 传给两种 Picker/Form，取消和 reset 清理纯 UI 日期；已有明确 offset 的 fold 值在无改动确认时保持原 instant，不重新制造歧义。
- 时间列初始化就显示当前选中项，滚动仅影响对应列，避免连带滚动弹层和文档。日期时间面板在较宽空间并排，在窄空间堆叠，采用按控件尺寸计算的 grid auto-fit/minmax；确认区保持可见。
- 范围端点标题使用本地化日期时间及实际显示粒度，未向产品按钮直接显示 ISO 序列化。输入组内 suffix action 使用 contentHeight，两侧字段保持相同高度，日期与时间在空间不足时可换行。
- FloatingPositioner 的 flip、shift 和 size 统一使用 8px 避让边距，修复宽弹层定位到 x=8 后仍获整幅 viewport 宽度、导致多出 8px 横向溢出的问题。
- Rating 不再取消选中 radio 的清空 click，按 canonical 同步并在 owner window 下一帧协调原生状态；hover 由组根委托。PasswordInput 检查真实 autocomplete 内容属性，避免 Firefox IDL getter 差异误报。
- Docs dev server 实际出现过源文件完整但 Vite 缓存为空组件的情况；配置 watch.awaitWriteFinish 的短写入稳定窗口，并重新生成缓存后已恢复。此项是对观察到的写入窗口风险的保护，不是完整 HMR 稳定性证明。

## 当前证据与边界

上一候选 [E12 CI 34070963282](https://github.com/kenconnet666/zadmin/actions/runs/34070963282) 已结束：三浏览器 Docs E2E 与 Workspace builds 通过，静态/组件/外部包等仍失败。本批对相关源码与 fixture 分别修正，完整结果由下一候选远程验证。

本地只做 WebStorm 受影响文件诊断、Prettier、源码/制品审计和 Chrome 插件点查，未执行本地 suite、完整类型、build 或 bundle gate。

真实浏览器证据：

- NumberField 输入单独负号：canonical 仍为 12.5，Form dirty=true、valid=false。
- Form 初次两项无效后输入 account x→alice、email alice@example.com；修复注册 effect 后错误清空，成功输出 true:false:0:alice。定位时的临时 trace 已删除。
- DateTimePicker 选择 9 月 8 日后仍显示原 canonical；时间列调整至 11:30:15 并确认后只产生一次 value change、一次 commit，关闭并回到 trigger。
- immediate 模式选新日期时立即写值并保持面板；随后单独确认只增加 commit，不重复 value change。
- DateTimeRange 跨日 preset 先改草稿，确认后为 9 月 7 日 23:00 至 9 月 8 日 01:00，仅一次 commit，焦点回到 trigger。
- 单值和范围的只读模型拒绝直接字段修改后，Day分别回到11/07，FormData保持原日期时间，范围回调计数0:0。
- DST面板选择3月8日02:30缺失时刻时保留原3月7日canonical且draft.valid=false；选择03:30后变为3月8日EDT并恢复draft.valid=true。
- 390px 下文档实际 clientWidth=380，修复后 scrollWidth=380；弹层位于 x=8、右边372，footer在可见区。1280px 下日历/时间并排为两列232px，仍无横向溢出。

新增 pure/SSR/types/browser 资产交远端；源码清洁、静态制品和个别浏览器点查不替代全矩阵稳定验收。后续继续周期选择、多月 Calendar、国际历法与其余企业组件能力，目标保持进行中。

最终API源码审计：181公开组件、2492 props、actionableIssues=0，111文档组件族。制品写入曾遇到一次Windows短时文件占用，单独重试progress生成后完成。

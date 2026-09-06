# E10：既有模型接入Form与控件组合

E9已经交付真实CheckboxGroup、独立FormModel/FormArray/errors层以及native读值/dirty基础。本批继续完整表单矩阵，不把独立helper或手工绑定Demo当作自动Form集成。

## 集成选择

优先向ZForm注入已有`FormModel`实例（`model` prop），保留未传model时的native模式。相较早期values/defaultValues/valueMode草案，这复用E9已有canonical owner，避免ZForm再构造第二份模型或同时接受多种互相覆盖的值来源。实例可在Form外读写、reset、观察，生命周期由创建者和表单各自负责。

`ZFormField`提供独立内部value scope，继续复用原有Field视觉/ARIA，不向ZField塞值仓库。control adapter声明值规范化、原生提交条目、实际表单关联、成功控件判定与焦点；上层组合claim唯一value owner，辅助按钮、Search input、SelectAll不抢业务值。首先接Input/Textarea/Checkbox/CheckboxGroup，再按文本、数值、集合/复杂值分组并行接入所有适用控件。

model用于Standard Schema输入；FormData继续按真实name/form/disabled/unmounted/submitter表达successful controls。批量模型写入与立即提交必须在同一个适配边界取到最新值，不依赖恰好已完成DOM flush。只读保留提交，disabled排除原生条目但可在model保留值。

## 必须一起完成

1. 受控/非受控model、owner拒绝、原位Svelte深state更新、undefined/null/空值、明确的值域与不可变快照类型；自动适配与显式value不可形成两个业务owner。
2. controller读写、initialize/reset/resetField、精确dirty、touched、aggregate state及订阅；外部同步、reset与用户change语义分开。完善所有变更来源的value观察，不把无事件原生DOM写值伪装成已自动观察。
3. schema/server/manual层接入既有validation ticket/epoch；局部校验不覆盖服务端错误。原生reset取消、晚到验证、提交替换与异步提交状态保持一致。
4. ZFormList使用FormArray稳定row id，数组索引仅为当前地址；move一次性迁移状态、错误和依赖，remove清理值/状态/旧验证，重复值行也要更新身份。不能在两个同path暂时重叠的注册effect之间串用旧状态。
5. 条件卸载preserve策略与明确数组remove分开；Field focus、native FormData、portal控件、主题、尺寸、禁用、reset、减少动画在实际组合中一起验证。

## 并行边界与短阶段

- Root独占ZForm/ZFormField/FormRegistry/context/validation集成。
- 稳定adapter协议后，文本及布尔组、数值组、compound集合组分文件并行改造，仍复用原控件内核。
- 独立代理审查FormArray身份迁移与errors层，另一代理同步真实Docs；不先写不存在的API示例。
- 每个可构建阶段提交推送；本地WebStorm与必要Chrome，长测试/构建交远程CI，不等待新CI。

最终验收必须使用当前候选的完整组件族证据；E9的Chrome示例、helper单测资产或stable标签均不能替代本批集成与全目标关闭条件。

# E9 Form native foundation 交叉审查

## 范围

只读审查 `ZForm`、`FormRegistry`、`NativeFormBaseline`、`formDataToObject` 与 native form values/baseline 测试。按当前 native value owner 合同判断，不把后续 model/adapter 能力当作当前缺陷。

## 发现

下列两项已由root在本批修正：FormRegistry拒绝同path不同htmlName；成员变化统一触发onMembershipChange并在DOM flush后重算dirty。新增registry负例与动态重复权限项的浏览器回归，完整执行仍交CI。保留原发现用于解释修复依据。

### P1：同一 FieldPath 可以登记不同 htmlName，但 baseline 只按 FieldPath key 存一份

`FormRegistry.register` 会拒绝“同一个 htmlName 对应不同 FieldPath”，却允许“同一个 FieldPath 对应不同 htmlName”。`ZFormField.htmlName` 又是公开覆盖点。与此同时，`NativeFormBaseline` 只以 `fieldPathKey(path)` 为 key：首个实例捕获的 name 成为该路径唯一 baseline，第二个不同 name 的实例触发 input 时会用自己的 FormData 条目与第一份 baseline 比较。结果取决于注册顺序，dirty 可能被错误标记。

公开 metadata 已把受支持形状描述为“同一路径可由多个同名 control 共同提交”，因此最小修法是在 `FormRegistry.register` 增加对称约束：同一 FieldPath 的所有实例必须使用同一 `htmlName`，否则注册阶段抛出明确错误。补一个 registry 单元用例覆盖同 path/different htmlName；无需改变 native value owner。

### P2：同路径的部分实例动态挂载或卸载后，dirty 不会立即按当前 successful controls 重算

首次同时挂载的重复实例通常会在 `onRegister` 的 tick 中一起进入初始 FormData，因此初始 baseline 正确。但路径已经有 baseline 后再动态增加一个同名实例，`capture` 是 no-op，也没有调用 `setDirty`；移除一个实例但路径仍有其他实例时，`FormRegistry` cleanup 直接返回，也没有通知 `ZForm`。此时 `getValues()` 已反映新 DOM，`getFieldState(path).dirty` 却保留旧值，直到该路径后续再产生 input 事件。

最小修法是让 registry 在同路径实例成员变化且路径仍存在时通知 `ZForm`，由 `ZForm` 在 DOM flush 后用既有 baseline、共同 `htmlName` 和最新 `FormData` 重算该路径 dirty。新增浏览器用例：两个同 path/同 name 控件建立 baseline，动态增加或移除一个实例后，不额外输入也能观察到 dirty 与当前 FormData 一致；全部实例卸载仍沿现有微任务清理和 `baseline.forget` 路径。

## 已核对且成立的边界

- `NativeFormBaseline.capture` 保留第一次有序 successful-control 快照，显式 reset 或最后实例卸载才清理；同 effect turn 的卸载/重挂由 registry unmount version 避免误删。
- 注册 capture、input dirty 比较、reset 重建和 destroy 都受 `nativeValueEpoch`/lifecycle 检查保护；旧 tick 不会越过 reset 或销毁写回。
- reset listener 在 task 边界等待浏览器默认动作，并在执行前检查 `event.defaultPrevented`；新 reset 会取消旧 pending callback。取消 reset 不清值、baseline 或字段状态。
- 空 file input 每次 FormData 生成的新空 `File` 只在空名称、零长度与允许的空 MIME 形状下视为相同；真实已选 File 仍按对象身份比较，不会因相同元数据隐藏替换。
- `getValues()` 每次读取当前 FormData，保留重复条目顺序，通过注册的 typed FieldPath 生成深冻结对象或根数组；File/Blob 身份不被递归冻结或复制。
- `getFieldValue(path)` 从同一只读快照逐段读取；缺失或 unsuccessful 字段返回 `undefined`，不冒充 Standard Schema output。
- `setFieldFeedback` 是正式反馈写入口，`setFieldState` 直接复用同一实现并带 deprecated 注释；两者没有 value/dirty/touched 写语义。

## 验证边界

本审查没有修改生产代码，没有运行 tests、typecheck、build 或浏览器。结论来自当前源码和现有测试的静态交叉检查；Chrome 已验证的 Alice → Bob → Alice dirty 行为与这里的结论一致，不覆盖动态重复实例成员变化。

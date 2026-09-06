# CheckboxGroup 执行记录（2026-09-07）

## 实现范围

本轮新增 `ZCheckboxGroup`、`ZCheckboxGroupItem`、`ZCheckboxGroupSelectAll` 和纯选择 helper。组件复用现有 `ZCheckbox` 的真实 input、`ControllableState`、`LogicalCollection`、`SelectionModel`、`MountedElements`、Field owner 与 `FormResetSignal`；没有修改 ZForm/FormRegistry，也没有复制 RadioGroup 的 roving focus。

## 最终 API

`ZCheckboxGroup<TKey extends SelectionKey>` 使用真正互斥的两种入口：

- data 模式必须提供 `options`，并禁止 `children`；空组使用 `options={[]}`；
- compound 模式必须提供 `children`，并禁止 `options`。

共同 props 包括 `value/defaultValue: readonly TKey[]`、`onValueChange`、`name/form`、`required`、`minSelected/maxSelected`、`disabled/readonly/invalid`、`orientation`、五档 `size`、semantic `tone`、`preserveUnknownValues`、`validationMessage` 和根 `ref`。

`ZCheckboxGroupItem` 要求 typed `value`，并允许自身 `disabled/textValue/size/tone`、真实 input `ref` 和合法 Checkbox 原生属性。可见 `children` 位于原生 label 中；不提供 children 时，调用方必须给真实 input 提供 `aria-label`。

`ZCheckboxGroupSelectAll` 使用同一组 selection，partial 时向真实 checkbox 写 `indeterminate`。它没有 `name`，不会进入 FormData。达到 `maxSelected` 允许容量时显示 checked；再次切换会按 `minSelected` 清除到允许下限。

## 行为边界

- 每个 item 都是普通原生 checkbox Tab stop；Arrow 键没有被改造成单选组导航。
- checked item 以相同 `name` 形成有序重复 FormData；number key 保持 typed public value，在 FormData 中按原生字符串提交。
- readonly 保留焦点和 FormData，只阻止切换。disabled 使用真实 input disabled，因此不提交。
- 所有程序切换入口在动作发生时读取 `input.matches(':disabled')`。SelectAll 每次只处理当前真实可操作 input；同组中位于局部 disabled fieldset 的 item 不会被选中。
- `minSelected` 阻止继续取消到下限以下；`maxSelected` 只阻止新增选择，不阻止取消。
- `required` 使有效最小值至少为一。第一个真实可用 input 保留动态 required，以获得浏览器本地化的零选择提示。
- min 大于一或外部 value 超过 max 时，一个真实可用 input 持有 group `customValidity`。owner 会随 disabled/mount 变化迁移；旧 owner 和组件卸载时会清除 validity。`validationMessage` 可覆盖内建英文 min/max 消息。
- options 模式默认删除不再存在的 key；compound item 卸载后在同一个微任务内没有重注册时静默删除。`preserveUnknownValues=true` 明确保留未知值。协调删除和 reset 不触发用户 `onValueChange`。
- SelectAll 忽略 disabled item，部分选择显示 mixed，并遵守 min/max。disabled 已选值可留在 typed model 中，但真实 disabled input 仍不会出现在 FormData。
- size 顺序为实例 → Field/Group → `componentDefaults.checkboxGroup` → `componentDefaults.checkbox` → density。tone 顺序为实例 → Group → checkboxGroup defaults → checkbox defaults → primary。Item 和 SelectAll 都把最终 tone 传给正式 `ZCheckbox.tone`；invalid 继续由 ZCheckbox 更具体的错误选择器优先。

## 编写的验证资产

- SSR：options 真实 checkbox 数量、重复 name、checked/default、disabled、group ARIA、compound children 和 typed helper。
- 类型：string/number typed数组、options/children互斥、必填 item value、封闭 orientation、Item/SelectAll snippet 与 ref。
- Browser：普通 Tab 顺序、mixed SelectAll、min/max、重复 FormData、reset、readonly、动态 compound removal、整体与局部 native fieldset disabled、min>1/max overflow 的 `form.checkValidity()`、numeric typed输出、Field继承和五档 size/tone。

按阶段约束，没有在本地运行 Vitest、Playwright、Svelte check、typecheck、build 或 Chrome。受影响文件只执行直接 Prettier 和 WebStorm affected-file diagnostics；完整行为由后续 CI 验收。

## Root实际集成

Chrome已验证typed数字/字符串key各自可选、SelectAll容量、重复FormData、min2/max3以及invalid/tone切换。实际浏览器发现max拒绝后底层Checkbox局部checked覆盖组值；Item/SelectAll现在以函数binding投射唯一组状态，拒绝后DOM/ARIA/label/value一致。组root继承Provider方向且保留实例dir；customValidity使用中英locale并允许validationMessage覆盖。compound空required的SSR由首个未disabled Item获得原生required，挂载后仍切回真实actionable owner。

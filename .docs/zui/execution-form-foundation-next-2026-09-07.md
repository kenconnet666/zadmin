# Form 基础下一批执行设计（2026-09-07）

## 结论

下一批不重写 Form。保留以下现有所有权：

| 责任                                                           | 继续由谁拥有                       |
| -------------------------------------------------------------- | ---------------------------------- |
| native 模式当前值、successful controls、FormData、浏览器 reset | 原生 control / `FormValueBridge`   |
| 字段路径、依赖图、dirty/touched/validating、DOM 顺序和焦点     | `FormRegistry`                     |
| 完整 typed 校验                                                | Standard Schema                    |
| label、description、反馈和 control 关联                        | `ZField` / `ZFormField`            |
| 单 checkbox 的布尔/混合状态                                    | `ZCheckbox` 的 `ControllableState` |

只在显式 `valueMode="model"` 时增加一个 Form model。model 是该模式的唯一业务值 owner；control 通过 adapter 投射 model，不再创建另一份会和 DOM 猜测同步的字段 store。native 模式继续是默认值，现有使用方式和提交结果不变。

## 现有代码的具体缺口

1. `ZFormController` 只有校验、反馈、focus/scroll/reset，没有 `getValues`、字段读写、initialize、watch 或数组操作。
2. `FormRegistry.markDirty` 一旦收到 `input` 就永久为 true，直到 reset；用户把值改回 baseline 仍是 dirty。这不是成熟表单 API 中的“当前值与初值不同”。
3. touched 已正确在焦点离开整个 `ZFormField` 后设置；submit 会 mark-all-touched。这条路径可以原样扩展。
4. schema errors、`errors` binding 和 controller `setErrors` 共用一个 map。局部 schema 验证可能覆盖服务器错误，也不能精确表达“输入后只清服务器错误”。
5. 最后一个同路径实例卸载后，状态和错误总会删除。条件字段没有 preserve 策略；数组 move/remove 也没有稳定 row identity。
6. Standard Schema 的全表 parse、path ticket、validation epoch、change debounce 和 submit supersede 已经正确解决竞态。字段级能力必须接在这套 ticket 上，不能新增第二组 Promise generation。
7. `ZField` 是单 control label。多 checkbox 不能靠给每个 input 设置 `required` 实现“至少选一个”，因为那会要求每一项都选中。
8. `ZCheckboxGroup` 尚不存在；单 `ZCheckbox` 已经具备真实 input、typed value、indeterminate、readonly、Field 继承、FormData 和 reset，应该成为 group item 的底层。

## 公开 API 方向

### ZForm 两种值模式

建议用判别 props 表达，不让 native 模式静默接受无效的 model 配置：

```ts
type ZFormNativeProps<TSchema> = {
	valueMode?: 'native';
	values?: never;
	defaultValues?: never;
	onValuesChange?: never;
};

type ZFormModelProps<TSchema, TValues> = {
	valueMode: 'model';
	defaultValues: TValues;
	values?: TValues; // bindable；undefined 时使用内部 model
	onValuesChange?: (detail: FormValuesChange<TValues>) => void;
	preserve?: boolean;
};
```

`onValuesChange` 只报告用户、controller 和 field-array 操作；外部受控 `values` 同步、initialize 与 reset 不伪造成用户 change。detail 至少包含 immutable `values`、`changedPaths` 和 `reason: 'user' | 'controller' | 'array'`，一次批量操作只通知一次。

controller 在兼容方法之外增加：

```ts
interface ZFormController<TValues, TOutput> {
	getValues(): TValues;
	getFieldValue(path: FieldPathInput): unknown;
	setValues(next: TValues | ((current: TValues) => TValues), options?: SetValueOptions): void;
	setFieldValue(path: FieldPathInput, value: unknown, options?: SetValueOptions): void;
	initialize(values: TValues, options?: { overwrite?: 'pristine' | 'all' }): void;
	resetField(path: FieldPathInput): void;
	subscribeValue(path: FieldPathInput, listener: FormValueListener): () => void;
	clearErrors(paths?: readonly FieldPathInput[]): void;
	setFieldFeedback(path: FieldPathInput, feedback: FormFieldStatePatch): void;
	fieldArray<T>(path: FieldPathInput): FormArrayController<T>;
}
```

`setFieldState` 当前实际只能写 errors/warnings/success，先保留为 deprecated alias，主名改为 `setFieldFeedback`。native 模式的 `getValues/getFieldValue` 每次从真实 FormData 读取；会写值的方法和 `fieldArray` 在 native 模式抛出明确错误，因为直接设置 DOM 会绕过 Svelte control owner。

### Control adapter

新增一个 FormField 内部 context，不改 `ZField` 的视觉/ARIA context：

```ts
interface FormValueAdapter<TValue = unknown> {
	read(): TValue;
	write(value: TValue, reason: 'model' | 'initialize' | 'reset'): void;
	entries(value: TValue): readonly FormValueEntry[];
	isSuccessful(): boolean; // 实际 :disabled、name/form 等边界
	focus(options?: FocusOptions): boolean;
}
```

`ZFormField` 负责把一个 adapter 绑定到现有 registry instance。model 模式下缺 adapter 必须在首次读写/submit 时明确报错；不能退回 `querySelector().value = ...`。第三方编辑器使用薄 `ZFormControlAdapter` 或同一 registration helper；File、Range、集合值继续复用已有 `FormValueBridge`/form-value codec。

model 模式创建 FormData 时仍先读取真实 form，以保留未托管控件、submitter 和浏览器 successful-control 规则；随后通过 `formdata` 事件或同等单点步骤，用 adapter 的 entries 替换已托管 name。这样 controller 批量写后不会因为 DOM 尚未 flush 而提交旧值。

Standard Schema 在 native 模式继续验证 `formDataToObject(FormData)`；model 模式验证 canonical model。model 可以保留 disabled/unmounted 值，而 `FormData` 仍排除不 successful 的控件；这两个结果必须在文档中明确区分。

### Dirty、touched 和聚合状态

- native 模式：ZForm 在字段注册完成或 reset 默认动作完成后，按 `htmlName` 保存原生 FormData baseline。每次 field input 重新读取该 name 的全部有序条目并深比较，调用 `registry.setDirty(instanceId, boolean)`。重复 checkbox 值作为一个字段整体比较。
- model 模式：按 FieldPath 比较 canonical value 与 defaultValues baseline；改回 baseline 必须恢复 `dirty=false`。
- controller `setValues/setFieldValue` 默认不标 dirty；`options.markDirty=true` 才改变 dirty。用户输入始终按 baseline 重算。
- touched 保留现有 focusout/submit 规则；外部 values 更新不触碰 touched。
- reset 清 validation tickets、dirty、touched、schema/server feedback 和 submitted，然后恢复对应模式 baseline。被 `preventDefault()` 的原生 reset 不执行任何清理。

`ZForm` 增加只读聚合 `FormState`：`dirty`、`touched`、`validating`、`submitting`、`submitted`、`valid`、`errors`，由 registry 和现有 ZForm 状态派生；controller 提供 `getState/subscribeState`。不要再维护一份平行 boolean 集合。

### Errors 与 validation

内部把反馈分为 `schema`、`server`、`manual` 三层，公开 `errors` 是去重后的 immutable 合并结果：

- Standard Schema 只替换被 ticket 接受路径的 schema 层；继续使用现有 whole-input parse、dependency closure、path version 和 validation epoch。
- 外部 `errors` 与 `controller.setErrors` 写 server 层；`clearErrors` 可按路径清除。
- `setFieldFeedback` 写 manual errors/warnings/success。
- 默认用户修改字段时清该字段 server error，是否清依赖字段由明确 `clearServerErrorsOnChange` 策略决定；schema error 只能由新 validation 结果替换。
- 后续 callable field validator 也必须复用 `beginValidation/finishValidation` ticket，并接收 AbortSignal；它是 Standard Schema 的可选补充，不是 rules DSL。

### FieldArray

FieldArray 只在 model 模式开放。建议成品入口为 `ZFormList`，底层为 `controller.fieldArray(path)`：

```ts
interface FormListRow<T> {
	readonly id: string;
	readonly index: number;
	readonly path: FieldPath;
	readonly value: T;
}

interface FormArrayController<T> {
	append(value: T): void;
	insert(index: number, value: T): void;
	remove(index: number): void;
	move(from: number, to: number): void;
	replace(index: number, value: T): void;
}
```

`ZFormList` 的 children 接收 rows 和 operations；文档必须使用 `{#each rows as row (row.id)}`。row id 与数组索引分离：

- 由 controller 操作产生的 row 在 move 后保留 id、dirty、touched、errors 和焦点身份。
- 可选 `getRowKey(item)` 使用业务 key，并拒绝重复 key；没有 key 时，外部整个数组替换只能按位置保留现有 id，不能猜测对象重排。
- registry 增加稳定 field identity，当前 FieldPath 只是 row 当前索引的地址。move 时先在一个 transaction 中更新 value、row index、公开 error path 和 dependency path，再通知/渲染。
- `remove` 是明确的数据删除，无论 preserve 配置都删除该 row 的 value/state/errors，并使旧 validation ticket 过期。
- 条件卸载使用 `ZForm.preserve` / `ZFormField.preserve`，默认 false；true 在 model 内保留 value 和 field state，但 native FormData 仍遵循 DOM successful controls。

### CheckboxGroup

先独立实现 `ZCheckboxGroup`、`ZCheckboxGroupItem` 和可选 `ZCheckboxGroupSelectAll`：

- root 复用 RadioGroup 已验证的 `claimZFieldControlOwner`、Field label/description、options/compound 互斥模式和同一 owner-realm reset；每个 item 直接渲染真实 `ZCheckbox`。
- 复用 `LogicalCollection`、`CompoundLogicalCollectionRegistry`、`MountedElements`、`SelectionModel(mode='multiple')` 和 `ControllableState`。checkbox 组保留原生 Tab 顺序，不引入 RadioGroup 的 roving focus/Arrow 选择。
- API：`value/defaultValue: readonly SelectionKey[]`、`onValueChange`、`options/children`、`name/form`、`minSelected/maxSelected`、`required`、`disabled/readonly/invalid`、`orientation/size`、`preserveUnknownValues`。
- 所有已选且 successful 的 item 以同 name 的真实 checkbox 形成多条 FormData；disabled item 可保留在 model value 中，但不会进入 FormData。
- `required` 等价于 `minSelected >= 1`。组级 native validity 写到第一个 enabled input 的 `setCustomValidity`，不能给每个 item 加 required。`maxSelected` 达到后阻止新的选择，不能禁用已选项或阻止取消。
- select-all 使用同一个 SelectionModel：忽略 disabled item，部分选中显示 `indeterminate`，受 min/max 限制；不复制第二套全选状态。
- options 模式默认在集合完整时清理已移除 key；`preserveUnknownValues=true` 才保留暂未挂载/远程 key。动态 disabled 不主动删除已选值。

这与 [React Aria CheckboxGroup](https://react-aria.adobe.com/CheckboxGroup) 的数组值、组名、组 required 和逐项 required 区分一致；API 形状参考其成熟边界，但仍保留 ZUI typed SelectionKey 和真实 `ZCheckbox` owner。Form 值/列表能力参考 [Mantine Form values](https://mantine.dev/form/values)、[Mantine nested fields](https://mantine.dev/form/nested/) 与 [Ant Design Form.List](https://ant.design/components/form/#form-list)：采用 values、baseline、数组操作和稳定 row key，不复制 React hook、render-props store 或 rules DSL。

## 最短可构建阶段

### 阶段 A：CheckboxGroup，独立交付

生产文件边界：

- `components/compound/checkbox-group/ZCheckboxGroup.svelte`
- `components/compound/checkbox-group/ZCheckboxGroupItem.svelte`
- `components/compound/checkbox-group/ZCheckboxGroupSelectAll.svelte`
- `components/compound/checkbox-group/context.svelte.ts`

只复用现有 Checkbox/collection/form reset，不改 FormRegistry。退出条件：SSR/类型/browser 覆盖重复 FormData、reset、required/min/max、全选 mixed、dynamic disabled/remove、options/compound、Field ARIA 和五档尺寸。

### 阶段 B：纯 model 与数组数学，可与 A 并行

生产文件边界：

- `runtime/form/form-model.svelte.ts`
- `runtime/form/form-value-adapter.svelte.ts`
- `runtime/form/form-array.ts`
- `runtime/form/form-errors.ts`

只实现 immutable path get/set、transaction、baseline diff、订阅、error layers、stable row id/reorder；不接 DOM、不改 ZForm。退出条件：纯 runtime 测试覆盖外部同步不回调、批量单通知、改回 baseline、数组 move identity、remove ticket invalidation 输入。

### 阶段 C：Form 集成，串行合并点

独占修改：

- `components/input/ZForm.svelte`
- `components/input/ZFormField.svelte`
- `runtime/form/form-context.svelte.ts`
- `runtime/form/form-registry.svelte.ts`
- `runtime/form/validation.ts`
- 新 `components/compound/form-list/ZFormList.svelte` 与 context

这一阶段接入 valueMode、controller、native baseline、adapter registration、error layers、aggregate state、preserve 和 FormList。`ZField.svelte` 不需要为值模型修改。

### 阶段 D：control adapter，可在 C 合同冻结后按文件并行

- 原生文本：`ZInput.svelte`、`ZTextarea.svelte`
- 布尔/集合：`ZCheckbox.svelte`、CheckboxGroup 目录
- 数值：`ZNumberField.svelte`、`ZSlider.svelte`、`ZRangeSlider.svelte`
- 复杂值：各自现有 compound root 与 `FormValueBridge`

每个流只注册同一 adapter 协议，不改 Form model/registry。先完成 Input、Textarea、Checkbox、CheckboxGroup 四类，形成 string、empty、boolean、repeated typed selection 的最小 codec 矩阵；其余组件随后迁移。

## 验收边界

第一批综合场景应同时证明：native 旧用法零迁移；model 受控/非受控；外部同步无用户回调；改回初值 dirty=false；blur touched；server/schema 错误不互相覆盖；prevented reset 不清状态；field array move 保留 row 状态和焦点；remove 清值/状态/过期验证；CheckboxGroup 重复 FormData、required/min/max 与 select-all mixed；disabled/unmounted model 和 native FormData 差异有明确输出。

本文件仅基于源码和官方资料形成下一批执行设计，没有修改生产、exports 或 tests，也没有运行本地测试、typecheck、build 或浏览器。

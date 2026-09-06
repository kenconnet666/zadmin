# E10B ZFormList 最小完整实施合同

日期：2026-09-07。状态：可立即拆分实施。本合同以当前 E10A 工作树为准，只定义
`ZFormList`、`FormArrayController` 与现有 `FormRegistry`/`ZForm` 的接缝；拖放、多选删除、
虚拟化和退出动画留给后续能力。

## 1. 决定

`ZFormList` 只在父 `ZForm` 已提供 `model` 时工作。`FormArrayController` 继续拥有数组值操作与
稳定 row id；`FormRegistry` 继续拥有 mounted field、字段状态、依赖和 validation token；
`ZForm` 继续拥有 validation epoch、timer 与 schema/server/manual 错误层。数组索引只是 row 的
当前地址，不是身份。

第一版公开 API 固定为：

```ts
export interface FormListOperations<T> {
	append(value: T): boolean;
	insert(index: number, value: T): boolean;
	remove(index: number): boolean;
	move(from: number, to: number): boolean;
	replace(index: number, value: T): boolean;
}

export interface ZFormListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	readonly children: Snippet<[rows: readonly FormArrayRow<T>[], operations: FormListOperations<T>]>;
	readonly getRowKey?: (value: T) => string | number;
	readonly name: FieldPathInput;
	ref?: HTMLDivElement | null;
}
```

`name` 与 `ZFormField` 保持一致。组件把 `rows` 与包装后的 operations 交给 snippet；文档和测试中的
渲染必须使用 `{#each rows as row (row.id)}`，字段路径从 `row.path` 追加字段段，例如
`[...row.path, 'email']`。调用方不得用 index、value 对象或业务字段直接作为 Svelte key。
`getRowKey` 只帮助 controller 在外部数组替换时调和 row id；自动生成的 `row.id` 始终是渲染 key，
不会写进业务值。

`FormArrayController` 的五个 mutation 改为返回 `boolean`。`true` 表示 model owner 已同步接受并且
row identity 已提交；同值操作也返回 `true`，但不发通知。`false` 表示受控 owner 拒绝，值、id、
registry、errors、焦点均不得变化。保留现有方法名和参数，不增加第二套 controller。

`FormArrayController` 的 model 参数收窄为内部结构类型，不再要求完整 `FormModel<TValues>`：

```ts
interface FormArrayModel {
	readonly defaultValues: unknown;
	get(path: FieldPathInput): unknown;
	getResetVersion(path: FieldPathInput): number;
	isDirty(path: FieldPathInput): boolean;
	isDirtyFrom(path: FieldPathInput, baselinePath?: FieldPathInput): boolean;
	resetFieldTo(path: FieldPathInput, baselinePath?: FieldPathInput): boolean;
	setField(path: FieldPathInput, value: unknown, reason: 'array'): boolean;
}
```

现有 `FormValueModel` 相应增加 `defaultValues`，并把 `setField` reason 扩为现有
`FormValuesChangeReason`；control adapter 仍只传 user/controller。`ZFormList` 从父 context 取得该 model，
按 `(model, normalized name, getRowKey)` 创建 controller。model 缺失立即抛出明确错误。name、model 或
getRowKey 身份变化时创建新 controller，并把首次 rows 当作新 list identity，不迁移旧 list 状态。

row baseline API 固定为：

```ts
interface FormArrayController<T, TValues> {
	isDirty(rowId: string, relativePath?: FieldPathInput): boolean;
	resetField(rowId: string, relativePath?: FieldPathInput): boolean;
}
```

省略 relativePath 表示整行；提供时它是 row 内相对路径。不存在的 row id 抛出明确错误。新增且不存在于
baseline 的 row/field 为 dirty。`resetField` 只恢复该 row identity 对应的 baseline，不改变数组顺序；
新增 row 的整行 reset 等价于显式 remove，新增 row 的子字段 reset 删除该子字段。整体
`FormModel.dirty` 继续比较数组顺序，因此移动两行会令表单整体 dirty，即使两行各自字段仍是 clean。

## 2. 当前必须先修的注册 cleanup

当前 `FormRegistry.register()` 的 cleanup 在创建时捕获 `field`、`key` 和 `path`：

- `current !== field` 会让 registry transaction 替换 registration record 后的旧 cleanup 直接返回；
- 后续同一 Svelte `instanceId` 以新 path 注册时会命中 duplicate instance；
- cleanup 即使继续执行，也会从旧 `key` 的 `#pathInstances` 删除并向 `onPathUnmount` 报旧 `path`。

修复方式是给每次真实注册创建稳定 `registrationToken: symbol`，保存在 `RegisteredField` 中；list
remap 替换 record 时保留 token。cleanup 重新从 `#fields.get(instanceId)` 读取当前 record，仅在 token
仍相同时执行，并使用当前 record 的 `key/path` 清 membership、排队 unmount 和调用回调。旧 token
的 cleanup 保持幂等 no-op。这样 `$effect` 的旧 cleanup 会清理已经 remap 的当前地址，新注册会在同一
turn 重新加入，现有 `#unmountVersions` 微任务继续保住状态。

同时把 `RegisteredField.dependencyKeys` 的来源路径保存为 normalized `dependencies: readonly FieldPath[]`。
只存序列化 key 无法在 row move 时重写依赖。

## 3. row identity transaction

增加内部合同，不从主 entrypoint 公开：

```ts
interface FormListRowAddress {
	readonly id: string;
	readonly path: FieldPath;
}

interface FormListReconcile {
	readonly listPath: FieldPath;
	readonly previous: readonly FormListRowAddress[];
	readonly next: readonly FormListRowAddress[];
	readonly removedIds: ReadonlySet<string>;
}

interface FormListHost {
	readonly model?: FormValueModel;
	listScopeContainsFocus(path: FieldPath): boolean;
	reconcileList(change: FormListReconcile): void;
	focusListScope(path: FieldPath): boolean;
}
```

`ZFormList` 在每次 operation 前后读取 immutable row address snapshot。owner 接受后立即调用
`reconcileList`；受控拒绝不调用。另设一个 `$effect.pre` 比较上次与本次 rows，覆盖 controlled owner
外部替换、initialize 和 reset。operation 已同步 reconcile 的 revision 要记录并在 `$effect.pre` 去重。

`FormRegistry` 增加一个 `reconcileList(change)`，并在单个 `batch()` 内完成下列操作：

1. 以 row id 连接 previous/next。相同 id 得到 `oldRowPrefix -> newRowPrefix`；缺失 id 是删除；新 id
   没有旧状态。
2. 先为所有受影响 registration 生成候选 record，再整体校验路径祖先冲突、共享 path 的 htmlName
   一致性和一个 htmlName 对一个 path 的约束。不得按 0→1、1→0 顺序就地搬运，因为 swap 会产生
   暂时冲突。
3. 一次性替换 `#fields`、`#pathInstances` 和 `#paths` 中 list 后代。`instanceId`、registration token、
   `order` 和 `control` 保持；field path 将旧 row prefix 替换为新 prefix。
4. registration 增加 `htmlNameFollowsPath`。`ZFormField` 未显式传 `htmlName` 时为 true，remap 后用
   `fieldPathToString(newPath)` 重建；显式 htmlName 跟随稳定组件实例保留，并重新执行冲突校验。
5. `dirty/touched/errors/warnings/success` snapshot 按 row id 从旧 path key 搬到新 path key。新 row 使用
   `INITIAL_STATE`；删除 row hard purge。已有 row 的 dirty 随状态搬运，后续字段变化由
   `FormArrayController.isDirty(rowId, relativePath)` 对 row baseline identity 重算；禁止用
   `model.isDirty(newPath)` 对位置 baseline 重算。
6. 所有 registration 的 dependency path 只要落在该 list 的旧 row prefix 下，就按相同 row id 重写；
   指向已删除 row 的 edge 删除。需要“任意当前位置变化”的字段应依赖 list root，而不是某个 index。
7. 外部 `subscribeField(path)` 仍订阅地址，不跟随 row id。transaction 完成后按最终地址发布一次状态；
   不向订阅者暴露 swap 中间态。

ZForm 的 `reconcileList` 在调用 registry transaction 前同步执行：

- `validationEpoch += 1`；
- 清空 validation timers；
- `registry.cancelValidation()`；
- 清空当前 validation run bookkeeping 并令 `validating=false`；
- 对 schema/server/manual 三层错误执行同一 row-id path remap。

错误迁移按 canonical path prefix 完成：list root 自身的错误保留；旧 row prefix 下、属于存活 id 的错误
换成新 prefix；删除 row 的全部后代错误丢弃；新 row 没有继承错误。三层分别 remap 后再调用现有
`mergeFormErrorLayers` 和一次 `registry.syncErrors`。晚到的 async schema 结果因 epoch/token 已失效，
不能把旧 index 的错误写给新 row。第一版允许结构变化取消无关字段的在途校验；这是安全且可维护的
最小边界。

## 4. FormArray identity baseline

当前 `FormArrayController` 只保存 current ids。无 `getRowKey` 时，move 后调用 model reset 会按当前位置
调和，导致 baseline 值拿到错误 row id。controller 必须同时保存 baseline array snapshot 与
`baselineIds`：

- 创建时为 baseline rows 分配 id；current 与 baseline 相同的 row 使用 baseline id；
- append/insert 创建只属于 current 的新 id；remove/move/replace 不改 baseline ids；
- 当 `model.defaultValues` 对应数组发生 initialize 变化时，建立新的 baseline identity。提供
  `getRowKey` 时可按业务 key复用仍存在的 id；无 key 时新 baseline 生成新 id，不猜对象重排；
- `initialize(..., { keepDirtyValues: true })` 遇到 dirty 数组时保留整段 current values/current ids，
  但更新 baseline values/baseline ids；下一次 reset 使用新 baseline ids；
- getRowKey 继续拒绝重复 key。候选 values、ids、keys、baseline identity 只在 owner 接受后提交。

值相等不能判断 reset：重复值行 move 后数组可能仍与 baseline 深相等，但 row identity 已改变。
`FormModel` 增加内部可观察 reset version：

```ts
getResetVersion(path: FieldPathInput): number;
```

实现使用 plain `Map<fieldPathKey, { path, version }>`、一个 global reset version 和单个 `$state` revision。
`getResetVersion(path)` 读取该 revision，并返回 global version 与所有覆盖该 path 的 reset scope version
最大值。成功 `reset()` 即使值相同也推进 global version；成功 `resetField(scope)` 即使值相同也推进该
scope version；controlled owner 拒绝不推进。写方法内部继续 untrack 自身 reset revision，避免 effect
回环。

FormArray 保存上次看到的 `getResetVersion(listPath)`。version 推进才把 current ids 恢复为 baseline ids；
普通 setValues、array move 和“值恰好等于 baseline”均不得触发身份恢复。resetField 的 scope 覆盖 list
时恢复整组 baseline ids；row/field 级 reset 由上面的 row baseline API精确处理，不重置其他 row id。

为了让 model 的同步 observer 在 array reason 回调中也看到新 rows，FormArray 在写入前设置仅限本次调用
的 pending candidate；`rows` getter 在 model 已等于 candidate 时读取 candidate ids。owner 拒绝后清掉
pending，正式 ids 不变。不得先永久提交 ids 再尝试 owner write。

## 5. remove、focus、preserve 与动画

`remove(index)` 是显式数据删除，始终删除 value、row state、三层 row errors、依赖边和旧 validation，
不受 `preserve` 影响。

如果调用 remove 时焦点位于被删除 row 的任一已注册 control 内，owner 接受后、DOM 更新前执行焦点
恢复：优先原下一 row 的第一个可聚焦后代；没有下一 row 时选择原上一 row；没有存活 row 时聚焦
`ZFormList` 根。根元素保留 `tabindex="-1"`，只用于程序化回退。owner 拒绝时不移动焦点。move/replace
不主动改焦点；stable keyed DOM 会保留当前 active element。

具体顺序是：remove 前用 `listScopeContainsFocus(oldRowPath)` 记录是否需要恢复；调用 array.remove；
返回 true 后仍按旧 registry path 聚焦原 next/previous row，随后调用 `reconcileList`。这样焦点先进入将
存活的 keyed DOM，再随该 row 原子换址；空列表才调用根 ref 的 `focus()`。

registry 内部的 scope focus 使用 `fieldPathStartsWith(field.path, rowPrefix)` 并继续复用当前 owner-document
tabbable、DOM order 和 realm-safe focus 逻辑，不能从 ZFormList 另写 querySelector 焦点算法。

条件卸载与 remove 分开：同一 E10B 集成提交加入 `ZForm.preserve` 和 `ZFormField.preserve`，Field 覆盖
Form 值。ZForm 未显式设置时，model 模式默认 true，native 模式默认 false，以兼容已经提交的 model
值所有权。preserve=true 时最后一个实例卸载后保留 model value 和 path state，但从 mounted
path/dependency/focus/validation 集合移除；重新注册恢复 state。native 模式即使 preserve=true 也只保留
state，FormData 仍遵循 successful DOM。model preserve=false 才调用内部
`model.removeFieldValue(path)` 删除值；owner 拒绝时值保留，但字段仍完成卸载。numeric terminal path
代表数组成员，只能经 FormList remove 删除，不能由普通 Field unmount 产生稀疏数组或隐式移位。
FormList 显式 remove 无条件 hard purge，即使字段设置 preserve=true。

`FormFieldRegistration` 新增可选 `preserve?: boolean` 与 `htmlNameFollowsPath?: boolean`，二者默认 false，
保持现有直接注册测试和非组件调用行为。registry 的卸载回调改为
`onPathUnmount(path: FieldPath, preserve: boolean)`；同 path 多实例必须使用同一 preserve 策略，否则注册
时报错。

第一版没有行 enter/exit/reorder 动画，也没有 timer；值、registry、errors 和焦点语义在当前调用栈完成，
所以 reduced-motion 与无 Web Animations API 环境天然安全。调用方不要在 row 根增加延迟卸载的 outro；
未来若提供动画，由 ZFormList 自己先 deregister、设 inert/aria-hidden，再保留纯视觉 ghost。Svelte 的
keyed each 保证重排组件身份，`animate:` 仅处理已有项重排，不能承担数据提交或 registry 迁移。

## 6. 组件与主题复用

`ZFormList` 根复用 `ZStack` 的 column/gap 能力，默认 `gap="medium"`，透传 div attributes、class、style
和 ref。组件不创建 Card、Field 或按钮外观，也不新增 Theme token。示例中的 row 使用 `ZGroup`，添加
使用现有 `ZButton`，删除使用 `ZButton tone="danger" variant="ghost" type="button"`。disabled/readonly
继续由父 Form/Field 与按钮本身表达；数组 runtime 不读取视觉状态。

ZFormList 本身不注册成 `ZFormField`，避免 array root 与 row descendant 触发现有 ancestor/descendant
冲突。list-level schema error 先通过 controller/errors 暴露，成品 ErrorList 视图后续单独增加；本批不在
registry 建一个假的 root field。

第一版明确拒绝嵌套 `ZFormList` scope。当前 controller 的 list path 与 baseline path 固定，无法在外层
row move 后安全重定位内层 list；检测到 list path 位于另一个已注册 list row 下时抛出明确错误。嵌套列表
需要 stable row scope 组合后再开放，不能伪装成已支持。

## 7. 两名实现者的文件边界

### 实现者 A：runtime identity transaction

独占：

- `ui/zui/src/runtime/form/form-array.svelte.ts`
- `ui/zui/src/runtime/form/form-registry.svelte.ts`
- `ui/zui/src/runtime/form/form-errors.ts` 或新增同目录纯 path-remap helper
- `ui/zui/tests/form-model.spec.ts`
- `ui/zui/tests/form-registry.spec.ts`

交付：boolean mutations、baseline ids、pending candidate、`FormListReconcile` 类型、registry 原子 remap、
registration token cleanup 修复、dependency path 存储/remap、error-layer remap 和纯 runtime 回归。不要改
ZForm/ZFormField/组件/entrypoint。

### 实现者 B：component 与 Form owner 集成

独占：

- 新 `ui/zui/src/components/compound/form-list/ZFormList.svelte`
- 如确有局部类型再建同目录 `context.svelte.ts`，没有第二个 owner 时不建
- `ui/zui/src/components/input/ZForm.svelte`
- `ui/zui/src/components/input/ZFormField.svelte`
- `ui/zui/src/runtime/form/form-context.svelte.ts`
- `ui/zui/src/entrypoints/index.ts`
- 新的 FormList SSR/types/browser fixtures 与 specs

交付：公开 API/metadata、model-only guard、operation 包装、同步 reconcile、`$effect.pre` 外部变化兜底、
validation epoch/timer/error-layer 集成、focus recovery、preserve 接线、ZStack 根与公开导出。只消费 A
冻结的 `FormListReconcile`/registry API，不修改 A 的 runtime 文件。

并行开始时 A 先提交类型签名或发给 B；B 可用同形本地类型编写组件，但最终只保留 A 的 canonical
类型。唯一串行合并点是 B 把 `reconcileList` 接到 ZForm 私有 host。

## 8. 必须通过的回归矩阵

纯 runtime：

- 重复值两行 move 后 id、touched、manual warning、schema/server error 全部跟 row；
- 0↔1 swap 不出现 duplicate path/HTML name 中间态，registry listener 只见最终状态；
- row 内依赖及外部指向该 row 的依赖一起 remap，删除 row 后 edge 消失；
- remove 清三层后代错误并拒绝晚到 ticket；其他 row 错误不变；
- controlled reject 对 values/ids/registry/errors/focus 完全无副作用；
- move/remove 后 reset 恢复 baseline 值及 baseline ids；initialize 与 keepDirtyValues 覆盖新 baseline；
- remap 后旧 register cleanup 不误删、不 duplicate，最终真实 unmount 仍清正确新 path。

浏览器/SSR/types：

- model 缺失时给明确错误；SSR 不访问 document/window；
- `{#each rows as row (row.id)}` 下 move 保留真实 input DOM identity、draft、焦点和 `ZFormField` state；
- 删除 focused row 后焦点去 next/previous/list root，删除最后一行不会落到已移除 DOM；
- remove 后立即 validate/submit 不包含旧 row，晚到 async 结果不复活错误；
- 无动画、Provider reduced motion、iframe ownerDocument 三条路径行为一致；
- preserve 条件卸载与显式 remove 分别验证；
- dotted scalar path 与 numeric array segment 不混淆；
- `children`、row.value 与 operations 保持泛型，不退化成 `any`。

## 9. 参考边界

- React Hook Form 官方 `useFieldArray` 要求使用生成的 field id/key 作为渲染 key，并提供
  append/insert/remove/move/update/replace；ZUI 采用稳定渲染身份与操作集合，不采用 hook store：
  https://github.com/react-hook-form/documentation/blob/master/src/content/docs/usefieldarray.mdx
- Ant Design `Form.List` 提供 add/remove/move，并要求 list 内 dependency 使用包含 list 和 index 的完整
  NamePath；ZUI 同样迁移完整 typed path，但状态归 `FormRegistry`：
  https://github.com/ant-design/ant-design/blob/6.5.0/components/form/index.en-US.md
- Mantine Form 提供 insert/remove/replace/reorder 与独立 dirty baseline；ZUI 的 baseline ids 补足重复值和
  reset 身份问题：
  https://github.com/mantinedev/mantine/blob/9.0.0/apps/mantine.dev/src/pages/form/use-form.mdx
- Svelte 官方要求 keyed each 使用唯一稳定 key，字符串/数字优先；`animate:` 只处理 keyed item 重排：
  https://github.com/sveltejs/svelte/blob/main/documentation/docs/03-template-syntax/03-each.md
  https://github.com/sveltejs/svelte/blob/main/documentation/docs/03-template-syntax/16-animate.md

这四个先例只用于确认稳定 key、数组操作、完整路径和 baseline 责任。ZUI 特有的 row-id 到 typed path、
registry state、三层 errors、dependency edge 与 validation epoch 的原子迁移，以本合同为唯一实施边界。

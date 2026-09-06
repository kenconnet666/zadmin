# N3 Segmented / RadioGroup / ToggleGroup migration note — 2026-09-06

本记录只审查现有实现和成熟 API，不修改源码。

## 现有事实

### ZSegmented

`ui/zui/src/components/input/ZSegmented.svelte` 当前已经使用：

- `LogicalCollection<SelectionKey, ZSegmentedOption>`
- `MountedElements<SelectionKey, HTMLButtonElement>`
- `CollectionNavigation`，传入 Provider direction、orientation、loop、disabled
- `SelectionModel`，single selection
- 原生 `button`，但公开为 `role="radiogroup"`，每项为 `role="radio"` + `aria-checked`
- `FormValueBridge`、`name`、required、readonly、invalid、Field owner 和五档 size

它不是旧 `CollectionStore`/`RovingFocus` 的消费者。当前重复点主要是 collection/navigation/selection wiring 和焦点事件接线，不是完整的旧实现。

### ZRadioGroup

`ui/zui/src/components/compound/radio-group/ZRadioGroup.svelte` 当前已经使用：

- `LogicalCollection`、`CompoundLogicalCollectionRegistry`、`MountedElements`
- `CollectionNavigation`，同样传入 direction、orientation、loop、disabled
- `SelectionModel`，single selection
- 两种输入来源：`options` 或 compound `ZRadioGroupItem` children，不能同时提供
- `ZRadioGroupItem` 输出真实 `input[type=radio]`，保留 name、FormData、required、native checked 和 `aria-checked`

RadioGroup 与 Segmented 可以共享导航 adapter 和 selection 规则，但不能合并 DOM/ARIA 语义。Radio 是互斥表单选择；ToggleGroup 是按钮状态集合。

## 不能直接合并的语义

| 组件            | DOM/ARIA                                            | selection          | empty 行为                                                                         | 主题状态                                                                        |
| --------------- | --------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| RadioGroup      | `radiogroup` + native radio / `aria-checked`        | 单选               | 是否允许空值由 required/业务表单合同决定                                           | checked、disabled、invalid、readonly、Field 状态                                |
| 当前 ZSegmented | `radiogroup` + button role radio / `aria-checked`   | 单选               | 当前 value 可为空，由 FormValueBridge/调用方合同决定                               | selected、invalid、readonly、五档 control size                                  |
| ToggleGroup     | toolbar/普通 composite 中的 button + `aria-pressed` | single 或 multiple | 必须明确；Radix single 实现可 deactivate 为空字符串，Bits 官方文档展示受控空字符串 | pressed/on、disabled、focus、Toolbar surface；不自动继承 Radio invalid/required |

因此 N3 不应把 `aria-checked` 改成 `aria-pressed` 来“统一视觉组件”。如果 ZSegmented 继续表示单选字段，保留 radio 语义；如果未来要表达多个独立开关，新增 ToggleGroup 或组合 Toolbar.Group。

## 可直接复用和可删除的范围

1. 复用 `runtime/collection/list-navigation.ts` 的 `navigationIntent`/`moveIndex`，避免 Toolbar、Segmented、RadioGroup 各写 Arrow/Home/End/RTL 分支。
2. 复用 `CollectionNavigation` 的 active key、disabled 跳过、orientation、loop 和 Provider direction。
3. 复用 `MountedElements` 的注册/清理合同；不要把 `HTMLElement` 放回 logical item，也不要用 DOM 查询推断集合顺序。
4. 复用 `SelectionModel` 的单选/multiple/empty 规则，但由每个组件提供不同的 DOM/表单适配。
5. 不删除 `ZRadioGroup` 的 `CompoundLogicalCollectionRegistry`：它承担 children 模式和 item 生命周期；`ZSegmented` 的 `options` 模式可以保持轻量。
6. 不新增 `RovingFocus` 分支给 ToggleGroup；N3 adapter 应包装现有 `CollectionNavigation`，全部真实消费者迁移后再删除旧 `RovingFocus`/旧 store。
7. 若 adapter 稳定，删除 Segmented 与 RadioGroup 中仅负责把相同 navigation 配置接到 item 的重复 helper；保留各自 selection/Form/ARIA/DOM 代码。

## N3 ToggleGroup 合同

建议先交付 `ZToggleGroup`，再把 Toolbar 作为其组合宿主：

- `type: 'single' | 'multiple'`
- `value/defaultValue` 与 `onValueChange`
- `orientation: 'horizontal' | 'vertical'`、`loop`、disabled item
- single 的空值策略显式记录为 `allowEmpty` 或固定允许空值；不能从 RadioGroup 的 required 语义推断
- item 是真实 button，使用 `aria-pressed="true|false"`，状态可用 `data-state="on|off"`
- active focus 与 selected values 分离；pointer move 不夺焦点，activation 才改变 value
- `Home`/`End`、相关方向键、RTL 映射和 `loop=false` 全部交给共享 navigation adapter
- Toolbar 内可有多个独立 group；普通 Button、Menu trigger、Link 不是 ToggleGroup item，也不应嵌套 button

Radix 的官方实现确认 Toggle 的状态通过 `aria-pressed` 表达，ToggleGroup single/multiple 使用 `value/defaultValue/onValueChange`；single 实现可在 deactivate 时清为空字符串。[Radix Toggle source](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle/src/toggle.tsx)、[Radix ToggleGroup source](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle-group/src/toggle-group.tsx)

Bits UI 官方 Toolbar.Group 采用 `type="single" | "multiple"`、字符串/字符串数组 value、`onValueChange`，Toolbar.GroupItem 以 value 注册，Toolbar.Button 与 toggle group 并列组合；官方资料没有提供应当替代 ZUI required RadioGroup 的语义。[Bits Toolbar](https://www.bits-ui.com/docs/components/toolbar)、[Bits ToggleGroup](https://www.bits-ui.com/docs/components/toggle-group)

Radix RovingFocus 的官方行为确认 orientation 过滤无关方向键，Home/End 移动首尾，loop 控制是否环绕，RTL 交换水平左右方向。[Radix RovingFocus source](https://github.com/radix-ui/primitives/blob/main/packages/react/roving-focus/src/roving-focus-group.tsx)

## Toolbar 组合边界

- Toolbar root 负责一个 composite Tab stop和方向键移动；它不拥有业务 selected value。
- `Toolbar.Group`/`ZToggleGroup` 各自拥有 selection；多个 group 之间用 Separator 或普通非聚焦结构分隔。
- 嵌套 Toolbar 的键盘边界必须显式定义：父 Toolbar 不应把子 Toolbar 的按钮重复登记为同一 roving 集合；子 Toolbar 作为一个可进入的 composite branch。
- Toolbar 的 `size` 复用 `controlSizeStyles` 五档；Toolbar surface、Toggle pressed、Radio checked、invalid/danger 是独立 theme 状态，不把 tone/selected 互相映射。
- reduced motion 只影响 indicator/overflow/presence；焦点、pressed、checked 立即更新。

## 阶段验收

- 先补 migration table：列出 Segmented/RadioGroup 当前 props、ARIA、form/reset、empty、disabled、readonly 和 event 来源，标明可共享代码与必须分离代码。
- 用三个最小消费者验证 adapter：现有 Segmented、options RadioGroup、compound RadioGroupItem；再加 ToggleGroup single/multiple。
- 覆盖 single empty、multiple clear、disabled item、loop false、Home/End、RTL、nested Toolbar、SSR 无 DOM、ShadowRoot/iframe owner document。
- 完成后再决定是否将 `ZSegmented` 改名为视觉便利入口或保留现名；不能在实现阶段隐式改变 radio/pressed 语义。

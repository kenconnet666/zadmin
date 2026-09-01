# ZUI Logical Collection Architecture

- 状态：Accepted for R4 implementation
- 范围：浏览器 / SvelteKit / WebView ZUI，不适用于 Miniapp 运行时
- 第一实现消费者：`ZCommand`

## 1. 决策

Collection 组件统一拆为五个正交层次：

```text
LogicalCollection (完整业务项、稳定 key、source order)
  └─ CollectionView (过滤、排序、分组、树展开后的有序视图)
       ├─ CollectionNavigation (active key 与方向导航)
       ├─ SelectionModel (selected keys、anchor、range、all)
       ├─ ActiveDescendant (容器焦点与 option DOM id)
       └─ RovingFocus adapter (后续批次，真实 item 焦点)

MountedElements (当前真实 DOM；不拥有业务项)
KeyedVirtualizer (窗口、测量、scroll；不拥有 active/selection)
```

禁止继续让逻辑 item 包含 `HTMLElement`，也禁止从已挂载 DOM 推断 data-backed
collection 的完整项目或业务顺序。

这一决策吸收成熟项目经过生产验证的职责边界，但不移植 React hook、通用状态机或
框架专属渲染缓存：

- React Aria/Stately：稳定 key、不可变 CollectionView、Selection 与 Focus 分离；
- Ariakit：registered items 与 rendered items 分离、roving 与 virtual focus 分离；
- Ark/Zag：adapter 驱动的 list/tree traversal；
- Naive UI：pending option、virtual scroll-to-key、remote selected-value label cache。

不采用：React JSX CollectionBuilder、完整 SelectionManager/DnD/LayoutDelegate、Ariakit
通用 store 同步、Zag component machine、Naive UI 每组件单独维护的大型 ref 图。

## 2. Key 合同

公共业务 key 继续使用：

```ts
type SelectionKey = string | number;
```

必须满足：

1. 同一完整集合中唯一且在项目生命周期内不可变；
2. number 必须 finite，并拒绝 `-0`，消除 Map/Set 与 `Object.is` 的不一致；
3. 字符串 `"1"` 与数字 `1` 是不同 key；
4. 业务 key 不直接拼进 DOM id；ActiveDescendant 为每个 typed key 分配 opaque slot；
5. 不以数组 index 作为业务 key；排序、过滤、分页和虚拟窗口不能改变 key。

Duplicate、invalid number、unknown view key 在 normalization 阶段立即抛错。

## 3. LogicalCollection 与 CollectionView

第一阶段接口：

```ts
interface LogicalCollectionItem<TKey, TValue> {
	readonly key: TKey;
	readonly value: TValue;
	readonly textValue: string;
	readonly disabled: boolean;
	readonly selectionDisabled: boolean;
	readonly groupKey: string | undefined;
}

interface LogicalCollectionAdapter<TValue, TKey> {
	key(value: TValue): TKey;
	textValue(value: TValue): string;
	disabled?(value: TValue): boolean;
	selectionDisabled?(value: TValue): boolean;
	groupKey?(value: TValue): string | undefined;
}

class LogicalCollection<TKey, TValue> {
	readonly full: LogicalCollectionView<TKey, TValue>;
	get(key: TKey): LogicalCollectionItem<TKey, TValue> | undefined;
	view(options: {
		keys?: readonly TKey[];
		include?: (item: LogicalCollectionItem<TKey, TValue>) => boolean;
	}): LogicalCollectionView<TKey, TValue>;
}
```

`full` 永远保持输入 source order。查询、相关性排序、权限过滤和树展开只生成 view；
selection 可以继续针对 full 工作。Group 本身不进入 focus/selection key 序列，空 group 不渲染。

后续 compound 组件支持两种互斥来源：

- `data`：Root 的 `items/options/nodes` 是 authoritative source，Item 只登记 DOM；
- `compound`：Item 注册逻辑 metadata，MountedElements 只在非虚拟模式校正 DOM 顺序。

传 data source 又同时声明 Item，开发环境抛错。没有 data source 的 compound collection 不允许
开启 virtualization，因为未挂载项无法被发现。

## 4. MountedElements

MountedElements 是 key 到当前 DOM element/id 的响应式注册表：

```ts
class MountedElements<TKey, TElement extends HTMLElement = HTMLElement> {
	mount(key: TKey, element: TElement, id: string): () => void;
	get(key: TKey): MountedElementRecord<TKey, TElement> | undefined;
	focus(key: TKey, options?: FocusOptions): boolean;
	order(keys: readonly TKey[]): readonly TKey[];
	clear(): void;
}
```

每次 mount 有独立 token；旧 ref 的 cleanup 不得删除后来替换的新 element。跨 document、
disconnected、Portal 无法比较时保持 logical order。此层不保存 disabled、textValue、selection
或虚拟范围。

## 5. Navigation 与焦点策略

CollectionNavigation 只决定 active key：

```ts
class CollectionNavigation<TKey, TValue> {
	readonly currentKey: TKey | undefined;
	set(key: TKey | undefined, reason: NavigationReason): boolean;
	move(intent: 'first' | 'last' | 'next' | 'previous'): TKey | undefined;
	handleKey(event: KeyboardEvent): boolean;
	reconcile(): TKey | undefined;
}
```

规则：

- disabled item 跳过，selectionDisabled item 仍可导航；
- active 与 selected 永远独立，只有 Tabs 等明确配置 selection-follows-focus；
- `currentKey` 只返回真实且仍有效的 active，未设置时返回 `undefined`；Root 在初始渲染显式
  `reconcile()` 写入第一候选，因此 `move(next)` 从未设置状态只会落到 first，不会越过它；
- view 改变时 active 若仍可导航则保持；否则按旧顺序选择后继，再选择前驱，最后才选择新
  view 第一项；
- query 输入可显式清 active，让新 view 从第一项开始；普通动态 items 更新使用 nearest；
- `event.isComposing` 或 legacy `keyCode === 229` 时不接管 Arrow/Home/End/Enter；
- vertical Home/End/Up/Down 不受 RTL 影响；Tree/Cascader 的 expand/collapse 水平键在后续树层
  根据 direction 交换。

焦点策略：

- Command、Combobox、Mention 与虚拟 listbox/tree 使用容器 DOM focus + ActiveDescendant；
- RadioGroup、Segmented 等非虚拟 composite 组合 CollectionNavigation 与 MountedElements，
  由真实 native radio/button 承担 roving DOM focus；Menu、Tabs 后续迁移到同一适配方式；
- pointer move 只改 active，不选择且不夺取输入焦点；press 才触发 selection/action。

## 6. ActiveDescendant

ActiveDescendant 组合 Navigation、MountedElements 和未来 VirtualMountBridge：

```ts
interface VirtualMountBridge<TKey> {
	isRendered(key: TKey): boolean;
	ensureKey(key: TKey, align?: VirtualAlign): void;
	scrollToKey(key: TKey, align?: VirtualAlign): void;
}

class ActiveDescendant<TKey, TValue> {
	readonly activeKey: TKey | undefined;
	readonly activeId: string | undefined;
	idFor(key: TKey): string;
	mount(key: TKey, element: HTMLElement): () => void;
	prune(keys: readonly TKey[]): void;
	set(key: TKey | undefined, reason: NavigationReason): boolean;
	handleKey(event: KeyboardEvent): boolean;
	reconcile(): TKey | undefined;
}
```

`aria-activedescendant` 只在 active key 已由 MountedElements 登记真实节点时设置，option 必须
使用同一 `idFor(key)`。active key 已决定但虚拟 target 尚未挂载的短暂阶段不暴露悬空 id；
mount 后注册表更新会再暴露。SSR 因没有 mounted DOM 不输出 `aria-activedescendant`，但 option
opaque id 本身仍按 logical order 确定；hydration mount 后建立引用。ID base 改变时 slot 保持、
最终 id 随 base 更新。

## 7. SelectionModel

SelectionModel 读取和写入外部状态，不重新实现 ControlledState：

```ts
type Selection<TKey> = 'all' | ReadonlySet<TKey>;

class SelectionModel<TKey, TValue> {
	readonly anchorKey: TKey | undefined;
	readonly currentKey: TKey | undefined;
	isSelected(key: TKey): boolean;
	canSelect(key: TKey): boolean;
	replace(key: TKey): boolean;
	toggle(key: TKey): boolean;
	extend(to: TKey): boolean;
	selectAll(): boolean;
	clear(): boolean;
	reconcile(): boolean;
	resetTransient(): void;
}
```

规则：

- controlled selection 不由 runtime 私自裁剪；
- async/分页默认保留当前未加载 key；
- 只有 owner 声明 collection complete 且 orphan policy 为 `prune-when-complete` 时，无控模型
  才裁剪真正删除的 key；
- `all` 默认针对 full；Transfer 的 Ctrl+A 显式针对当前 view；
- range 按 view 顺序并跳过 disabled/selectionDisabled；
- disallowEmpty 在 toggle/clear 时统一生效；
- form reset 由组件先调用 `ControllableState.reset()`，再调用 `resetTransient()`，不触发用户
  change callback。

## 8. Async 和树边界

Async 状态不伪装成 disabled item：

```ts
type CollectionLoadPhase = 'idle' | 'loading' | 'filtering' | 'loading-more' | 'error';

interface CollectionAsyncState<TKey> {
	readonly phase: CollectionLoadPhase;
	readonly hasMore?: boolean;
	readonly loadingKeys?: ReadonlySet<TKey>;
	readonly errorKeys?: ReadonlyMap<TKey, unknown>;
}
```

Flat collection 的网络和数据归调用方，ZUI 只发 `onLoadMore/onRetry`。请求 coordinator 在新
query、节点删除或 Root destroy 时 abort，并用 generation 忽略旧 Promise。Loading-more 保留
现有 view；remote selected key 即使当前搜索结果没有也保留。

后续 LogicalTree 在 LogicalCollection 之上增加 parent/children/flatten，不另建第二套 key、
selection 或 navigation：

- disabled node 只禁用自身，不隐式禁用 descendants；
- missing parent 和 cycle 在 normalization 报错；
- collapse active descendant 时 active 回到被折叠 branch；
- lazy branch 在 loading/error 时仍可聚焦；同一 key 的 load action 去重；
- TreeSelect Root 与内部 ZTree 共享同一 tree collection；
- Cascader columns 由 `childrenOf(parentKey)` 产生，不维护字符串 DOM map。

## 9. Virtual handshake 与 SSR

R4 后续固定握手：

```text
Navigation 选择 target key
→ ActiveDescendant/roving adapter 调用 virtualizer.ensureKey(target)
→ 同一响应事务的新 range 包含 target
→ Item mount 到 MountedElements
→ active-descendant 暴露 id，或 roving adapter 完成真实 focus
```

KeyedVirtualizer 按 key 保存测量，提供 `scrollToKey/index`，数据或尺寸更新前保存首个可见 key
和项内偏移以恢复 scroll anchor。它不拥有 active 或 selection。

SSR 规则：

- LogicalCollection、Navigation、Selection 不读取 DOM/global；
- SSR range 只使用显式 height/ssrViewportSize 与 estimate；
- ResizeObserver 从 `element.ownerDocument.defaultView` 获取；
- hydration 前保持 SSR range，真实测量在 hydration 完成后提交；
- form reset 不自动清 async cache，也不强制移动当前 DOM focus。

## 10. 迁移与删除顺序

1. P1：新增五个内部 runtime，迁移 ZCommand，保持公共 props 和行为；
2. P2：KeyedVirtualizer + ZVirtualList；
3. P3：Combobox、Select、MultiSelect、RadioGroup、Segmented、Menu；
4. P4：Mention、Transfer；
5. P5：LogicalTree、Tree、TreeSelect、Cascader；
6. P6：DataTable；
7. 全部消费者迁移后删除旧 CollectionStore/RovingFocus/createTreeIndex 实现。

保留 `list-navigation.ts` 的纯方向/index helper 给 DateField、TimeField。Typeahead
继续独立，但最终只消费纯 logical item。现有 fixed virtual range 函数保留为 fixed layout，
不与 keyed controller 混在一个状态所有者中。

P1 新 runtime 暂不从主入口或 `@zadmin/zui/runtime` 导出；至少两个真实消费者验证后再冻结
公共合同。

### Mention suggestion projection

`ZMention` keeps the native textarea as the only DOM focus owner and projects the current caret
query into a `LogicalCollectionView`. `CollectionNavigation`, `MountedElements` and
`ActiveDescendant` own suggestion movement and opaque typed-key IDs; async loading only replaces the
owner-provided `items`, and fixed-row virtualization reuses the P2 mount handshake. Custom item
snippets render content only, so they cannot replace option semantics or keyboard ownership. Request
debounce, cancellation and cache remain application concerns exposed through `onSearchChange`.

### TagsInput text-value boundary

`ZTagsInput` deliberately remains string-only because every value is created or edited as text and
passes through delimiters, transform and validation. Typed option selection remains a MultiSelect
responsibility. The tag array projects into a small `LogicalCollection` keyed by current order for
keyboard navigation; these numeric keys are internal positions, not public business identity. This is
also why duplicate textual tags can remain independently removable without inventing opaque public
IDs. Visible tags reuse `ZTag`, while `FormValueBridge` owns repeated successful values and the draft
input never participates in FormData.

## 11. P5 LogicalTree implementation record

R4 P5 implements `LogicalTree` as an immutable hierarchy adapter over `LogicalCollection` rather
than a parallel collection runtime. The public flat `nodes + parentKey` input remains because it is
stable for databases, async patches and WebView IPC; the normalized model owns typed-key validation,
parent/children lookup, source order, cycle detection, paths and visible flattening. Each visible
entry carries `level`, `posInSet`, `setSize`, actual `childCount` and `hasChildren` for unloaded
branches.

The production focus contract is one container tab stop plus `aria-activedescendant` in both regular
and virtual trees. `MountedElements` only records current `treeitem` wrappers. Virtual mode delegates
windowing, keyed measurement and `ensureKey` to P2 `ZVirtualList`; a target ID is exposed only after
that wrapper mounts. Collapse moves an active descendant back to the collapsed branch, while ordinary
node deletion uses `CollectionNavigation.reconcile()` successor-then-predecessor nearest recovery.

Expansion, selection, loading and rendering remain separate owners:

- expansion is a controlled/uncontrolled key array;
- `SelectionModel` provides none/single/multiple, strict checkbox visuals, range and select-all while
  respecting `disabled` and `selectionDisabled`;
- lazy `hasChildren` requests are deduplicated per key, receive an `AbortSignal`, abort on node removal
  or destroy, retain focusability during loading/error and retry from the switcher or logical expand
  key; callers remain responsible for updating `nodes` and caching data;
- typed item snippets render content only and cannot replace the `treeitem`, ID, hierarchy ARIA or
  focus owner;
- `ZTreeSelect` composes `ZPopover + ZTree + FormValueBridge`; it owns only value/open/Field/form
  integration and does not create another tree traversal, navigation or selection state machine.

This stage deliberately adopts APG keyboard semantics, React Aria's focus/selection separation and
async collection ownership, MUI X's flat virtual tree structure, Ant's typed-key/lazy/scroll-to-key
product surface and Naive UI's explicit loading-key behavior. It does not adopt framework-specific
hooks, cache stores or component machines.

Half-check propagation and drag-and-drop are deferred. A fake indeterminate state would be worse than
the current explicit strict checkbox contract, and production DnD requires a separate keyboard and
screen-reader interaction design, drop validation, announcements and cross-tree ownership. Neither is
required to keep core selection, expansion, lazy loading or virtualization production-usable.

### Cascader column projection

`ZCascader` now consumes the same `LogicalTree` but does not reuse Tree's flattened visible view.
Each visible column is a `childrenOf(parentKey)` projection with an independent
`LogicalCollectionView`, `CollectionNavigation`, `MountedElements`, `ActiveDescendant` and locale
typeahead owner. The root owns only the complete typed path, Popover, loaded-path filter, lazy request
registry and `FormValueBridge`. This keeps number `1` distinct from string `"1"`, prevents disabled
ancestors from being bypassed by search, and removes the former string-keyed DOM map.

Fixed-row virtual columns use the same P2 handshake as Select and Transfer. Loaded-path search is
deliberately local: it indexes complete leaves currently present in `nodes`, and async/remote search
remains a data-owner concern. Lazy `hasChildren` requests are abortable and retryable, but the caller
still updates and caches flat nodes. ZUI retains one leaf path rather than copying Ant's multiple
cascade/half-check surface; MUI has no Cascader, so a generic Select is not stretched into a hidden
hierarchical state machine.

## 12. Primary references

- [WAI-ARIA APG Tree View pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [React Spectrum TreeView](https://react-spectrum.adobe.com/TreeView)
- [MUI X Rich Tree View virtualization](https://mui.com/x/react-tree-view/rich-tree-view/virtualization/)
- [MUI X Rich Tree View lazy loading](https://mui.com/x/react-tree-view/rich-tree-view/lazy-loading/)
- [Ant Design Tree](https://ant.design/components/tree/)
- [Ant Design Cascader](https://ant.design/components/cascader/)
- [React Spectrum collection model](https://react-spectrum.adobe.com/v3/collections.html)
- [React Spectrum selection model](https://react-spectrum.adobe.com/v3/selection.html)
- [React Aria Collection interface source](https://github.com/adobe/react-spectrum/blob/main/packages/%40react-types/shared/src/collections.d.ts)
- [Ariakit Collection Store source](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-components/src/collection/collection-store.ts)
- [Ark UI List Collection](https://ark-ui.com/docs/collections/list-collection)
- [Zag ListCollection source](https://github.com/chakra-ui/zag/blob/main/packages/utilities/collection/src/list-collection.ts)
- [Naive UI Select source](https://github.com/tusen-ai/naive-ui/blob/main/src/select/src/Select.tsx)
- [Naive UI SelectMenu pending/virtual source](https://github.com/tusen-ai/naive-ui/blob/main/src/_internal/select-menu/src/SelectMenu.tsx)
- [Naive UI Tree source](https://github.com/tusen-ai/naive-ui/blob/main/src/tree/src/Tree.tsx)

# W4 下一短阶段：Transfer 移动事务（E19）

核查日期：2026-09-07。本文只确定 E18 `ZSortable × ZFormList` 之后的一个短、可构建阶段，不改写 W4 总路线，也不把当前工作树中的组件或测试资产存在视为远程验收通过。

## 结论

E19 先把 `ZTransfer` 现有的双栏移动改成一个 **Transfer 专用、可接受/拒绝/取消/过期的移动事务**。现有中间按钮必须先消费这条事务；跨栏 pointer/touch 拖放在事务合同通过后接入。当前阶段不直接修改 `ZTree` 或 `ZDataTable`，也不把 `ZSortable` 嵌套进两个 pane 形成三份业务数组。

这个顺序有具体源码依据：

- `ZTransfer` 已由一个 `LogicalCollection` 派生 source/target 两个 view；唯一 canonical 值仍是目标侧的有序 `value`。`sourceChecked`、`targetChecked`、两侧 active key 和 query 都只是临时 UI 状态。
- 当前 `move(to)` 已集中处理 disabled item、loaded key 的 `items` 顺序、未加载 orphan key 的保留和接受后的临时勾选清理。它是最小的事务提取点，不需要先发明新的集合 owner。
- `ZSortable` 已证明 `ReorderRequest` 快照、`AbortSignal`、`accepted/rejected/cancelled/stale/error` 终态、外部 owner 回声核对和最终公告；Transfer 可以共享来源与终态词汇，但不能复用单容器 reorder 请求冒充跨栏 membership 变化。
- `ZTree` 的下一步必须另外回答 `before/after/inside`、不能放进自身后代、折叠/未加载目标、selected/expanded/active 独立状态和 lazy 请求取消。把这些规则塞进 Transfer 会得到错误的“统一 owner”。
- `ZDataTable` 的行重排还必须先区分 client/server sort、当前过滤/分页 view 与完整数据顺序，并处理虚拟 spacer、expanded row、sticky cell 和原生 `table/tbody/tr` 结构。它不是 E19 的短改。

## 现有所有权边界必须保留

| 能力                             | 当前 owner                                                         | E19 处理                                                          |
| -------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Transfer 全量 item 与 key 顺序   | `items` 调用方                                                     | 只读快照；不复制为内部数组                                        |
| 目标栏成员与 FormData            | `value/defaultValue/onValueChange` 与唯一 `FormValueBridge`        | immediate 模式保持现状；request 模式由外部 value owner 接受并回写 |
| 两栏临时勾选                     | 两个 `SelectionModel` 及 `sourceChecked/targetChecked`             | pending/reject 时保留；accepted 后才清理来源侧勾选                |
| active descendant / filter query | 各 pane 的 `CollectionNavigation`、`ActiveDescendant`、`Typeahead` | 不并入 move request，不因等待响应建立第二份选择模型               |
| 远程数据请求                     | `AsyncCollectionQuery` 的 loader、generation 与 AbortSignal        | 不复用。它只拥有数据请求生命周期，不拥有 membership mutation      |
| 单容器 reorder                   | `createReorderRequest/applyReorderRequest`                         | 不用于跨栏移动；只共享 mutation source/result 字面量              |
| FormList 数组 identity           | `FormArrayController` 与稳定 row id                                | 不进入 Transfer；两者只在最终 request 生命周期与公告行为上同族    |

`SelectionModel` 继续只计算 selection policy。不要给它增加 Promise、AbortSignal、业务数组写入或拖放 session。`AsyncCollectionQuery` 继续只管理 latest-wins 数据加载；不要用 query 的 `data` 字段暂存 Transfer 候选 value。

## 冻结的公开形状

为了让旧 `ZTransfer` 保持直接可用，同时让异步业务明确选择 owner，Props 应使用判别分支：

```ts
export type TransferMoveSource = CollectionMutationSource;
export type TransferMoveResult = CollectionMutationResult;

export interface TransferMoveRequest {
	readonly destination: 'source' | 'target';
	readonly movingKeys: readonly SelectionKey[];
	readonly value: readonly SelectionKey[];
	readonly nextValue: readonly SelectionKey[];
	readonly source: TransferMoveSource;
	readonly signal: AbortSignal;
}

export interface TransferMoveEnd {
	readonly request: TransferMoveRequest;
	readonly result: TransferMoveResult;
	readonly error?: unknown;
}

type TransferImmediateMove = {
	readonly moveMode?: 'immediate';
	readonly onMoveRequest?: never;
};

type TransferRequestedMove = {
	readonly moveMode: 'request';
	readonly onMoveRequest: (request: TransferMoveRequest) => boolean | Promise<boolean>;
};
```

`ZTransferProps` 是现有 shared props 与这两个分支的联合，并增加两支都可用的 `onMoveEnd?: (detail: TransferMoveEnd) => void`。不要用 `onMoveRequest?` 加隐式运行时猜测，也不要让 `onValueChange` 和 request callback 同时竞争同一次业务写入。

- `immediate` 是兼容默认值：中间按钮通过已有 `valueState.setFromUser(nextValue)` 写一次并调用 `onValueChange`。
- `request` 明确把接受权交给外部 owner：`onMoveRequest` 返回 true 还不等于完成；只有外部 `value` 与 `request.nextValue` 精确同序回声一致才是 accepted。该分支不由组件再写第二次 canonical value。
- request callback 返回 false 是 rejected；抛错是 error；卸载、disabled/readonly、`items`/`value` 快照变化或新请求开始时 abort，并按原因记录 cancelled 或 stale。
- pending 期间不再发第二个请求。筛选与查看可以保留；勾选、移动按钮和未来拖放写入暂时禁用。
- accepted 才清除实际来源 pane 的 checked keys，并把焦点恢复到同 key 的新 pane 项；若该项未挂载或已成为 orphan，回退到目标 pane listbox。rejected/error 保持原 pane、勾选和焦点。

`CollectionMutationSource = 'action' | 'keyboard' | 'pointer'` 与 `CollectionMutationResult = 'accepted' | 'rejected' | 'cancelled' | 'stale' | 'error'` 是 E18/E19 已出现的真正公共事实。现有 `ReorderSource`、`SortableMoveResult` 保留为兼容 type alias。除此之外不提取 `UniversalMoveOwner`、通用 `nextItems | nextValue` 联合或任意 container graph。

## 具体文件改动

### 必改源码

1. 新增 `ui/zui/src/runtime/collection/mutation.ts`
   - 只导出共享 source/result 类型和窄校验函数。
   - `runtime/collection/reorder.ts` 与 `runtime/drag-drop/types.ts` 改为别名/导入，保持现有公开 Sortable 类型名称。
2. 新增 `ui/zui/src/runtime/collection/transfer.ts`
   - `createTransferMoveCandidate({ items, value, movingKeys, destination })` 返回冻结的 `movingKeys/value/nextValue`。
   - 精确保留当前规则：loaded keys 按 `items` 顺序，orphan keys 按原 value 顺序；disabled/missing key 不因一次请求被偷偷加入或移除。
   - `matchesTransferSnapshot(currentItems, currentValue, request)` 只判断 Transfer 自己的 key/value 快照；不读取 DOM、selection 或 Form registry。
3. 修改 `ui/zui/src/components/input/ZTransfer.svelte`
   - 删除内联 `move(to)` 中的 next-value 拼装，改为唯一 `requestTransferMove(destination, source)`。
   - immediate/request 两条路径共用 candidate、pending、abort、终态、焦点与公告收尾。
   - 根增加 `data-state="idle|pending"` 和真实 `aria-busy`；disabled/readonly 仍保留各自现有语义。
4. 最小修改 `ui/zui/src/components/input/TransferPane.svelte`
   - 只接收 pending gate 和必要的 focus controller；不把 pane 提升成新的 value owner。
   - 行、checkbox、filter、虚拟列表结构保持一份，不复制一个“draggable pane”。
5. locale 的 Transfer namespace 增加 pending、accepted、rejected、cancelled、error 公告函数。
   - 公告由 Transfer 最终结果产生；不能先报“已移动”再因 owner 拒绝补一句失败。

### 样式、主题和动画

- 不新增 Transfer 专用 raw 色、字号、间距或时长。面板/输入/按钮继续使用 `resolvedSize` 与现有 Theme token。
- pending 使用现有 Button disabled、`ZSpinner` 和 surface/disabled 状态层级；不新增整栏 opacity 规则导致 readonly 与 pending 混淆。
- E19 没有 layout reorder 动画。不要为了“看起来像拖放”先加入 CSS transform 或 ghost。E19B 接 pointer/touch 后复用 `runtime/drag-drop/layout-motion.ts`、`ReducedMotionState`、class-only plugins、nonce 和最终公告。
- RTL 继续只翻转 source/target 的视觉方向与图标；`destination` 使用逻辑名称，不在 RTL 交换业务含义。

### Docs 与资产

- `apps/docs/src/content/components/input/transfer/` 增加一个 request-owner Demo：异步接受、明确拒绝、pending 时 external value/items 变化导致 stale，输出唯一 canonical value/FormData。
- pure runtime 资产覆盖 loaded/orphan/disabled/typed key、快照变化和冻结结果。
- browser 资产覆盖 immediate 兼容、request accept/reject/error/cancel/stale、勾选保留/清理、焦点恢复、FormData/reset、readonly/disabled、五尺寸、RTL 和虚拟 pane。
- SSR 只呈现 idle 双栏；没有用户请求时不构造 AbortController、不输出 pending live message。
- types 资产覆盖 immediate/request 判别、request 回调必填与互斥、typed `SelectionKey`、终态 detail。

## E19 明确删减和延期

- 不在 E19 提供跨 pane pointer/touch 拖放。先让中间按钮真实走同一事务，远程验证接受/拒绝/取消后，E19B 再把 drop 转换成同一个 `requestTransferMove`。
- 不把 `ZSortable` 包住 source/target pane。它的 `nextItems` 是单容器 reorder；Transfer 的 canonical 是 target membership，两者不能互换。
- 不新增 `sourceItems`、`targetItems` 两个 bindable 数组；它们始终由 `items + value` 派生。
- 不把临时 checked keys 写入 FormData，也不在 request 中携带 `SelectionModel` 实例。
- 不在 Transfer 中加入 remote cache、分页或 server request。未来 remote pane 继续消费 `AsyncCollectionQuery`，但数据 owner 与 move owner 分开。
- 不顺手加入 Tree `checkStrategy`、Tree drag、DataTable row/column reorder 或 ProTable query。它们分别进入后续阶段。

## 退出条件

E19 只有同时满足以下条件才可结束：

1. 旧 immediate 按钮行为、typed key 顺序、orphan、FormData 和 reset 不退化。
2. request accept 只在外部 value 精确回声后 accepted；false/error/stale/cancel 都不改变 canonical value。
3. accepted/rejected 后 checked、active、focus 和 live announcement 与结果一致；pending 中没有第二次提交。
4. readonly、disabled、reset、外部 items/value 更新和卸载会终止请求并释放 AbortController。
5. 五档尺寸、六主题、RTL、reduced motion 和 CSP nonce 没有新增局部实现或 raw 样式。
6. 专项 pure/SSR/types/browser/Docs 资产已写；当前 revision 的远程执行证据仍由 execution composer 判断，资产存在本身不写成 Verified。

E19B 随后只做 Transfer 的跨栏 pointer/touch/keyboard drop adapter，并复用 E19 事务。该消费者通过后再冻结 Tree 的层级 drop request；DataTable row reorder 等 server sort 与虚拟 table 顺序合同确定后进入 W5 接缝阶段。

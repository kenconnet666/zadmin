# E9 Form model 与数组基础执行记录

日期：2026-09-07。本阶段只交付独立 runtime 数学，不接入 ZForm、FormRegistry、DOM control adapter 或 validation epoch。

## FormModel

`FormModel<T>` 保存 immutable current snapshot 与 default baseline。支持 plain object、array 和 primitive 的递归复制/冻结；Date、File、Blob 等 opaque 对象保持引用，不做 JSON 序列化。FieldPath 直接复用现有 normalize/key/string 工具，含点字符串仍是一个标量 segment，numeric segment 保持数组含义；prototype 特殊路径被拒绝。

`setField`、`setFields` 和 `setValues` 都生成不可变的新快照。批量字段写入只发布一次 detail，changedPaths 去重，reason 限定为 user、controller、array。dirty 永远由 current 与 baseline 深比较；改回 baseline 自动恢复 false。initialize 同时重建 current/baseline，reset 与 resetField 回 baseline，这些操作以及 syncExternal 都不伪造成 onValuesChange。

受控模式通过 read/write 与 owner 同步。公开 values 始终读取 owner；owner 拒绝 write 时不会暴露乐观 current。getter 会深读受控树并与上次冻结快照比较：同值时保持快照引用稳定，普通同引用可变对象或 Svelte deep-state proxy 原位改变时生成新快照，同时让 Svelte 收集深层依赖。路径订阅同时识别祖先和后代交叉，只在订阅值实际变化时调用。

## FormArray

`FormArrayController` 只通过 FormModel 的 array reason 写值，提供 append、insert、remove、move、replace。公开 rows 为冻结的 id/index/path/value 快照。move 同步移动 id；无业务 key 时外部整体替换按位置保留 id，有 getRowKey 时按 key 调和并拒绝重复。

数组操作先计算候选 values、keys 和 ids，经过 key 校验且 model owner 接受后才提交 identity；重复 key、越界或受控 owner 拒绝不会污染已有 row id。

## Error layers

`FormErrorLayers` 仅承载 schema、server、manual 三层 immutable FormErrors。set/clear 支持整层或指定 FieldPath；merge 固定按 schema、server、manual 顺序合并并去重。模块不创建 validation ticket、epoch、异步状态或清错策略，这些继续由 ZForm 与 FormRegistry 拥有。

纯 runtime 与类型资产覆盖 baseline dirty、不可变路径、批量单通知、外部同步、受控拒绝、prototype 防护、祖先订阅、数组 move/remove/key 调和与拒绝回滚、错误分层顺序和冻结快照。本阶段没有宣称 native ZForm 已接入 model。

# 插件生命周期

## 状态

| 状态         | 含义                                 |
| ------------ | ------------------------------------ |
| `registered` | 已进入 Runtime，尚未启动             |
| `waiting`    | 必需 Injection 没有 active Provider  |
| `starting`   | 正在执行 `setup()`                   |
| `active`     | 返回值已经注册为 Provider            |
| `stopping`   | 正在撤销资源和贡献                   |
| `stopped`    | 已完成清理，可再次启动               |
| `failed`     | setup或dispose失败，错误保留在快照中 |

## Provider

Host Package 通过 `runtime.provide()` 注册静态 Provider。动态 Plugin 的 `setup()` 返回值自动以 Plugin ID注册 Provider。

同一个 ID 只能有一个 active Provider。Host 与 Plugin 冲突、两个 Plugin ID重复都会失败。

## 启动

1. 规范化 Plugin Definition、version和artifactRevision；
2. 由 Injection ID构建依赖图并拒绝必需依赖环；
3. 按拓扑顺序启动；
4. required Provider缺失时进入 waiting；
5. optional Provider缺失时注入 `undefined`；
6. 创建 `PluginScope` 和 AbortSignal；
7. 执行 `setup(context, dependencies, config)`；
8. 注册返回值并进入 active；
9. setup失败时清理已经注册的 Effect并进入 failed。

## 停止

停止 Provider前先反向拓扑停止所有 dependents。每个 Plugin：

1. 从 Provider容器撤销当前值；
2. 进入 stopping；
3. AbortSignal触发；
4. Effect按 LIFO顺序异步清理；
5. 清除 API、Scope和 waiting状态；
6. 成功进入 stopped，失败进入 failed。

## Revision reconcile

Artifact ID/version/content hash、Definition或配置变化都会触发 reconcile。变化 Provider 的 required 和 optional dependents 都会重新 setup并取得新对象；无关 Plugin 不停止。

`PluginSnapshot.revision` 是该记录被重启的次数，`artifactRevision` 是当前内容哈希。

## 事务式 Manager

PluginManager 在改变当前 Runtime 前先加载所有候选 Server Artifact。候选激活后如果任何 Plugin failed或waiting：

```text
停止候选
  → reconcile旧 App Definition
  → 恢复旧 Provider和dependents
  → 保持旧 artifacts为current
```

相同 ID/revision集合是 no-op，不会因为轮询重复重载。

## Client 生命周期

ClientPluginRuntime 先 import所有变化模块，再批量 dispose旧 Client Plugin并 activate新模块。新模块失败时，已激活候选被清理，旧模块重新 activate。

页面路径只能由一个 owner注册。Plugin disposer必须撤销它拥有的全部页面和 DOM资源。

## 进程边界

Node.js ESM模块记录不能真正卸载。ZAdmin 的卸载定义为释放 Scope、路由、页面、Provider和业务资源；新 revision使用带哈希的 URL导入。旧模块记录最终由进程重启清理。

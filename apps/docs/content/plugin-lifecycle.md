# 插件生命周期

## 身份与状态单位

三个概念不能混淆：

- Plugin ID：稳定业务身份，例如 `@zadmin/approval`。
- Artifact version：SemVer兼容身份。
- Generation ID：一次实际装载实例，包含内容 revision前缀和 UUID。

同一 Plugin ID在一个 Runtime中最多有一个 active generation，但失败释放的旧 generation可能以 `leaked`诊断记录存在。

## Artifact发现

开发态：

```text
plugins/*/dist
  → WorkspacePluginArtifactProvider
  → serverRevision/clientRevision变化
  → PluginManager串行reconcile
```

生产态：

```text
installed.json
  → InstalledPluginArtifactProvider
  → 选中的id/version/enabled
  → PluginManager串行reconcile
```

Workspace artifact覆盖同 ID的installed artifact，便于本地开发。

## 安装

`.zplugin`只允许普通文件和目录；安装前检查：

-路径穿越、绝对路径、Windows drive路径；
-文件数和解压后总字节上限；
-Manifest Protocol、trust、entry路径；
-entry文件存在；
-同 ID/version已有内容时 revision必须完全一致。

解压在数据目录下的 staging完成，然后原子 rename到版本目录。安装状态通过临时文件加 rename写入。

Admin对 install、enable、disable、activate和uninstall再包一层 Runtime事务：

```text
保存installed.json快照
  → 修改安装状态
  → scan + Runtime reconcile
  → 成功：保留新状态
  → 失败：恢复状态快照并reconcile旧集合
```

已解压但未激活的版本文件不会在失败时删除，可用于后续诊断或重新激活；`uninstall`当前删除安装记录，不物理删除历史版本目录。

## Waiting

required Injection不存在时：

- Plugin仍在 desired Module计划中；
  -没有 Scope和Provider实例；
  -状态为 `waiting`并列出 `waitingFor`；
  -其 required dependents也会等待；
  -Client Artifact不会发布。

依赖后来出现时，Runtime自动构造 Plugin及受影响 dependents。

Manifest版本不兼容与“依赖不存在”不同：已安装但版本不满足范围时，Manager拒绝新的 artifact集合并保留旧集合，防止把不兼容实例注入强类型调用点。

## 激活

候选阶段：

1. 根据新旧Provider图计算changed Module和传递dependents。
2. 为每个可运行affected Module创建 candidate Scope。
3. 正向拓扑执行 Provider `create()`。
4. 执行 `prepare()`。
5. 执行 `health()`，非healthy候选不能提交。
6. 此时路由、页面、队列consumer和timer不得对外发布。

提交阶段：

1. 反向撤销旧 Scope activation contribution。
2. 反向执行旧 Provider `deactivate()`。
3. 一次替换 active Registry引用。
4. 正向执行新 Provider `activate()`。
5. 正向执行新 Scope activation contribution。
6. 反向 `dispose()`旧 generation。

## 回滚

### Candidate准备失败

```text
dispose candidate
  → 旧Registry不变
  → 旧路由和实例不动
```

Factory在抛错前没有成功返回实例时，Container不会把 `undefined`传给其dispose；Factory必须自行清理“创建到一半后抛错”的局部资源。

### 旧版本Deactivate失败

```text
不交换Registry
  → 重新activate旧generation
  → dispose candidate
```

### 新版本Activate失败

```text
deactivate candidate
  → 恢复旧Registry
  → reactivate old
  → dispose candidate
```

### 旧版本Dispose失败

新版本已经对外提供服务，此时不伪装为可安全回滚：

-新版本保持 active；
-旧 generation标为 `leaked`；
-Runtime进入 `degraded`；
-同 Module再次replacement抛出 `LeakedGenerationError`；
-Host关闭返回错误；
-必须重启进程清理不可证明已释放的资源。

## 禁用、移除和重新启用

-禁用 Plugin等价于从当前 artifact集合删除它。
-Runtime撤销该 Plugin和传递 dependents。
-仍被保留但缺少required dependency的dependent进入waiting。
-重新启用上游后，waiting Plugin用新generation重新构造。
-optional dependency移除时消费者仍会重建，获得 `undefined`而不是继续持有旧API对象。

## 关闭

Admin Host依次且尽量完整清理：

1. 等待正在执行的插件状态事务；
2. 停止 workspace watcher；
3. 停止 installed watcher；
4. 关闭EventSource bridge，并主动close全部浏览器stream；
5. 移除动态 Plugin；
6. 反向停止和释放 Host Module。

某一步失败不会阻止后续清理；最终以 `AggregateError`报告。静态代码 HMR使用 `Symbol.for('@zadmin/admin/host')`串行等待旧 Host完全释放后才创建新 Host，避免多个数据库连接、watcher或EventSource bridge并存。

## 浏览器生命周期

Client Runtime先import全部changed module，然后在一个页面批次中：

```text
dispose old/removed
  → activate changed
  → 一次通知页面订阅者
```

失败时反向dispose新模块并重新activate旧模块。Runtime还会单独跟踪 activate期间的所有页面注册，即使插件在返回总disposer之前抛错，也不会遗留半注册页面。

## ESM边界

带 revision query的动态 import保证新代码得到新的 Module Record。业务层卸载完成后，Container和诊断不再保存旧 API/class/Error对象引用；但 Node ESM缓存本身不提供强制删除接口。长期进程仍应结合正常部署滚动重启，而不是把无限次热升级当作进程永不重启的替代品。

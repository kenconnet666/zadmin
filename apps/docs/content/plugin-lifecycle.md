# 插件生命周期

## 状态

| 状态         | 含义                                     |
| ------------ | ---------------------------------------- |
| `registered` | 已进入 Runtime，但尚未尝试启动           |
| `waiting`    | 必需依赖缺失或未激活                     |
| `starting`   | 正在执行 `setup()`                       |
| `active`     | API可被依赖插件使用                      |
| `stopping`   | 已停止接收新的生命周期注册，正在清理     |
| `stopped`    | 已完成清理，可再次启动                   |
| `failed`     | setup或dispose失败，错误保留在诊断快照中 |

主要转换：

```text
registered → starting → active
registered → waiting
waiting → starting → active
starting → failed
active → stopping → stopped
active → stopping → failed
failed/stopped/waiting → starting
```

## 启动

1. App定义规范化并检查重复 ID。
2. 构建依赖图并检查循环。
3. 按拓扑顺序启动插件。
4. 必需依赖没有处于 `active` 时，插件进入 `waiting`。
5. 创建独立 `PluginScope` 和 `AbortController`。
6. 执行 `setup(context, dependencyApis, config)`。
7. setup返回值保存为直接调用 API。
8. setup失败时立即回收已经注册的 Effect并进入 `failed`。

## 停止

停止 provider时必须先停止全部传递依赖者：

```text
report → sales → auth → postgres
```

停止 postgres的顺序是：

```text
report
sales
auth
postgres
```

每个插件停止过程：

1. 状态切换到 `stopping`。
2. AbortSignal触发。
3. 按 LIFO顺序执行 Effect disposer。
4. 清除公开 API和 Scope引用。
5. 成功进入 `stopped`，失败进入 `failed`。

## 重载

显式 `runtime.reload(id)` 会停止插件及其所有下游依赖，然后按拓扑顺序重新启动。

HMR reconcile使用 definition对象身份识别源码变化：

- provider变化：重载 provider和全部下游。
- consumer变化：只重载 consumer及其下游。
- 无关插件保持运行，revision不变。
- 插件移除：停止并删除记录，下游进入 `waiting`。
- 后续重新安装依赖：waiting插件自动启动。

## 配置

`plugin.configure(config)` 创建带类型配置的安装项。配置对象变化会触发插件和下游重载。

配置应当是数据，不应在配置对象中保存连接、定时器或其他运行时资源。

## 观测

`runtime.onLifecycle(listener)` 可观察所有状态转换，返回取消订阅函数。

`runtime.snapshot` 包含：

```text
instanceId
appId
plugin id
state
dependencies
waitingFor
revision
error
```

Admin和ETL应用通过 `/__zadmin/runtime` 暴露当前诊断快照。生产环境后续接入鉴权时，该入口必须仅允许管理员访问。

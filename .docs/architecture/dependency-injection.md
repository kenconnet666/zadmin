# DI 容器

## 目标

`ServiceContainer`是面向动态 Plugin generation设计的 IoC容器。它不仅完成 Token → Provider → Instance，还统一管理：

- Provider依赖图和完整解析路径；
- Host/Plugin owner；
  -候选 generation；
  -异步 prepare、activate、deactivate、dispose和health；
- dependents级联重建；
  -原子 Registry切换；
  -失败回滚和资源泄漏阻断；
  -不可持有插件对象引用的序列化诊断。

## Token与Injection

Token运行时身份是稳定字符串，类型通过 phantom member存在于编译期：

```ts
export interface ApprovalApi {
	start(subjectId: string): ApprovalRecord;
}

export const APPROVAL_ID = '@zadmin/approval' as const;
export const APPROVAL = token<ApprovalApi>(APPROVAL_ID);
```

普通 Service：

```ts
const dependencies = {
	auth: inject<AuthService>('@zadmin/auth'),
	database: inject<PostgresService>('@zadmin/postgres')
} as const;
```

上游 Plugin：

```ts
import type { ApprovalPlugin } from '@zadmin/approval';

const dependencies = {
	approval: injectPlugin<ApprovalPlugin>('@zadmin/approval')
} as const;
```

可选依赖：

```ts
approval: injectOptionalPlugin<ApprovalPlugin>('@zadmin/approval');
```

`ResolveInjections<typeof dependencies>`自动生成：

```ts
{
	readonly auth: AuthService;
	readonly database: PostgresService;
	readonly approval: ApprovalApi | undefined;
}
```

类型在编译后不会成为运行时值，因此 `injectPlugin<TPlugin>()`仍必须接收一次 Plugin ID；泛型会检查该字符串是否匹配 `TPlugin['id']`。

## 独立结构声明

少量情况下，两个模块需要并行编译，或者不希望把上游整个 package放入编译图，可以只声明消费者真正需要的最小结构：

```ts
interface ApprovalStarter {
	start(subjectId: string): { readonly id: string };
}

const approval = inject<ApprovalStarter>('@zadmin/approval');
```

这种写法保留调用点强类型和运行时依赖边，但不能让 TypeScript跨仓库证明 Provider完整实现同一结构。默认仍应依赖上游 Plugin package并使用 `injectPlugin()`。

## Provider

容器只支持三种直接来源：

```ts
provideValue(TOKEN, value);
provideFactory({ token: TOKEN, dependencies, create, ...hooks });
provideClass(ServiceClass);
```

每个 Provider在其 Module generation中只构造一次。当前没有 transient、request、resolution或session scope；短生命周期对象由注入的 factory显式创建，HTTP请求状态由 SvelteKit `RequestEvent`传递。

所有 Provider都会在 candidate阶段构造，避免 lazy resolution把启动错误推迟到业务请求。

## 标准装饰器

Class Provider可使用：

```ts
@service({ token: APPROVAL, dependencies })
export class ApprovalService implements ApprovalApi {
	constructor(
		private readonly services: ResolveInjections<typeof dependencies>,
		context: ServiceContext
	) {}
}

export const approvalProvider = provideClass(ApprovalService);
```

`@service()`只把 Token和Dependency Map挂在 class constructor的 `Symbol.for('@zadmin/core/service-metadata')`上。它：

-不访问全局 Container；
-不扫描目录；
-不依赖参数名；
-不读取 design:paramtypes；
-不需要 reflect metadata；
-随 class和旧 ESM graph一起失去业务引用。

Vite 8当前默认 Oxc会保留标准装饰器语法，Node不能直接执行。`@zadmin/core/vite`中的 `zadminPlugin()`只对含标准装饰器的 TypeScript文件调用 TypeScript标准 emit，不切换 legacy decorator语义。

## ServiceContext与Scope

每个 Module generation有一个 `ServiceScope`：

```ts
interface ServiceContext<Config = unknown> {
	readonly id: string;
	readonly moduleId: string;
	readonly generation: string;
	readonly kind: 'host' | 'plugin';
	readonly config: Config;
	readonly signal: AbortSignal;

	onActivate(setup): void;
	onDeactivate(disposer): void;
	onDispose(disposer): void;
	effect(acquire): Promise<void>;
}
```

- `effect()`在prepare期获取资源，最终 dispose时反向释放。
- `onActivate()`只在 generation提交后发布路由、timer或consumer；返回值在 deactivate时反向执行。
- `onDeactivate()`用于停止接收新工作，并可在回滚时再次 activate。
- `onDispose()`只执行一次。
- `AbortSignal`在最终 dispose时触发，不在可回滚的普通 deactivate时触发。
  -所有 disposer都会尝试执行；多个失败汇总为 `AggregateError`。

## Class生命周期方法

`provideClass()`识别以下可选方法：

```ts
prepare(context);
activate(context);
deactivate(context);
dispose(context);
health(context);
```

Factory Provider有同名 callback。生命周期方法不使用额外装饰器，因为每阶段最多一个入口，普通方法更容易测试和覆盖。

## Provider图与循环

循环检测发生在 Provider/Bean级，而不是简单的 Plugin级：

```text
A/service-1 → B/service-1
B/service-2 → A/service-2
```

只要上述边没有形成实际 Provider环就允许。真正的环会报告完整路径并拒绝 candidate：

```text
@zadmin/a/x -> @zadmin/b/y -> @zadmin/a/x
```

没有 `forwardRef()`、lazy proxy、setter injection或循环后置修复。业务双向回调应改为单向 Registry：一方暴露 `register(handler)`，另一方在自己的 Scope中注册并持有 disposer。

## Generation事务

一次变更会合并旧图和新图中的全部 dependents。成功路径：

```text
create candidate scopes
  → create providers（正向拓扑）
  → prepare
  → health/readiness
  → deactivate old scopes/providers（反向拓扑）
  → 原子替换 active Registry引用
  → activate candidate providers/scopes（正向拓扑）
  → dispose old providers/scopes（反向拓扑）
```

失败语义：

- candidate create/prepare/health失败：释放 candidate，旧 Registry和业务保持不变。
- old deactivate失败：不切换 Registry，重新激活已停止的旧 generation，释放 candidate。
- candidate activate失败：停止 candidate，恢复旧 Registry，重新激活旧 generation，再释放 candidate。
  -旧 generation在新版本 active后 dispose失败：新版本继续服务，旧版本标记 `leaked`；同一 Module后续 replacement被拒绝，Host关闭也返回错误，必须重启进程。

生命周期事务严格串行。诊断 observer抛错会被隔离，不能反向破坏已提交状态。

## Waiting与可选依赖

缺少 required Provider的 Module保留在计划中但不创建 generation，状态为 `waiting`。依赖出现后，Module及其 dependents自动进入候选构建。

可选 Provider缺少时注入 `undefined`；它新增、移除或换 generation时，消费者仍会重建，避免长期持有过期对象。

等待中的服务端 Plugin不会进入 `PluginManager.activeArtifacts`，因此其浏览器页面也不会提前发布。

## 诊断与健康

`ServiceContainer.snapshot`只包含冻结的可序列化诊断：

- Module ID、kind、version、revision、generation、state；
- Provider ID、source、state、dependencies、dependents；
  -创建/激活时间；
- health；
  -序列化 Error；
- leaked generation ID。

它不保留旧 class或API对象。Admin暴露：

```text
GET /__zadmin/runtime
GET /__zadmin/health
```

`/__zadmin/health`主动执行当前 Provider health check，全部健康返回 `200`，degraded返回 `503`；暂时性 health失败恢复后，Container可以回到 `active`。

## 明确不提供

-第三方 DI Runtime或第二套 Binding图；
-反射式构造器自动注入；
-parameter/property injection；
-自动 Service扫描；
-多 binding、qualifier、tag和alias；
-AOP/interceptor代理；
-request/transient/resolution scope；
-循环依赖代理；
-对象引用原地指向新实例的热交换 Proxy；
-恶意代码沙箱；
-网络 RPC或跨进程透明调用。

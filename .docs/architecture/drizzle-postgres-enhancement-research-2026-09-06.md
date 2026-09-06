# Drizzle PostgreSQL 增强范围：以 TypeScript 和原生能力为基准

调研与收敛日期：2026-09-06。本文是当前范围决策，替代此前按 Java/C# ORM 功能分类得到的宽泛实施清单。依赖升级与基础数据库接入已经完成；这里讨论的新增 API 尚未实现。运行与恢复方式见 [本地 PostgreSQL 接入](../development/postgres.md)。

## 当前结论

`@zadmin/drizzle` 只接收可以直接组合进原生查询、具有明确类型或语义收益的少量 PostgreSQL 表达式。现在最具体的候选是 JSONB 路径读取；搜索表达式等待实际搜索需求。没有业务重复证据时，包继续保持很小，暂不增加运行时代码也合理。

动态条件、DTO、列表分页、版本 PATCH、租户条件、事务审计和关系统计，优先写成普通 TypeScript 业务函数。连接、请求观测、COPY 与 RLS 执行配置属于基础设施。它们都不因 Java/C# ORM 提供一个专门 API，就自动成为本包需求。

装饰器可以适当使用。现代 TS 的 class/method/field/accessor decorator 能解决不同问题；是否采用取决于实际行为和类型收益，不以“TS 不能反射全部类型”否定装饰器，也不为了装饰器另建实体系统。

## 纳入范围的判断条件

每个候选依次回答：

1. Drizzle 最新公开 API 是否已提供？包括 RQB2、SQL builder、SQL 模板、codec、校验适配和 Kit SDK。
2. 普通函数、对象组合、闭包、泛型或现有生态是否已经足够清楚？几行直接代码不等于需要新 DSL。
3. 抽取后是否统一了反复出现、容易出错的数据库语义，或者提供原先没有的类型约束？单纯重命名 API 不算收益。
4. 抽象能否保留查询结果推导、别名、NULL、参数化与执行所有权，而不引入第二套 schema/AST/映射器？

缺少具名 helper 仅表示一个便利入口缺口，不能直接推导出必须自研。首轮不以包大小、对标功能数或目录数量为目标。

## 已核对的基线

本地已安装 `drizzle-orm@1.0.0-rc.4`、`drizzle-kit@1.0.0-rc.4`、`postgres@3.4.9`，TypeScript catalog 为 `6.0.3`。RC.4 是当前选用的最新 RC 发布，不把它称作稳定版。能力核对优先依据已发布包的公开声明/实现，再结合当前官方文档。[Drizzle RC.4 发布](https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-rc.4)

| 能力                      | 原生/生态解决方式                                                        | 当前处置                                     |
| ------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| 动态条件                  | TS 对象/数组/条件表达式；`and` 忽略 undefined；RQB2 对象过滤             | 不做 QuerySpec、whereIf 或条件解释器         |
| 关联存在/不存在、嵌套加载 | RQB2 关系 where、NOT、with、through、子集合 limit/orderBy                | 不做导航运行时、Include 封装                 |
| DTO、投影与返回类型       | `select({})`、columns/extras、`$inferSelect`、`Awaited<ReturnType<...>>` | 不做 DTO class/映射注册表                    |
| 输入验证                  | 选定的运行时 schema；Drizzle 已有 Zod 等适配与 insert/update schema 生成 | 不做另一套校验框架，不为此强加校验库         |
| 普通分页与简单游标        | limit/offset/orderBy、原生比较表达式、取 limit+1                         | 由具体列表函数决定                           |
| PATCH 与乐观并发          | `.set` 忽略 undefined，条件含版本，RETURNING 判断结果                    | 由具体业务更新函数决定                       |
| 自动时间/默认值           | 数据库 default、Drizzle `$defaultFn`/`$onUpdate` 等已有机制              | 不做重复的属性赋值系统；业务审计另行显式处理 |
| 事务/保存点               | 原生 `db.transaction(tx => ...)`                                         | 不做 UnitOfWork 包装                         |
| count/sum、同表多指标     | `$count`、extras、groupBy/having、SQL FILTER/LATERAL                     | 先写有名字的报表查询                         |
| 对象图结果、JSON 映射     | RQB2、原生 codec、customType/mapWith                                     | 不做通用 JSON DTO 聚合和 decoder 注册表      |
| SQL 标签与 SQL 输出       | `.comment()`、RQB comment、`.toSQL()`、logger                            | 直接使用；完成耗时的观测按基础设施处理       |
| schema diff/迁移          | Kit 的 `cli` 和 `api-postgres` 公开 SDK                                  | 不做 schema diff，不解析人类日志             |
| COPY/流式读取             | Postgres.js streams/cursor + Node pipeline                               | 按实际 ETL 任务处理格式、背压与取消          |

依据：[RQB](https://orm.drizzle.team/docs/rqb)、[条件组合](https://orm.drizzle.team/docs/guides/conditional-filters-in-query)、[Update](https://orm.drizzle.team/docs/update)、[Zod 适配](https://orm.drizzle.team/docs/zod)、[Codecs](https://orm.drizzle.team/docs/codecs)。

## TypeScript 已经比额外框架更直接的地方

### 值直接产生结果类型

下面是使用原生 API 的示意，假定 db/users 已配置，输入已在接口边界验证。没有新增框架 API：

```ts
import { and, asc, eq, gt } from 'drizzle-orm';

function listUsers(tenantId: string, input: { active?: boolean; after?: number; limit: number }) {
	return db
		.select({ id: users.id, name: users.name, active: users.active })
		.from(users)
		.where(
			and(
				eq(users.tenantId, tenantId),
				input.active === undefined ? undefined : eq(users.active, input.active),
				input.after === undefined ? undefined : gt(users.id, input.after)
			)
		)
		.orderBy(asc(users.id))
		.limit(input.limit);
}

type UserListItem = Awaited<ReturnType<typeof listUsers>>[number];
```

一个函数已经表达筛选、租户条件、简单游标和结果投影。重复时提取返回 SQL 条件的函数或投影对象即可。`satisfies` 可检查对象符合已有契约并保留推导；不必引入 ProjectionSpec 或专用 DTO 类型生成器。[TS typeof/ReturnType](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)、[satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)

TypeScript 类型不替代外部 JSON 的运行时验证。校验器负责接口输入；查询返回值继续由 Drizzle 推导。这里是两种明确职责，不需要统一成一个 Entity 基类。

### 原生关系查询已经处理对象图

RQB2 原生 `columns/with/where/extras` 支持结果投影、关联筛选、子集合排序/分页和标量子查询。`extras` 中的当前表列必须使用回调参数的别名，例如 `(u) => db.$count(posts, eq(posts.authorId, u.id))`，不能直接捕获导入的 `users.id`。[RQB 作用域和别名](https://orm.drizzle.team/docs/rqb)

Drizzle 已直接从选择对象推导结果，嵌套关系结果也由原生 mapper/codec 处理。对于这些场景，它比再加 DTO class、注解映射和结果装配器更直接。

EF 多集合平铺 JOIN 的行数乘积不能套到 Drizzle RQB 的关联聚合上。自动 split query、通用 relation loader 和子查询优化器移出当前范围；只有具体查询的执行计划显示问题时，才在该业务函数内选择分组派生表或分批查询。

### 组合条件值，不包装任意 builder

RC.4 的 `$dynamic()` 在运行时返回当前 builder；`.where()` 会设置/替换当前 where 配置，不会把每次调用自动 AND。

因此不采用“先由 withTenant(query) 加条件，再让调用方自由调用 where”的透明 Scope。它可能被后续调用覆盖。使用 `and(tenantFilter, businessFilters)` 一次构造，或让完整业务函数持有必要约束。[Drizzle 动态查询](https://orm.drizzle.team/docs/dynamic-query-building)

这也说明，接收并修改任意 builder 的泛型中间层，比返回原生 SQL 值的函数更难保持正确性。增强应优先返回表达式，不接管查询生命周期。

### 插件可以直接组合自己的关系类型

当前 Host 的 `PostgresService.db` 未绑定业务 relations，这不意味着需要一个全局 schema 注册器。插件在其 Provider 创建阶段使用共享 client，即可获得本插件的原生类型：

```ts
import { drizzle } from 'drizzle-orm/postgres-js';

const db = drizzle({
	client: postgresService.client,
	relations
});
```

这里复用 Host 的连接池；relations 来自原生 `defineRelations`/`defineRelationsPart`。Provider 仍由 core 管理，不在插件模块顶层创建连接，也不由插件关闭 Host client。统一驱动解析约定，插件不任意修改共享 client 的 parser/serializer。

## 装饰器的具体使用边界

| 用法                             | TS 可以做到什么                           | 当前判断                                                  |
| -------------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| class decorator                  | 附加元数据、包装/替换类、初始化行为       | 已有 `@service` 继续使用，注册与释放交给 core             |
| method decorator                 | 包装已有方法，保留 this、参数、返回值契约 | 多个业务入口确实重复时，可提供 tracing/执行策略的可选语法 |
| field decorator                  | 记录元数据、替换初始值                    | 可以使用，但普通 field decorator 不自动监控后续每次赋值   |
| accessor/getter/setter decorator | 包装读写与初始化                          | 属性校验等模型需求出现时评估，不为 ORM 引入实体脏追踪     |
| context.metadata                 | 存放显式写入的运行时描述                  | 有跨成员描述收集需求时再用，不必重写现有 @service 元数据  |

现代标准装饰器不等于 legacy `experimentalDecorators`，也不提供 `emitDecoratorMetadata` 式类型反射。interface、泛型实参和联合类型不会自动恢复为运行时 schema。另一方面，泛型装饰器可以约束已有方法/字段类型，这与“完全没有类型能力”不同。[TS 标准装饰器](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators)、[TC39 metadata](https://github.com/tc39/proposal-decorator-metadata)

装饰器可以在运行时添加字段，但 `@decorator` 语法不会自动让原类的静态类型看到新字段。需要返回一个带新增成员的精确类型时，TS 的工厂函数、mixin 和泛型对象组合更自然。[TS 类装饰器类型边界](https://github.com/microsoft/TypeScript/issues/4881)

可以讨论的行为入口如下；`traced` 是设计形态，并非已经实现的 API：

```ts
class OrderService {
	@traced('orders.create')
	async create(input: CreateOrder) {
		return createOrder(this.database, input);
	}
}

const create = withTrace('orders.create', (input: CreateOrder) => createOrder(database, input));
```

两种语法应共享既有观测执行函数，不重复建设 tracer；若已有 instrumentation 已覆盖需求，则不新增。单纯给 SQL 加标签直接使用 Drizzle comment。业务 tracing 更可能属于 core/应用执行层，不属于纯 SQL 增强包。

`@transactional` 也能实现，但只在跨多个服务的事务传播确有重复时考虑。装饰器不会使方法体里捕获的普通 db 自动加入事务；必须先设计显式 ctx/tx，或在确有需要时设计基于 AsyncLocalStorage 的会话访问。事务复用、保存点和异步资源所有权需明确。简单场景继续直接 `db.transaction(tx => ...)`。[Node AsyncLocalStorage](https://nodejs.org/api/async_context.html#asynclocalstoragerunstore-callback-args)

装饰器求值阶段只记录描述或包装方法，不连接数据库、不扫描注册、不保存当前请求/连接。元数据附着当前 generation 的类；实际注册、撤销、资源释放沿用 core。现有工程约定只提供 class `@service` 是当前实现范围，不是 TS 能力限制；用户允许按实际用途讨论 method 等扩展，本轮不修改装饰器实现或编译选项。Node 的原生 TS type stripping 不应被当作装饰器转换器，采用新装饰器时仍需验证构建链。[Node TypeScript 边界](https://nodejs.org/api/typescript.html#typescript-features)

## 保留候选一：JSONB 路径读取

这是目前最明确的库级候选，但仍需在真实 JSON 列查询中证明复用价值。固定一次性提取 `preferences->>'theme'` 时，一条原生 SQL 模板已经清楚，不为它单独包装。

当多处需要从已有 JSON 类型获得合法路径和叶子类型时，候选初版只提供两个纯表达式函数：

| 候选函数                   | 语义                   | 类型目标                                |
| -------------------------- | ---------------------- | --------------------------------------- |
| `jsonbValue(column, path)` | PG `#>` 路径取 JSON 值 | 字面量路径对应的 JSON 叶子类型，加 null |
| `jsonbText(column, path)`  | PG `#>>` 路径取文本    | 始终返回文本或 null 的 SQL 表达式       |

以下是拟议 API，不是当前可 import 的代码：

```ts
// preferences 的声明包含 { locale: 'zh' | 'en'; contact?: { email: string } }
const locale = jsonbValue(users.preferences, ['locale']);
// SQL<'zh' | 'en' | null>

const email = jsonbText(users.preferences, ['contact', 'email']);
// SQL<string | null>

// select、where、alias、执行和结果对象仍交给原生 Drizzle。
const rows = await db.select({ id: users.id, email }).from(users);
```

新增价值应当是合法路径检查、叶子类型推导和路径参数编码，而非把 `#>` 改个名字：

- 使用 const 泛型/tuple 路径，从列上声明的 JSON 结构推导；对象、可选属性与数组路径明确支持范围，限制类型递归深度。
- 路径作为 text[] 数据参数传递，不插入原始 SQL。动态路径只返回宽 JSON 类型/unknown，不声称还能精确推导。
- 即使声明属性必填，数据库仍可能缺键，结果包含 null。SQL NULL、JSON null 和缺失键的区别不能仅靠 JS null 恢复；确需区分时显式选择存在性/类型信息。
- JSON 模型必须使用实际 JSON 表示。`$type<{ createdAt: Date }>()` 不会把 JSON 字符串变成 Date，大整数也不会自动变为无损 bigint。
- 不把整对象的 custom decoder 直接用于一个叶子。确需验证或转换时组合现有 mapWith/codec，不建立第二套 decoder registry。

`SQL<T>` 和 `.nullable()` 是静态类型表达，不等于执行 cast、校验或数据解析；实现必须让 SQL 返回值、TS 类型和实际 decoder 一致。[PG JSON 运算](https://www.postgresql.org/docs/current/functions-json.html)、[Drizzle SQL](https://orm.drizzle.team/docs/sql)、[Drizzle Codecs](https://orm.drizzle.team/docs/codecs)

`jsonbSet` 暂不与读取一并纳入：父路径缺失、数组下标、JSON null/SQL NULL 和 createMissing 都有独立语义。出现真实局部更新用例后，再增加明确的单路径写入表达式；不做任意对象深层 PATCH 编译器。

## 保留候选二：实际需要时的 PostgreSQL 搜索表达式

有搜索业务后，才讨论一组小表达式函数，用于复用文档向量、配置、权重、匹配和排名。同一个向量表达式可以用于查询与索引声明，避免两处公式漂移。原生 Drizzle 仍负责表、索引、查询和结果推导。

候选形态是 `weightedTextVector`、`webSearchQuery`、`textSearchMatch`、`textSearchRank`，返回原生 SQL 值；名字和数量不是已确定的公开合同。已有 `customType`/codec 直接复用，不另建 PG 类型注册器。[Drizzle FTS](https://orm.drizzle.team/docs/guides/postgresql-full-text-search)

单次的 `sql` 表达式已经够用时不增加这些函数。重复使用时也必须保持配置与索引表达式一致；可空文本的 coalesce 策略明确，不默默吞掉 NULL。英文或 simple 配置不代表已解决中文分词。

`pg_trgm` 只有具体模糊搜索需求才加入；不通过纯表达式 helper 偷改连接的 similarity_threshold，也不把 `similarity >= threshold` 和 `%` 的索引路径说成完全相同。扩展与索引继续由迁移负责。[PG pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)

## 明确移出当前增强范围

- 通用 DTO/实体装饰器、Repository、QuerySpec、ProjectionSpec、UnitOfWork、自动 Scope。它们目前主要重复 TS 与 Drizzle 的能力。
- 通用分页器。唯一排序、NULL、游标编码与快照属于业务契约；TS 泛型不能证明数据库 timestamp 微秒被 JS Date 毫秒无损保留，也不能自动保证 bigint 的 JSON 编码正确。
- 通用 JSON 对象图聚合与 mapper。RQB2 已处理常见关系结果；少量报告直接 SQL 并明确 JSON 内的数据表示、空集和排序。
- window/recursive DSL。原生 SQL 可以表达，缺一个 builder 不是实施理由；多处真实复杂报表出现后再评估。窗口排名返回 bigint、lag/lead 可能新增 NULL，不能只断言 SQL<number>。
- 自动关系聚合合并/split query。先使用原生 RQB/SQL 并观察具体计划，不复制 EasyQuery/LINQ to DB 的优化器。
- 通用版本 PATCH 与审计引擎。允许修改的字段、未匹配结果、审计事件和业务动作由有名字的业务函数管理。
- 租户过滤与完整 RLS 生命周期框架。当前先显式业务条件；需要数据库隔离时，角色、策略和事务上下文归基础设施，不声称能改写任意查询或隔离同权限恶意插件。
- 通用 BulkEngine、COPY 阈值自动切换、跨驱动 fallback。先用 Postgres.js streams 与 Node pipeline 完成具体导入任务，再提取稳定复用的格式编码。
- 重新实现 logger、SQL comment、codec、schema diff；现有公开入口优先。

这些功能不是“TS 做不到”，而是当前没有足够新增价值，或者不属于纯查询增强包。将来有新证据时重新评估，不把本轮取舍写成永久禁止。

## 包边界与下一步

| 位置                        | 当前应做的事                                                        |
| --------------------------- | ------------------------------------------------------------------- |
| `@zadmin/drizzle`           | 暂无广泛框架计划；JSONB 读取是具体候选，搜索按真实需求再定          |
| `@zadmin/postgres`          | 已有连接与生命周期；观测完成事件、取消、COPY/RLS 执行集成有需求再补 |
| `@zadmin/core` / 应用执行层 | 现有 @service；重复行为成立后再讨论可选方法装饰器/HOF               |
| 业务插件                    | 表与关系、查询/更新函数、输入 schema、权限和审计语义                |

后续先用原生 Drizzle 完成一个真实列表与编辑流程；如果 JSON 路径读取反复出现，再提取上述两个函数，验证非法路径/可空性/数组路径的类型约束与真实 PG 结果。搜索、窗口、复杂加载与 COPY 由真实场景触发，不再按功能清单逐项建设。

表达式如进入实现，直接返回原生 SQL，能放入 select/where/update/RQB RAW；RQB 中由回调传入当前别名列。不扩展 db 原型，不复制私有 AST，不构造第二份 schema。

这轮是范围与文档修订，没有实施候选 helper、修改装饰器或访问数据库。验证以已安装包和官方资料核对、文档审阅为限，不运行全量类型检查或测试。

## 外部研究保留的价值

| 参考                                                                                                                                                                 | 保留的设计经验                            | 在 TS/Drizzle 中的落点                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| [EasyQuery 导航/集合](https://www.easy-query.com/easy-query-doc/ability/select/where.html)                                                                           | 同一 any 内的条件由同一条关联记录满足     | 原生 RQB 关系 where / SQL EXISTS，不做导航 DSL |
| [EasyQuery 聚合计划](https://www.easy-query.com/easy-query-doc/performance/implicit-subquery-group-join)                                                             | 同关系多指标可显式预聚合                  | 有执行计划证据的业务 SQL                       |
| [Npgsql JSON](https://www.npgsql.org/efcore/mapping/json.html)                                                                                                       | JSON 类型、SQL 运算与映射语义共同设计     | JSONB 路径候选，复用现有 codec                 |
| [EF split query](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries) / [LINQ to DB 6.4](https://github.com/linq2db/linq2db/releases/tag/v6.4.0) | 加载策略有代价，需要控制 SQL 数量和一致性 | 原生 RQB 优先，具体慢查询再处理                |
| [FreeSql 更新](https://freesql.net/guide/update.html)                                                                                                                | 写入路径与版本检查契约要明确              | 普通 updateUser 等业务函数                     |
| [Dapper](https://github.com/DapperLib/Dapper/blob/main/Readme.md)                                                                                                    | 保留 SQL 与执行边界                       | Drizzle 已有的直接查询路线                     |

## 已完成的基础接入

此前提交 `632fa5a` 已升级 ORM/Kit 至 RC.4，完成 Postgres Module、Admin 私有环境接入和 WSL 本机转发；真实连接、事务提交、嵌套回滚、临时表清理、连接池关闭与应用健康检查通过。

这些是前一实施阶段的验收记录，本轮未重复探测服务状态，也不把它们作为尚未实现的增强 API 证据。具体端口、凭据文件位置和恢复命令以 [接入文档](../development/postgres.md) 为准。

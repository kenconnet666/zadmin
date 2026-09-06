# Drizzle PostgreSQL 增强调研与设计建议

调研日期：2026-09-06。状态：依赖升级与 S0 基础接入已完成，真实连接、事务及应用健康检查通过；后续增强 API 属于待讨论设计，尚未实施。运行与恢复方式见 [本地 PostgreSQL 接入](../development/postgres.md)。

## 结论与最新版本基线

建议把 `@zadmin/drizzle` 做成 PostgreSQL 查询与写入的薄增强库，把连接、事务执行和资源生命周期留在 `@zadmin/postgres`。优先减少后台列表、版本更新、关系统计与 PostgreSQL 表达式的重复代码，同时保留原生 Drizzle 查询、SQL 和类型推导。

用户明确要求采用最新版本，并要求立即升级。因此不以旧项目版本限制设计：本次已把 Drizzle ORM 和 Kit 同步升级到官方当前 RC 标签对应的 `1.0.0-rc.4`，catalog 与 peer dependency 使用精确版本；Postgres.js 的最新版本仍是 `3.4.9`。npm 的 `latest` 标签仍分别指向 ORM `0.45.2`、Kit `0.31.10`，不能把“最新发布的 RC”写成“最新稳定版”。发布依据是 npm registry 与 [Drizzle RC.4 正式发布记录](https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-rc.4)。

判断能力时使用“最新发布包的公开入口 + 官方文档 + 对应版本源码”。网站会先于发布包更新，开发分支版本号也不能证明某项 API 已发布。

## 调研开始时的本地现状与职责

调研开始时实际读取的代码如下；这是接入前快照，S0 完成结果见本文末尾：

- `packages/drizzle/src/index.ts` 仅导出包名常量，没有查询增强实现。
- `packages/postgres/src/index.ts` 提供 DI Module、配置及 `closed` 标记；尚未创建 Postgres.js 客户端，也没有数据库查询健康检查。
- `packages/postgres/package.json` 已依赖 `postgres`、`drizzle-orm` 与 `@zadmin/drizzle`。
- 调研开始时业务代码未发现 Drizzle 表定义、关系定义、查询调用或数据库迁移，因此依赖升级时没有可迁移的旧关系 API。

因此先完成了数据库连接与生命周期的 S0 接入。包边界遵循现有 [架构](./overview.md) 与 [工程约定](../development/conventions.md)，不把数据库池放到插件模块顶层，不新建伴生 API 包。

| 所有者             | 建议职责                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `@zadmin/drizzle`  | 纯查询规格、SQL 表达式、投影、分页谓词、写入条件与结果契约；依赖 Drizzle 公开 API，不依赖 DI 或驱动 |
| `@zadmin/postgres` | Postgres.js 连接池、Drizzle 实例、事务和请求上下文、连接健康、关闭与取消、COPY/流式执行             |
| 业务插件           | 业务 schema、公开查询字段、权限决策、领域事务、迁移与索引声明                                       |
| Host/部署工具      | 聚合并检查迁移、版本兼容、执行可审核的结构变更；不在普通 CRUD 或插件激活时自动改表                  |

## 参考对象与真正值得借鉴的机制

| ORM                | 已确认的参考能力                                                                | 对我们的意义                          | 不直接复制的部分                                 |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| Java EasyQuery     | 类型化实体代理、导航路径、集合条件/聚合、DTO 查询规格、子查询聚合合并、策略拦截 | 业务关系表达和同关系多指标投影        | Java 注解/生成器、完整实体运行时、通用查询优化器 |
| EF Core + Npgsql   | 命名过滤、单查询/拆查询选择、并发令牌、PG JSON/数组/全文检索翻译                | 明确策略、加载方式、PG 类型与索引语义 | DbContext 跟踪图、隐式 SaveChanges、自动级联     |
| LINQ to DB         | CTE、窗口函数、直接 DML、批量加载策略、BulkCopy                                 | PostgreSQL 查询表达和显式执行计划     | 第二套通用 AST、跨数据库抽象和自动策略回退       |
| SqlSugar / FreeSql | 动态筛选、DTO、命名过滤、版本更新、批量导入、审计                               | 后台业务契约和写入规范                | 全局可变上下文、自动建表、通用 Repository        |
| Dapper             | 显式 SQL、结果映射、缓冲/流式选择                                               | 保留 SQL 可见性和明确的资源管理       | 再包装一遍现有 Drizzle CRUD                      |

### EasyQuery：关系语义比方法数量更值得借鉴

EasyQuery 正式发布基线为 [3.2.14](https://github.com/dromara/easy-query/releases/tag/3.2.14)；本次看到 main 的版本号已写为 3.2.15，但不据此宣称正式发布。

它通过 Java annotation processor 生成 SQL 类型代理，链式操作构造表达式。不是把任意 Java lambda 的业务代码自动翻译为 SQL。关系元数据决定 ToOne 的 JOIN 与 ToMany 的子查询；`any/none` 表达存在/不存在，集合还可进行 count/sum 等聚合。下面是官方文档确认的 API 形态：

```java
easyEntityQuery.queryable(SysBank.class)
    .where(bank -> bank.bankCards().any(card -> {
        card.type().eq("储蓄卡");
    }))
    .toList();
```

值得保留的语义：同一个 `any` 内的 A、B 必须由同一条关联记录满足；两个独立 `any` 则可能由不同记录满足。查询规格不能把这两种情况误合并。对象导航默认 LEFT JOIN，明确要求关系存在时才选择 INNER JOIN。[筛选与导航查询](https://www.easy-query.com/easy-query-doc/ability/select/where.html)

`whereObject` 从请求 DTO 的字段映射得到条件；`selectAutoInclude` 与 `NavigateFlat` 从结果 DTO 定义得到投影与关系穿透。TypeScript 可以借鉴“定义一次查询规格/投影，多处复用”，用运行时对象推导结果类型，无需复制 DTO class 和注解反射。[DTO 筛选](https://www.easy-query.com/easy-query-doc/dto-query/filter.html)、[DTO 映射](https://www.easy-query.com/easy-query-doc/dto-query/map1.html)

`.subQueryToGroupJoin(...)` 能把同关系多个相关子查询合并为分组派生表。我们可以借鉴显式选择聚合计划，比较 correlated subquery、LATERAL 和按外键预聚合三种方案；不依据文档中的单个性能案例承诺普遍加速。[隐式子查询优化](https://www.easy-query.com/easy-query-doc/performance/implicit-subquery-group-join)

EasyQuery 的命名/受保护拦截器与逻辑删除有实际传播边界，逻辑删除开关不会自动跨所有子查询传播。应借鉴其“策略有名字、有作用域”的目标，避免把默认过滤视为数据库隔离证明。[全局拦截器](https://www.easy-query.com/easy-query-doc/adv/interceptor.html)、[逻辑删除](https://www.easy-query.com/easy-query-doc/adv/logic-delete.html)

### C#：吸收查询和执行契约，保留 TypeScript 的语言边界

C# 编译器可以把 `Expression<Func<T, bool>>` 转成表达式树；普通 TypeScript 回调没有同样的运行时表示。`u => u.age > 18` 会执行 JavaScript 比较，普通 Proxy 不能把所有运算符可靠重载为 SQL。因此不采用 `Function.toString()`、任意函数源码解析或不可翻译时悄悄转为内存筛选。继续使用 Drizzle 运算符、类型化对象条件和返回 `SQL` 的函数。[Microsoft 表达式树](https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/)、[EF 查询翻译边界](https://learn.microsoft.com/en-us/ef/core/querying/client-eval)

EF 的 `AsSplitQuery()` 明确表达多集合加载策略：例如同一个父项的两个集合各 10 条，直接平铺 JOIN 可能形成 100 行。拆查询减少重复数据，但增加往返和结果缓冲；要求一致快照时仍需合适隔离级别。这个数字是关系乘积示例，不是 Drizzle 性能测量；Drizzle RQB 通过嵌套聚合生成结果，不能直接套用 EF 平铺 JOIN 的结论。[EF 单查询与拆查询](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries)

[LINQ to DB 6.4.0](https://github.com/linq2db/linq2db/releases/tag/v6.4.0) 进一步提供 `KeyedQuery`、`CteUnion` 和 `Sql.Window.*`。可借鉴先分页父项，再按父键批量装配子项的方式；每父项 Top N 必须使用分区排名或关联子查询，不能把子查询全局 `LIMIT N` 当作每父项限制。

EF 10+ 的命名过滤支持分别管理租户和软删除。Npgsql 可把 PG `xmin` 映射为并发令牌；但直接 `ExecuteUpdate/Delete` 不自动应用实体跟踪的并发检测，仍需版本条件和影响行数检查。我们更适合显式 PATCH 和可见事务。[EF 过滤](https://learn.microsoft.com/en-us/ef/core/querying/filters)、[Npgsql 并发控制](https://www.npgsql.org/efcore/modeling/concurrency.html)、[EF 直接更新/删除](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete)

Npgsql 的价值还在 JSON 结构、数组操作符、全文检索与索引的对应关系。例如数组包含与参数数组成员测试不是同一个 SQL 运算。增强时应一起考虑返回类型、NULL、编码和索引，避免只加一个 `sql<T>` 类型断言。[JSON](https://www.npgsql.org/efcore/mapping/json.html)、[数组](https://www.npgsql.org/efcore/mapping/array.html)、[全文检索](https://www.npgsql.org/efcore/mapping/full-text-search.html)

SqlSugar 和 FreeSql 主要补齐后台工程惯例。SqlSugar 的查询过滤默认生效，更新/删除及子查询需要相应启用路径；FreeSql 全局过滤覆盖 Select/Update/Delete，版本更新也存在具体入口限制。两者都说明“有过滤器/乐观锁”不等于每一种 SQL 写法都自动拥有相同保证。[SqlSugar 过滤](https://www.donet5.com/home/Doc?typeId=1205)、[FreeSql 过滤](https://freesql.net/guide/filters.html)、[FreeSql 版本更新](https://freesql.net/guide/update.html)

FreeSql `InsertOrUpdate` 在 PostgreSQL 使用 ON CONFLICT，批量 COPY 是另一执行路径；Dapper 则让 SQL 和缓冲/流式选择直接可见。我们应保留这些边界，不把所有模式都隐藏到一个 `save()`。[FreeSql upsert](https://freesql.net/guide/insert-or-update.html)、[Dapper](https://github.com/DapperLib/Dapper/blob/main/Readme.md)

## 最新 Drizzle 已有能力：复用基线

| 能力                                                          | 当前判断                                                                                | 增强层的责任                                                                     |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 类型化 select/insert/update/delete、returning、upsert         | 已有                                                                                    | 不复制 CRUD；只补业务条件与结果契约                                              |
| JOIN/LATERAL、子查询、普通 CTE、聚合、行锁                    | 已有                                                                                    | 缩短重复组合，不能宣传成新增数据库能力                                           |
| `defineRelations`、RQB2、嵌套 with、关系条件、through、多对多 | RC.4 已有                                                                               | 直接复用，避免建设第二份关系系统                                                 |
| RQB2 对象过滤、关系存在条件、对象排序与嵌套分页               | RC.4 已有 `AND/OR/NOT`、字段操作符、关系条件、`orderBy`、`limit/offset`                 | 只做输入校验、字段/操作符白名单和分页契约；不再实现对象筛选解释器                |
| 关系上的 predefined filters                                   | 已有，面向目标关系表                                                                    | 不等同于任意查询/DML 都受约束的租户策略                                          |
| `$dynamic()`、SQL 模板、类型/codec 扩展                       | 已有                                                                                    | 使用公开组合点；不修改 builder 内部状态                                          |
| 数组运算、JSON/JSONB 列、向量类型/操作符、RLS DDL             | 已有相应基础                                                                            | 只补当前业务需要且公开 API 未覆盖的组合                                          |
| SQL comment、查询 SQL 输出                                    | RC.4 已有                                                                               | 补统一标签、耗时与请求关联；不重复发明标签格式                                   |
| Kit 程序化入口和结构化输出                                    | RC.4 的 `drizzle-kit/cli` 与 `drizzle-kit/api-postgres` 均已核对公开声明和真实 ESM 导出 | 根据任务选择命令 SDK 或 PG snapshot/diff SDK；不自建 schema diff，不解析人类日志 |

依据：[RQB](https://orm.drizzle.team/docs/rqb)、[Relations](https://orm.drizzle.team/docs/relations)、[动态查询](https://orm.drizzle.team/docs/dynamic-query-building)、[RLS](https://orm.drizzle.team/docs/rls)、[RC.4 发布](https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-rc.4)，并核对安装包公开声明及运行时导入。

RQB2 的根 `where` 可通过 `posts: true` 或 `posts: { ... }` 筛选具有匹配关系的父项；`with.posts.where` 只筛选加载的子项，不能把这两种意图合并。关系定义的 predefined `where` 只针对目标 `to` 表，不是中间表过滤，也不会自动覆盖根表、普通 SQL builder 或写入。`optional: false` 仅表达关系结果的类型保证，不创建数据库约束。[RQB](https://orm.drizzle.team/docs/rqb)、[Relations](https://orm.drizzle.team/docs/relations)

细分表达式已按安装的 RC.4 全包公开声明、JS 实现和根入口/`pg-core` 的真实导出完成窄范围核对：

| 表达式           | RC.4 公开能力边界                                                                        | 后续选择                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| JSON path/键提取 | 未发现第一类路径 helper 或 JSON 列路径访问 API；官方 RQB 示例仍以 `RAW` + `sql` 写 `->>` | 有业务需要时提供 PG 专属薄表达式；复用参数化 SQL，不造完整 JSON 查询语言        |
| JSON 聚合 helper | Codec 文档提到 `jsonAgg`/`jsonBuildObject`，但安装包未发现同名公开导出或实现             | 不能列为当前可 import 的 API；按实际查询使用 PG SQL，并单独处理 JSON 内类型映射 |
| 窗口函数/frame   | 未发现 `.over()`、window spec、`rowNumber()`/`rank()` 第一类 builder                     | PostgreSQL 可执行，Drizzle 可通过 `sql` 表达；按实际报表需求补小 helper         |
| 递归 CTE         | 普通 `$with().as()`/`with()` 已有；未发现 `withRecursive` 或递归选项                     | `WITH RECURSIVE` 使用显式 SQL；不把普通 CTE 支持等同于递归 builder              |

Codec 已原生处理常规读取、写入参数和 JSON 上下文的 cast/normalize；`customType({ codec })` 与 SQL 表达式的 `.mapWith(column)` 可复用相应转换。Codec 不是 JSON path API，`.$type<T>()` 也不验证运行时 JSON 结构。数据库支持、可通过 `sql` 表达、已有公开 helper 是三个不同层次。[Codecs](https://orm.drizzle.team/docs/codecs)、[RQB 的 JSON RAW 示例](https://orm.drizzle.team/docs/rqb)、[RC.4 codec 修复](https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-rc.4)

## 候选增强与实施顺序

| 优先级 | 能力                              | 具体收益                                | 相对成本 | 关键边界                                   |
| ------ | --------------------------------- | --------------------------------------- | -------- | ------------------------------------------ |
| P0     | 真正的 Postgres Module            | 连接、事务、健康、关闭有明确所有者      | 中       | S0 基础接入完成；请求 scope、COPY 仍未实现 |
| P1     | 类型化列表输入与分页契约          | 统一输入校验、允许字段、排序与分页      | 低到中   | 复用 RQB2 对象过滤，不再解释一套筛选 AST   |
| P1     | 版本 PATCH、归档/恢复、受影响结果 | 防止静默覆盖和字段误写                  | 低到中   | 0 行可能是不存在、不可见或版本不匹配       |
| P1     | PostgreSQL 表达式小模块           | JSONB、检索、时间桶等保持类型和语义一致 | 中       | 先检查原生 API；索引/编码不能省略          |
| P1     | 显式请求 scope 与事务审计         | 租户、操作者、tx 传播有契约             | 中到高   | 不宣称能透明改写任意 Drizzle SQL           |
| P1     | 查询诊断                          | 查询标签、SQL 数量、耗时、影响行数      | 低到中   | observer 失败不能改变已提交结果            |
| P2     | 关系指标与可选批量装配            | 复杂列表减少重复子查询和 N+1            | 中到高   | 复用 RQB2；每父项 Top N、基数和 NULL 正确  |
| P2     | COPY/流式导出                     | ETL 避免全量内存与逐行往返              | 中到高   | 执行驱动能力；背压、连接、取消、事务       |
| P3     | 窗口/递归/高级查询规格            | 排名、组织树、时序报表                  | 中到高   | 在真实需求出现后补小 API，不造通用优化器   |

成本是设计工作量的相对比较，不是人日估算；没有做吞吐、内存或数据库执行计划基准。

### 类型化列表规格

RQB2 已提供对象过滤解释、嵌套关系条件和对象排序，直接使用其公开输入类型和查询入口。列表增强只描述接口允许的字段、操作符、值类型、分页上限与字面匹配语义；验证后的值传给原生 RQB2，不再定义另一套对象 AST、操作符分发器或对象到 SQL 的递归解释器。业务接口字段名与数据库字段名不同时做有限映射即可。

下面是待讨论的 API 草案，当前尚未实现：

```ts
// 业务校验函数：拒绝未公开的排序字段、非法值和过大的分页输入。
const input = parseCustomerListInput(request.query);

const rows = await tx.query.customers.findMany({
	columns: { id: true, name: true },
	where: {
		tenantId: scope.tenantId,
		deletedAt: { isNull: true },
		status: input.status,
		createdAt: input.createdAfter === undefined ? undefined : { gte: input.createdAfter }
	},
	orderBy: input.orderBy,
	limit: input.limit,
	offset: input.offset
});
```

必须定义的语义：

- 默认只有 `undefined` 表示不提供条件；`false`、`0`、空字符串和 `null` 不得因为 truthy 判断丢失。
- `contains` 按字面包含处理并正确转义 `%`、`_`；需要 SQL 模式匹配时用另一个明确操作符。
- `in: []` 明确表示匹配空集合；动态输入要验证值类型、操作符、树深度、项数和允许关系。
- RQB2 复用原生对象过滤；复杂 SQL 风格查询继续通过公开 `and/or` 等运算符一次合成 `.where()`。`$dynamic()` 允许组合 builder，不代表多次 `.where()` 自动 AND。
- 游标分页使用稳定复合排序和唯一键兜底，明确升降序、NULL 排序与游标编码；初版可只支持非空排序列以控制复杂度。
- 分页主对象时先确定主键集合，再关联 ToMany；不能直接在展开后的 JOIN 行上分页。
- `total` 可选，不默认每页强制 count。GROUP BY、DISTINCT、JOIN 的 count 需要显式统计查询，不能套 `count(*)`。
- 两条查询分别拿 page 和 total 时，Read Committed 可能看到不同快照；要求一致时使用同一适当隔离级别的事务。[PG 隔离级别](https://www.postgresql.org/docs/current/transaction-iso.html)

分页应复用 [Drizzle 游标示例](https://orm.drizzle.team/docs/guides/cursor-based-pagination) 的公开组合方式，增量是统一契约和边界验证。

### 版本写入与审计

初版建议显式业务 `version` 列。统一生成带主键、数据范围和预期版本的 UPDATE，并执行 `version = version + 1`，用 RETURNING 获取结果。`xmin` 可作为独立 PG 适配，但不把它当作跨备份恢复永久有效的业务版本。

建议默认返回 `updated | notMatched`。若需要区分 notFound / forbidden / conflict，由有相应权限的业务流程处理；不能把更新 0 行一概称为并发冲突，也不能为了分类泄露其他租户是否存在某条记录。

PATCH 仅允许明确列：`undefined` 不更新，`null` 明确清空；id、tenant、version、审计字段不能由普通客户端任意覆写。归档与恢复分别提供入口；恢复时如果碰到有效记录唯一约束冲突，应明确返回冲突。

业务数据和审计记录必须使用同一个 `tx`。提交后回调可以做非持久通知，但进程可能在 commit 后、回调前退出；必须可靠投递的消息由业务采用同事务 outbox，不宣称普通 hook 可以保证投递。[FreeSql UnitOfWork 的实例边界](https://freesql.net/guide/unit-of-work.html)、[Drizzle 事务](https://orm.drizzle.team/docs/transactions)

### PostgreSQL 专用表达式

优先选择已有实际使用场景的函数，返回原生 `SQL<T>`，并保留可空性和对应的 runtime codec：

- JSONB：路径提取、文本与 JSON 值的区分、`jsonb_set` 局部修改、包含/键存在、聚合为数组。SQL NULL、JSON null、缺失键必须分别说明；JSON 聚合会把 bigint/date 等转成 JSON 表示，不能假设保留原列 decoder。
- 检索：`websearch_to_tsquery`、匹配、rank、headline、权重和索引表达式共同配置；复用 `customType`，不维护完整 PG 类型库。
- 模糊检索：可选 `pg_trgm`，明确 GIN/GiST、ILIKE 和相似度的适用情形。
- 时间与统计：`date_trunc`、时间区间、条件聚合 FILTER；窗口/递归 API 根据真实报表需求再加入。

普通 JSON path helper 也必须限定深度和返回类型，避免无限递归类型导致 IDE 性能下降。全文检索的语言配置需要明确；不能把英文词干化或 `simple` 字典当作已解决中文分词，中文质量需要单独选型和样本验证。[PG JSON](https://www.postgresql.org/docs/current/functions-json.html)、[Drizzle FTS](https://orm.drizzle.team/docs/guides/postgresql-full-text-search)、[PG parser](https://www.postgresql.org/docs/current/textsearch-parsers.html)、[pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)

### 数据范围和 RLS

借鉴命名策略，但由 Host 创建不可变的请求上下文并显式传入。缺少必需租户时失败；`includeDeleted` 和跨租户管理是不同能力，避免一个 `ignoreAllFilters()` 同时关闭二者。

初版策略只承诺覆盖增强 API 管理的入口。JOIN 的 ON/WHERE、子查询、RQB、批量查询和写入都需单独验证。原生 Drizzle 是显式出口，不通过修改私有 AST 来声称完全拦截。

如采用 PG RLS，使用实际权限策略和 `USING`/`WITH CHECK` 约束读取与写入。连接角色不能是 superuser/BYPASSRLS，表所有者默认绕过的行为也需处理。请求上下文若用 `set_config(..., true)`，设置与查询必须在同一事务连接中，不能把租户状态留到连接池下一位请求。[PG RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)、[set_config](https://www.postgresql.org/docs/current/functions-admin.html)

通过自定义会话变量选择租户的 RLS，可以约束使用可信上下文的应用查询，但如果同一数据库角色可以任意执行 SQL 和修改该变量，它不能隔离恶意的同权限代码。当前动态插件运行于同一 Host；RLS 不应被宣传为插件沙箱。

### 关系统计和加载策略

RQB2 的关系筛选和对象图加载先直接使用。额外增强聚焦重复使用的统计投影，例如客户的已支付订单数、总额、最近订单时间：

1. 保留原生相关子查询路径，适合筛选后的少量父项。
2. 对重复扫描同关系的多指标，允许显式选 LATERAL 或分组派生表，处理无匹配时 `count=0`、`sum=null/0` 的契约。
3. 有实测依据后再提供 `single`/`batch` 装配选择，batch 先取当前页父键再查子项；批次数受参数上限和内存限制。
4. 同一关系 A AND B 与两次 EXISTS 的区别、可空关系、每父项 Top N 都属于验收条件。

计划选择必须依赖真实数据、索引和 EXPLAIN。即使 SQL 条数少，也不保证更快；有性能证据前不做自动改写和“自动最优策略”。

### COPY、导出与连接归属

Postgres.js 已提供 COPY readable/writable stream、cursor、事务和保留连接能力。大规模 ETL 应在这些执行能力上增加列编码、背压、取消、超时和清理，不通过 Drizzle helper 重新实现 COPY 协议。[Postgres.js 官方说明](https://github.com/porsager/postgres#copy)

普通批量 upsert 继续使用 Drizzle 多行 INSERT + ON CONFLICT。大规模去重合并可研究 `COPY -> staging -> INSERT SELECT ON CONFLICT`；COPY 本身不是 upsert。临时表、复制和合并必须使用同一连接/事务，并明确中途失败、取消和重复键处理。

COPY 与 Drizzle 外层事务的连接桥接是实施前的公开 API 验证项。若驱动/Drizzle 的公开接口不能可靠共享事务连接，则提供独立、明确的导入事务入口；不依靠私有 session 字段，也不宣称它自动加入外部 `tx`。

RLS 表的 COPY FROM 存在数据库限制，不能为了导入而默认切换为绕过 RLS 的角色；应选择保持目标写入策略的 INSERT 路径或经过设计的 staging 合并。[PG COPY](https://www.postgresql.org/docs/current/sql-copy.html)

### 诊断和迁移工具

复用 Drizzle `.comment()`/SQL 输出、驱动执行钩子，补 query name、耗时、SQL 条数、rows、请求/插件关联。默认不记录参数值；诊断事件和 observer 错误不得改变已经提交的业务结果。

EXPLAIN 是显式开发工具。EXPLAIN ANALYZE 会实际执行语句，不由普通诊断路径自动对写操作运行。

Kit RC.4 存在两组职责不同的公开程序化入口，不能混为一种 SDK：

| 发布入口                   | 已核对导出                                                                          | 适用场景与契约                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `drizzle-kit/cli`          | `generate`、`push`、`pull`、`up`、`exportSql`、`check`                              | 命令级 SDK，类型化 options/results 对应 CLI 的 JSON envelope；处理状态、错误和需要补充的决策                                           |
| `drizzle-kit/api-postgres` | `generateDrizzleJson`、`generateMigration`、`pushSchema`、`startStudioServer`、`up` | PG schema snapshot/diff 工具；`generateMigration(prev, cur)` 返回 SQL 数组；`pushSchema(...)` 返回 `sqlStatements`、`hints`、`apply()` |

本次真实 ESM 导入已确认这两组导出。RC.4 发布说明宣传的 `drizzle-kit/cli` 在本次安装包中确实存在，不应写成“仅宣传、尚未发布”。差异在于接口层级与返回契约：`api-postgres.pushSchema` 的计划/apply 与 `cli.push` 的命令结果不是同一对象；两处 `up` 也不能互换。公开类型和 export map 已检查，但未调用 schema 变更函数，因此不将导入成功当作迁移执行验证。[RC.4 SDK 发布说明](https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-rc.4)

按任务选择已发布 SDK，复用官方 snapshot/diff/DDL 生成，不解析人类日志，也不自建 schema diff。`pushSchema` 先返回计划、调用 `apply()` 才应用；命令 SDK 的缺少决策状态应交给明确的迁移流程。即使可程序化，也保持迁移可审查、可部署的边界，不在请求或插件激活时调用 push 自动改表。

## 分阶段建议与验证范围

| 阶段 | 可独立审阅的交付                             | 进入下一阶段的条件                                 |
| ---- | -------------------------------------------- | -------------------------------------------------- |
| S0   | Postgres Module 实际连接、关闭与明确事务入口 | 生命周期与连接归属清楚；基础 SQL 可用              |
| S1   | 列表规格、分页、投影复用、版本 PATCH         | 一个真实后台列表/编辑流程验证输入、SQL、结果与类型 |
| S2   | scope/必要的 RLS、事务内审计、查询诊断       | 覆盖读写、JOIN/子查询、缺上下文及并发请求隔离      |
| S3   | 两三个实际使用的 PG 表达式模块               | PG 结果类型、编码、索引与边界有对应证据            |
| S4   | 有需求的关系统计、COPY/流式导出              | 真实数据规模下说明 SQL 数量、时间、内存和事务语义  |

如果第一个业务功能就是多租户，S2 的必要隔离能力必须与 S1 一起交付，不能在缺少隔离时上线。

后续实现采用 WebStorm 受影响文件诊断；数据库语义、并发、RLS、COPY 与性能场景放到有真实 PG 的 CI，推送后继续下一项工作，不在当前任务等待新 CI。类型测试重点覆盖投影、可空列、JSON 路径与 schema 规模，避免为每个转发 helper 编写镜像测试。

明确不纳入首轮：实体脏追踪、全对象图自动保存、通用 Repository、任意 TypeScript Lambda 编译、自动分库分表、跨数据库统一 ORM、自建 SQL 优化器、透明全局查询缓存、CRUD 自动改表。

## 本次完成与验证边界

本次完成研究、公开 API 核对、依赖升级及用户追加的 WSL PostgreSQL 基础接入。以下真实连接证据只覆盖 S0，不代表后续增强功能已实现。

- 实施：Drizzle ORM `0.45.2 -> 1.0.0-rc.4`；Kit `0.31.10 -> 1.0.0-rc.4`；更新 catalog、增强包 peer dependency 和 pnpm lockfile。
- Postgres.js `3.4.9` 已是官方 latest，保持该版本；复用 WSL 内现有 PostgreSQL 18.4，没有替换数据库服务器镜像。
- 安装：`pnpm install --ignore-scripts` 成功，CLI 返回 ORM/Kit 均为 RC.4。
- 静态检查：WebStorm 对修改的 catalog/package 配置及 Postgres Module 未报错；批量检查曾返回未完成，已用逐文件检查取得结果。
- 轻量验证：通过 `drizzle.mock()` 构造 SQL 风格查询和 RQB2 查询，确认驱动导入、SQL 参数化与 `defineRelations` 可用；该检查没有数据库连接和数据写入。
- 公开 API 核对：读取 RC.4 包声明与实现，真实导入 ORM/PG 和 Kit 两组 SDK；确认 RQB2 对象过滤、comment、codec 与 SDK 导出，区分 JSON path、窗口及递归 CTE 的公开 helper 缺口。未调用 SDK 数据库变更函数。
- 锁文件核对：直接依赖版本变化仅为上述 Drizzle ORM/Kit；其余 diff 包括 Kit 新依赖 jiti 的 peer 绑定变化及 pnpm 清理失去引用的旧记录，没有升级其他直接依赖。
- 冻结锁文件验证：离线 `pnpm install --lockfile-only --frozen-lockfile --ignore-scripts --offline` 成功。
- WSL/Docker：Debian WSL2、Docker `26.1.5+dfsg1` 可用，现有 `pg-1`/`pg-2` healthy；`pg-1` 为 PostgreSQL 18.4 主库。
- Windows 到 Docker 发布的 5432/5433 超时，但 WSL 内可达；验证本机 socat 转发后安装 `zadmin-postgres-bridge.service`，仅监听 `127.0.0.1:15432`，服务 active/enabled。
- 创建独立 `zadmin_web` 数据库与非超级用户登录角色；随机凭据仅写入被 Git 忽略的 `apps/admin/.env.local`。没有修改已有 `zadmin` 数据库或重建容器。
- `@zadmin/postgres` 现提供真实 client/db、SELECT 1 健康检查和幂等关闭。无配置/测试模式明确 disabled，不创建数据库连接；Admin 单例从服务端私有环境读取 DATABASE_URL。
- 真实模块验证：连接应用数据库、事务提交、嵌套事务回滚全部通过；临时表通过 ON COMMIT DROP 删除，验证连接池已关闭。
- 应用在 `http://localhost:5173` 运行，`/__zadmin/health` 返回 active 且 PostgreSQL healthy；`/auth/api/status` 返回 active。开发服务和本机转发服务保留供当前应用使用。
- 没有执行业务 schema 迁移、全量 TypeScript 检查、完整构建或本地 Vitest/浏览器测试。新增测试由 CI 执行；上述结果不是生产部署或全部 ORM 增强能力的验收。

# Drizzle PostgreSQL JSONB 路径增强

`@zadmin/drizzle` 提供两个可以组合进原生 Drizzle 查询的纯表达式函数：`jsonbValue` 和 `jsonbText`。当前基线为 Drizzle ORM `1.0.0-rc.4`；编译期合同使用 TypeScript `6.0.3`，运行时与数据库验收使用 Node.js 24、Postgres.js 3.4.9 和 PostgreSQL 18。

## 使用

```ts
import { jsonbText, jsonbValue } from '@zadmin/drizzle';
import { eq, isNotNull } from 'drizzle-orm';
import { integer, jsonb, pgTable } from 'drizzle-orm/pg-core';

interface Preferences {
	locale: 'zh' | 'en';
	contact?: { email: string };
	devices: readonly { name: string }[];
}

const users = pgTable('users', {
	id: integer().primaryKey(),
	preferences: jsonb().$type<Preferences>()
});

// db 是调用方已有的 Drizzle 实例。
const rows = await db
	.select({
		id: users.id,
		locale: jsonbValue(users.preferences, ['locale']),
		email: jsonbText(users.preferences, ['contact', 'email']),
		lastDevice: jsonbValue(users.preferences, ['devices', -1, 'name'])
	})
	.from(users)
	.where(eq(jsonbText(users.preferences, ['locale']), 'zh'));

// locale: 'zh' | 'en' | null
// email、lastDevice: string | null
```

`jsonbValue` 使用 PostgreSQL `#>` 返回 JSON 值；`jsonbText` 使用 `#>>` 返回 PostgreSQL 文本。两者都返回原生 `SQL`，可以直接用于 `select`、`where`、排序、SQL 组合和结果别名，不拥有连接或事务。

| 输入叶子                           | jsonbValue                                         | jsonbText                                                   |
| ---------------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| JSON 字符串                        | 原字符串，保持 `"123"` 为字符串                    | 原字符串                                                    |
| JSON 数字 / 布尔                   | number / boolean                                   | PostgreSQL 的文本表示，例如 `"0"` / `"false"`               |
| JSON 对象 / 数组                   | JSON 对象 / 数组                                   | PostgreSQL 的 JSON 文本，不保证与 JSON.stringify 的排版相同 |
| JSON null                          | JS null，但 SQL 表达式本身是非 SQL NULL 的 JSON 值 | SQL NULL / JS null                                          |
| SQL NULL / 缺失路径 / 不匹配的结构 | SQL NULL / JS null                                 | SQL NULL / JS null                                          |

例如 `isNotNull(jsonbValue(users.preferences, ['contact']))` 可以判断路径是否得到一个非 SQL NULL 的 JSON 值；显式 JSON null 也符合该条件。不要仅从读取后的 JS null 区分 JSON null、SQL NULL 与缺键。需要区分时直接组合原生谓词。[PG JSON 运算符](https://www.postgresql.org/docs/18/functions-json.html)

## 路径与类型

- 路径为 `readonly (string | number)[]`，最多 8 段；`[]` 表示整个 JSON 根值。
- 原生 JSONB 列的字面量 tuple 自动检查已声明的键，并推导叶子类型。所有已知结果仍包含 null；列 `.notNull()` 不保证路径存在。
- 可选/可空对象、联合对象、JSON 数组与 readonly tuple 均可使用。联合模型中仅部分分支存在的合法路径返回相应叶子与 null。
- 数字段接受 PostgreSQL 有符号 32 位整数。负数从 JSON 数组末尾计数；字符串段允许空键、Unicode、逗号、引号等，禁止 NUL。
- 类型已知的数组支持规范整数下标及字符串下标，例如 `0`、`-1`、`"0"`、`"-1"`。`"01"` 可以是明确的对象键，但不作为类型化数组索引。
- 固定长度 tuple 的正负索引可以推导具体项；optional/rest tuple 根据可能的长度保守返回元素联合。越界固定 tuple 字面量路径会产生编译错误。
- `Record<number, T>` 支持 `1` 和规范数字字符串 `"1"`；动态 JS 路径数组返回 unknown，由调用方验证输入和解释结果。

```ts
import type { JsonbPath } from '@zadmin/drizzle';

// 明确的非法字面量路径会在编译时被拒绝。
// jsonbValue(users.preferences, ['contcat', 'email']);

const path: JsonbPath = getValidatedPathFromRequest();
const value = jsonbValue(users.preferences, path); // SQL<unknown>
```

运行时同样拒绝超过 8 段、稀疏数组、非字符串/数字段、NUL、非整数、非有限或超出 int32 范围的数字。字符串中看起来像数字的键仍以字符串发送；具体 JSON 结构由 PostgreSQL 判断。

路径会在构造表达式时复制，再通过 Drizzle 公开的 `makePgArray` 编码为一个 `text[]` 参数。后续修改原始数组不会改变已构造的表达式；不自行拼接 SQL 路径，不把 JS 数组误编译为 SQL tuple。

## 来源和别名

支持 JSONB 列、自定义 `dataType() => 'jsonb'` 的列、实际产生 JSONB 的 `SQL<T>`，以及合法查询作用域内的 `SQL.Aliased<T>`。`json`、SQL `jsonb[]` 和普通标量列会在运行时被拒绝；普通标量列还会被静态类型拒绝。

只有原生 JSONB 列提供存储模型的精确推导。自定义列与 SQL/SQL.Aliased 的声明类型可能来自整对象 decoder，无法证明它与存储的 JSON 形状相同，因此 `jsonbValue` 对这些来源返回 unknown；`jsonbText` 始终返回文本或 null。例如 decoder 将 `{ count: 1 }` 变成 `{ count: '1' }` 时，路径读取仍是原始 number，不能根据 decoder 后的类型声称得到 string。需要精确输出时，在叶子结果上显式组合校验器或 decoder。

RC.4 的 JSON/JSONB 列使用相同的公开静态 dataType，SQL 数组另有 `dimensions`，因此运行时检查同时查看公共 SQL 类型与维度。SQL 表达式没有可以证明数据库返回类型的元数据，调用方必须保证它实际产生 JSONB。

表别名和子查询字段直接传入即可。RQB 的当前列必须从回调参数取得，才能保留自关联与嵌套查询的作用域：

```ts
const rows = await db.query.users.findMany({
	columns: { id: true },
	where: {
		RAW: (u) => eq(jsonbText(u.preferences, ['locale']), 'zh')
	},
	extras: {
		email: (u) => jsonbText(u.preferences, ['contact', 'email'])
	}
});
```

SQL 别名遵循原生 Drizzle 规则：表达式上的 `.as('name')` 不能让 SELECT 同层其他表达式凭空引用该别名；需要时先投影为子查询，再使用其字段。增强函数不擅自展开或改写别名。[Drizzle RQB](https://orm.drizzle.team/docs/rqb)

## JSON 表示与解码

`jsonb().$type<T>()` 是存储模型声明，不验证数据库中每个 JSON 文档。`jsonbValue` 不自动应用源列或源 SQL 的整对象 decoder，也不执行第二次 JSON.parse；Postgres.js 的默认 JSON/JSONB parser 已经返回 JSON 值。全局驱动/codec 配置也必须遵循这个原始 JSON 表示约定，不能用模型声明掩盖运行时类型变化。

从 `Date`、`bigint` 等非 JSON 模型读取时，类型保守退化为 unknown；根模型中的这些字段也相应退化。不会声称数据库字符串被还原为 Date，或者 JSON 大整数自动无损还原为 bigint。复杂 JSON 返回类型的递归推导也有深度上限。

如果配置了非默认驱动 parser，或者叶子需要运行时校验，直接对结果使用原生 `.mapWith(...)`：

```ts
const email = jsonbValue(users.preferences, ['contact', 'email']).mapWith((value) =>
	emailSchema.parse(value)
);
```

类型断言和 `.nullable()` 都不代替 decoder；只在结果表达式上显式选择所需转换。此包不建设第二套 codec 或 schema 注册器。[Drizzle SQL](https://orm.drizzle.team/docs/sql)

## 验证与 CI

```powershell
pnpm --filter @zadmin/drizzle check
pnpm --filter @zadmin/drizzle test
# 在当前进程设置独立测试连接串后运行；不要把真实凭据提交到仓库。
pnpm --filter @zadmin/drizzle test:postgres
pnpm --filter @zadmin/drizzle build
```

`test:postgres` 要求 `DRIZZLE_TEST_DATABASE_URL`，缺失直接失败。它只在随机命名的临时表中写入测试记录，使用事务和 `ON COMMIT DROP`，随后验证临时表消失并关闭连接池。

- 编译期合同从实际公开 API 检查路径、叶子、联合、tuple、动态路径、别名和错误调用；不只检查孤立类型工具。
- 单元测试检查参数化、非法输入、路径快照和原生组合。
- PG 测试验证 JSON/text 差异、字符串不二次解析、NULL、特殊键、空路径、负索引、SQL/别名/RQB 与源 decoder 隔离。
- GitHub CI 的 `Drizzle PostgreSQL JSONB` job 使用一次性 PostgreSQL 18 服务，运行类型合同、单元、PG 集成和包构建，并加入 required aggregate。

实现范围是已审定的 JSONB 路径读取完整合同。`jsonbSet`、深层 PATCH、JSON 聚合 mapper、JSONPath 语言、搜索表达式与 ORM 装饰器不在此版本内；原生 SQL 仍可以表达这些操作。范围依据见 [设计取舍](../architecture/drizzle-postgres-enhancement-research-2026-09-06.md)。

# ZUI ICSS 生产架构

本文是 `@zadmin/zui` 第一版实现合同。目标是提供强类型、运行时 CSS、Svelte 编译优化和单一 class API；后续实现不得重新引入公开的 `{ class, style }`、`css` prop 或 action API。

## 实现状态

`@zadmin/zui@0.1.0`已经于2026-08-24完成本文范围和生产验收。当前实现包含Runtime、Compiler、SvelteKit SSR/CSP/HMR、8个基础组件和Svelte展示站；验收数据见[测试与验收](../development/testing.md)。

## 范围

本阶段做到生产可用的是：

- ICSS 强类型 DSL、主题和单位系统；
- 确定性序列化、hash、浏览器样式表和 SSR Registry；
- Svelte 预处理器，将可追踪的动态叶子值提升为元素 inline CSS 自定义属性；
- SvelteKit SSR、hydration、CSP 和 HMR 集成；
- `Provider`、`Box`、`Stack`、`Text`、`Button` 五个基础组件；
- 文档、浏览器测试、并发 SSR、性能不变量和外部 tarball 安装验收。

不在本阶段迁移旧 ZUI 的完整 Vue 组件集合，也不实现 WyW 式静态执行、跨框架编译器、恶意 CSS 沙箱或任意全程序数据流分析。

## 公开 API

`icss()` 永远返回可直接绑定到 `class` 的 branded string：

```ts
declare const ICSS_CLASS: unique symbol;

export type IcssClassName = string & {
	readonly [ICSS_CLASS]: true;
};
```

响应式值推荐放入标准 Svelte `$derived`：

```svelte
<script lang="ts">
	let panelWidth = $state(320);
	let opacity = $state(0.8);

	const panelClass = $derived(
		icss(theme, (s) => {
			s.display.flex;
			s.width.px(panelWidth);
			s.padding._medium;

			s._hover((hover) => {
				hover.opacity(opacity);
			});
		})
	);
</script>

<div class={panelClass}>...</div>
```

直接写在 class expression 中同样受支持：

```svelte
<div class={icss(theme, (s) => s.width.px(panelWidth))}>...</div>
```

不提供这些公开形态：

```ts
// 不提供
{ class: string, style: string }
{ className: string, variables: Record<string, string> }
```

## 编译和运行双轨

Svelte 预处理器能把 ICSS class 关联到元素时，动态叶子值转换成 Svelte 原生 `style:` directive。概念转换如下：

```svelte
<!-- 源码 -->
<div class={panelClass} />

<!-- 内部转换结果，用户不编写 -->
<div
	class={panelClass}
	style:--panel-width-a1b2c3-0={panelWidth}
	style:--opacity-a1b2c3-1={opacity}
/>
```

结构 CSS 只生成并缓存一次：

```css
.c-a1b2c3 {
	width: calc(var(--panel-width-a1b2c3-0) * 1px);
}

.c-a1b2c3:hover {
	opacity: var(--opacity-a1b2c3-1);
}
```

普通 TS、未安装预处理器或无法分析的数据流仍由运行时生成完整 class rule。回退必须功能正确，但不承诺高频动态值拥有 inline variable 的性能。

编译器是优化路径，不是正确性的唯一来源；运行时是完整后备，不是测试垫片。

## 动态槽位

动态 CSS 自定义属性格式：

```text
--[可选源码变量名]-[模板 hash]-[槽位序号]
```

示例：

```text
--panel-width-a1b2c3-0
--opacity-a1b2c3-1
--a1b2c3-2
```

- 源码名称只用于可读性，复杂表达式可以没有名称；
- hash 隔离模板、组件和继承范围；
- 最后的零基序号区分同一模板中的多个动态叶子；
- 值不参与结构 hash；
- 开发映射可以记录相对文件、行列、属性和条件；
- 生产产物不包含绝对源码路径。

数值在 inline 中保持原始数字，单位在 CSS 中恢复：

```html
<div style="--panel-width-a1b2c3-0:320"></div>
```

```css
width: calc(var(--panel-width-a1b2c3-0) * 1px);
```

无单位属性直接使用 `var()`；颜色、阴影和 transform 等复合值保留完整字符串。

## 值与结构

| 源码                                         | 处理              | 值变化时 class     |
| -------------------------------------------- | ----------------- | ------------------ |
| `s.padding.px(16)`                           | 静态结构值        | 不变               |
| `s.width.px(width)`                          | inline 数字槽位   | 不变               |
| `s.opacity(opacity)`                         | inline 无单位槽位 | 不变               |
| `s.width.px(width * zoom)`                   | 匿名表达式槽位    | 不变               |
| `s.padding.px(compact ? 8 : 16)`             | 条件值槽位        | 不变               |
| `if (compact) s.padding... else s.margin...` | 两个结构模板      | 切换               |
| `s.color._primary`                           | 主题值进入结构    | 主题变化时可能切换 |

编译器必须保留控制流保护。例如：

```ts
if (item) s.width.px(item.width);
```

不得无条件读取 `item.width`，而应生成等价于 `item ? item.width : undefined` 的隐藏绑定。

## DSL

保留四种主要属性形态：

```ts
s.color('#fff'); // 原始值
s.color._primary; // theme token
s.display.flex; // keyword
s.padding.px(16); // unit
```

所有 setter 在类型层返回 `void`，不允许跨属性 fluent chain。主题使用不可变普通对象，属性元数据把 `padding` 映射到 `space`、`color` 映射到 `color`、`fontSize` 映射到 `fontSize` 等 token 分类。

第一版内建嵌套能力限定为：

```text
_hover _active _focus _focusVisible _disabled
_before _after _media _supports _container _selector
```

业务条件直接使用 TypeScript `if`、`switch`、三元和逻辑表达式。ARIA、data state 和少见 selector 使用 `_selector()`，不预设几十个语法糖。

## 编译器边界

第一版必须支持：

- `class={icss(...)}`；
- `const value = $derived(icss(...))` 后绑定本地元素；
- class 数组、条件和同一个 class 的多个本地使用位置；
- `if/else`、`switch` 和嵌套条件保护；
- pseudo、media、supports 和 container；
- 现有 `style` attribute/directive；
- import alias、source map、SSR 和 hydration；
- ZUI 自有组件的隐藏变量转发。

任意循环、跨模块不透明 helper、任意对象数据流和未知第三方组件进入运行时回退。开发诊断必须说明 callsite、回退原因、性能影响和可优化写法。

inline 变量只对 self、pseudo 和 descendant selector 安全。兄弟、祖先或外部 selector 中的动态值必须回退为完整 class rule。

## Runtime

Builder 用 Proxy 记录 declaration、selector 和 at-rule instruction tree。规范化保留声明顺序，结构签名不包含动态槽位当前值。

运行时分层：

```text
Builder -> canonical serializer -> deterministic hash -> Stylis -> StyleRegistry
```

要求：

- hash 不使用随机数，不依赖插入顺序；
- hash 命中后仍比较 canonical string；
- server/client 产生相同 class；
- 浏览器按 Document 或 ShadowRoot 隔离 Registry；
- 开发时按模块持有 style bucket，支持 HMR 替换和 dispose；
- 生产使用 CSSOM 分桶插入；
- SSR Registry 按请求隔离；
- hydration 接管服务端规则，不重复插入；
- 每个 callsite 的结构变体有明确上限；
- 编译快路径中动态值更新不得增加任何 rule、class 或 cache entry。

## SSR、CSP 与 HMR

SvelteKit 集成由`@zadmin/sveltekit/zui`提供`zuiHandle()`：

```ts
import { zuiHandle } from '@zadmin/sveltekit/zui';

export const handle = sequence(zuiHandle(), existingHandle);
```

每个请求创建独立 Registry，SSR 后把 critical CSS 注入 head。客户端从 `data-icss` 标记接管。通用 SSR 另提供显式 `createServerStyleRegistry()` 和 CSS 提取接口。

默认高性能模式使用 inline variables，因此 CSP 需要允许 `style-src-attr 'unsafe-inline'`；style element 仍使用 nonce/hash。严格禁止 inline style 的系统可以选择 `dynamicValues: 'class-rules'` 回退模式。

HMR 必须区分：

- 普通动态值：只调用 `style.setProperty`；
- ICSS 结构修改：替换所属模块规则并保留组件状态；
- runtime/compiler 修改：失效 transform cache 并清理旧模块规则。

## 组件边界

原生元素直接接收隐藏 `style:` directive。ZUI 自有组件必须有可确定的样式根元素，标准转发 `class` 和内部变量 carrier，不增加 wrapper。未知第三方组件无法确认 class 落点时使用完整 class rule 回退。

第一批组件：

```text
ZProvider ZBox ZStack ZText ZIcon ZButton ZInput ZField
```

它们用于验证主题、组件边界、响应式槽位、状态 selector、SSR、HMR 和可访问性，不作为旧组件迁移的开始信号。

## 目录

```text
ui/zui/src/lib/
	compiler/   AST分析、绑定、诊断、改写、源码名称
	component-runtime/ 多组件共享的Context与根样式机制
	components/ gene、input、layout分类下的8个单文件组件
	icss/       Builder、hash、Registry、序列化、Sheet、值和单位
	recipes/    recipe与slot recipe定义、缓存和HMR所有权
	theme/      默认主题、定义、属性元数据、类型和单位
	index.ts    公开入口例外

ui/sveltekit/src/lib/zui/
	client、handle、request registry、CSP和类型
```

公开 subpath：

```text
@zadmin/zui
@zadmin/zui/compiler
@zadmin/zui/runtime
@zadmin/zui/testing    内存runtime、fixture和资源断言，仅供测试
@zadmin/zui/internal   仅编译产物使用
@zadmin/sveltekit/zui
```

compiler/server 代码进入浏览器 bundle 必须为 0 B。

## 依赖

本节描述已落地的ICSS子系统：其运行路径只使用`stylis`和type-only `csstype`，编译器使用`magic-string`、`estree-walker`和peer `svelte/compiler`，不依赖Emotion、dx-styles、WyW、color2k、Babel、SWC或ts-morph。后续组件阶段已经安装但尚未接入现有8个组件的通用API依赖、Shiki可选入口和实施顺序见[ZUI组件与展示站改进蓝图](./component-roadmap.md)；这些依赖不得进入未使用对应能力的tree-shaken浏览器产物。

Svelte peer 必须收紧到实际验证的现代 Svelte 5 范围，不能继续宣称兼容所有早期 Svelte 5 编译行为。

## 生产验收

10,000 次动态值更新后必须满足：

```text
class 数量不增加
CSS rule 数量不增加
style tag 数量不增加
结构 cache 数量不增加
```

还必须完成：

- Chromium、Firefox、WebKit 浏览器集成；
- SSR/hydration，无重复规则和 attribute mismatch；
- 至少 50 个并发、不同主题请求无 Registry 串扰；
- nonce、hash、`inline-vars` 和 `class-rules` CSP 模式；
- 真实 Vite HMR 修改、观察和 fixture 恢复；
- `pnpm pack` 后在仓库外 SvelteKit fixture 安装和构建；
- runtime browser bundle gzip 目标不超过 15 KB；
- compiler/server 模块不进入 client bundle；
- Core/Compiler branch coverage至少 90%，基础组件至少 80%；
- 全仓 `check`、`test`、`build`、`lint`。

## 实现检查点

```text
1d3dd82 docs(zui): freeze production icss architecture
18fe91a chore(zui): establish package and test boundaries
0f51f12 feat(zui): add typed theme and icss builder
4b36e7c feat(zui): add deterministic css runtime
ddcc4f9 feat(zui): compile dynamic icss values to inline variables
547f0e3 feat(zui): harden sveltekit ssr and hmr integration
a613cb4 feat(zui): add provider and foundational components
fecc5a2 docs(zui): replace starter content with zui documentation
```

后续改动仍要保持阶段提交可构建，并持续满足本文生产不变量。

# ZUI 运行时 CSS 与组件 API 蓝图

状态：详细设计草案，尚未实施（2026-08-28）。本文细化[UI 平台重构蓝图](./ui-platform-blueprint.md)中的 `@zadmin/zui`；当前已经实现和验证的行为仍以[ZUI ICSS 生产架构](./zui-icss.md)与[ZUI 使用与外部接入](./zui-usage.md)为准。

## 1. 目标

`@zadmin/zui`是浏览器和桌面WebView共用的Svelte 5组件库与运行时CSS系统。目标是：

- 一套强类型、class-only的CSS API；
- 静态结构生成稳定class，响应式叶子只更新CSS变量；
- 编译器是性能优化，运行时是完整正确性后备；
- Theme、recipe、slot recipe和组件Props使用同一类型源；
- 组件直接落到真实语义元素，不为样式增加无意义wrapper；
- 原生HTML属性、事件、ARIA、`class`、`style`和`ref`正常传播；
- SSR、hydration、CSP、HMR、ShadowRoot与外部tarball都属于生产合同；
- 目录同层尽量全为目录或全为代码文件，每层约5–15个直接子项。

本文不把StyleX、vanilla-extract、Panda或其他CSS框架作为依赖；只借鉴其已验证的recipe、slot recipe和动态变量边界。

## 2. 核心决策

保留现有公开合同：

```ts
const className = icss(theme, (s) => {
	s.display.flex;
	s.padding._medium;
	s.color._primary;
});
```

`icss()`永远返回可直接绑定到`class`的branded string：

```ts
declare const ICSS_CLASS: unique symbol;

export type IcssClassName = string & {
	readonly [ICSS_CLASS]: true;
};
```

继续禁止以下公开API：

```text
// 不提供
{ class: string, style: string }
{ className: string, variables: Record<string, string> }
css={{ color: 'red' }}
use:zuiStyle={...}
```

新增三类高层能力：

```text
useZui();
defineRecipe(...);
defineSlotRecipe(...);
```

分层关系：

```text
ICSS DSL
  → StyleProgram
  → canonical serialization
  → deterministic hash
  → Stylis
  → StyleRegistry
  → BrowserStyleSheet / MemoryStyleSheet

defineRecipe
  → base branch
  → variant branches
  → compound branches
  → stable class list

defineSlotRecipe
  → named slot recipes
  → stable class object
```

## 3. 目标目录

```text
ui/zui/
  src/
    compiler/
    components/
    runtime/
    styles/
    testing/
    theme/
    types/
    index.ts
  package.json
  README.md
  svelte.config.js
  tsconfig.json
  vite.config.ts
  vitest.config.ts
```

`src/`下以目录为主，只保留`index.ts`一个入口例外。

推荐内部目录：

```text
src/compiler/
  analyze.ts
  bindings.ts
  diagnostics.ts
  preprocess.ts
  rewrite.ts
  source-names.ts
  types.ts

src/runtime/
  context.ts
  hash.ts
  registry.ts
  runtime.ts
  serialize.ts
  sheet.ts
  variables.ts

src/styles/
  builder.ts
  conditions.ts
  recipe.ts
  slots.ts
  types.ts
  values.ts

src/theme/
  contract.ts
  default.ts
  define.ts
  properties.ts
  types.ts
  units.ts
```

组件首层保持8个目录：

```text
src/components/
  box/
  button/
  field/
  icon/
  input/
  provider/
  stack/
  text/
```

每个组件目录以代码文件为主，例如：

```text
src/components/button/
  ZButton.svelte
  button.browser.spec.ts
  button.recipe.ts
  button.spec.ts
  button.types.ts
  index.ts
```

## 4. Package exports

```text
@zadmin/zui
@zadmin/zui/compiler
@zadmin/zui/runtime
@zadmin/zui/testing
@zadmin/zui/internal
```

| 入口         | 内容                                  | 客户端生产bundle   |
| ------------ | ------------------------------------- | ------------------ |
| 根入口       | 组件、Theme、`icss`、recipe、`useZui` | 允许               |
| `./compiler` | Svelte preprocess与诊断               | 禁止               |
| `./runtime`  | 显式Runtime、Registry、Sheet高级API   | 按实际引用         |
| `./testing`  | fake runtime、fixtures和断言          | 禁止               |
| `./internal` | 编译器生成代码使用                    | 允许但不供业务调用 |

根入口计划：

```ts
export { defaultTheme, defineTheme, extendTheme } from './theme/index.js';

export { icss, defineRecipe, defineSlotRecipe, useZui } from './styles/index.js';

export {
	ZBox,
	ZButton,
	ZField,
	ZIcon,
	ZInput,
	ZProvider,
	ZStack,
	ZText
} from './components/index.js';
```

不保留旧`@zadmin/zui-svelte`兼容转发包，除非发布状态检查证明外部已有消费者；即使需要迁移包，也只发布deprecation版本，不让兼容层长期留在仓库。

## 5. Theme API

### 5.1 默认合同

ZUI组件只消费一个严格的`ZuiTheme`，第一层控制在13组：

```ts
export interface ZuiTheme {
	readonly borderWidth: BorderWidthTokens;
	readonly breakpoint: BreakpointTokens;
	readonly color: ColorTokens;
	readonly duration: DurationTokens;
	readonly fontSize: FontSizeTokens;
	readonly fontWeight: FontWeightTokens;
	readonly lineHeight: LineHeightTokens;
	readonly opacity: OpacityTokens;
	readonly radius: RadiusTokens;
	readonly shadow: ShadowTokens;
	readonly size: SizeTokens;
	readonly space: SpaceTokens;
	readonly zIndex: ZIndexTokens;
}
```

13组仍在5–15范围内，不把互不相关的token强行合并。

### 5.2 定义与扩展

```ts
export declare const defaultTheme: ZuiTheme;

export declare function defineTheme<const TTheme extends ZuiTheme>(
	theme: TTheme
): DeepReadonly<TTheme>;

export declare function extendTheme(base: ZuiTheme, patch: DeepPartial<ZuiTheme>): ZuiTheme;
```

示例：

```ts
export const enterpriseTheme = extendTheme(defaultTheme, {
	color: {
		primary: '#6d28d9',
		primaryHover: '#5b21b6'
	},
	radius: {
		medium: 6
	}
});
```

要求：

- Theme和token group深冻结；
- patch拒绝未知组和未知token；
- 数字必须有限；
- 组件需要的语义token不能缺失；
- Theme不在原对象上修改；
- Theme值参与canonical style identity；
- Theme切换允许生成另一组稳定class，但不能按组件实例重复生成。

v1不把全部Theme改写成CSS variable contract。只有真实的高频主题切换或外部品牌主题证明当前class缓存不足时，才单独设计`ThemeScope`和变量contract。

## 6. ICSS DSL

### 6.1 属性写法

继续保留四种主要形态：

```ts
s.color('#fff'); // CSS值
s.color._primary; // Theme token
s.display.flex; // keyword
s.padding.px(8, 16); // unit
```

补充低层出口：

```ts
s.color.raw('color-mix(in srgb, red 80%, black)');
s.set('--custom-property', value);
```

规则：

- setter返回`void`，不做跨属性fluent chain；
- 每条declaration接受1–4个值；
- `null`和`undefined`省略声明；
- 不提供`!important`快捷API；
- raw只绕过属性值枚举，不绕过selector和block安全检查；
- unknown token、unit、keyword或property在开发态抛出明确错误。

### 6.2 第一方组件的关键字与Theme token提升

ICSS回调参数统一命名为`s`，第一方ZUI组件、recipe、Docs和测试不使用`style`、`css`等更长或含义不一致的参数名。

第一方组件遇到CSS标准关键字时，不把关键字作为普通字符串调用：

```ts
// 禁止
s.borderColor('transparent');

// 目标
s.borderColor.transparent;
```

若属性元数据尚未提供该关键字，当前改动必须同时：

1. 把关键字加入对应`PROPERTY_DEFINITIONS[property].keywords`；
2. 让类型层生成`s.property.keyword`访问器；
3. 增加builder、类型推导、序列化和浏览器测试；
4. 检查该关键字是否只对部分属性有效，不能加入错误属性的通用集合。

第一方组件遇到品牌、颜色、间距、圆角、阴影、字号或其他视觉字面量时，优先复用或新增语义Theme token：

```ts
// 禁止在第一方组件recipe中硬编码
s.borderColor('#FFFFFF');

// 如果语义是画布色
s.borderColor._canvas;

// 如果语义是普通边框
s.borderColor._border;
```

新增Theme token时必须：

1. 先检索现有语义token，避免同义重复；
2. 按用途命名，例如`canvas`、`surface`、`border`，不按原始值命名为`white`、`hexFFFFFF`；
3. 更新`ZuiTheme`合同、`defaultTheme`和必要的属性token映射；
4. 增加自定义Theme、缺失token和组件视觉状态测试；
5. 说明token属于稳定设计语义，而不是只为消除一处字面量机械创建。

以下是少数允许的直接值：

- 业务侧`icss()`接收的运行时数据；
- CSS规范函数或计算表达式，且没有合理keyword/token表示；
- 结构性的`0`、百分比或只在单一算法中成立的数值；
- 有文档和测试说明的兼容性修复。

第一方组件中的例外必须在代码旁解释原因。代码评审默认要求把标准关键字提升到属性元数据，把稳定视觉值提升到Theme。

### 6.3 条件与嵌套

```ts
icss(theme, (s) => {
	s.color._text;

	s._hover((hover) => {
		hover.color._primary;
	});

	s._focusVisible((focus) => {
		focus.outline('2px solid currentColor');
		focus.outlineOffset.px(2);
	});

	s._media('(min-width: 48rem)', (wide) => {
		wide.padding._large;
	});

	s._selector('&[data-invalid="true"]', (invalid) => {
		invalid.borderColor._danger;
	});
});
```

内建保持在约10个：

```text
_hover _active _focus _focusVisible _disabled
_before _after _media _supports _container _selector
```

业务条件直接使用TypeScript：

```ts
if (compact) {
	s.padding._small;
} else {
	s.padding._medium;
}
```

不为每种ARIA、data-state或浏览器selector创建语法糖。

## 7. Context-bound CSS

普通TypeScript和测试继续使用：

```ts
const className = icss(defaultTheme, (s) => {
	s.display.grid;
});
```

Svelte组件内部推荐：

```svelte
<script lang="ts">
	import { useZui } from '@zadmin/zui';

	const zui = useZui();
	let width = $state(320);

	const rootClass = $derived(
		zui.icss((s) => {
			s.width.px(width);
			s.padding._medium;
		})
	);
</script>

<div class={rootClass}></div>
```

目标接口：

```ts
export interface ZuiContext {
	readonly theme: ZuiTheme;
	readonly runtime: IcssRuntime;
	icss(factory: IcssFactory<ZuiTheme>): IcssClassName;
	recipe<TRecipe extends RecipeDefinition>(
		recipe: TRecipe,
		variants?: RecipeSelection<TRecipe>
	): IcssClassName;
	slots<TRecipe extends SlotRecipeDefinition>(
		recipe: TRecipe,
		variants?: SlotRecipeSelection<TRecipe>
	): SlotClassNames<TRecipe>;
}

export declare function useZui(): ZuiContext;
```

`ZuiContext.theme`使用getter读取最新Provider值；`$derived`重新执行时可以响应Theme变化。`useZui()`只能在组件初始化期间调用。

没有Provider时使用不可变`defaultTheme`与当前Document默认runtime；SSR没有request-local runtime时开发态告警，生产仍以MemoryStyleSheet正确回退。

## 8. Recipe API

### 8.1 目的

当前Button在组件内通过`switch`计算palette和metrics，再把所有结果放入一个`icss()`调用。目标是把有限variants定义为模块级recipe，使base、variant和compound分支各自拥有稳定class，避免按组合生成笛卡尔积。

### 8.2 定义

```ts
export const buttonRecipe = defineRecipe({
	base: (s) => {
		s.display.inlineFlex;
		s.alignItems.center;
		s.justifyContent.center;
		s.borderWidth.px(1);
		s.borderStyle.solid;
		s.borderRadius._medium;
		s.fontWeight._semibold;
		s.cursor.pointer;
	},
	variants: {
		variant: {
			primary: (s) => {
				s.backgroundColor._primary;
				s.borderColor._primary;
				s.color._canvas;
			},
			secondary: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.color._text;
			},
			danger: (s) => {
				s.backgroundColor._danger;
				s.borderColor._danger;
				s.color._canvas;
			},
			ghost: (s) => {
				s.backgroundColor.transparent;
				s.borderColor.transparent;
				s.color._primary;
			}
		},
		size: {
			small: (s) => {
				s.minHeight.px(28);
				s.padding.px(0, 10);
				s.fontSize._small;
			},
			medium: (s) => {
				s.minHeight.px(36);
				s.padding.px(0, 16);
				s.fontSize._medium;
			},
			large: (s) => {
				s.minHeight.px(44);
				s.padding.px(0, 20);
				s.fontSize._large;
			}
		},
		disabled: {
			true: (s) => {
				s.cursor.notAllowed;
				s.opacity._disabled;
			},
			false: () => undefined
		},
		fullWidth: {
			true: (s) => s.width.percent(100),
			false: () => undefined
		}
	},
	compoundVariants: [
		{
			when: { variant: 'ghost', disabled: true },
			style: (s) => s.backgroundColor._surface
		}
	],
	defaultVariants: {
		variant: 'primary',
		size: 'medium',
		disabled: false,
		fullWidth: false
	}
});
```

使用：

```svelte
<script lang="ts">
	const zui = useZui();

	let {
		disabled = false,
		variant = 'primary',
		size = 'medium',
		loading = false,
		fullWidth = false
	}: ZButtonProps = $props();

	const rootClass = $derived(
		zui.recipe(buttonRecipe, {
			disabled: disabled || loading,
			fullWidth,
			size,
			variant
		})
	);
</script>
```

类型：

```ts
type RecipeVariantValue<TOptions> = keyof TOptions extends 'false' | 'true'
	? boolean
	: keyof TOptions;

export type RecipeVariants<TRecipe extends RecipeDefinition> = {
	readonly [TName in keyof TRecipe['variants']]?: RecipeVariantValue<TRecipe['variants'][TName]>;
};

export type ButtonVariants = Omit<RecipeVariants<typeof buttonRecipe>, 'disabled'>;
```

公开类型必须精确推导variant key和值，boolean recipe key映射为`boolean`，不能泄漏`unknown`或`any`。

要求：

- recipe在模块级定义；
- base、每个variant值和每个compound分别注册稳定class；
- 不为每个variant组合生成新StyleProgram；
- variant选择只拼接已存在class；
- dynamic叶子不放入recipe，使用`zui.icss()`；
- unknown variant在类型层拒绝，运行时开发构建也给出诊断；
- recipe暴露只读`variantMap`，供Docs、Storybook和测试生成矩阵；
- 每个recipe的分支总数默认上限64，超出需要拆分职责。

这借鉴vanilla-extract/Panda的`base + variants + compoundVariants + defaultVariants`形态，但CSS仍由ZUI runtime生成和缓存，不引入其构建器。

## 9. Slot Recipe API

复杂组件由多个DOM part组成时使用slot recipe，不通过全局descendant selector猜测内部结构。

```ts
export const fieldRecipe = defineSlotRecipe({
	slots: ['root', 'label', 'control', 'description', 'error'] as const,
	base: {
		root: (s) => s.display.grid,
		label: (s) => s.fontWeight._medium,
		control: () => undefined,
		description: (s) => s.color._textMuted,
		error: (s) => s.color._danger
	},
	variants: {
		size: {
			small: {
				root: (s) => s.gap._xsmall
			},
			medium: {
				root: (s) => s.gap._small
			}
		},
		invalid: {
			true: {
				control: (s) => s.borderColor._danger
			},
			false: {}
		}
	},
	defaultVariants: {
		size: 'medium',
		invalid: false
	}
});
```

使用：

```ts
const classes = $derived(
	zui.slots(fieldRecipe, {
		size,
		invalid: Boolean(error)
	})
);

classes.root;
classes.label;
classes.control;
classes.description;
classes.error;
```

要求：

- slot名称是稳定公开part名；
- 每个slot class直接放到对应真实元素；
- slot recipe不自动创建DOM；
- component tests验证所有slot都被使用且没有额外wrapper；
- 第一阶段只由`ZField`验证，出现第二个多part组件后再决定是否扩展API。

## 10. 动态值与编译器

### 10.1 优化路径

源码：

```svelte
<div class={icss(theme, (s) => s.width.px(width))}></div>
```

编译概念结果：

```svelte
<div class="c-a1b2c3" style:--width-a1b2c3-0={width}></div>
```

CSS：

```text
.c-a1b2c3 {
	width: calc(var(--width-a1b2c3-0) * 1px);
}
```

10,000次`width`更新不得增加class、rule、style tag或结构cache。

### 10.2 组件边界

目标是移除公开Props中的`__icssVariables`。优先验证Svelte attachment：

- compiler为动态变量生成内部attachment；
- attachment通过已知ZUI组件传到真实root；
- 组件只需要把剩余原生Props传播到root；
- attachment使用Symbol key，不占用业务Props名称；
- SSR/hydration、HMR和组件切换必须验证。

如果attachment无法满足SSR或编译边界，则使用非导出的unique-symbol carrier；不退回公开字符串`__icssVariables`。

迁移期间允许当前实现继续工作，直到attachment spike覆盖Box、Button、动态`svelte:element`、SSR和100次mount/unmount。

### 10.3 回退

以下进入完整runtime class-rule回退：

- 普通TypeScript；
- 未安装preprocess；
- 循环或未知控制流；
- 跨模块不透明helper；
- 未知第三方组件；
- sibling、ancestor或外部selector的动态值；
- 无法证明attachment落点的组件。

开发诊断包含callsite、原因、性能影响和建议写法。回退必须正确，不能为了性能静默丢失CSS。

## 11. Class composition与级联

Svelte 5原生支持class数组和对象，ZUI不再增加`cx()`：

```svelte
<button class={[rootClass, active && activeClass, className]}></button>
```

内部顺序统一为：

```text
base recipe
variant recipe
compound recipe
consumer class
```

CSS rule优先级不能仅依赖class字符串顺序。目标runtime评估固定cascade layer：

```css
@layer zui.base, zui.components, zui.utilities;
```

- 组件recipe进入`zui.components`；
- 业务`icss()`进入`zui.utilities`；
- 无layer的业务CSS按浏览器规则高于ZUI layer；
- inline `style`仍按标准级联最高；
- 第一阶段不公开任意layer名称和`!important`API。

cascade layer必须先做三浏览器、SSR和旧业务CSS兼容spike。验证失败则继续使用现有插入顺序，不同时上线两种优先级模型。

## 12. Runtime与Registry

```ts
export interface IcssRuntime {
	readonly registry: StyleRegistry;
	icss<TTheme extends ThemeSchema>(theme: TTheme, factory: IcssFactory<TTheme>): IcssClassName;
	recipe<TRecipe extends RecipeDefinition>(
		theme: ZuiTheme,
		recipe: TRecipe,
		variants?: RecipeSelection<TRecipe>
	): IcssClassName;
	slots<TRecipe extends SlotRecipeDefinition>(
		theme: ZuiTheme,
		recipe: TRecipe,
		variants?: SlotRecipeSelection<TRecipe>
	): SlotClassNames<TRecipe>;
}
```

Registry要求：

- canonical string包含layer、selector、at-rule、property、unit和Theme值；
- hash确定、短小、server/client一致；
- hash命中仍比较canonical，碰撞明确失败；
- Document和ShadowRoot拥有独立Registry；
- SSR每请求独立MemoryStyleSheet；
- hydration接管`data-icss`，不重复插入；
- HMR按module/recipe/callsite释放owner；
- persistent规则不被单个组件卸载删除；
- recipe按runtime、theme和branch缓存；
- 每个动态callsite默认最多128个结构变体；
- Registry提供只读metrics供开发工具和测试使用。

推荐metrics：

```ts
interface StyleRegistryMetrics {
	readonly classes: number;
	readonly rules: number;
	readonly owners: number;
	readonly recipes: number;
	readonly hydrated: number;
}
```

## 13. SSR、CSP、HMR与ShadowRoot

SvelteKit集成迁到`@zadmin/sveltekit/zui`：

```ts
import { zuiHandle } from '@zadmin/sveltekit/zui';

export const handle = zuiHandle({
	csp: {
		nonce: (event) => event.locals.cspNonce
	}
});
```

目标选项：

```ts
interface ZuiHandleOptions {
	readonly csp?:
		| { readonly nonce: string | ((event: RequestEvent) => string | undefined) }
		| { readonly hash: true };
	readonly dynamicValues?: 'inline-vars' | 'class-rules';
}
```

要求：

- nonce和hash互斥；
- request-local runtime由AsyncLocalStorage隔离；
- critical CSS只注入本请求实际使用规则；
- `inline-vars`明确要求`style-src-attr`策略；
- `class-rules`用于严格禁止inline attribute的系统；
- HMR修改recipe只替换对应owner规则并保留组件状态；
- ShadowRoot可以通过显式runtime传入Provider；
- 浏览器全局runtime不跨Document泄漏。

## 14. Provider与组件上下文

```ts
export interface ZProviderProps {
	readonly children?: Snippet;
	readonly runtime?: IcssRuntime;
	readonly theme?: ZuiTheme;
}
```

`ZProvider`不创建DOM wrapper：

```svelte
<script lang="ts">
	let { children, runtime, theme = defaultTheme }: ZProviderProps = $props();

	provideZui(() => ({ runtime, theme }));
</script>

{@render children?.()}
```

嵌套Provider允许局部Theme或ShadowRoot runtime。Theme切换后，组件`$derived`重新选择recipe classes；没有Provider时使用默认上下文。

## 15. 组件公共约定

### 15.1 命名

- 组件名使用`Z`前缀；
- Props使用`ZButtonProps`等完整名；
- recipe使用`buttonRecipe`；
- part和state使用小写稳定名称；
- 文件夹使用小写组件名，内部代码文件使用统一前缀。

### 15.2 Root合同

每个有DOM root的组件必须：

- 恰好拥有一个明确样式root；
- 把`class`和`style`合并到该root；
- 把适用的原生HTML attributes与callback events传播到root；
- 暴露`ref`并支持`bind:ref`；
- 不增加纯样式wrapper；
- 设置稳定`data-*`状态供测试与外部CSS使用；
- 内部生成的ARIA不能被无意覆盖为错误状态。

### 15.3 Events

采用Svelte 5 callback props，不使用`createEventDispatcher`：

- 原生元素事件保持`onclick`、`oninput`、`onchange`；
- 语义状态回调使用`onValueChange`、`onOpenChange`等；
- 回调直接返回业务值，不创建无意义`CustomEvent`；
- 不同时提供`on:change`和`onChange`两套兼容API。

### 15.4 Bindings

只有组件真正拥有可变状态时使用`$bindable`：

```ts
let { value = $bindable(''), onValueChange }: ZInputProps = $props();
```

- `ZInput`支持`bind:value`；
- Button、Box、Stack、Text和Icon没有多余bindable Props；
- future overlay使用`bind:open`前必须定义controlled/uncontrolled行为；
- 用户输入触发bindable更新后调用语义callback；
- 外部Props更新不重复触发用户动作callback。

### 15.5 Snippets

- 默认内容使用`children?: Snippet`；
- 只有第二个真实内容区域出现时才增加named snippet；
- 不为可能出现的icon提前添加`leading`、`trailing`等大量slots；
- 多part组件优先普通Props加一个children，复杂复用再引入named snippets；
- snippet参数必须有明确类型，不回退`any`。

## 16. 首批8个组件

### 16.1 ZProvider

职责：Theme、Runtime和未来direction/locale上下文。无DOM root。

```svelte
<ZProvider theme={enterpriseTheme}>
	<App />
</ZProvider>
```

### 16.2 ZBox

严格的`div`容器，不做全组件多态：

```ts
export interface ZBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	readonly children?: Snippet;
	ref?: HTMLDivElement | null;
}
```

需要`section`、`main`或`article`时直接使用原生元素；避免为`as`泛型引入复杂且不完整的HTML类型。

### 16.3 ZStack

```ts
export type ZStackDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export interface ZStackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	readonly align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
	readonly children?: Snippet;
	readonly direction?: ZStackDirection;
	readonly gap?: keyof ZuiTheme['space'] | number;
	readonly justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
	readonly wrap?: boolean;
	ref?: HTMLDivElement | null;
}
```

默认：`direction='column'`、`gap='none'`、`align='stretch'`。

### 16.4 ZText

有限语义元素，不做任意`svelte:element`：

```ts
export type ZTextElement = 'label' | 'p' | 'small' | 'span' | 'strong';

export interface ZTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	readonly as?: ZTextElement;
	readonly children?: Snippet;
	readonly size?: keyof ZuiTheme['fontSize'];
	readonly tone?: 'default' | 'muted' | 'primary' | 'danger';
	readonly truncate?: boolean;
	readonly weight?: keyof ZuiTheme['fontWeight'];
	ref?: HTMLElement | null;
}
```

### 16.5 ZIcon

```ts
export type ZIconName = keyof typeof iconManifest;

export interface ZIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
	readonly label?: string;
	readonly name: ZIconName;
	readonly size?: keyof ZuiTheme['size'] | number;
	ref?: SVGSVGElement | null;
}
```

- 没有label时`aria-hidden=true`；
- 有label时使用`role=img`和可访问名称；
- icon manifest在构建期验证，禁止任意HTML/SVG字符串注入；
- 第一批只带真实使用的5–15个图标。

### 16.6 ZButton

```ts
export interface ZButtonProps
	extends Omit<HTMLButtonAttributes, 'children' | 'disabled'>, ButtonVariants {
	readonly children?: Snippet;
	readonly disabled?: boolean;
	readonly loading?: boolean;
	ref?: HTMLButtonElement | null;
}
```

规则：

- 默认`type='button'`；
- `disabled || loading`映射到原生`disabled`；
- loading设置`aria-busy=true`与`data-loading=true`；
- 保留原生`onclick`，不再包装成自定义事件；
- spinner为内部`aria-hidden`视觉，不改变children语义；
- variant和size完全来自recipe类型。

### 16.7 ZInput

```ts
export type ZInputType = 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';

export interface ZInputProps extends Omit<
	HTMLInputAttributes,
	'children' | 'size' | 'type' | 'value'
> {
	readonly invalid?: boolean;
	readonly size?: 'small' | 'medium' | 'large';
	readonly type?: ZInputType;
	value?: string;
	readonly onValueChange?: (value: string) => void;
	ref?: HTMLInputElement | null;
}
```

- 内部使用原生`input`；
- 支持`bind:value`；
- 原生`oninput`、`onchange`仍可传入；
- 用户输入先更新value，再调用`onValueChange`；
- 外部value变化不触发`onValueChange`；
- invalid映射`aria-invalid`和`data-invalid`；
- 不在Input内部渲染label、description或error。

### 16.8 ZField

```ts
export interface ZFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	readonly children?: Snippet;
	readonly controlId?: string;
	readonly description?: string;
	readonly error?: string;
	readonly label: string;
	readonly required?: boolean;
	ref?: HTMLDivElement | null;
}
```

`ZField`建立内部Field context，`ZInput`在没有显式`id`、`aria-describedby`或`aria-invalid`时使用该context。`ZField`负责：

- 使用`$props.id()`生成SSR稳定ID；
- 生成或接受`controlId`，使label与已知ZUI control可访问关联；
- description/error ID；
- invalid状态与slot recipe；
- 不接管Input value；
- 第一阶段只支持单一ZUI control children；原生或第三方control必须显式传相同`id`，不实现任意表单引擎。

## 17. 组件实现模板

```svelte
<script lang="ts">
	import { useZui } from '../../runtime/context.js';
	import { buttonRecipe } from './button.recipe.js';
	import type { ZButtonProps } from './button.types.js';

	let {
		children,
		class: className,
		disabled = false,
		fullWidth = false,
		loading = false,
		ref = $bindable(null),
		size = 'medium',
		style,
		type = 'button',
		variant = 'primary',
		...rest
	}: ZButtonProps = $props();

	const zui = useZui();
	const rootClass = $derived(
		zui.recipe(buttonRecipe, {
			disabled: disabled || loading,
			fullWidth,
			size,
			variant
		})
	);
</script>

<button
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	{style}
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	data-loading={loading || undefined}
>
	{#if loading}
		<span aria-hidden="true">…</span>
	{/if}
	{@render children?.()}
</button>
```

实现顺序固定：

1. type imports；
2. Props解构和默认值；
3. context；
4. derived classes/state；
5. 单一语义root；
6. rest props与组件强制语义属性按显式优先级合并；
7. snippets。

## 18. 可访问性合同

| 组件        | 必须验证                                                 |
| ----------- | -------------------------------------------------------- |
| ZButton     | keyboard click、disabled、loading、focus-visible、name   |
| ZInput      | label、description、error、required、invalid、form reset |
| ZField      | SSR稳定IDs、label/control、description/error关系         |
| ZIcon       | decorative与labelled两种模式                             |
| ZText       | 元素语义不因视觉variant改变                              |
| ZStack/ZBox | 不伪造role，不破坏原生attributes                         |

测试使用真实浏览器和可访问性查询；snapshot只验证结构，不能代替键盘和语义测试。

## 19. 测试与性能门槛

### 19.1 Runtime CSS

10,000次动态值更新后：

```text
class数量不增加
CSS rule数量不增加
style tag数量不增加
结构cache数量不增加
recipe branch数量不增加
```

### 19.2 Recipe

- 每个variant值至少一个测试；
- defaultVariants和compoundVariants完整覆盖；
- recipe分支总数和Registry metrics固定；
- Theme切换只生成每个分支一份新class；
- HMR删除旧recipe owner且不删除共享class；
- slot recipe所有slot都有root落点。

### 19.3 Components

- TypeScript Props inference；
- SSR；
- Chromium、Firefox、WebKit；
- keyboard、focus、ARIA；
- native event passthrough；
- bindable状态和callback顺序；
- class/style/ref传播；
- attachment动态变量；
- 100次mount/unmount回到资源基线；
- 每个组件statements/branches/functions/lines至少80%。

### 19.4 Bundle

```text
runtime browser gzip <= 15 KB
单个基础组件增量 gzip <= 3 KB
compiler/server进入browser bundle = 0 B
testing进入production bundle = 0 B
```

## 20. 分阶段实现

### Z0：冻结本文

- 确认API命名和8个基础组件；
- 不修改现有实现；
- 将本文链接到总蓝图和文档索引。

### Z1：合并包和目录

- `zui-core + zui-svelte → zui`；
- 保持现有`icss()`、SSR、HMR和组件行为；
- 不同时引入recipe或组件重写。

### Z2：Context与Theme

- 新增`useZui()`；
- Provider同时提供Theme和Runtime；
- 新增`extendTheme()`；
- 验证nested provider、SSR和ShadowRoot显式runtime。

### Z3：Recipe

- 实现`defineRecipe()`和类型推导；
- Button改用recipe；
- 验证稳定branch class、Theme cache和HMR owner；
- 不同时实现slot recipe。

### Z4：Slot Recipe

- 实现`defineSlotRecipe()`；
- 只由ZField验证；
- 没有第二个真实多part组件前不扩展slot API。

### Z5：Attachment carrier

- spike Svelte attachment；
- 覆盖native root、ZUI root、SSR、hydration和HMR；
- 成功后移除公开`__icssVariables`；
- 失败则使用内部unique-symbol carrier。

### Z6：8个基础组件

- 保留现有Box、Stack、Text、Button行为后重命名`Z*`；
- 新增Icon、Input、Field；
- Provider升级为ZProvider；
- 每个组件独立完成类型、SSR、浏览器和无障碍门槛。

### Z7：SvelteKit迁移

- `icssHandle`迁到`@zadmin/sveltekit/zui`并重命名`zuiHandle`；
- compiler/server client bundle保持0 B；
- 重新做并发SSR、CSP和外部tarball验收。

### Z8：生产验收

- 全仓check/test/build/lint；
- 三浏览器；
- HMR；
- Docs与组件矩阵；
- 外部package fixture；
- 更新当前事实文档，蓝图仍保留决策历史。

## 21. 暂不实现

- public `css` prop；
- public action/attachment API；
- atomic CSS；
- arbitrary polymorphic `as`；
- responsive component props；
- runtime object style API；
- public `cx()`；
- `!important` helper；
- 全量CSS变量Theme contract；
- 全局reset注入；
- Portal、Dialog、Popover和复杂表单；
- 旧ZUI完整组件迁移；
- React/Vue adapter；
- Miniapp组件或样式共享。

## 22. 参考而不照搬

- StyleX：typed/composable/predictable的设计目标，`https://stylexjs.com/`；
- vanilla-extract Recipes：base、variants、compoundVariants和defaultVariants，`https://vanilla-extract.style/documentation/packages/recipes/`；
- vanilla-extract Dynamic：动态CSS变量的小runtime边界，`https://vanilla-extract.style/documentation/dynamic-api/`；
- Panda Recipes与Slot Recipes：variant类型和多part样式组织，`https://panda-css.com/docs/concepts/recipes`、`https://panda-css.com/docs/concepts/slot-recipes`；
- Svelte 5：callback props、snippets、class数组/对象、attachments和`$bindable`，`https://svelte.dev/docs/svelte/overview`。

采用标准只看是否适合当前ZUI的class-only runtime、Svelte编译器和SSR合同，不因为外部框架流行而复制其完整API。

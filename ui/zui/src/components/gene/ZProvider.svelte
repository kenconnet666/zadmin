<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import type { IcssRuntime } from '../../icss/runtime.js';
	import type {
		ZuiColorScheme,
		ZuiContrast,
		ZuiDensity,
		ZuiDirection,
		ZuiLocalePackOverrides,
		ZuiMotion,
		ZuiPortalContainer,
		ZuiTranslations
	} from '../../runtime/foundation/context.js';
	import type { ZuiTheme } from '../../theme/types.js';
	import type { ZuiComponentDefaults } from '../../runtime/foundation/component-defaults.js';

	export interface ZProviderProps {
		children?: Snippet;
		componentDefaults?: ZuiComponentDefaults | null;
		colorScheme?: ZuiColorScheme;
		contrast?: ZuiContrast;
		density?: ZuiDensity;
		direction?: ZuiDirection;
		idPrefix?: string;
		locale?: string;
		localePack?: ZuiLocalePackOverrides;
		motion?: ZuiMotion;
		portalContainer?: ZuiPortalContainer;
		runtime?: IcssRuntime;
		theme?: ZuiTheme;
		timeZone?: string;
		translations?: ZuiTranslations;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'provider',
		importStatement: "import { ZProvider } from '@zadmin/zui';",
		name: 'ZProvider',
		bindings: [],
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '继承父级或空值',
				description:
					'仅允许button/dataTable的白名单行为props；null停止继承；禁止受控状态、回调、DOM和CSS。',
				name: 'componentDefaults',
				type: 'ZuiComponentDefaults | null'
			},
			{ default: '—', description: 'Provider子树。', name: 'children', type: 'Snippet' },
			{
				default: "继承父级或 'light'",
				description: '显式主题明暗模式，供代码等需要配套表面的组件继承。',
				name: 'colorScheme',
				type: "'light' | 'dark'"
			},
			{
				default: "继承父级或 'normal'",
				description: '高对比度偏好；auto由平台偏好与组件CSS渐进增强解析。',
				name: 'contrast',
				type: "'auto' | 'high' | 'normal'"
			},
			{
				default: "继承父级或 'comfortable'",
				description: '组件密度轴；组件的显式size始终优先。',
				name: 'density',
				type: "'compact' | 'comfortable' | 'spacious'"
			},
			{
				default: '继承父级或 ltr',
				description: '组件方向，不从客户端环境猜测。',
				name: 'direction',
				type: "'ltr' | 'rtl'"
			},
			{
				default: "继承父级或 'zui'",
				description: 'SSR稳定ID命名空间前缀。',
				name: 'idPrefix',
				type: 'string'
			},
			{
				default: '继承父级或 en-US',
				description: 'SSR稳定的BCP 47 locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: '继承父级或enUSLocalePack',
				description: '类型安全的组件默认文案与参数化格式函数覆盖。',
				name: 'localePack',
				type: 'ZuiLocalePackOverrides'
			},
			{
				default: "继承父级或 'auto'",
				description: '动画偏好；auto尊重reduced-motion并保持SSR稳定。',
				name: 'motion',
				type: "'auto' | 'full' | 'reduced'"
			},
			{
				default: '继承父级或 null',
				description: '未来Portal的Document、ShadowRoot或HTMLElement挂载边界。',
				name: 'portalContainer',
				type: 'Document | HTMLElement | ShadowRoot | null'
			},
			{ default: 'defaultTheme', description: '严格ZUI主题。', name: 'theme', type: 'ZuiTheme' },
			{
				default: "继承父级或 'UTC'",
				description: 'SSR稳定的IANA时区；日期组件不从客户端环境猜测。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: '当前默认runtime',
				description: 'Document、ShadowRoot或SSR runtime。',
				name: 'runtime',
				type: 'IcssRuntime'
			},
			{
				default: '继承父级或空字典',
				description: '已弃用的字符串字典兼容层；新代码使用localePack。',
				name: 'translations',
				type: 'Readonly<Record<string, string>>'
			}
		],
		since: '0.1.0',
		snippets: [{ description: 'Provider子树。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZProvider.svelte',
		states: [],
		status: 'stable',
		summary:
			'提供Theme、偏好轴、locale pack、componentDefaults、SSR稳定timeZone、direction、Portal边界和ICSS runtime，不创建额外DOM。componentDefaults只允许button/dataTable行为props；null停止继承，受控状态/回调/DOM/CSS被拒绝。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { provideZui } from '../../runtime/foundation/context.js';

	let {
		children,
		componentDefaults,
		colorScheme,
		contrast,
		density,
		direction,
		idPrefix,
		locale,
		localePack,
		motion,
		portalContainer,
		runtime,
		theme,
		timeZone,
		translations
	}: ZProviderProps = $props();
	provideZui(() => ({
		colorScheme,
		contrast,
		density,
		direction,
		idPrefix,
		locale,
		localePack,
		motion,
		portalContainer,
		runtime,
		theme,
		timeZone,
		translations,
		componentDefaults
	}));
</script>

{@render children?.()}

<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import type { IcssRuntime } from '../../icss/runtime.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export interface ZProviderProps {
		children?: Snippet;
		colorScheme?: 'dark' | 'light';
		direction?: 'ltr' | 'rtl';
		locale?: string;
		runtime?: IcssRuntime;
		theme?: ZuiTheme;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'provider',
		importStatement: "import { ZProvider } from '@zadmin/zui';",
		name: 'ZProvider',
		props: [
			{ default: '—', description: 'Provider子树。', name: 'children', type: 'Snippet' },
			{
				default: "继承父级或 'light'",
				description: '显式主题明暗模式，供代码等需要配套表面的组件继承。',
				name: 'colorScheme',
				type: "'light' | 'dark'"
			},
			{
				default: '继承父级或 ltr',
				description: '组件方向，不从客户端环境猜测。',
				name: 'direction',
				type: "'ltr' | 'rtl'"
			},
			{
				default: '继承父级或 en-US',
				description: 'SSR稳定的BCP 47 locale。',
				name: 'locale',
				type: 'string'
			},
			{ default: 'defaultTheme', description: '严格ZUI主题。', name: 'theme', type: 'ZuiTheme' },
			{
				default: '当前默认runtime',
				description: 'Document、ShadowRoot或SSR runtime。',
				name: 'runtime',
				type: 'IcssRuntime'
			}
		],
		source: 'ui/zui/src/components/gene/ZProvider.svelte',
		status: 'stable',
		summary: '提供Theme、colorScheme、locale、direction和ICSS runtime，不创建额外DOM。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { provideZui } from '../../runtime/context.js';

	let { children, colorScheme, direction, locale, runtime, theme }: ZProviderProps = $props();
	provideZui(() => ({ colorScheme, direction, locale, runtime, theme }));
</script>

{@render children?.()}

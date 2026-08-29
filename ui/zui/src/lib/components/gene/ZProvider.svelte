<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../component-metadata.js';

	import type { IcssRuntime } from '../../icss/runtime.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export interface ZProviderProps {
		children?: Snippet;
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
		source: 'ui/zui/src/lib/components/gene/ZProvider.svelte',
		status: 'stable',
		summary: '提供Theme、locale、direction和ICSS runtime，不创建额外DOM。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { provideZui } from '../../component-runtime/zui-context.js';

	let { children, direction, locale, runtime, theme }: ZProviderProps = $props();
	provideZui(() => ({ direction, locale, runtime, theme }));
</script>

{@render children?.()}

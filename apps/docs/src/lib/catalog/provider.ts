import ThemeDemo from '../demos/provider/ThemeDemo.svelte';
import themeSource from '../demos/provider/ThemeDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const providerDoc = defineComponentDoc({
	id: 'provider',
	name: 'ZProvider',
	summary: '向组件树提供严格Theme和ICSS Runtime，不创建额外DOM根节点。',
	importStatement: "import { ZProvider } from '@zadmin/zui';",
	source: 'ui/zui/src/lib/components/provider/ZProvider.svelte',
	demos: [
		{
			id: 'provider-theme',
			title: 'Theme与嵌套Provider',
			description: '嵌套Provider只覆盖自己的子树，默认Provider继续使用defaultTheme。',
			component: ThemeDemo,
			source: themeSource
		}
	],
	api: [
		{
			title: 'Props',
			rows: [
				{
					name: 'theme',
					type: 'ZuiTheme',
					default: 'defaultTheme',
					description: '严格且不可变的ZUI主题。'
				},
				{
					name: 'runtime',
					type: 'IcssRuntime',
					default: '当前默认runtime',
					description: '显式Document、ShadowRoot或SSR runtime。'
				},
				{
					name: 'children',
					type: 'Snippet',
					default: '—',
					description: 'Provider子树，不增加DOM wrapper。'
				}
			]
		}
	],
	accessibility: ['不创建无语义wrapper。', '不会改变子组件的原生语义与焦点顺序。']
});

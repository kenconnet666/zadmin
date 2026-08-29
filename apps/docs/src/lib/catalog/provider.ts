import { providerMetadata } from '@zadmin/zui/metadata';
import ThemeDemo from '../demos/ProviderThemeDemo.svelte';
import themeSource from '../demos/ProviderThemeDemo.svelte?raw';
import { defineComponentDoc } from './types.js';

export const providerDoc = defineComponentDoc(providerMetadata, {
	demos: [
		{
			component: ThemeDemo,
			description: '嵌套Provider只覆盖自己的子树，并继承未显式提供的上下文。',
			id: 'provider-theme',
			source: themeSource,
			title: 'Theme与嵌套Provider'
		}
	],
	accessibility: ['不创建无语义wrapper。', '不会改变子组件的原生语义与焦点顺序。']
});

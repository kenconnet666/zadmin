import { providerMetadata } from '@zadmin/zui/metadata';
import PortalDemo from './PortalDemo.svelte';
import portalSource from './PortalDemo.svelte?raw';
import ThemeDemo from './ThemeDemo.svelte';
import themeSource from './ThemeDemo.svelte?raw';
import PreferencesDemo from './PreferencesDemo.svelte';
import preferencesSource from './PreferencesDemo.svelte?raw';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const providerDoc = defineComponentDoc(providerMetadata, {
	demos: [
		{
			component: ThemeDemo,
			description: '嵌套Provider只覆盖自己的子树，并继承未显式提供的上下文。',
			id: 'provider-theme',
			source: themeSource,
			title: 'Theme与嵌套Provider'
		},
		{
			component: PreferencesDemo,
			description: '嵌套Provider同时覆盖对比度、密度、方向、locale和动画偏好。',
			id: 'provider-preferences',
			source: preferencesSource,
			title: '显示与区域偏好'
		},
		{
			component: PortalDemo,
			description: 'portalContainer隔离浮层挂载边界，idPrefix为复合组件生成稳定命名空间。',
			id: 'provider-portal-boundary',
			source: portalSource,
			title: 'Portal与ID边界'
		}
	],
	accessibility: ['不创建无语义wrapper。', '不会改变子组件的原生语义与焦点顺序。']
});
